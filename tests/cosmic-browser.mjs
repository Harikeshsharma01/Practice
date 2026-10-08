import { ensureStudent } from "./helpers/signin.mjs";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:5173";
await mkdir("/tmp/sewestian-screenshots", { recursive: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ensureStudent(page, base);
  await page.goto(base);
  await page.getByRole("heading", { name: /Hey, curious mind/ }).waitFor();
  const toggle = page.getByRole("button", {
    name: "Cosmic effects",
    exact: true,
  });
  assert.equal(await toggle.getAttribute("aria-pressed"), "true");
  await page
    .getByRole("button", { name: "Ignite the learning galaxy", exact: true })
    .click();
  assert.equal(
    await page
      .getByRole("button", { name: "Ignite the learning galaxy", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.mouse.move(700, 460);
  await page.waitForTimeout(200);
  await page.screenshot({
    path: "/tmp/sewestian-screenshots/galaxy-home-desktop.png",
    fullPage: true,
  });
  await toggle.click();
  assert.equal(await toggle.getAttribute("aria-pressed"), "false");
  await page.reload();
  await page.getByRole("heading", { name: /Hey, curious mind/ }).waitFor();
  assert.equal(await toggle.getAttribute("aria-pressed"), "false");
  assert.equal(
    await page.locator("html").getAttribute("data-cosmic-effects"),
    "off",
  );
  await toggle.click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.getByRole("heading", { name: /Hey, curious mind/ }).waitFor();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Galaxy home fits phone width",
  );
  await page
    .getByRole("button", { name: "Ignite the learning galaxy", exact: true })
    .click();
  await page.screenshot({
    path: "/tmp/sewestian-screenshots/galaxy-home-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Travel into a live simulation", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "A learner opens a page", exact: true })
    .waitFor();
  assert.ok(
    await page.getByLabel("Choose a simulation", { exact: true }).isVisible(),
  );
  await page
    .getByLabel("Choose a simulation", { exact: true })
    .selectOption("journey-file");
  await page
    .getByRole("heading", { name: "Start with Unicode text", exact: true })
    .waitFor();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Galaxy journey fits phone width",
  );
  await page.screenshot({
    path: "/tmp/sewestian-screenshots/galaxy-lab-mobile.png",
    fullPage: true,
  });
  const reduced = await browser.newPage({
    viewport: { width: 1200, height: 900 },
    reducedMotion: "reduce",
  });
  await ensureStudent(reduced, base);
  await reduced.goto(base);
  await reduced.getByRole("heading", { name: /Hey, curious mind/ }).waitFor();
  assert.equal(
    await reduced
      .getByRole("button", { name: "Cosmic effects", exact: true })
      .getAttribute("aria-pressed"),
    "false",
  );
  await reduced.close();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: galaxy activation, effects toggle and persistence, reduced-motion default, portal navigation and mobile selector/layout.",
  );
} finally {
  await browser.close();
}
