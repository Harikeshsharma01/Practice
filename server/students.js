import {
  randomBytes,
  randomUUID,
  createHash,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { posix } from "node:path";
import { rateLimit } from "express-rate-limit";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
const derive = promisify(scrypt);
const hash = (v) => createHash("sha256").update(v).digest("hex");
const valid = (v) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((v) => v.toLowerCase());
const credentials = z.object({ email, password: z.string().min(12).max(128) });
const signup = credentials.extend({ name: z.string().trim().min(2).max(80) });
async function passwordHash(password) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + (await derive(password, salt, 64)).toString("hex");
}
async function passwordMatches(password, stored) {
  const [salt, value] = stored.split(":");
  return timingSafeEqual(
    await derive(password, salt, 64),
    Buffer.from(value, "hex"),
  );
}
const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  provider: u.provider,
});
export function registerStudents(
  app,
  store,
  {
    production = false,
    required = true,
    googleClientId = "",
    googleClientSecret = "",
    googleRedirectUri = "",
    googleClient,
  } = {},
) {
  let redirect;
  try {
    const u = new URL(googleRedirectUri);
    if (
      (u.protocol === "https:" ||
        (!production &&
          u.hostname === "localhost" &&
          u.protocol === "http:")) &&
      u.pathname === "/api/student/google/callback" &&
      !u.search &&
      !u.hash &&
      !u.username &&
      !u.password
    )
      redirect = u.href;
  } catch {}
  const googleEnabled = !!(googleClientId && googleClientSecret && redirect);
  const oauth = googleEnabled
    ? googleClient ||
      new OAuth2Client(googleClientId, googleClientSecret, redirect)
    : null;
  const cookie = {
    httpOnly: true,
    secure: production,
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 86400_000,
  };
  app.use(async (req, _res, next) => {
    const token = req.cookies.sewestian_student_session;
    if (valid(token)) {
      const session = await store.get("student-session-" + hash(token));
      if (session && session.expires > Date.now())
        req.student = await store.get("student-user-" + session.userId);
    }
    const teacher = req.cookies.sewestian_session;
    if (valid(teacher)) {
      const session = await store.get("session-" + hash(teacher));
      req.isTeacher = !!session && session.expires > Date.now();
    }
    next();
  });
  app.use("/api/student", (_req, res, next) => {
    res.set("Cache-Control", "private, no-store");
    next();
  });
  const limit = rateLimit({
    windowMs: 15 * 60_000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      error: "Too many sign-in attempts. Please try again in 15 minutes.",
    },
  });
  async function session(res, user) {
    const token = randomBytes(32).toString("hex");
    await store.set("student-session-" + hash(token), {
      userId: user.id,
      expires: Date.now() + cookie.maxAge,
    });
    res.cookie("sewestian_student_session", token, cookie);
  }
  app.get("/api/student/status", (req, res) =>
    res.json({
      required,
      authenticated: !!req.student || !!req.isTeacher,
      teacher: !!req.isTeacher,
      user: req.student ? publicUser(req.student) : null,
      googleEnabled,
      offline: false,
    }),
  );
  app.post("/api/student/signup", limit, async (req, res) => {
    const parsed = signup.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        error:
          "Enter your name, a valid email, and a password of 12–128 characters.",
      });
    const { name, email, password } = parsed.data;
    const user = {
      id: randomUUID(),
      name,
      email,
      provider: "password",
      passwordHash: await passwordHash(password),
      createdAt: new Date().toISOString(),
    };
    // Reserve normalized email atomically; never store a raw password.
    if (!(await store.create("student-email-" + hash(email), user.id)))
      return res.status(409).json({
        error: "An account already uses this email. Sign in instead.",
      });
    try {
      await store.set("student-user-" + user.id, user);
    } catch (e) {
      await store.delete("student-email-" + hash(email));
      throw e;
    }
    await session(res, user);
    res.status(201).json({ user: publicUser(user) });
  });
  app.post("/api/student/login", limit, async (req, res) => {
    const parsed = credentials.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(401)
        .json({ error: "The email or password is incorrect." });
    const id = await store.get("student-email-" + hash(parsed.data.email));
    const user = id && (await store.get("student-user-" + id));
    const dummy = "00000000000000000000000000000000:" + "00".repeat(64);
    if (
      !(await passwordMatches(
        parsed.data.password,
        user?.passwordHash || dummy,
      )) ||
      !user
    )
      return res
        .status(401)
        .json({ error: "The email or password is incorrect." });
    await session(res, user);
    res.json({ user: publicUser(user) });
  });
  app.post("/api/student/logout", async (req, res) => {
    const token = req.cookies.sewestian_student_session;
    if (valid(token)) await store.delete("student-session-" + hash(token));
    res.clearCookie("sewestian_student_session", { path: "/" });
    const teacherToken = req.cookies.sewestian_session;
    if (valid(teacherToken))
      await store.delete("session-" + hash(teacherToken));
    res.clearCookie("sewestian_session", { path: "/" });
    res.json({ ok: true });
  });
  app.get("/api/student/google/start", limit, async (_req, res) => {
    if (!oauth)
      return res.status(503).json({
        error: "Google sign-in is not configured by the teacher yet.",
      });
    const state = randomBytes(32).toString("hex"),
      nonce = randomBytes(32).toString("hex");
    const verifier = randomBytes(32).toString("base64url");
    await store.set("google-flow-" + hash(state), {
      nonce,
      verifier,
      expires: Date.now() + 10 * 60_000,
    });
    res.cookie("sewestian_google_state", state, {
      ...cookie,
      sameSite: "lax",
      maxAge: 10 * 60_000,
    });
    res.redirect(
      oauth.generateAuthUrl({
        access_type: "online",
        scope: ["openid", "email", "profile"],
        state,
        nonce,
        code_challenge: createHash("sha256")
          .update(verifier)
          .digest("base64url"),
        code_challenge_method: "S256",
        prompt: "select_account",
      }),
    );
  });
  app.get("/api/student/google/callback", limit, async (req, res) => {
    const state = req.query.state;
    const fail = () => res.redirect("/?signin=google-failed");
    if (!oauth || !valid(state) || req.cookies.sewestian_google_state !== state)
      return fail();
    const flow = await store.get("google-flow-" + hash(state));
    res.clearCookie("sewestian_google_state", { path: "/" });
    if (
      !flow ||
      flow.expires <= Date.now() ||
      typeof req.query.code !== "string" ||
      req.query.code.length > 4096
    )
      return fail();
    if (
      !(await store.create("google-used-" + hash(state), {
        usedAt: Date.now(),
      }))
    )
      return fail();
    await store.delete("google-flow-" + hash(state));
    try {
      const { tokens } = await oauth.getToken({
        code: req.query.code,
        codeVerifier: flow.verifier,
        redirect_uri: redirect,
      });
      const ticket = await oauth.verifyIdToken({
        idToken: tokens.id_token,
        audience: googleClientId,
      });
      const identity = ticket.getPayload();
      if (
        identity.nonce !== flow.nonce ||
        !identity.email_verified ||
        !identity.sub ||
        !email.safeParse(identity.email).success
      )
        return fail();
      // Google subject is the identity. Never auto-link an unverified password account by email.
      const key = "student-google-" + hash(identity.sub);
      let id = await store.get(key);
      if (!id) {
        const candidate = randomUUID();
        if (await store.create(key, candidate)) {
          id = candidate;
          await store.set("student-user-" + id, {
            id,
            name: String(identity.name || identity.email).slice(0, 80),
            email: identity.email.toLowerCase(),
            provider: "google",
            createdAt: new Date().toISOString(),
          });
        } else id = await store.get(key);
      }
      const user = await store.get("student-user-" + id);
      if (!user) return fail();
      await session(res, user);
      res.redirect("/");
    } catch {
      fail();
    }
  });
  app.use((req, res, next) => {
    if (!required) return next();
    let pathname;
    try {
      pathname = posix.normalize(
        decodeURIComponent(req.path).replaceAll("\\", "/"),
      );
    } catch {
      return res.status(400).json({ error: "Invalid resource path." });
    }
    if (
      !/^\/(?:api\/(?:catalog|media|support)(?:\/|$)|videos(?:\/|$))/i.test(
        pathname,
      )
    )
      return next();
    res.set("Cache-Control", "private, no-store");
    if (!req.student && !req.isTeacher)
      return res.status(401).json({
        error: "Sign in to Sewestian to open your learning universe.",
        code: "STUDENT_LOGIN",
      });
    next();
  });
}
