import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:5173";
await mkdir("/tmp/sewestian-screenshots", { recursive: true });
try {
  await page.goto(base);
  await page.getByRole("heading", { name: /Hey, curious mind/ }).waitFor();
  await page.screenshot({
    path: "/tmp/sewestian-screenshots/home-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /Find something to learn/ }).click();
  await page
    .getByRole("textbox", { name: "Search all learning content" })
    .fill("binary");
  await page
    .getByRole("dialog")
    .getByRole("link", { name: /The language of 0s/ })
    .click();
  await page
    .getByRole("button", { name: "Bookmark lesson", exact: true })
    .click();
  await page.getByRole("button", { name: "Quick check", exact: true }).click();
  await page.getByRole("button", { name: "B 10", exact: true }).click();
  await page.getByText("You connected the dots!").waitFor();
  await page
    .getByRole("button", { name: "Mark as explored", exact: true })
    .click();
  await page.reload();
  await page
    .getByRole("button", { name: "Lesson explored", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Live lab", exact: true }).click();
  await page
    .getByRole("button", { name: "Toggle bit 128", exact: true })
    .click();
  assert.equal(await page.locator(".lab-readout strong").textContent(), "170");
  const imageDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download current page image" })
    .click();
  const img = await imageDownload;
  assert.match(img.suggestedFilename(), /\.png$/);
  await img.saveAs("/tmp/sewestian-screenshots/notes.png");
  const pptDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download lesson slides" }).click();
  const ppt = await pptDownload;
  assert.match(ppt.suggestedFilename(), /\.pptx$/);
  await ppt.saveAs("/tmp/sewestian-screenshots/lesson.pptx");
  await page.goto(base + "/courses");
  await page.getByRole("button", { name: "CBSE", exact: true }).click();
  await page.getByLabel("Filter by class").selectOption("XII");
  assert.equal(await page.locator(".course-grid .course-card").count(), 2);
  await page.goto(base + "/labs?lab=gates");
  await page.getByRole("button", { name: "Input A", exact: true }).click();
  assert.equal(await page.locator(".bulb").textContent(), "ON · 1");
  await page.getByRole("button", { name: "XOR", exact: true }).click();
  assert.equal(await page.locator(".bulb").textContent(), "OFF · 0");
  await page.getByRole("button", { name: /The sorting room/ }).click();
  for (let i = 0; i < 15; i++)
    await page
      .getByRole("button", { name: "Next comparison", exact: true })
      .click();
  assert.deepEqual(
    await page.locator(".sort-bars>div>span").allTextContents(),
    ["15", "25", "40", "55", "65", "80"],
  );
  await page
    .getByText("Sorted! Every value is now in ascending order.")
    .waitFor();
  await page.goto(base + "/admin");
  await page.getByRole("heading", { name: "Welcome, teacher." }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.getByRole("heading", { name: /Hey, curious mind/ }).waitFor();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    "Mobile home should not overflow",
  );
  await page.screenshot({
    path: "/tmp/sewestian-screenshots/home-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "My courses", exact: true }).click();
  await page
    .getByRole("heading", { name: "A universe built around you." })
    .waitFor();
  for (const route of [
    "/notes",
    "/course/cbse-12-cs",
    "/lesson/number-systems",
    "/labs?lab=cpu",
    "/labs?lab=network",
    "/admin",
  ]) {
    await page.goto(base + route);
    await page.waitForTimeout(150);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `No mobile overflow on ${route}`,
    );
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: desktop and mobile navigation, search, quiz, progress persistence, bookmarks, PNG and PPTX downloads, course filters, binary, gate and sorting simulations, teacher entry, and responsive layouts.",
  );
} finally {
  await browser.close();
}
