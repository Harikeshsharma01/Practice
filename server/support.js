import { randomBytes, randomUUID, createHash } from "node:crypto";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const validToken = (value) =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const tokenFrom = (req) =>
  validToken(req.cookies.sewestian_inbox) ? req.cookies.sewestian_inbox : null;
const threadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  kind: z.enum(["doubt", "feedback", "issue"]),
  subject: z.string().trim().min(3).max(160),
  context: z.string().trim().max(200).default(""),
  message: z.string().trim().min(3).max(5000),
});
const replySchema = z.object({ message: z.string().trim().min(1).max(5000) });

export function registerSupport(
  app,
  store,
  protect,
  { production = false } = {},
) {
  app.use(["/api/support", "/api/admin/support"], (_req, res, next) => {
    res.set("Cache-Control", "private, no-store");
    next();
  });
  const limit = rateLimit({
    windowMs: 60_000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Please wait a minute before sending more messages." },
  });
  app.use("/api/support", (req, res, next) =>
    ["GET", "HEAD"].includes(req.method) ? next() : limit(req, res, next),
  );
  const setCookie = (res, token) =>
    res.cookie("sewestian_inbox", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: production,
      path: "/",
      maxAge: 90 * 86400_000,
    });
  async function inbox(req) {
    const token = tokenFrom(req);
    return token && (await store.get("support-inbox-" + hash(token)))
      ? hash(token)
      : null;
  }
  // Recovery is a bearer secret, independent of teacher login and classroom approval.
  app.post("/api/support/session", async (req, res) => {
    let token = tokenFrom(req);
    if (req.body?.code !== undefined) {
      const code = req.body.code;
      if (
        !validToken(code) ||
        !(await store.get("support-inbox-" + hash(code)))
      )
        return res
          .status(400)
          .json({ error: "That inbox code was not found on this server." });
      token = code;
    } else if (!token || !(await inbox(req))) {
      token = randomBytes(32).toString("hex");
      await store.set("support-inbox-" + hash(token), {
        createdAt: new Date().toISOString(),
      });
    }
    setCookie(res, token);
    res.json({ code: token });
  });
  async function messages(id) {
    return (await store.list("support-message-" + id + "-"))
      .map(({ value }) => value)
      .sort(
        (a, b) =>
          a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
      );
  }
  async function summary(thread) {
    const history = await messages(thread.id);
    const { owner, ...publicThread } = thread;
    const state = await store.get("support-state-" + thread.id);
    return {
      ...publicThread,
      status: state?.status || "open",
      messageCount: history.length,
      lastRole: history.at(-1)?.role || "student",
      updatedAt: history.at(-1)?.createdAt || thread.createdAt,
    };
  }
  async function list(owner) {
    const all = (await store.list("support-thread-"))
      .map(({ value }) => value)
      .filter((thread) => owner === undefined || thread.owner === owner);
    return (await Promise.all(all.map(summary))).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }
  async function find(req, res, teacher = false) {
    const id = req.params.id;
    const thread = /^[a-f0-9-]{36}$/.test(id)
      ? await store.get("support-thread-" + id)
      : null;
    if (!thread || (!teacher && thread.owner !== (await inbox(req)))) {
      res.status(404).json({ error: "Conversation not found in this inbox." });
      return null;
    }
    return thread;
  }
  async function append(id, role, text) {
    const message = {
      id: randomUUID(),
      role,
      text,
      createdAt: new Date().toISOString(),
    };
    // Each message is its own record: concurrent student/teacher replies cannot overwrite each other.
    await store.set(`support-message-${id}-${message.id}`, message);
    return message;
  }
  app.get("/api/support", async (req, res) => {
    const owner = await inbox(req);
    res.json({ threads: owner ? await list(owner) : [] });
  });
  app.post("/api/support", async (req, res) => {
    const parsed = threadSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        error:
          "Add your name, a subject and a message (up to 5,000 characters).",
      });
    const owner = await inbox(req);
    if (!owner)
      return res
        .status(401)
        .json({ error: "Open your student inbox before sending a question." });
    const { message, ...fields } = parsed.data;
    const thread = {
      id: randomUUID(),
      owner,
      ...fields,
      createdAt: new Date().toISOString(),
    };
    // Store the first message before exposing its thread in an inbox list.
    await append(thread.id, "student", message);
    await store.set("support-thread-" + thread.id, thread);
    res.status(201).json(await summary(thread));
  });
  app.get("/api/support/:id", async (req, res) => {
    const thread = await find(req, res);
    if (thread)
      res.json({
        ...(await summary(thread)),
        messages: await messages(thread.id),
      });
  });
  app.post("/api/support/:id/replies", async (req, res) => {
    const thread = await find(req, res);
    if (!thread) return;
    const parsed = replySchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Write a reply of 1–5,000 characters." });
    if ((await store.get("support-state-" + thread.id))?.status === "resolved")
      return res.status(409).json({
        error:
          "This conversation is resolved. Start a new question if you need more help.",
      });
    res
      .status(201)
      .json(await append(thread.id, "student", parsed.data.message));
  });
  app.get("/api/admin/support", protect, async (_req, res) =>
    res.json({ threads: await list() }),
  );
  app.get("/api/admin/support/:id", protect, async (req, res) => {
    const thread = await find(req, res, true);
    if (thread)
      res.json({
        ...(await summary(thread)),
        messages: await messages(thread.id),
      });
  });
  app.post("/api/admin/support/:id/replies", protect, async (req, res) => {
    const thread = await find(req, res, true);
    if (!thread) return;
    const parsed = replySchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Write a reply of 1–5,000 characters." });
    res
      .status(201)
      .json(await append(thread.id, "teacher", parsed.data.message));
  });
  app.put("/api/admin/support/:id/status", protect, async (req, res) => {
    const thread = await find(req, res, true);
    if (!thread) return;
    if (!["open", "resolved"].includes(req.body?.status))
      return res.status(400).json({ error: "Choose open or resolved." });
    await store.set("support-state-" + thread.id, { status: req.body.status });
    res.json({ ok: true });
  });
}
