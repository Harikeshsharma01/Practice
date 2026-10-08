import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { createStore } from "../server/store.js";
import { createApp, hashPassword } from "../server/app.js";
const directory = await mkdtemp(
  path.join(os.tmpdir(), "sewestian-support-ui-"),
);
const store = await createStore({ directory });
const password = crypto.randomUUID();
await store.set("admin", {
  email: "teacher@example.test",
  passwordHash: hashPassword(password),
});
const server = createApp(store).listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const errors = [];
const desktop = await browser.newContext({
  viewport: { width: 1440, height: 1050 },
});
const phone = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36 SewestianAndroid/1.0",
});
const admin = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
});
const student = await desktop.newPage(),
  mobile = await phone.newPage(),
  teacher = await admin.newPage();
for (const page of [student, mobile, teacher])
  page.on("pageerror", (e) => errors.push(e.message));
try {
  await student.goto(base + "/lesson/number-systems");
  await student
    .getByRole("link", { name: "Ask your teacher about this lesson" })
    .click();
  await expect(
    student.getByLabel("Course, lesson or page (optional)"),
  ).not.toHaveValue("");
  await student
    .getByLabel("Your name", { exact: true })
    .fill("Aarav browser test");
  await student
    .getByLabel("Subject", { exact: true })
    .fill("Help with binary carry");
  await student
    .getByLabel("Your message", { exact: true })
    .fill("Why is 1 + 1 = 10? <img src=x onerror=alert(1)>");
  await student
    .getByRole("button", { name: "Send to teacher", exact: true })
    .click();
  await expect(
    student.getByRole("heading", { name: "Help with binary carry" }),
  ).toBeVisible();
  await expect(student.locator(".support-message img")).toHaveCount(0);
  await student
    .getByText("Continue this inbox on another device", { exact: true })
    .click();
  await student
    .getByRole("button", { name: "Show my private inbox code" })
    .click();
  const code = await student
    .getByLabel("My private inbox code", { exact: true })
    .inputValue();
  assert.match(code, /^[a-f0-9]{64}$/);
  await student
    .getByText("Continue this inbox on another device", { exact: true })
    .click();
  await mobile.goto(base + "/support");
  await expect(
    mobile.getByText("No conversations yet.", { exact: true }),
  ).toBeVisible();
  await mobile
    .getByText("Continue this inbox on another device", { exact: true })
    .click();
  await mobile.getByLabel("Saved inbox code", { exact: true }).fill(code);
  await mobile
    .getByRole("button", { name: "Link saved inbox", exact: true })
    .click();
  await mobile.getByRole("button", { name: /Help with binary carry/ }).click();
  await expect(
    mobile.getByRole("heading", { name: "Help with binary carry" }),
  ).toBeVisible();
  await mobile
    .getByText("Continue this inbox on another device", { exact: true })
    .click();
  const login = await admin.request.post(base + "/api/auth/login", {
    data: { email: "teacher@example.test", password },
  });
  assert.equal(login.status(), 200);
  await teacher.goto(base + "/admin");
  await teacher
    .getByRole("button", { name: "Student inbox", exact: true })
    .click();
  await teacher.getByRole("button", { name: /Help with binary carry/ }).click();
  await teacher
    .getByLabel("Your reply", { exact: true })
    .fill("One plus one makes two. Write 0 in this column and carry 1.");
  await teacher
    .getByRole("button", { name: "Send reply", exact: true })
    .click();
  await expect(teacher.getByText("Reply sent.", { exact: true })).toBeVisible();
  // Verify automatic reply refresh, not a page reload.
  await expect(mobile.locator(".support-message.teacher")).toContainText(
    "carry 1",
    { timeout: 20000 },
  );
  await teacher
    .getByRole("button", { name: "Mark resolved", exact: true })
    .click();
  await expect(
    teacher.getByRole("button", { name: "Reopen conversation", exact: true }),
  ).toBeVisible();
  await mobile
    .getByRole("button", { name: "Refresh conversations", exact: true })
    .click();
  await expect(
    mobile.getByText(
      "This conversation is resolved. Start a new question if you need more help.",
    ),
  ).toBeVisible();
  assert.ok(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Mobile inbox must fit",
  );
  await mkdir("/tmp/sewestian-screenshots", { recursive: true });
  await mobile.screenshot({
    path: "/tmp/sewestian-screenshots/support-phone.png",
    fullPage: true,
  });
  await teacher.screenshot({
    path: "/tmp/sewestian-screenshots/support-teacher.png",
    fullPage: true,
  });
  // APK landing must remain usable without the learning backend.
  await mobile.route("**/api/**", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"Test backend unavailable"}',
    }),
  );
  await mobile.goto(base + "/mobile");
  await expect(
    mobile.getByRole("link", { name: "Download Android APK", exact: true }),
  ).toBeVisible();
  const downloadEvent = mobile.waitForEvent("download");
  await mobile
    .getByRole("link", { name: "Download Android APK", exact: true })
    .click();
  const download = await downloadEvent;
  const bytes = await readFile(await download.path());
  const release = JSON.parse(
    await readFile(
      new URL("../shared/android-release.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    release.sha256,
  );
  assert.equal(download.suggestedFilename(), "Sewestian.apk");
  assert.ok(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await mobile.screenshot({
    path: "/tmp/sewestian-screenshots/android-download.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: lesson context, private questions, cross-device inbox linking, teacher replies, polling, resolution, mobile layout, XSS escaping, and verified APK download without API.",
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
  await rm(directory, { recursive: true, force: true });
}
