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
import multer from "multer";
import { readFile, unlink } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import {
  allLessons,
  mediaIsPublished,
  publicCatalog,
  teacherLessons,
  registerTeachingRoutes,
  studioLessonFields,
} from "./teaching.js";
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
function websiteOrigin(value) {
  if (!value || typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      return null;
    return url.origin;
  } catch {
    return null;
  }
}
const lessonSchema = z.object({
  ...studioLessonFields,
  title: z.string().trim().min(3).max(140),
  summary: z.string().trim().min(10).max(400),
  notes: z
    .array(z.tuple([z.string().min(1).max(120), z.string().min(1).max(12000)]))
    .min(1)
    .max(100),
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
  mediaIds: z
    .array(z.string().regex(/^(?:[a-f\d]{24}|[a-f\d-]{36})$/i))
    .max(30)
    .optional()
    .default([]),
  status: z.enum(["draft", "published"]),
});
export function createApp(
  store,
  { production = false, clientOrigin = "", ...teachingOptions } = {},
) {
  const configuredOrigin = websiteOrigin(clientOrigin);
  if (clientOrigin && !configuredOrigin) {
    throw new Error(
      "CLIENT_ORIGIN must be an HTTP or HTTPS website address without a path, query, or credentials.",
    );
  }
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
  app.use(express.json({ limit: "2mb" }), cookieParser());
  app.use("/api", (req, res, next) => {
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.headers.origin
    ) {
      const origin = websiteOrigin(req.headers.origin);
      const allowed = production
        ? [configuredOrigin]
        : [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:4000",
            "http://127.0.0.1:4000",
            configuredOrigin,
            // Vite preserves Host when proxying /api. Accept the actual local
            // website origin, including alternate ports and LAN addresses.
            // Production continues to require the explicit configured origin.
            websiteOrigin(`${req.protocol}://${req.get("host")}`),
          ];
      if (!origin || !allowed.includes(origin))
        return res.status(403).json({
          error: production
            ? "Teacher login is not enabled for this website address. Set CLIENT_ORIGIN on the server to this site's exact origin and restart the server."
            : "This website address is not allowed. Open the URL shown by npm run dev, or set CLIENT_ORIGIN in .env to your browser's website address and restart the server.",
        });
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
  const mediaUpload = multer({
    dest: path.resolve(".data/uploads"),
    limits: { fileSize: 4_000_000, files: 1 },
    fileFilter: (_req, file, done) => {
      if (!file.mimetype || file.mimetype === "application/octet-stream") {
        const ext = path.extname(file.originalname).toLowerCase();
        if ([".md", ".markdown"].includes(ext)) file.mimetype = "text/markdown";
        if (ext === ".txt") file.mimetype = "text/plain";
      }
      if (
        [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "video/mp4",
          "video/webm",
          "application/pdf",
          "text/plain",
          "text/markdown",
        ].includes(file.mimetype)
      )
        return done(null, true);
      return done(
        new Error(
          "Choose a JPG, PNG, GIF, WebP, MP4, WebM, PDF, TXT or Markdown file.",
        ),
      );
    },
  });
  const inspectUpload = async (file) => {
    const head = await readFile(file.path).then((data) => data.subarray(0, 16));
    const signatures = {
      "image/png": head
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      "image/jpeg": head[0] === 255 && head[1] === 216 && head[2] === 255,
      "image/gif": ["GIF87a", "GIF89a"].includes(
        head.subarray(0, 6).toString("ascii"),
      ),
      "image/webp":
        head.subarray(0, 4).toString("ascii") === "RIFF" &&
        head.subarray(8, 12).toString("ascii") === "WEBP",
      "video/mp4": head.subarray(4, 8).toString("ascii") === "ftyp",
      "video/webm": head
        .subarray(0, 4)
        .equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])),
      "application/pdf": head.subarray(0, 5).toString("ascii") === "%PDF-",
      "text/plain": !head.includes(0),
      "text/markdown": !head.includes(0),
    };
    if (!signatures[file.mimetype])
      throw Object.assign(
        new Error("The file contents do not match their declared file type."),
        { status: 400 },
      );
  };
  const cleanUpload = (file) => unlink(file.path).catch(() => {});
  app.get("/api/health", (_req, res) =>
    res.json({ status: "ok", storage: store.mode }),
  );
  app.get("/api/catalog", async (_req, res) => {
    res.set("Cache-Control", "no-store").json(await publicCatalog(store));
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
    "/api/admin/uploads",
    protect,
    (req, res, next) => {
      mediaUpload.single("file")(req, res, (error) =>
        error ? next(error) : next(),
      );
    },
    async (req, res) => {
      if (!req.file)
        return res.status(400).json({ error: "Choose a file to upload." });
      try {
        await inspectUpload(req.file);
        const name =
          path
            .basename(req.file.originalname)
            .replace(/[^\p{L}\p{N}._ -]/gu, "")
            .slice(0, 120) || "classroom-file";
        const saved = await store.putFile(req.file.path, {
          name,
          type: req.file.mimetype,
          createdAt: new Date().toISOString(),
        });
        res.status(201).json({
          id: saved.id,
          name: saved.name,
          type: saved.type,
          size: saved.size,
        });
      } finally {
        await cleanUpload(req.file);
      }
    },
  );
  app.post(
    "/api/admin/import-notes",
    protect,
    (req, res, next) => {
      mediaUpload.single("file")(req, res, (error) =>
        error ? next(error) : next(),
      );
    },
    async (req, res) => {
      if (!req.file)
        return res
          .status(400)
          .json({ error: "Choose a Markdown or text notes file." });
      try {
        if (!["text/plain", "text/markdown"].includes(req.file.mimetype))
          return res.status(400).json({
            error:
              "Notes import supports .txt and .md. Upload PDFs as student resources.",
          });
        await inspectUpload(req.file);
        const text = await readFile(req.file.path, "utf8");
        if (Buffer.byteLength(text) > 1_500_000)
          return res
            .status(413)
            .json({ error: "Notes import is limited to 1.5 MB." });
        const chunks = text
          .trim()
          .split(/\n(?=#{1,3}\s)/)
          .filter(Boolean);
        if (chunks.length > 100 || chunks.some((chunk) => chunk.length > 12120))
          return res.status(400).json({
            error:
              "Split the notes into at most 100 pages with up to 12,000 characters per page.",
          });
        const notes = chunks
          .map((chunk, i) => {
            const lines = chunk.split(/\r?\n/);
            const hasHeading = /^#{1,3}\s/.test(lines[0]);
            const heading = hasHeading
              ? lines
                  .shift()
                  .replace(/^#{1,3}\s*/, "")
                  .trim()
              : `Imported page ${i + 1}`;
            return [
              heading || `Imported page ${i + 1}`,
              lines.join("\n").trim(),
            ];
          })
          .filter(([, body]) => body);
        if (
          notes.some(
            ([heading, body]) => heading.length > 120 || body.length > 12000,
          )
        )
          return res.status(400).json({
            error:
              "Use page headings up to 120 characters and page text up to 12,000 characters. No content has been imported.",
          });
        if (!notes.length)
          return res
            .status(400)
            .json({ error: "Add note text under a heading and try again." });
        res.json({ name: path.basename(req.file.originalname), notes });
      } finally {
        await cleanUpload(req.file);
      }
    },
  );
  app.get("/api/media/:id", async (req, res, next) => {
    try {
      const file = await store.getFile(req.params.id);
      if (!file) return res.status(404).json({ error: "Media not found." });
      const isPublished = await mediaIsPublished(store, file.metadata.id);
      if (!isPublished) {
        const token = req.cookies.sewestian_session;
        const session =
          token && token.length === 64
            ? await store.get(
                "session-" + createHash("sha256").update(token).digest("hex"),
              )
            : null;
        if (!session || session.expires < Date.now()) {
          file.stream.destroy();
          return res.status(404).json({ error: "Media not found." });
        }
      }
      res.set({
        "Content-Type": file.metadata.type,
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
        "Cache-Control": isPublished ? "no-store" : "private, no-store",
      });
      await pipeline(file.stream, res);
    } catch (error) {
      next(error);
    }
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
  registerTeachingRoutes(app, store, protect, teachingOptions);
  app.get("/api/admin/lessons", protect, async (_req, res) =>
    res.json(await teacherLessons(store)),
  );
  app.put("/api/admin/lessons/:id", protect, async (req, res) => {
    if (!(await allLessons(store)).some((l) => l.id === req.params.id))
      return res.status(404).json({ error: "Lesson not found." });
    const parsed = lessonSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: parsed.error.issues[0].message });
    const { status, ...changes } = parsed.data;
    const existing =
      (await store.get("draft-" + req.params.id)) ||
      (await store.get("published-" + req.params.id)) ||
      {};
    const content = { ...existing, ...changes };
    for (const id of content.mediaIds)
      if (!(await store.get(`upload-${id}`)))
        return res.status(400).json({
          error: "One attached upload could not be found. Upload it again.",
        });
    content.updatedAt = new Date().toISOString();
    if (status === "published") {
      content.publishedAt = content.updatedAt;
      await store.set("published-" + req.params.id, content);
      await store.delete("hidden-" + req.params.id);
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
    const mediaTypeError = err.message?.startsWith("Choose a JPG");
    const status =
      err.code === "LIMIT_FILE_SIZE" || err.status === 413
        ? 413
        : err.status === 400 || mediaTypeError
          ? 400
          : 500;
    res.status(status).json({
      error:
        err.status === 413
          ? "This chapter is too large for one request. Split it into smaller chapters."
          : err.code === "LIMIT_FILE_SIZE"
            ? "That file is too large. Upload a file smaller than 4 MB."
            : err.status === 400 || mediaTypeError
              ? err.message
              : "Something went wrong. Please try again.",
    });
  });
  return app;
}
