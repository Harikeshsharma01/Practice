import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { courses, lessons } from "../shared/catalog.js";
import { buildUnitBook } from "../shared/unit-books.js";
import { deepLessons } from "../shared/deep-lessons.js";
import { hindiExplanations } from "../shared/hindi-explanations.js";
import { generatedVideo } from "../server/video-library.js";
import { publicCatalog } from "../server/teaching.js";
import { createStore } from "../server/store.js";

test("all 33 public teaching units contain 50 substantive study pages without lost topics", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "study-books-"));
  try {
    const store = await createStore({ directory });
    const live = await publicCatalog(store);
    assert.equal(live.courses.length, 8);
    assert.equal(live.lessons.length, 138);
    let units = 0;
    for (const course of live.courses)
      for (const unit of course.units) {
        const book = buildUnitBook(course, unit, live.lessons);
        units++;
        assert.equal(book.pages.length, 50, unit.bookId);
        assert.deepEqual(
          [...new Set(book.pages.map((p) => p.topicId))],
          unit.lessons,
        );
        assert.equal(new Set(book.pages.map((p) => p.number)).size, 50);
        for (const p of book.pages) {
          assert.ok(p.blocks.length);
          assert.ok(p.blocks.every((b) => b.text.trim().length));
        }
        for (const id of unit.lessons) {
          const lesson = live.lessons.find((l) => l.id === id);
          const texts = book.pages
            .filter((p) => p.topicId === id)
            .flatMap((p) => p.blocks.map((b) => b.text));
          assert.ok(texts.includes(lesson.example.solution));
          assert.ok(texts.includes(lesson.practical.answer));
        }
        assert.match(book.sourceNote, /provisional/);
      }
    assert.equal(units, 33);
    const referenced = new Set(
      live.courses.flatMap((c) => c.units.flatMap((u) => u.lessons)),
    );
    for (const l of deepLessons) {
      assert.ok(referenced.has(l.id), l.id);
      assert.ok(l.quiz.answer < l.quiz.options.length);
    }
    await store.set("draft-computer-systems", {
      summary: "PRIVATE NOTE THAT SHOULD NOT APPEAR",
    });
    let catalog = await publicCatalog(store);
    assert.ok(!JSON.stringify(catalog).includes("PRIVATE NOTE"));
    await store.set("published-computer-systems", {
      summary: "Teacher changed the published account of computer hardware.",
    });
    catalog = await publicCatalog(store);
    const edited = catalog.lessons.find((l) => l.id === "computer-systems");
    assert.equal(
      edited.generatedVideo,
      null,
      "stale video is hidden after teacher edits",
    );
    const book = buildUnitBook(
      catalog.courses[0],
      catalog.courses[0].units[0],
      catalog.lessons,
    );
    assert.ok(JSON.stringify(book).includes(edited.summary));
    await store.set("hidden-hardware-io", true);
    catalog = await publicCatalog(store);
    assert.ok(
      !buildUnitBook(
        catalog.courses[0],
        catalog.courses[0].units[0],
        catalog.lessons,
      ).pages.some((p) => p.topicId === "hardware-io"),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
test("every original topic has current video assets, English captions and Hindi explanations", async () => {
  for (const lesson of lessons) {
    const v = generatedVideo(lesson);
    assert.ok(v, lesson.id);
    assert.ok(v.duration > 5);
    assert.match(hindiExplanations[lesson.id], /[\u0900-\u097f]/);
    for (const key of ["src", "poster", "english", "hindiTrack"]) {
      const f = path.join("public", v[key]);
      assert.ok((await stat(f)).size > 50, f);
    }
    assert.match(
      await readFile(path.join("public", v.english), "utf8"),
      /^WEBVTT/,
    );
    assert.match(
      await readFile(path.join("public", v.hindiTrack), "utf8"),
      /[\u0900-\u097f]/,
    );
    assert.equal(
      generatedVideo({ ...lesson, title: lesson.title + " changed" }),
      null,
    );
  }
});
