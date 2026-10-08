import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { hashPassword } from "../server/app.js";
import { createApp } from "./helpers/content-app.js";
import { createStore } from "../server/store.js";
import { practicals } from "../shared/practicals.js";
import { buildJourney } from "../shared/journeys.js";

test("journeys preserve algorithm, byte, circuit and processor invariants", () => {
  assert.deepEqual(
    buildJourney("journey-sort", { values: "3,-1,3,0" }).at(-1).state.array,
    [-1, 0, 3, 3],
  );
  assert.equal(
    buildJourney("journey-web", { failure: true }).at(-1).state.serverContacted,
    false,
  );
  assert.equal(
    buildJourney("journey-sql", { minimum: 95 }).at(-1).state.rows.length,
    0,
  );
  const file = buildJourney("journey-file", { text: "मुंबई ✓" });
  assert.equal(file.at(-1).state.text, "मुंबई ✓");
  assert.equal(file.at(-1).state.matches, true);
  for (let a = 0; a < 2; a++)
    for (let b = 0; b < 2; b++)
      for (let c = 0; c < 2; c++) {
        const { D, Bout } = buildJourney("journey-circuit", { a, b, c }).at(
          -1,
        ).state;
        assert.equal(a - b - c, D - 2 * Bout);
      }
  assert.equal(
    buildJourney("journey-circuit", { mode: "rs", a: 1, b: 1 }).at(-1).state.Q,
    "invalid",
  );
  assert.equal(
    buildJourney("journey-circuit", { mode: "jk", a: 1, b: 1, q: 1 }).at(-1)
      .state.Q,
    0,
  );
  assert.equal(
    buildJourney("journey-circuit", { mode: "counter" }).at(-1).state.Q2Q1Q0,
    "000",
  );
  const cpu = buildJourney("journey-cpu", { a: 255, b: 1 });
  assert.equal(cpu.at(-1).state.A, "00H");
  assert.equal(cpu.at(-2).state.CY, 1);
  assert.equal(cpu.at(-2).state.Z, 1);
  assert.throws(() => buildJourney("journey-cpu", { a: 256, b: 1 }));
  assert.equal(new Set(practicals.map((p) => p.id)).size, practicals.length);
  for (const p of practicals) {
    assert.ok(p.sourceDetail);
    assert.ok(p.code);
    assert.ok(p.output);
    if (p.id === "cpp-string-reverse") assert.match(p.review, /crossed out/);
  }
});

