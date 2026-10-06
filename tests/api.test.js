import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createApp, hashPassword } from "../server/app.js";
import { createStore } from "../server/store.js";
import { courses, lessons, lessonIds } from "../shared/catalog.js";
test("catalog has eight valid, deduplicated course pathways", () => {
  assert.equal(courses.length, 8);
  assert.equal(new Set(lessons.map((l) => l.id)).size, lessons.length);
  for (const course of courses) {
    assert.ok(lessonIds(course).length);
    for (const id of lessonIds(course))
      assert.ok(lessons.some((l) => l.id === id));
    assert.equal(course.syllabusStatus, "provisional");
  }
  for (const l of lessons) {
    assert.ok(l.notes.length);
    assert.ok(l.practical.answer);
    assert.ok(l.quiz.options[l.quiz.answer]);
  }
});
test("authentication, protected drafts, public publishing, validation and persistent sessions", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "sewestian-test-"));
  const store = await createStore({ directory });
  const password = "a-test-password-" + crypto.randomUUID();
  await store.set("admin", {
    email: "teacher@example.test",
    passwordHash: hashPassword(password),
  });
  const app = createApp(store);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = "";
  const request = async (url, method = "GET", body, headers = {}) =>
    fetch(base + url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  try {
    assert.equal((await request("/api/health")).status, 200);
    assert.equal((await request("/api/admin/lessons")).status, 401);
    assert.equal(
      (
        await request("/api/auth/login", "POST", {
          email: "teacher@example.test",
          password: "incorrect",
        })
      ).status,
      401,
    );
    const login = await request("/api/auth/login", "POST", {
      email: "teacher@example.test",
      password,
    });
    assert.equal(login.status, 200);
    assert.match(login.headers.get("set-cookie"), /HttpOnly/);
    cookie = login.headers.get("set-cookie").split(";")[0];
    assert.equal((await request("/api/admin/lessons")).status, 200);
    const content = {
      title: "A revised binary lesson",
      summary: "Learn about binary through an updated teacher explanation.",
      notes: [["Binary basics", "One bit has two possible values: 0 or 1."]],
      videoUrl: "",
      status: "draft",
    };
    assert.equal(
      (await request("/api/admin/lessons/number-systems", "PUT", content))
        .status,
      200,
    );
    let catalog = await (await request("/api/catalog")).json();
    assert.notEqual(
      catalog.lessons.find((l) => l.id === "number-systems").title,
      content.title,
    );
    const reopened = await createStore({ directory });
    assert.equal(
      (await reopened.get("draft-number-systems")).title,
      content.title,
    );
    assert.equal(
      (
        await request("/api/admin/lessons/number-systems", "PUT", {
          ...content,
          status: "published",
        })
      ).status,
      200,
    );
    catalog = await (await request("/api/catalog")).json();
    assert.equal(
      catalog.lessons.find((l) => l.id === "number-systems").title,
      content.title,
    );
    assert.equal(await store.get("draft-number-systems"), null);
    assert.equal(
      (
        await request("/api/admin/lessons/number-systems", "PUT", {
          ...content,
          videoUrl: "javascript:alert(1)",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request("/api/admin/lessons/number-systems", "PUT", {
          ...content,
          title: "x",
        })
      ).status,
      400,
    );
    assert.equal(
      (await request("/api/admin/lessons/no-such-lesson", "PUT", content))
        .status,
      404,
    );
    assert.equal(
      (
        await request("/api/admin/lessons/number-systems", "PUT", content, {
          Origin: "https://attacker.example",
        })
      ).status,
      403,
    );
    assert.equal((await request("/api/auth/logout", "POST")).status, 200);
    assert.equal((await request("/api/admin/lessons")).status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  }
});
