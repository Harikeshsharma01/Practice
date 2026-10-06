import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { z } from "zod";
import path from "node:path";
import { existsSync } from "node:fs";
import { courses, lessons, sources } from "../shared/catalog.js";
export const hashPassword = (password) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
};
function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const actual = scryptSync(password, salt, 64),
    expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
const lessonSchema = z.object({
  title: z.string().trim().min(3).max(140),
  summary: z.string().trim().min(10).max(400),
  notes: z
    .array(z.tuple([z.string().min(1).max(120), z.string().min(1).max(5000)]))
    .min(1)
    .max(20),
  videoUrl: z
    .string()
    .max(500)
    .optional()
    .default("")
    .refine((value) => {
      if (!value) return true;
      try {
        const u = new URL(value);
        return (
          u.protocol === "https:" &&
          [
            "www.youtube.com",
            "youtube.com",
            "youtu.be",
            "www.youtube-nocookie.com",
            "vimeo.com",
            "www.vimeo.com",
          ].includes(u.hostname)
        );
      } catch {
        return false;
      }
    }, "Use a YouTube or Vimeo HTTPS link"),
  status: z.enum(["draft", "published"]),
});
export function createApp(
  store,
  { production = false, clientOrigin = "" } = {},
) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:"],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          frameSrc: [
            "https://www.youtube-nocookie.com",
            "https://player.vimeo.com",
          ],
          objectSrc: ["'none'"],
        },
      },
    }),
  );
  app.use(express.json({ limit: "160kb" }), cookieParser());
  app.use("/api", (req, res, next) => {
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.headers.origin
    ) {
      const allowed = production
        ? [clientOrigin]
        : [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:4000",
            "http://127.0.0.1:4000",
            clientOrigin,
          ];
      if (!allowed.includes(req.headers.origin))
        return res.status(403).json({ error: "This origin is not allowed." });
    }
    next();
  });
  const protect = async (req, res, next) => {
    const token = req.cookies.sewestian_session;
    if (!token || token.length !== 64)
      return res
        .status(401)
        .json({ error: "Sign in to the teacher workspace." });
    const key = "session-" + createHash("sha256").update(token).digest("hex");
    const session = await store.get(key);
    if (!session || session.expires < Date.now())
      return res
        .status(401)
        .json({ error: "Your session has expired. Please sign in again." });
    req.sessionKey = key;
    next();
  };
  app.get("/api/health", (_req, res) =>
    res.json({ status: "ok", storage: store.mode }),
  );
  app.get("/api/catalog", async (_req, res) => {
    const published = [];
    for (const lesson of lessons) {
      const override = await store.get("published-" + lesson.id);
      published.push(override ? { ...lesson, ...override } : lesson);
    }
    res.json({ courses, lessons: published, sources });
  });
  app.get("/api/auth/status", async (req, res) => {
    const admin = await store.get("admin");
    const token = req.cookies.sewestian_session;
    const session = token
      ? await store.get(
          "session-" + createHash("sha256").update(token).digest("hex"),
        )
      : null;
    res.json({
      configured: !!admin,
      authenticated: !!session && session.expires > Date.now(),
    });
  });
  app.post(
    "/api/auth/login",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 8,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Too many attempts. Try again in 15 minutes." },
    }),
    async (req, res) => {
      const { email, password } = req.body ?? {};
      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        password.length > 256
      )
        return res
          .status(400)
          .json({ error: "Enter your email and password." });
      const admin = await store.get("admin");
      if (!admin)
        return res.status(503).json({
          error:
            "Teacher access has not been configured. Follow the setup instructions in the project README.",
        });
      if (
        email.toLowerCase() !== admin.email ||
        !verifyPassword(password, admin.passwordHash)
      )
        return res
          .status(401)
          .json({ error: "The email or password is incorrect." });
      const token = randomBytes(32).toString("hex"),
        key = "session-" + createHash("sha256").update(token).digest("hex");
      await store.set(key, { expires: Date.now() + 8 * 60 * 60 * 1000 });
      res.cookie("sewestian_session", token, {
        httpOnly: true,
        secure: production,
        sameSite: "strict",
        maxAge: 8 * 60 * 60 * 1000,
        path: "/",
      });
      res.json({ ok: true });
    },
  );
  app.post("/api/auth/logout", protect, async (req, res) => {
    await store.delete(req.sessionKey);
    res.clearCookie("sewestian_session", { path: "/" });
    res.json({ ok: true });
  });
  app.get("/api/admin/lessons", protect, async (_req, res) => {
    const result = [];
    for (const lesson of lessons) {
      const draft = await store.get("draft-" + lesson.id),
        published = await store.get("published-" + lesson.id);
      result.push({
        ...lesson,
        ...published,
        ...draft,
        status: draft ? "draft" : published ? "published" : "original",
        publishedAt: published?.publishedAt ?? null,
      });
    }
    res.json(result);
  });
  app.put("/api/admin/lessons/:id", protect, async (req, res) => {
    if (!lessons.some((l) => l.id === req.params.id))
      return res.status(404).json({ error: "Lesson not found." });
    const parsed = lessonSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: parsed.error.issues[0].message });
    const { status, ...content } = parsed.data;
    content.updatedAt = new Date().toISOString();
    if (status === "published") {
      content.publishedAt = content.updatedAt;
      await store.set("published-" + req.params.id, content);
      await store.delete("draft-" + req.params.id);
    } else await store.set("draft-" + req.params.id, content);
    res.json({ ok: true, status });
  });
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "API route not found." }),
  );
  const dist = path.resolve("dist");
  if (existsSync(dist)) {
    app.use(express.static(dist));
    app.get("/{*path}", (_req, res) =>
      res.sendFile(path.join(dist, "index.html")),
    );
  }
  app.use((err, _req, res, _next) => {
    console.error(err.message);
    res.status(err.status === 400 ? 400 : 500).json({
      error:
        err.status === 400
          ? "Invalid request body."
          : "Something went wrong. Please try again.",
    });
  });
  return app;
}