test("teacher chapters preserve 50 pages, media privacy, course assignment and syllabus evidence across restart", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "sewestian-studio-"));
  const store = await createStore({ directory });
  const password = crypto.randomUUID();
  await store.set("admin", {
    email: "teacher@example.test",
    passwordHash: hashPassword(password),
  });
  const server = createApp(store, { aiKey: "" }).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = "";
  const request = (url, method = "GET", body, auth = true) =>
    fetch(base + url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(auth && cookie ? { Cookie: cookie } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  try {
    assert.equal(
      (
        await request("/api/admin/chapters", "POST", {
          title: "Private course",
          courseIds: ["mh-12-cs1"],
        })
      ).status,
      401,
    );
    const login = await request("/api/auth/login", "POST", {
      email: "teacher@example.test",
      password,
    });
    cookie = login.headers.get("set-cookie").split(";")[0];
    const made = await request("/api/admin/chapters", "POST", {
      title: "Object lifetimes in C++",
      courseIds: ["mh-12-cs1"],
      targetPages: 50,
    });
    assert.equal(made.status, 201);
    const chapter = await made.json();
    let catalog = await (await request("/api/catalog")).json();
    assert.ok(!catalog.lessons.some((l) => l.id === chapter.id));
    const form = new FormData();
    form.append(
      "file",
      new Blob(["%PDF-1.4\nTeacher reference"], { type: "application/pdf" }),
      "reference.pdf",
    );
    const upload = await fetch(base + "/api/admin/uploads", {
      method: "POST",
      headers: { Cookie: cookie },
      body: form,
    });
    assert.equal(upload.status, 201);
    const attachment = await upload.json();
    assert.equal(
      (await request("/api/media/" + attachment.id, "GET", undefined, false))
        .status,
      404,
    );
    assert.equal((await request("/api/media/" + attachment.id)).status, 200);
    const notes = Array.from({ length: 50 }, (_, i) => [
      `Page ${i + 1}`,
      `Concept ${i + 1}: ${"A worked explanation. ".repeat(190)}`,
    ]);
    const content = {
      ...chapter,
      notes,
      mediaIds: [attachment.id],
      courseIds: ["mh-12-cs1", "cbse-12-cs"],
      status: "draft",
    };
    assert.equal(
      (await request(`/api/admin/lessons/${chapter.id}`, "PUT", content))
        .status,
      200,
    );
    const reopened = await createStore({ directory });
    assert.equal((await reopened.get(`draft-${chapter.id}`)).notes.length, 50);
    assert.equal(
      (
        await request(`/api/admin/lessons/${chapter.id}`, "PUT", {
          ...content,
          status: "published",
        })
      ).status,
      200,
    );
    catalog = await (await request("/api/catalog")).json();
    assert.equal(
      catalog.lessons.find((l) => l.id === chapter.id).notes.length,
      50,
    );
    for (const id of content.courseIds)
      assert.ok(
        catalog.courses
          .find((c) => c.id === id)
          .units.some((u) => u.lessons.includes(chapter.id)),
      );
    assert.ok(
      !catalog.courses
        .find((c) => c.id === "mh-11-cs2")
        .units.some((u) => u.lessons.includes(chapter.id)),
    );
    assert.equal(
      (await request("/api/media/" + attachment.id, "GET", undefined, false))
        .status,
      200,
    );
    const mapping = {
      session: "2026–27",
      sourceTitle: "Teacher reference",
      sourceUrl: "",
      mediaId: "",
      reviewed: true,
      notes: "Needs official comparison",
      rows: [
        {
          topic: "Object lifetime",
          sourcePage: "2",
          lessonIds: [chapter.id],
          practicalIds: ["cpp-lifecycle"],
        },
      ],
    };
    assert.equal(
      (await request("/api/admin/syllabus/mh-12-cs1", "PUT", mapping)).status,
      400,
    );
    assert.equal(
      (
        await request("/api/admin/syllabus/mh-12-cs1", "PUT", {
          ...mapping,
          sourceUrl: "https://mahahsscboard.in/",
        })
      ).status,
      200,
    );
    assert.equal((await request("/api/admin/assistant/status")).status, 200);
    assert.equal(
      (await request("/api/admin/assistant/draft", "POST", {})).status,
      503,
    );
    const imported = new FormData();
    imported.append(
      "file",
      new Blob(["# Chapter\nOverview\n\n## A second page\nExample"], {
        type: "application/octet-stream",
      }),
      "notes.md",
    );
    const importedResponse = await fetch(base + "/api/admin/import-notes", {
      method: "POST",
      headers: { Cookie: cookie },
      body: imported,
    });
    assert.equal(importedResponse.status, 200);
    assert.equal((await importedResponse.json()).notes.length, 2);
    assert.equal(
      (await request(`/api/admin/chapters/${chapter.id}/unpublish`, "POST"))
        .status,
      200,
    );
    catalog = await (await request("/api/catalog")).json();
    assert.ok(!catalog.lessons.some((l) => l.id === chapter.id));
    assert.equal(
      (await request("/api/media/" + attachment.id, "GET", undefined, false))
        .status,
      404,
    );
    assert.equal(
      catalog.courses.find((c) => c.id === "mh-12-cs1").syllabus.rows[0]
        .lessonIds.length,
      0,
    );
  } finally {
    await new Promise((r) => server.close(r));
    await rm(directory, { recursive: true, force: true });
  }
});

test("AI drafting is protected, validates provider output and never publishes", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "sewestian-ai-"));
  const store = await createStore({ directory });
  const password = crypto.randomUUID();
  await store.set("admin", {
    email: "teacher@example.test",
    passwordHash: hashPassword(password),
  });
  let payload;
  const server = createApp(store, {
    aiKey: "test-only-not-a-real-key",
    aiFetch: async (url, options) => {
      assert.equal(url, "https://api.openai.com/v1/responses");
      payload = JSON.parse(options.body);
      return new Response(
        JSON.stringify({
          status: "completed",
          output: [
            {
              content: [
                {
                  type: "output_text",
                  text: JSON.stringify({
                    pages: [
                      {
                        title: "Stack operations",
                        body: "A stack removes the most recently inserted value first.",
                      },
                    ],
                  }),
                },
              ],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  }).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal(
      (await fetch(base + "/api/admin/assistant/status")).status,
      401,
    );
    const login = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "teacher@example.test", password }),
    });
    const cookie = login.headers.get("set-cookie").split(";")[0];
    const response = await fetch(base + "/api/admin/assistant/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        topic: "Stacks",
        instructions: "Use a short example",
        courseId: "cbse-12-cs",
        pageCount: 1,
        startPage: 1,
        context: "",
      }),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).reviewRequired, true);
    assert.equal(payload.store, false);
    assert.equal((await store.list("published-")).length, 0);
    assert.equal((await store.list("custom-")).length, 0);
  } finally {
    await new Promise((r) => server.close(r));
    await rm(directory, { recursive: true, force: true });
  }
});
