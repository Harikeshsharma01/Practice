import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import express from "express";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createStore } from "../server/store.js";
import { createApp } from "../server/app.js";
const directory = await mkdtemp(path.join(os.tmpdir(), "sewestian-auth-ui-"));
const store = await createStore({ directory });
const connected = createApp(store).listen(0, "127.0.0.1");
await new Promise((r) => connected.once("listening", r));
const offlineApp = express();
offlineApp.use("/api", (_q, r) =>
  r.status(500).json({ error: "Offline APK must not call a server API" }),
);
offlineApp.use(express.static("android/.build/web", { dotfiles: "allow" }));
offlineApp.get("/{*path}", (_q, r) =>
  r.sendFile(path.resolve("android/.build/web/index.html"), {
    dotfiles: "allow",
  }),
);
const packaged = offlineApp.listen(0, "127.0.0.1");
await new Promise((r) => packaged.once("listening", r));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const failures = [];
await mkdir("/tmp/sewestian-screenshots", { recursive: true });
try {
  for (const [name, server] of [
    ["website", connected],
    ["offline", packaged],
  ]) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36 SewestianAndroid/1.1",
    });
    const page = await context.newPage(),
      base = `http://127.0.0.1:${server.address().port}`,
      apiRequests = [];
    page.on("pageerror", (e) => failures.push(name + ": " + e.message));
    page.on("request", (r) => {
      if (
        name === "offline" &&
        (r.url().includes("/api/") || !r.url().startsWith(base))
      )
        apiRequests.push(r.url());
    });
    await page.goto(base + "/lesson/number-systems");
    await expect(
      page.getByRole("heading", { name: "Sign in to your universe." }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Continue with Google/ }),
    ).toBeDisabled();
    await page.screenshot({
      path: `/tmp/sewestian-screenshots/${name}-login.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Sign up", exact: true }).click();
    const password = "student-test-" + crypto.randomUUID();
    await page.getByLabel("Your name", { exact: true }).fill("Test Learner");
    await page
      .getByLabel("Email address", { exact: true })
      .fill("learner@example.test");
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "The language of 0s & 1s" }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "Your universe — go home", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: /Hey, curious mind/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Go back", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "The language of 0s & 1s" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Video", exact: true }).click();
    const video = page.locator("video").first();
    await video.evaluate((v) => {
      v.muted = true;
      v.load();
    });
    await expect
      .poll(() => video.evaluate((v) => v.readyState))
      .toBeGreaterThanOrEqual(2);
    await video.evaluate((v) => v.play());
    await expect
      .poll(() => video.evaluate((v) => v.currentTime))
      .toBeGreaterThan(0.3);
    await video.evaluate((v) => v.pause());
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      "mobile header overflow: " + name,
    );
    if (name === "offline") {
      const records = await page.evaluate(
        () =>
          new Promise((resolve, reject) => {
            const r = indexedDB.open("sewestian-local-accounts");
            r.onsuccess = () => {
              const q = r.result
                .transaction("accounts")
                .objectStore("accounts")
                .getAll();
              q.onsuccess = () => resolve(q.result);
              q.onerror = () => reject(q.error);
            };
          }),
      );
      assert.equal(records.length, 1);
      assert.ok(!JSON.stringify(records).includes(password));
      assert.match(records[0].passwordHash, /^[a-f0-9]{64}$/);
      await page.goto(base + "/support");
      await page
        .getByLabel("Your doubt or feedback")
        .fill("Please explain the carry bit.");
      await page
        .getByRole("button", { name: "Save on this phone", exact: true })
        .click();
      await expect(page.getByRole("status")).toContainText(
        "Not sent to your teacher",
      );
      await page.screenshot({
        path: "/tmp/sewestian-screenshots/offline-notebook.png",
        fullPage: true,
      });
    } else {
      await page.goto(base + "/support");
      await expect(
        page.getByText(/Your inbox is linked to this website account/),
      ).toBeVisible();
    }
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Sign in to your universe." }),
    ).toBeVisible();
    await page
      .getByLabel("Email address", { exact: true })
      .fill("learner@example.test");
    await page
      .getByLabel("Password", { exact: true })
      .fill("wrong-password-long");
    await page
      .getByRole("button", { name: "Log in to Sewestian", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText("incorrect");
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page
      .getByRole("button", { name: "Log in to Sewestian", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: /Hey, curious mind/ }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: /Hey, curious mind/ }),
    ).toBeVisible();
    if (name === "offline")
      assert.deepEqual(
        apiRequests,
        [],
        "offline lessons must not request remote servers",
      );
    await page.screenshot({
      path: `/tmp/sewestian-screenshots/${name}-signed-in.png`,
      fullPage: true,
    });
    await context.close();
  }
  assert.deepEqual(failures, []);
  console.log(
    "PASS: website and offline signup/login/logout, rejected passwords, persistent accounts, Home/Back, bundled video playback, private account storage and no offline API/network requests.",
  );
} finally {
  await browser.close();
  await new Promise((r) => connected.close(r));
  await new Promise((r) => packaged.close(r));
  await rm(directory, { recursive: true, force: true });
}
