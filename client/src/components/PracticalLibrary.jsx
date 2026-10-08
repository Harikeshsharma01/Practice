import { storageKey } from "../auth/runtime";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Download,
  FlaskConical,
} from "lucide-react";
export function SyllabusPanel({ course, lessons }) {
  const s = course.syllabus;
  return (
    <section className="syllabus-evidence">
      <span className="overline">SOURCE → TOPIC → LESSON → PRACTICAL</span>
      <h3>
        {s?.reviewed
          ? "Teacher-reviewed topic mapping"
          : "Syllabus verification workspace"}
      </h3>
      {s ? (
        <>
          <p>
            <strong>{s.sourceTitle}</strong> · {s.session}
          </p>
          <p>{s.notes}</p>
          <div className="button-row">
            {s.sourceUrl && (
              <a
                className="button"
                href={s.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open source document
              </a>
            )}
            {s.evidence?.map((file) => (
              <a
                className="button"
                key={file.id}
                href={`/api/media/${file.id}`}
                target="_blank"
                rel="noreferrer"
              >
                {file.name}
              </a>
            ))}
          </div>
          <div className="syllabus-rows">
            {s.rows.map((r, i) => (
              <details key={i}>
                <summary>
                  {r.topic} · {r.lessonIds.length} lessons /{" "}
                  {r.practicalIds.length} practicals
                </summary>
                {r.sourcePage && <p>Source page / section: {r.sourcePage}</p>}
                {r.lessonIds.map((id) => (
                  <Link key={id} to={`/lesson/${id}`}>
                    {lessons.find((l) => l.id === id)?.title || id}
                    <ArrowRight size={13} />
                  </Link>
                ))}
                {r.practicalIds.map((id) => (
                  <Link
                    key={id}
                    to={`/practicals?course=${course.id}&practical=${id}`}
                  >
                    Practical: {id.replaceAll("-", " ")}
                    <ArrowRight size={13} />
                  </Link>
                ))}
              </details>
            ))}
          </div>
          <p className="caption">
            Reviewed by the teacher against the stated source. Sewestian does
            not certify board approval.
          </p>
        </>
      ) : (
        <p>
          The teacher can attach the official syllabus and map each topic here.
          Current lesson pathways and supplementary practicals remain
          provisional. The photographed Maharashtra journal entries are labeled
          separately from suggested exercises.
        </p>
      )}
      <Link className="button primary" to={`/practicals?course=${course.id}`}>
        Open this course’s practical journal
        <FlaskConical size={16} />
      </Link>
    </section>
  );
}
export default function PracticalLibrary({ courses, practicals = [] }) {
  const location = useLocation(),
    params = new URLSearchParams(location.search);
  const [course, setCourse] = useState(params.get("course") || "all"),
    [query, setQuery] = useState(""),
    [source, setSource] = useState("all"),
    [selected, setSelected] = useState(params.get("practical") || ""),
    [solution, setSolution] = useState(false),
    [journal, setJournal] = useState(() => {
      try {
        return JSON.parse(
          localStorage.getItem(storageKey("sewestian-practical-journal")) ||
            "{}",
        );
      } catch {
        return {};
      }
    });
  useEffect(() => {
    localStorage.setItem(
      storageKey("sewestian-practical-journal"),
      JSON.stringify(journal),
    );
  }, [journal]);
  const filtered = practicals.filter(
    (p) =>
      (course === "all" || p.courseIds.includes(course)) &&
      (source === "all" || p.source === source) &&
      `${p.title} ${p.language} ${p.concept}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const p = filtered.find((p) => p.id === selected) || filtered[0];
  function update(changes) {
    setJournal((j) => ({ ...j, [p.id]: { ...j[p.id], ...changes } }));
  }
  function exportJournal() {
    const text = `# Sewestian practical journal\n\n${filtered.map((p) => `## ${p.title}\n\nSource: ${p.sourceDetail}\n${p.review || ""}\n\nAim and theory: ${p.concept}\n\nProcedure:\n${p.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nWorked solution:\n\n\`\`\`\n${p.code}\n\`\`\`\n\nExpected observation:\n${p.output}\n\nMy observation: ${journal[p.id]?.observation || "Not recorded"}\n\nViva:\n${p.viva.join("\n")}\n\nStatus: ${journal[p.id]?.done ? "Completed" : "To practise"}`).join("\n\n---\n\n")}`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/markdown;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "sewestian-practical-journal.md";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="page practical-library">
      <div className="page-intro">
        <div>
          <span className="eyebrow">FROM THE JOURNAL TO UNDERSTANDING</span>
          <h1>Aim. Trace. Build. Explain.</h1>
          <p>
            Worked practicals with procedures, solutions, observations and viva
            prompts. Follow your teacher’s approved list.
          </p>
        </div>
        <button className="button" onClick={exportJournal}>
          <Download size={17} />
          Download filtered journal
        </button>
      </div>
      <div className="practical-filters">
        <label>
          Board and class
          <select
            value={course}
            onChange={(e) => {
              setCourse(e.target.value);
              setSolution(false);
            }}
          >
            <option value="all">All eight pathways</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.board} {c.grade} · {c.code}
              </option>
            ))}
          </select>
        </label>
        <label>
          Source
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setSolution(false);
            }}
          >
            <option value="all">All source types</option>
            <option value="teacher-photo">From your journal photos</option>
            <option value="suggested">Supplementary suggestions</option>
          </select>
        </label>
        <label>
          Find a practical
          <input
            type="search"
            placeholder="C++, gates, CSV, SQL…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSolution(false);
            }}
          />
        </label>
      </div>
      <p className="caption">
        {filtered.length} practicals ·{" "}
        {filtered.filter((p) => journal[p.id]?.done).length} marked complete in
        this browser. Photo entries establish a teacher-supplied list; official
        board alignment still needs its source document.
      </p>
      <div className="practical-layout">
        <aside className="practical-picker">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelected(item.id);
                setSolution(false);
              }}
              className={p?.id === item.id ? "selected" : ""}
            >
              <span>
                {item.title}
                <small>
                  {item.language} ·{" "}
                  {item.source === "teacher-photo"
                    ? "Journal photo"
                    : "Suggested exercise"}
                </small>
              </span>
              {journal[item.id]?.done ? (
                <CheckCircle2 size={16} />
              ) : (
                <ArrowRight size={15} />
              )}
            </button>
          ))}
        </aside>
        {p ? (
          <article className="practical-detail" key={p.id}>
            <span className="pill green">{p.language}</span>
            <h2>{p.title}</h2>
            <div className="practical-source">
              <strong>
                {p.source === "teacher-photo"
                  ? "Teacher-supplied photograph"
                  : "Supplementary original practical"}
              </strong>
              <p>
                {p.sourceDetail} {p.sourceRow && `Entry: ${p.sourceRow}.`}
              </p>
              {p.review && (
                <p className="review-note">Review needed: {p.review}</p>
              )}
            </div>
            <h3>Aim and theory</h3>
            <p>{p.concept}</p>
            <h3>Procedure</h3>
            <ol>
              {p.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <div className="button-row">
              <Link className="button" to={`/lesson/practical-${p.id}`}>
                <BookOpen size={16} />
                Notes and slides
              </Link>
              {p.lab && (
                <Link className="button primary" to={`/labs?lab=${p.lab}`}>
                  <FlaskConical size={16} />
                  Explore the simulation
                </Link>
              )}
            </div>
            <h3>Worked solution</h3>
            <button className="button" onClick={() => setSolution(!solution)}>
              {solution
                ? "Hide solution"
                : "Reveal solution after your attempt"}
            </button>
            {solution && (
              <pre>
                <code>{p.code}</code>
              </pre>
            )}
            <h3>Expected observation</h3>
            <pre>{p.output}</pre>
            <h3>Check before submitting</h3>
            <p>{p.pitfalls}</p>
            <h3>Viva and a variation</h3>
            <ul>
              {p.viva.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
            <p>{p.extension}</p>
            <div className="student-observation">
              <label>
                My observed result
                <textarea
                  rows={4}
                  maxLength={5000}
                  value={journal[p.id]?.observation || ""}
                  placeholder="What happened? What did you change? Why did the result change?"
                  onChange={(e) => update({ observation: e.target.value })}
                />
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={!!journal[p.id]?.done}
                  onChange={(e) => update({ done: e.target.checked })}
                />
                I completed the practical and can explain the result
              </label>
              <small>
                Saved only in this browser. Download your journal to keep a
                copy.
              </small>
            </div>
          </article>
        ) : (
          <p className="empty-state">No practical matches these filters.</p>
        )}
      </div>
    </div>
  );
}
