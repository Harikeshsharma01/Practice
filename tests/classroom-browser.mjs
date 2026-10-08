import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createStore } from "../server/store.js";
import { hashPassword } from "../server/app.js";
import { createApp } from "./helpers/content-app.js";
const directory = await mkdtemp(path.join(os.tmpdir(), "sewestian-class-ui-"));
const store = await createStore({ directory });
const password = crypto.randomUUID() + "-teacher";
await store.set("admin", {
  email: "teacher@example.test",
  passwordHash: hashPassword(password),
});
const server = createApp(store, { classroomLan: true }).listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const admin = await browser.newContext({
  viewport: { width: 1440, height: 1050 },
});
const student = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36",
});
const teacher = await admin.newPage(),
  phone = await student.newPage();
const errors = [];
for (const p of [teacher, phone])
  p.on("pageerror", (e) => errors.push(e.message));
await mkdir("/tmp/sewestian-screenshots", { recursive: true });
try {
  await teacher.goto(base + "/admin");
  await teacher
    .getByRole("button", { name: "Teacher sign-in", exact: true })
    .click();
  await teacher
    .getByLabel("Email address", { exact: true })
    .fill("teacher@example.test");
  await teacher.getByLabel("Password", { exact: true }).fill(password);
  await teacher
    .getByRole("button", { name: "Enter teacher workspace", exact: true })
    .click();
  await teacher
    .getByRole("button", { name: "Classroom access", exact: true })
    .click();
  await teacher
    .getByRole("button", {
      name: "Start new class · reset all access",
      exact: true,
    })
    .click();
  await teacher.waitForFunction(() =>
    /^\d{6}$/.test(
      document.querySelector(".classroom-code")?.textContent || "",
    ),
  );
  const code = (await teacher.locator(".classroom-code").textContent()).trim();
  await phone.goto(base);
  await phone.getByLabel("Your name", { exact: true }).fill("Aarav test");
  await phone.getByLabel("Six-digit class code", { exact: true }).fill(code);
  await phone
    .getByRole("button", { name: "Request a seat", exact: true })
    .click();
  await phone
    .getByRole("heading", { name: "You’re in the waiting room." })
    .waitFor();
  assert.equal(
    (await student.request.get(base + "/api/catalog")).status(),
    403,
  );
  await phone.screenshot({
    path: "/tmp/sewestian-screenshots/classroom-waiting.png",
    fullPage: true,
  });
  await teacher
    .getByRole("button", { name: "Approve Aarav test", exact: true })
    .click();
  await phone.getByRole("heading", { name: /Hey, curious mind/ }).waitFor();
  assert.equal(
    (await student.request.get(base + "/api/catalog")).status(),
    200,
  );
  await phone.locator(".student-watermark").waitFor();
  // The Android print dialog temporarily hides the WebView. An intentional
  // export must remain printable, while ordinary backgrounding still locks it.
  await phone.evaluate(() => {
    window.dispatchEvent(new Event("beforeprint"));
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  assert.equal(
    await phone
      .getByRole("dialog", { name: "Classroom privacy screen" })
      .count(),
    0,
  );
  await phone.evaluate(() => {
    window.dispatchEvent(new Event("afterprint"));
    document.dispatchEvent(new Event("visibilitychange"));
    delete document.hidden;
  });
  await phone
    .getByRole("dialog", { name: "Classroom privacy screen" })
    .waitFor();
  await phone.getByRole("button", { name: "Resume my lesson" }).click();
  await phone.getByRole("heading", { name: /Hey, curious mind/ }).waitFor();
  await teacher.screenshot({
    path: "/tmp/sewestian-screenshots/classroom-teacher.png",
    fullPage: true,
  });
  await phone.keyboard.press("PrintScreen");
  await phone
    .getByRole("dialog", { name: "Classroom privacy screen" })
    .waitFor();
  assert.equal(
    await phone
      .locator(".app-shell")
      .evaluate((e) => getComputedStyle(e).visibility),
    "hidden",
  );
  await phone.screenshot({
    path: "/tmp/sewestian-screenshots/classroom-privacy.png",
    fullPage: true,
  });
  await phone.getByRole("button", { name: "Resume my lesson" }).click();
  await phone.getByRole("heading", { name: /Hey, curious mind/ }).waitFor();
  assert.ok(
    await phone.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "phone layout overflow",
  );
  await teacher
    .getByRole("button", { name: "Remove Aarav test", exact: true })
    .click();
  await phone
    .getByRole("heading", { name: "Your access has been removed." })
    .waitFor();
  assert.equal(
    (await student.request.get(base + "/api/catalog")).status(),
    403,
  );
  await teacher
    .getByRole("button", { name: "Approve Aarav test", exact: true })
    .click();
  await phone.getByRole("heading", { name: /Hey, curious mind/ }).waitFor();
  await teacher
    .getByRole("button", { name: "End class · remove all access", exact: true })
    .click();
  await phone
    .getByRole("button", { name: "Request a seat", exact: true })
    .waitFor();
  assert.equal(
    await phone
      .getByRole("button", { name: "Request a seat", exact: true })
      .isDisabled(),
    true,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: teacher sign-in, code-based joining, waiting room, approval, mobile layout, watermark, privacy lock/resume, revocation and end-class lockout.",
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
  await rm(directory, { recursive: true, force: true });
}
