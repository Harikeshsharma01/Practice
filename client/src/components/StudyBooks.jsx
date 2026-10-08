import { storageKey } from "../auth/runtime";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Download,
  Printer,
  Play,
  Pause,
  Sparkles,
} from "lucide-react";
import { buildUnitBook } from "../../../shared/unit-books.js";
import "./study-books.css";

export function GeneratedVideo({ lesson }) {
  const v = lesson.generatedVideo;
  if (!v) return null;
  return (
    <section className="generated-explainer">
      <div className="study-eyebrow">WATCH · READ · REPLAY</div>
      <h3>A small film. A clearer idea.</h3>
      <p>
        English narration · Hindi explanation captions · {Math.ceil(v.duration)}{" "}
        seconds
      </p>
      <video
        key={v.src}
        controls
        playsInline
        preload="none"
        poster={v.poster}
        aria-label={`${lesson.title} narrated explainer`}
      >
        <source src={v.src} type="video/mp4" />
        <track
          kind="captions"
          src={v.english}
          srcLang="en"
          label="English narration"
        />
        <track
          kind="subtitles"
          src={v.hindiTrack}
          srcLang="hi"
          label="Hindi explanation summary"
          default
        />
      </video>
      <p className="caption">
        Original study explainer with a synthetic English voice. Hindi captions
        explain the key idea; they are not a word-for-word translation.
      </p>
      <details>
        <summary lang="hi">हिन्दी में समझें</summary>
        <p lang="hi" className="hindi-explanation">
          {v.hindi}
        </p>
      </details>
      <details>
        <summary>English transcript</summary>
        <p className="video-transcript">{v.transcript}</p>
      </details>
      <a className="button" href={v.src} download>
        <Download size={16} />
        Download MP4
      </a>
    </section>
  );
}

