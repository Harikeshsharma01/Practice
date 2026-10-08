import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createApp } from "../server/app.js";
import { createStore } from "../server/store.js";
const cookie = (r) =>
  r.headers
    .getSetCookie()
    .map((s) => s.split(";")[0])
    .join("; ");
async function fixture(options = {}) {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "sewestian-accounts-"),
  );
  const store = await createStore({ directory });
  const server = createApp(store, options).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  return {
    store,
    base,
    request: (p, c = "", method = "GET", body, headers = {}) =>
      fetch(base + p, {
        method,
        headers: { "content-type": "application/json", cookie: c, ...headers },
        body: body ? JSON.stringify(body) : undefined,
        redirect: "manual",
      }),
    close: async () => {
      await new Promise((r) => server.close(r));
      await rm(directory, { recursive: true, force: true });
    },
  };
}
test("mandatory learner login, normalized signup, hashed passwords, session revocation and account-bound inbox", async () => {
  const f = await fixture();
  try {
    for (const path of [
      "/api/catalog",
      "/api/support",
      "/videos/computer-systems.mp4",
      "/%76ideos/computer-systems.mp4",
    ])
      assert.equal((await f.request(path)).status, 401);
    assert.equal((await f.request("/api/student/google/start")).status, 503);
    assert.equal((await f.request("/api/student/status")).status, 200);
    const payload = {
      name: "Test Student",
      email: "Student@Example.test",
      password: "a-secure-local-password",
    };
    const signup = await f.request("/api/student/signup", "", "POST", payload);
    assert.equal(signup.status, 201);
    const signed = cookie(signup),
      user = (await signup.json()).user;
    assert.match(signup.headers.get("set-cookie"), /HttpOnly/);
    assert.equal(user.passwordHash, undefined);
    const stored = await f.store.get("student-user-" + user.id);
    assert.notEqual(stored.passwordHash, payload.password);
    assert.ok(!JSON.stringify(stored).includes(payload.password));
    assert.equal(
      (
        await f.request("/api/student/signup", "", "POST", {
          ...payload,
          email: "student@example.test",
        })
      ).status,
      409,
    );
    assert.equal(
      (
        await f.request("/api/student/login", "", "POST", {
          ...payload,
          password: "wrong-but-long-password",
        })
      ).status,
      401,
    );
    assert.equal((await f.request("/api/catalog", signed)).status, 200);
    assert.equal((await f.request("/api/admin/lessons", signed)).status, 401);
    assert.equal(
      (
        await f.request(
          "/api/student/signup",
          "",
          "POST",
          { ...payload, email: "second@example.test" },
          { origin: "https://attacker.example" },
        )
      ).status,
      403,
    );
    const created = await f.request("/api/support", signed, "POST", {
      name: "Student",
      kind: "doubt",
      subject: "Carry in binary",
      context: "CS",
      message: "Please explain carry.",
    });
    assert.equal(created.status, 201);
    const thread = await created.json();
    const device = await f.request("/api/student/login", "", "POST", payload);
    const secondCookie = cookie(device);
    assert.equal(
      (await f.request("/api/support/" + thread.id, secondCookie)).status,
      200,
    );
    const other = await f.request("/api/student/signup", "", "POST", {
      ...payload,
      email: "different@example.test",
    });
    assert.equal(
      (await f.request("/api/support/" + thread.id, cookie(other))).status,
      404,
    );
    await f.request("/api/student/logout", signed, "POST", {});
    assert.equal((await f.request("/api/catalog", signed)).status, 401);
    assert.equal((await f.request("/api/catalog", secondCookie)).status, 200);
    const concurrent = await Promise.all(
      [1, 2].map(() =>
        f.request("/api/student/signup", "", "POST", {
          ...payload,
          email: "concurrent@example.test",
        }),
      ),
    );
    assert.deepEqual(concurrent.map((r) => r.status).sort(), [201, 409]);
  } finally {
    await f.close();
  }
});
test("Google website callback validates state, nonce and replay before creating a student session", async () => {
  let issued,
    verified = false;
  const googleClient = {
    generateAuthUrl(opts) {
      issued = opts;
      return "https://accounts.google.com/o/oauth2/v2/auth?state=" + opts.state;
    },
    async getToken() {
      return { tokens: { id_token: "mock-token" } };
    },
    async verifyIdToken({ audience }) {
      assert.equal(audience, "client-test");
      verified = true;
      return {
        getPayload: () => ({
          nonce: issued.nonce,
          email_verified: true,
          sub: "google-subject",
          email: "google@example.test",
          name: "Google learner",
        }),
      };
    },
  };
  const f = await fixture({
    googleClientId: "client-test",
    googleClientSecret: "test-placeholder",
    googleRedirectUri: "http://localhost/api/student/google/callback",
    googleClient,
  });
  try {
    const start = await f.request("/api/student/google/start");
    assert.equal(start.status, 302);
    assert.match(
      start.headers.get("location"),
      /^https:\/\/accounts.google.com/,
    );
    assert.match(issued.code_challenge, /^[\w-]{43}$/);
    const endpoint =
      "/api/student/google/callback?state=" + issued.state + "&code=mock";
    const invalid = await f.request(endpoint);
    assert.equal(invalid.headers.get("location"), "/?signin=google-failed");
    assert.equal(verified, false);
    const result = await f.request(endpoint, cookie(start));
    assert.equal(result.status, 302);
    assert.equal(result.headers.get("location"), "/");
    assert.equal(verified, true);
    const signed = cookie(result);
    assert.equal((await f.request("/api/catalog", signed)).status, 200);
    assert.equal((await f.request("/api/admin/lessons", signed)).status, 401);
    const again = await f.request(endpoint, cookie(start));
    assert.equal(again.headers.get("location"), "/?signin=google-failed");
  } finally {
    await f.close();
  }
});
