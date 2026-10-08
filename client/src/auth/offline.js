// Device-local accounts only. No network authentication, teacher sync or Google claims.
let dbPromise;
const sessionKey = "sewestian-offline-session";
const encode = (value) => new TextEncoder().encode(value);
const hex = (bytes) =>
  [...new Uint8Array(bytes)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
const random = () => hex(crypto.getRandomValues(new Uint8Array(32)));
function database() {
  if (!dbPromise)
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open("sewestian-local-accounts", 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore("accounts", { keyPath: "email" });
        req.result.createObjectStore("attempts");
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () =>
        reject(
          Error(
            "Device storage is unavailable. Enable app storage and try again.",
          ),
        );
    });
  return dbPromise;
}
async function read(store, key) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const r = db.transaction(store).objectStore(store).get(key);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function write(store, value, key, add = false) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite"),
      target = tx.objectStore(store);
    key === undefined
      ? target[add ? "add" : "put"](value)
      : target.put(value, key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
async function digest(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return hex(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: encode(salt),
        iterations: 210000,
        hash: "SHA-256",
      },
      key,
      256,
    ),
  );
}
const userView = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  provider: "local-device",
});
async function current() {
  let s;
  try {
    s = JSON.parse(sessionStorage.getItem(sessionKey));
  } catch {}
  if (!s || s.expires < Date.now()) return null;
  const user = await read("accounts", s.email);
  return user?.id === s.id ? user : null;
}
export async function offlineApi(path, options = {}) {
  const body = options.body ? JSON.parse(options.body) : {};
  const user = await current();
  if (path === "/student/status")
    return {
      required: true,
      authenticated: !!user,
      user: user ? userView(user) : null,
      teacher: false,
      googleEnabled: false,
      offline: true,
    };
  if (path === "/student/logout") {
    sessionStorage.removeItem(sessionKey);
    return { ok: true };
  }
  if (path === "/student/signup" || path === "/student/login") {
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      typeof body.password !== "string" ||
      body.password.length < 12 ||
      body.password.length > 128
    )
      throw Error("Enter a valid email and a password of 12–128 characters.");
    const attempts = (await read("attempts", email)) || { count: 0, until: 0 };
    if (attempts.until > Date.now())
      throw Error("Too many attempts. Wait five minutes before trying again.");
    let account = await read("accounts", email);
    if (path.endsWith("/signup")) {
      if (
        typeof body.name !== "string" ||
        body.name.trim().length < 2 ||
        body.name.trim().length > 80
      )
        throw Error("Enter a name of 2–80 characters.");
      if (account)
        throw Error(
          "This email already has an account on this phone. Sign in instead.",
        );
      const salt = random();
      account = {
        id: crypto.randomUUID(),
        email,
        name: body.name.trim(),
        salt,
        passwordHash: await digest(body.password, salt),
      };
      try {
        await write("accounts", account, undefined, true);
      } catch (e) {
        if (e?.name === "ConstraintError")
          throw Error("This email already has an account. Sign in instead.");
        throw e;
      }
    } else {
      const candidate = await digest(
        body.password,
        account?.salt || "00000000000000000000000000000000",
      );
      if (!account || candidate !== account.passwordHash) {
        const count = attempts.count + 1;
        await write(
          "attempts",
          {
            count: count >= 5 ? 0 : count,
            until: count >= 5 ? Date.now() + 300000 : 0,
          },
          email,
        );
        throw Error("The email or password is incorrect.");
      }
    }
    await write("attempts", { count: 0, until: 0 }, email);
    sessionStorage.setItem(
      sessionKey,
      JSON.stringify({
        id: account.id,
        email,
        expires: Date.now() + 86400_000,
      }),
    );
    return { user: userView(account) };
  }
  if (!user) throw Error("Sign in to open your learning universe.");
  if (path === "/classroom/status")
    return { enabled: false, allowed: true, teacher: false };
  if (path === "/catalog") {
    const response = await fetch("/offline/catalog.json");
    if (!response.ok)
      throw Error(
        "Bundled lessons are missing. Reinstall the current Sewestian APK.",
      );
    return response.json();
  }
  if (path === "/auth/status")
    return { configured: false, authenticated: false };
  throw Error(
    "This feature needs the connected teacher website. It is not available in the offline app.",
  );
}
