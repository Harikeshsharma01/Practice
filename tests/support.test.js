import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { hashPassword } from "../server/app.js";
import { createApp } from "./helpers/content-app.js";
import { createStore } from "../server/store.js";

test("private student inbox links across devices; teacher replies persist without leaking or overwriting messages", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "sewestian-support-"));
  const store = await createStore({ directory });
  const password = crypto.randomUUID();
  await store.set("admin", {
    email: "teacher@example.test",
    passwordHash: hashPassword(password),
  });
  let server = createApp(store).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  let base = `http://127.0.0.1:${server.address().port}`;
  const request = (endpoint, cookie = "", method = "GET", body, extra = {}) =>
    fetch(base + "/api" + endpoint, {
      method,
      headers: { "content-type": "application/json", cookie, ...extra },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  const cookie = (res) => res.headers.get("set-cookie").split(";")[0];
  try {
    assert.equal((await request("/admin/support")).status, 401);
    const session = await request("/support/session", "", "POST", {});
    assert.equal(session.status, 200);
    assert.match(session.headers.get("cache-control"), /no-store/);
    assert.match(session.headers.get("set-cookie"), /HttpOnly/);
    const student = cookie(session),
      code = (await session.json()).code;
    assert.match(code, /^[a-f0-9]{64}$/);
    assert.equal(
      (await request("/support/session", "", "POST", { code: [code] })).status,
      400,
    );
    assert.equal(
      (await request("/support/session", "", "POST", { code: "a".repeat(64) }))
        .status,
      400,
    );
    const payload = {
      name: "Test student",
      kind: "doubt",
      subject: "Binary addition",
      context: "XI CS",
      message: "Why does 1 + 1 become 10?",
      role: "teacher",
    };
    assert.equal((await request("/support", "", "POST", payload)).status, 401);
    assert.equal(
      (
        await request("/support", student, "POST", {
          ...payload,
          message: "x".repeat(5001),
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request("/support", student, "POST", payload, {
          origin: "https://attacker.example",
        })
      ).status,
      403,
    );
    const created = await request("/support", student, "POST", payload);
    assert.equal(created.status, 201);
    const thread = await created.json();
    assert.equal(thread.owner, undefined);
    assert.equal(thread.lastRole, "student");
    const second = await request("/support/session", "", "POST", {}),
      other = cookie(second);
    assert.deepEqual(
      (await (await request("/support", other)).json()).threads,
      [],
    );
    assert.equal((await request(`/support/${thread.id}`, other)).status, 404);
    assert.equal(
      (
        await request(`/support/${thread.id}/replies`, other, "POST", {
          message: "intruder",
        })
      ).status,
      404,
    );
    assert.equal(
      (
        await request(`/admin/support/${thread.id}/replies`, student, "POST", {
          message: "fake teacher",
        })
      ).status,
      401,
    );
    const login = await request("/auth/login", "", "POST", {
      email: "teacher@example.test",
      password,
    });
    const teacher = cookie(login);
    const inbox = await (await request("/admin/support", teacher)).json();
    assert.equal(inbox.threads.length, 1);
    assert.ok(!JSON.stringify(inbox).includes(code));
    const responses = await Promise.all([
      request(`/support/${thread.id}/replies`, student, "POST", {
        message: "Please show the carry.",
        role: "teacher",
      }),
      request(`/admin/support/${thread.id}/replies`, teacher, "POST", {
        message: "Two units make one pair: write 0 and carry 1.",
      }),
    ]);
    assert.ok(responses.every((r) => r.status === 201));
    const linked = await request("/support/session", other, "POST", { code });
    const phone = cookie(linked);
    const conversation = await (
      await request(`/support/${thread.id}`, phone)
    ).json();
    assert.equal(conversation.messages.length, 3);
    assert.equal(
      conversation.messages.filter((m) => m.role === "teacher").length,
      1,
    );
    assert.equal(
      (
        await request(`/admin/support/${thread.id}/status`, student, "PUT", {
          status: "resolved",
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await request(`/admin/support/${thread.id}/status`, teacher, "PUT", {
          status: "resolved",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await request(`/support/${thread.id}/replies`, phone, "POST", {
          message: "follow-up",
        })
      ).status,
      409,
    );
    await request(`/admin/support/${thread.id}/status`, teacher, "PUT", {
      status: "open",
    });
    await new Promise((r) => server.close(r));
    const reopened = await createStore({ directory });
    server = createApp(reopened).listen(0, "127.0.0.1");
    await new Promise((r) => server.once("listening", r));
    base = `http://127.0.0.1:${server.address().port}`;
    assert.equal(
      (await (await request(`/support/${thread.id}`, phone)).json()).messages
        .length,
      3,
    );
    assert.equal(
      (
        await request(`/support/${thread.id}/replies`, phone, "POST", {
          message: "Understood, thank you.",
        })
      ).status,
      201,
    );
    let limited;
    for (let i = 0; i < 31; i++)
      limited = await request("/support/session", "", "POST", {
        code: "invalid",
      });
    assert.equal(limited.status, 429);
  } finally {
    await new Promise((r) => server.close(r));
    await rm(directory, { recursive: true, force: true });
  }
});
