import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createStore } from "../server/store.js";
import { createApp } from "./helpers/content-app.js";
const directory = await mkdtemp(path.join(os.tmpdir(), "study-reader-"));
const store = await createStore({ directory });
const server = createApp(store).listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await mkdir("/tmp/sewestian-screenshots", { recursive: true });
try {
  await page.goto(base + "/course/mh-11-cs1");
  await page
    .getByRole("link", { name: /Open the unit study book/ })
    .first()
    .click();
  await page.getByLabel("Study page", { exact: true }).waitFor();
  assert.equal(
    await page
      .getByLabel("Study page", { exact: true })
      .locator("option")
      .count(),
    50,
  );
  await page
    .getByRole("button", { name: "Next study page", exact: true })
    .click();
  assert.equal(
    await page.getByLabel("Study page", { exact: true }).inputValue(),
    "2",
  );
  await page.reload();
  await page.getByLabel("Study page", { exact: true }).waitFor();
  assert.equal(
    await page.getByLabel("Study page", { exact: true }).inputValue(),
    "2",
  );
  await page
    .getByRole("button", { name: "Switch to typed notes", exact: true })
    .click();
  assert.equal(await page.locator(".study-paper.handwriting").count(), 0);
  await page
    .getByRole("button", { name: "Switch to handwriting style", exact: true })
    .click();
  await page.getByRole("button", { name: /Destination/ }).click();
  await page
    .getByRole("heading", { name: "Why this result follows" })
    .waitFor();
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save book as Markdown" }).click();
  assert.match((await dl).suggestedFilename(), /\.md$/);
  await page.getByText("हिन्दी में समझें", { exact: true }).click();
  assert.ok(
    (await page.locator(".hindi-explanation").textContent()).length > 50,
  );
  const video = page.locator("video");
  await video.evaluate((v) => {
    v.muted = true;
    v.load();
  });
  await page.waitForFunction(
    () => document.querySelector("video")?.readyState >= 2,
  );
  await video.evaluate((v) => v.play());
  await page.waitForFunction(
    () => document.querySelector("video").currentTime > 0.3,
  );
  assert.equal(await video.locator("track").count(), 2);
  await video.evaluate((v) => v.pause());
  await page.screenshot({
    path: "/tmp/sewestian-screenshots/unit-reader.png",
    fullPage: true,
  });
  await page.getByLabel("Study page", { exact: true }).selectOption("50");
  assert.equal(
    await page
      .getByRole("button", { name: "Next study page", exact: true })
      .isDisabled(),
    true,
  );
  await page.evaluate(() => {
    window.print = () => {};
  });
  await page.getByRole("button", { name: "Print / save PDF" }).click();
  await page
    .locator(".study-print-only .study-paper")
    .first()
    .waitFor({ state: "attached" });
  assert.equal(
    await page.locator(".study-print-only .study-paper").count(),
    50,
  );
  await page.pdf({
    path: "/tmp/sewestian-screenshots/unit-book.pdf",
    format: "A4",
    printBackground: true,
  });
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "/tmp/sewestian-screenshots/unit-reader-mobile.png",
    fullPage: true,
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "mobile horizontal overflow",
  );
  await page.goto(base + "/lesson/8085-addressing");
  await page.getByRole("button", { name: "Video", exact: true }).click();
  await page.locator("video").waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: 50-page reader, progress, handwriting toggle, journey, Markdown, MP4 playback, Hindi, full-book PDF, mobile and lesson video",
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
  await rm(directory, { recursive: true, force: true });
}
