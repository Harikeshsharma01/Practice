import { randomBytes, randomInt, createHash } from "node:crypto";
import { networkInterfaces } from "node:os";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { posix } from "node:path";
const digest = (t) => createHash("sha256").update(t).digest("hex");
const ipv4 = (s) =>
  /^\d{1,3}(\.\d{1,3}){3}$/.test(s) &&
  s.split(".").every((n) => Number(n) <= 255)
    ? s.split(".").reduce((a, n) => (a * 256 + Number(n)) >>> 0, 0)
    : null;
export function localPeer(address, interfaces = networkInterfaces()) {
  const ip = (address || "").replace(/^::ffff:/, "");
  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (!/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip)) return false;
  const value = ipv4(ip);
  if (value === null) return false;
  return Object.values(interfaces)
    .flat()
    .some((n) => {
      if (n.internal || n.family !== "IPv4") return false;
      const host = ipv4(n.address),
        mask = ipv4(n.netmask);
      // Only directly attached private IPv4 subnets; forwarded headers are never trusted.
      const privateHost = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(
        n.address,
      );
      return (
        privateHost &&
        mask !== null &&
        host !== null &&
        (value & mask) === (host & mask)
      );
    });
}
export function registerClassroom(
  app,
  store,
  protect,
  { classroomLan = false, production = false, interfaces } = {},
) {
  const enabled = classroomLan;
  const cookie = {
    httpOnly: true,
    sameSite: "strict",
    secure: production,
    path: "/",
    maxAge: 4 * 60 * 60 * 1000,
  };
  async function config() {
    return (
      (await store.get("classroom-settings")) || {
        code: "",
        epoch: "",
        open: false,
        phoneOnly: true,
        privacy: true,
      }
    );
  }
  async function teacher(req) {
    const t = req.cookies.sewestian_session;
    if (!/^[a-f0-9]{64}$/.test(t || "")) return false;
    const s = await store.get("session-" + digest(t));
    return !!s && s.expires > Date.now();
  }
  async function state(req) {
    const isTeacher = await teacher(req);
    if (!enabled) return { enabled: false, allowed: true, teacher: isTeacher };
    const settings = await config();
    const nearby = localPeer(req.socket.remoteAddress, interfaces);
    if (!nearby)
      return {
        enabled: true,
        allowed: false,
        teacher: false,
        status: "outside",
        message: "Connect to the teaching computer’s local network.",
      };
    if (isTeacher) return { enabled: true, allowed: true, teacher: true };
    const phone = /Android.*Mobile|iPhone|iPod/i.test(
      req.get("user-agent") || "",
    );
    if (settings.phoneOnly && !phone)
      return {
        enabled: true,
        allowed: false,
        status: "phone",
        message:
          "This class is set to phone browsers. Use your phone or ask the teacher to allow other devices.",
      };
    const token = req.cookies.sewestian_student;
    const member = /^[a-f0-9]{64}$/.test(token || "")
      ? await store.get("classroom-member-" + digest(token))
      : null;
    const current =
      member && member.epoch === settings.epoch && member.expires > Date.now();
    return {
      enabled: true,
      allowed: !!current && member.status === "approved",
      teacher: false,
      open: settings.open,
      privacy: settings.privacy,
      status: current ? member.status : "join",
      name: current ? member.name : undefined,
      badge: current ? member.id.slice(0, 6) : undefined,
    };
  }
  // Apply the socket network boundary before any classroom/teacher/data endpoint.
  app.use((req, res, next) => {
    if (
      enabled &&
      (req.get("forwarded") ||
        req.get("x-forwarded-for") ||
        req.get("x-forwarded-host"))
    )
      return res.status(403).json({
        error:
          "Open the classroom directly on its local network address, without a forwarding proxy.",
      });
    if (enabled && !localPeer(req.socket.remoteAddress, interfaces))
      return res.status(403).json({
        error:
          "This classroom is available only on the teaching computer’s local network.",
      });
    next();
  });
  // Serialize classroom mutations so a settings save cannot restore an ended epoch.
  let changes = Promise.resolve();
  app.use(
    ["/api/admin/classroom", "/api/classroom/join"],
    async (req, res, next) => {
      if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
      const previous = changes;
      let release;
      changes = new Promise((resolve) => {
        release = resolve;
      });
      await previous;
      if (res.destroyed) {
        release();
        return;
      }
      res.once("finish", release);
      res.once("close", release);
      next();
    },
  );
  app.get("/api/classroom/status", async (req, res) =>
    res.set("Cache-Control", "no-store").json(await state(req)),
  );
  const joinLimit = rateLimit({
    windowMs: 60_000,
    limit: 12,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req) => req.socket.remoteAddress || "local",
    validate: false,
    message: { error: "Too many join attempts. Wait one minute." },
  });
  app.post("/api/classroom/join", joinLimit, async (req, res) => {
    if (!enabled)
      return res
        .status(409)
        .json({ error: "Local classroom mode is not running." });
    const settings = await config();
    const current = await state(req);
    if (current.status === "phone")
      return res.status(403).json({ error: current.message });
    if (["pending", "approved", "revoked"].includes(current.status))
      return res.status(409).json({
        error:
          "This browser already has a classroom request. Ask your teacher to review it.",
      });
    const parsed = z
      .object({
        name: z.string().trim().min(2).max(60),
        code: z.string().regex(/^\d{6}$/),
      })
      .safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Enter your name and the six-digit class code." });
    if (!settings.open || parsed.data.code !== settings.code)
      return res
        .status(403)
        .json({ error: "The code is incorrect or new joins are closed." });
    const members = await store.list("classroom-member-");
    if (
      members.filter(
        (r) => r.value.epoch === settings.epoch && r.value.expires > Date.now(),
      ).length >= 100
    )
      return res
        .status(409)
        .json({ error: "This classroom has reached its 100-browser limit." });
    const token = randomBytes(32).toString("hex"),
      id = digest(token);
    await store.set("classroom-member-" + id, {
      id,
      name: parsed.data.name,
      status: "pending",
      epoch: settings.epoch,
      joinedAt: Date.now(),
      expires: Date.now() + cookie.maxAge,
      device: /iPhone|iPod/i.test(req.get("user-agent") || "")
        ? "iPhone"
        : /Android/i.test(req.get("user-agent") || "")
          ? "Android"
          : "Other browser",
    });
    res
      .cookie("sewestian_student", token, cookie)
      .status(201)
      .json({ ok: true });
  });
  app.get("/api/admin/classroom", protect, async (req, res) => {
    const settings = await config();
    const rows = await store.list("classroom-member-");
    const addresses = Object.values(interfaces || networkInterfaces())
      .flat()
      .filter(
        (n) =>
          !n.internal &&
          n.family === "IPv4" &&
          localPeer(n.address, interfaces),
      )
      .map((n) => `http://${n.address}:${req.socket.localPort}`);
    res.set("Cache-Control", "no-store").json({
      enabled,
      ...settings,
      addresses: enabled ? addresses : [],
      members: rows
        .map((r) => r.value)
        .filter((m) => m.epoch === settings.epoch && m.expires > Date.now())
        .map(({ epoch, ...m }) => m),
    });
  });
  app.post("/api/admin/classroom/settings", protect, async (req, res) => {
    if (!enabled)
      return res.status(409).json({
        error:
          "Start npm run classroom on your teaching computer to manage a local class.",
      });
    const parsed = z
      .object({
        open: z.boolean(),
        phoneOnly: z.boolean(),
        privacy: z.boolean(),
      })
      .strict()
      .safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Choose valid classroom settings." });
    const old = await config();
    await store.set("classroom-settings", { ...old, ...parsed.data });
    res.json({ ok: true });
  });
  app.post("/api/admin/classroom/new", protect, async (_req, res) => {
    if (!enabled)
      return res
        .status(409)
        .json({ error: "Start local classroom mode first." });
    const old = await config();
    await store.set("classroom-settings", {
      ...old,
      epoch: randomBytes(16).toString("hex"),
      code: String(randomInt(100000, 1000000)),
      open: true,
    });
    // A fresh epoch instantly invalidates old cookies. Remove old roster records.
    for (const row of await store.list("classroom-member-"))
      await store.delete(row.key);
    res.json({ ok: true });
  });
  app.post("/api/admin/classroom/end", protect, async (_req, res) => {
    if (!enabled)
      return res
        .status(409)
        .json({ error: "Start local classroom mode first." });
    const old = await config();
    await store.set("classroom-settings", {
      ...old,
      epoch: randomBytes(16).toString("hex"),
      code: "",
      open: false,
    });
    res.json({ ok: true });
  });
  app.post("/api/admin/classroom/members/:id", protect, async (req, res) => {
    if (!enabled)
      return res
        .status(409)
        .json({ error: "Start local classroom mode first." });
    if (
      !/^[a-f0-9]{64}$/.test(req.params.id) ||
      !["approved", "revoked"].includes(req.body?.status)
    )
      return res.status(400).json({ error: "Choose approve or remove." });
    const key = "classroom-member-" + req.params.id,
      member = await store.get(key),
      settings = await config();
    if (
      !member ||
      member.epoch !== settings.epoch ||
      member.expires <= Date.now()
    )
      return res
        .status(404)
        .json({ error: "That classroom request has expired." });
    await store.set(key, { ...member, status: req.body.status });
    res.json({ ok: true });
  });
  app.use(async (req, res, next) => {
    if (!enabled) return next();
    let pathname;
    try {
      pathname = posix.normalize(
        decodeURIComponent(req.path).replaceAll("\\", "/"),
      );
    } catch {
      return res.status(400).json({ error: "Invalid resource path." });
    }
    if (!/^\/(?:api\/(?:catalog|media)(?:\/|$)|videos(?:\/|$))/i.test(pathname))
      return next();
    res.set("Cache-Control", "private, no-store");
    if (!(await state(req)).allowed)
      return res.status(403).json({
        error: "Teacher approval is required to open classroom content.",
        code: "CLASSROOM_ACCESS",
      });
    next();
  });
}