export function TopicJourney({ lesson }) {
  const [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false);
  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [lesson.id]);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () =>
        setStep((s) => {
          if (s >= 3) {
            setPlaying(false);
            return 3;
          }
          return s + 1;
        }),
      6000,
    );
    return () => clearInterval(timer);
  }, [playing]);
  const states = [
    {
      name: "Origin",
      heading: "The question we start with",
      text: lesson.example.problem,
    },
    {
      name: "Mechanism",
      heading: "What happens behind the scenes",
      text: lesson.summary,
    },
    {
      name: "Destination",
      heading: "Why this result follows",
      text: lesson.example.solution,
    },
    {
      name: "Change it",
      heading: "Now change the situation",
      text: lesson.practicalDetails?.extension || lesson.practical.task,
    },
  ];
  return (
    <section className="topic-journey" aria-label="Visual explanation journey">
      <div className="study-eyebrow">
        <Sparkles size={15} />
        FOLLOW THE IDEA
      </div>
      <h3>Travel from question to understanding.</h3>
      <div className="study-journey-orbit" style={{ "--station": step }}>
        <div className="study-journey-trail" />
        <span className="study-journey-comet" aria-hidden="true">
          ✦
        </span>
        {states.map((s, i) => (
          <button
            key={s.name}
            aria-pressed={step === i}
            onClick={() => {
              setStep(i);
              setPlaying(false);
            }}
          >
            <span>{i + 1}</span>
            {s.name}
          </button>
        ))}
      </div>
      <div className="study-journey-explanation" aria-live="polite">
        <small>STOP {step + 1} OF 4</small>
        <h4>{states[step].heading}</h4>
        <p>{states[step].text}</p>
      </div>
      <div className="button-row">
        <button
          className="button"
          onClick={() => {
            if (step === 3) setStep(0);
            setPlaying(!playing);
          }}
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}{" "}
          {playing ? "Pause journey" : "Play journey"}
        </button>
        {lesson.lab && (
          <Link className="button" to={`/labs?lab=${lesson.lab}`}>
            Change inputs in the related lab <ArrowRight size={15} />
          </Link>
        )}
      </div>
      <p className="caption">
        A guided concept map. Read at your own pace; related labs let you
        explore input changes.
      </p>
    </section>
  );
}
function Block({ block, printing }) {
  if (block.kind === "solution" && !printing)
    return (
      <details className="study-answer">
        <summary>{block.title} · reveal after trying</summary>
        <pre>{block.text}</pre>
      </details>
    );
  return (
    <section className={`study-block ${block.kind}`}>
      <h3>{block.title}</h3>
      {block.kind === "code" || block.kind === "solution" ? (
        <pre>{block.text}</pre>
      ) : (
        <p>{block.text}</p>
      )}
    </section>
  );
}
export function UnitBook({ courses, lessons }) {
  const { id } = useParams();
  const course = courses.find((c) => c.units.some((u) => u.bookId === id));
  const unit = course?.units.find((u) => u.bookId === id);
  const book = unit ? buildUnitBook(course, unit, lessons) : null;
  const [position, setPosition] = useState(0),
    [hand, setHand] = useState(true),
    [printAll, setPrintAll] = useState(false);
  useEffect(() => {
    let saved = 0;
    try {
      saved =
        Number(localStorage.getItem(storageKey("sewestian-unit-" + id))) || 0;
    } catch {}
    setPosition(saved);
    setPrintAll(false);
  }, [id]);
  const page = book?.pages[Math.min(position, (book?.pages.length || 1) - 1)];
  function turn(next) {
    const p = Math.max(0, Math.min(next, book.pages.length - 1));
    setPosition(p);
    try {
      localStorage.setItem(storageKey("sewestian-unit-" + id), String(p));
    } catch {}
  }
  function download() {
    const text =
      `# ${book.title}\n${book.course}\n\n${book.sourceNote}\n\n` +
      book.pages
        .map(
          (p) =>
            `## Study page ${p.number}: ${p.title} — ${p.kind}\n\n` +
            p.blocks.map((b) => `### ${b.title}\n\n${b.text}\n`).join("\n"),
        )
        .join("\n---\n\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/markdown;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = id + ".md";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  useEffect(() => {
    const fn = () => setPrintAll(false);
    window.addEventListener("afterprint", fn);
    return () => window.removeEventListener("afterprint", fn);
  }, []);
  useEffect(() => {
    if (printAll) {
      const timer = setTimeout(() => window.print(), 200);
      return () => clearTimeout(timer);
    }
  }, [printAll]);
  if (!page)
    return (
      <div className="page">
        <h1>This unit has no published study pages yet.</h1>
        <Link to="/courses">Choose a course</Link>
      </div>
    );
  const lesson = lessons.find((l) => l.id === page.topicId);
  return (
    <div className="page unit-book-page">
      <div className="study-screen-only">
        <Link className="back-link" to={`/course/${course.id}`}>
          <ArrowLeft size={16} /> {course.subject} · {course.grade}
        </Link>
        <header className="study-book-header">
          <span className="study-eyebrow">THE SEWESTIAN STUDY EDITION</span>
          <h1>{book.title}</h1>
          <p>
            {book.course} · {book.pages.length} study pages ·{" "}
            {book.topics.length} connected topics
          </p>
          <p className="caption">{book.sourceNote}</p>
        </header>
        <div className="book-tools">
          <button
            className="button"
            aria-pressed={hand}
            onClick={() => setHand(!hand)}
          >
            {hand ? "Switch to typed notes" : "Switch to handwriting style"}
          </button>
          <button className="button" onClick={download}>
            <Download size={16} />
            Save book as Markdown
          </button>
          <button className="button" onClick={() => setPrintAll(true)}>
            <Printer size={16} />
            Print / save PDF
          </button>
        </div>
      </div>
      <div className="unit-reader-grid">
        <aside className="unit-book-toc study-screen-only">
          <span className="study-eyebrow">INSIDE THIS UNIT</span>
          {book.topics.map((t) => (
            <button
              key={t.id}
              className={t.id === page.topicId ? "active" : ""}
              onClick={() => turn(t.page - 1)}
            >
              <span>{String(t.page).padStart(2, "0")}</span>
              {t.title}
            </button>
          ))}
          <p className="caption">
            Your reading position is saved on this browser. Shared topics use
            the same published lesson across courses.
          </p>
        </aside>
        <div>
          <div className="study-pager study-screen-only">
            <button
              className="button"
              aria-label="Previous study page"
              disabled={page.number === 1}
              onClick={() => turn(page.number - 2)}
            >
              <ArrowLeft size={17} />
            </button>
            <label>
              Page{" "}
              <select
                aria-label="Study page"
                value={page.number}
                onChange={(e) => turn(Number(e.target.value) - 1)}
              >
                {book.pages.map((p) => (
                  <option key={p.number} value={p.number}>
                    {p.number} · {p.kind}
                  </option>
                ))}
              </select>{" "}
              of {book.pages.length}
            </label>
            <button
              className="button"
              aria-label="Next study page"
              disabled={page.number === book.pages.length}
              onClick={() => turn(page.number)}
            >
              <ArrowRight size={17} />
            </button>
          </div>
          <article
            className={`study-paper ${hand ? "handwriting" : ""} ${printAll ? "study-screen-only" : ""}`}
          >
            <div className="paper-meta">
              {book.course}
              <span>
                {page.number} / {book.pages.length}
              </span>
            </div>
            <span className="paper-kind">{page.kind}</span>
            <h2>{page.title}</h2>
            {page.blocks.map((b, i) => (
              <Block key={page.number + "-" + i} block={b} />
            ))}
            <footer>Sewestian · Learn it. Trace it. Explain it.</footer>
          </article>
          {printAll && (
            <div className="study-print-only">
              {book.pages.map((p) => (
                <article
                  className={`study-paper ${hand ? "handwriting" : ""}`}
                  key={p.number}
                >
                  <div className="paper-meta">
                    {book.course} · {book.title} · Study page {p.number}/
                    {book.pages.length}
                  </div>
                  <h2>{p.title}</h2>
                  <p>{p.kind}</p>
                  {p.blocks.map((b, i) => (
                    <Block key={i} block={b} printing />
                  ))}
                </article>
              ))}
            </div>
          )}
          <div className="study-screen-only">
            <div className="study-page-links">
              <Link to={`/lesson/${lesson.id}`}>
                <BookOpen size={16} />
                Open full lesson, notes images and slides
              </Link>
            </div>
            <TopicJourney lesson={lesson} />
            <GeneratedVideo lesson={lesson} />
            <p className="caption">
              Study pages are logical reading sections. Long code examples may
              use more than one sheet when printed. Teachers can edit the
              underlying lesson in their workspace; books use its published
              version.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
