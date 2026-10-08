import { request as httpRequest } from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { hashPassword } from "../server/app.js";
import { createApp } from "./helpers/content-app.js";
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

test("local login accepts the actual website origin while production requires its configured origin", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "sewestian-origin-"));
  const store = await createStore({ directory });
  const password = "origin-test-" + crypto.randomUUID();
  await store.set("admin", {
    email: "teacher@example.test",
    passwordHash: hashPassword(password),
  });
  async function withServer(options, run) {
    const server = createApp(store, options).listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const login = (origin, headers = {}) => {
      // Node's fetch normalises Host to the URL's host; raw HTTP preserves
      // the browser host exactly as Vite's proxy forwards it.
      if (headers.Host)
        return new Promise((resolve, reject) => {
          const request = httpRequest(
            base + "/api/auth/login",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Origin: origin,
                ...headers,
              },
            },
            (response) => {
              const chunks = [];
              response.on("data", (chunk) => chunks.push(chunk));
              response.on("end", () =>
                resolve(
                  new Response(Buffer.concat(chunks), {
                    status: response.statusCode,
                  }),
                ),
              );
            },
          );
          request.on("error", reject);
          request.end(
            JSON.stringify({ email: "teacher@example.test", password }),
          );
        });
      return fetch(base + "/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: origin,
          ...headers,
        },
        body: JSON.stringify({ email: "teacher@example.test", password }),
      });
    };
    try {
      await run(login, base);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  }
  try {
    await withServer({}, async (login, base) => {
      assert.equal(
        (await login(base)).status,
        200,
        "same-origin login on an alternate development port",
      );
      assert.equal(
        (await login("http://192.168.1.12:5174", { Host: "192.168.1.12:5174" }))
          .status,
        200,
        "LAN origin preserved by the development proxy",
      );
      assert.equal(
        (await login("http://[::1]:5174", { Host: "[::1]:5174" })).status,
        200,
        "IPv6 loopback",
      );
      assert.equal(
        (await login("https://attacker.example")).status,
        403,
        "unrelated origins remain blocked",
      );
      assert.equal(
        (await login("null")).status,
        403,
        "opaque origins remain blocked",
      );
    });
    await withServer(
      { production: true, clientOrigin: "  https://classroom.example/  " },
      async (login, base) => {
        const response = await login("https://classroom.example");
        assert.equal(
          response.status,
          200,
          "configured origin tolerates surrounding whitespace and trailing slash",
        );
        assert.match(response.headers.get("set-cookie"), /Secure/);
        assert.equal(
          (await login(base)).status,
          403,
          "development same-origin handling is disabled in production",
        );
        assert.equal(
          (await login("https://preview.classroom.example")).status,
          403,
          "no implicit subdomain access",
        );
        assert.equal(
          (await login("https://classroom.example.attacker.example")).status,
          403,
          "no hostname prefix matching",
        );
        assert.equal((await login("null")).status, 403);
      },
    );
    assert.throws(
      () =>
        createApp(store, { clientOrigin: "https://classroom.example/admin" }),
      /CLIENT_ORIGIN/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
