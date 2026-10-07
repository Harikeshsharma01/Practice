import { chromium } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import { createServer } from "node:http";
import path from "node:path";
import assert from "node:assert/strict";
import { createStore } from "../server/store.js";
import { createApp, hashPassword } from "../server/app.js";
const directory = await mkdtemp(path.join(os.tmpdir(), "sewestian-teacher-"));
const store = await createStore({ directory });
const password = crypto.randomUUID() + "-teacher";
await store.set("admin", {
  email: "teacher@example.test",
  passwordHash: hashPassword(password),
});
const server = createServer().listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}`;
server.on("request", createApp(store, { clientOrigin: base }));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/admin");
  await page.getByLabel("Email address").fill("teacher@example.test");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Enter your workspace" }).click();
  await page.waitForTimeout(500);
  const loginError = await page.locator(".form-error").allTextContents();
  if (loginError.length) throw new Error(loginError.join(" "));
  await page
    .getByRole("button", { name: "Quick lesson editor", exact: true })
    .click();
  await page
    .getByLabel("Lesson title")
    .fill("A teacher-reviewed computer lesson");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved" }).waitFor();
  let catalog = await (await fetch(base + "/api/catalog")).json();
  assert.notEqual(
    catalog.lessons[0].title,
    "A teacher-reviewed computer lesson",
  );
  await page.getByRole("button", { name: "Publish to students" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Lesson published" })
    .waitFor();
  catalog = await (await fetch(base + "/api/catalog")).json();
  assert.equal(catalog.lessons[0].title, "A teacher-reviewed computer lesson");
  await page.screenshot({
    path: "/tmp/sewestian-screenshots/teacher-workspace.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.getByRole("heading", { name: "Welcome, teacher." }).waitFor();
  await page.goto(base + "/course/cbse-11-cs");
  await page.getByRole("link", { name: "Open course book" }).click();
  await page.locator(".book-chapter").first().waitFor();
  const course = catalog.courses.find((c) => c.id === "cbse-11-cs");
  assert.equal(
    await page.locator(".book-chapter").count(),
    new Set(course.units.flatMap((u) => u.lessons)).size,
  );
  await page.pdf({
    path: "/tmp/sewestian-screenshots/course-book.pdf",
    format: "A4",
    printBackground: true,
  });
  await page.goto(base + "/lesson/number-systems");
  await page.getByRole("button", { name: "Switch to typed notes" }).click();
  assert.equal(await page.locator(".handwritten-notes").count(), 0);
  await page
    .getByRole("button", { name: "Switch to handwritten style" })
    .click();
  assert.equal(await page.locator(".handwritten-notes").count(), 1);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: built-app teacher sign-in, private draft, publish, sign-out, expanded printable course book, PDF generation, handwriting toggle, and browser errors.",
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
  await rm(directory, { recursive: true, force: true });
}
