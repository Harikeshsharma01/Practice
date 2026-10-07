import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createApp, hashPassword } from "../server/app.js";
import { createStore } from "../server/store.js";
const directory = await mkdtemp(
  path.join(os.tmpdir(), "sewestian-studio-browser-"),
);
const store = await createStore({ directory });
const password = crypto.randomUUID();
await store.set("admin", {
  email: "teacher@example.test",
  passwordHash: hashPassword(password),
});
const server = createApp(store, { aiKey: "" }).listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
await mkdir("/tmp/sewestian-screenshots", { recursive: true });
let page;
try {
  page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(7000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/admin");
  await page.getByLabel("Email address").fill("teacher@example.test");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Enter your workspace" }).click();
  await page
    .getByLabel("New chapter title")
    .fill("A deep guide to object lifetimes");
  await page.getByLabel("Starting course").selectOption("mh-12-cs1");
  await page
    .getByRole("button", { name: "Create chapter", exact: true })
    .click();
  await page
    .getByRole("heading", {
      name: "A deep guide to object lifetimes",
      exact: true,
    })
    .waitFor();
  await page
    .getByLabel("Page heading", { exact: true })
    .fill("Construction begins an object lifetime");
  await page
    .getByRole("textbox", { name: "Page content", exact: true })
    .fill(
      "The constructor establishes the initial state. Trace an object entering and leaving a nested scope.",
    );
  await page.getByRole("button", { name: "Add page", exact: true }).click();
  await page
    .getByLabel("Page heading", { exact: true })
    .fill("Destruction follows scope exit");
  await page
    .getByRole("textbox", { name: "Page content", exact: true })
    .fill(
      "When the block ends, automatic objects are destroyed in reverse construction order.",
    );
  await page
    .getByRole("button", { name: "Save chapter draft", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Chapter draft saved." })
    .waitFor();
  let catalog = await (await fetch(base + "/api/catalog")).json();
  assert.ok(
    !catalog.lessons.some(
      (l) => l.title === "A deep guide to object lifetimes",
    ),
  );
  await page
    .getByRole("button", { name: "Publish chapter", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Chapter published" })
    .waitFor();
  catalog = await (await fetch(base + "/api/catalog")).json();
  const chapter = catalog.lessons.find(
    (l) => l.title === "A deep guide to object lifetimes",
  );
  assert.equal(chapter.notes.length, 2);
  assert.deepEqual(chapter.courseIds, ["mh-12-cs1"]);
  await page.getByRole("button", { name: "AI drafting", exact: true }).click();
  await page
    .getByText("AI generation needs OPENAI_API_KEY", { exact: false })
    .waitFor();
  assert.equal(
    await page.getByRole("button", { name: "Draft next pages" }).isDisabled(),
    true,
  );
  await page.getByRole("button", { name: "Chapters", exact: true }).click();
  await page.screenshot({
    path: "/tmp/sewestian-screenshots/chapter-studio.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Teacher studio fits phone width",
  );
  await page.screenshot({
    path: "/tmp/sewestian-screenshots/studio-mobile.png",
    fullPage: true,
  });
  await page.goto(base + `/lesson/${chapter.id}`);
  await page
    .getByRole("heading", {
      name: "Construction begins an object lifetime",
      exact: true,
    })
    .waitFor();
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await page
    .getByRole("heading", {
      name: "Destruction follows scope exit",
      exact: true,
    })
    .waitFor();
  await page.goto(base + "/practicals?course=mh-11-cs2");
  await page
    .getByRole("heading", { name: "Implement basic logic gates", exact: true })
    .waitFor();
  await page
    .getByLabel("My observed result")
    .fill("My AND-gate output was high only for 11.");
  await page.reload();
  await page
    .getByRole("heading", { name: "Implement basic logic gates", exact: true })
    .waitFor();
  assert.equal(
    await page.getByLabel("My observed result").inputValue(),
    "My AND-gate output was high only for 11.",
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Practical library fits phone width",
  );
  await page.goto(base + "/labs?lab=journey-web");
  await page
    .getByRole("heading", { name: "A learner opens a page", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page
    .getByRole("heading", { name: "Resolve the hostname", exact: true })
    .waitFor();
  await page.getByLabel("Simulate DNS failure").check();
  await page.getByLabel("Journey step").fill("2");
  await page
    .getByRole("heading", {
      name: "No destination could be resolved",
      exact: true,
    })
    .waitFor();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Journey fits phone width",
  );
  await page.screenshot({
    path: "/tmp/sewestian-screenshots/journey-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/labs?lab=journey-cpu");
  await page
    .getByRole("heading", {
      name: "Fetch the instruction sequence",
      exact: true,
    })
    .waitFor();
  await page.getByLabel("Journey step").fill("4");
  await page
    .getByRole("heading", { name: "Update status flags", exact: true })
    .waitFor();
  await page.screenshot({
    path: "/tmp/sewestian-screenshots/register-journey.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: chapter creation, page authoring, private draft, publishing, paginated reader, AI disabled state, local practical observations, journey controls, desktop and phone layouts.",
  );
} catch (error) {
  console.log(
    "Studio labels",
    await page.locator(".studio-page-edit").ariaSnapshot(),
  );
  console.log(
    "Studio diagnostic",
    await page
      .locator(".studio-page-edit")
      .innerText()
      .catch(() => "not present"),
  );
  console.log(
    "Runtime errors",
    await page.locator(".form-error").allTextContents(),
  );
  await page.screenshot({
    path: "/tmp/sewestian-screenshots/studio-failure.png",
    fullPage: true,
  });
  throw error;
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
  await rm(directory, { recursive: true, force: true });
}
