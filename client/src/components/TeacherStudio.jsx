import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Save,
  Send,
  Copy,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sparkles,
  BookOpen,
  Eye,
  Download,
} from "lucide-react";
import { labInfo } from "./Labs";

const emptyMapping = {
  session: "2026–27",
  sourceTitle: "",
  sourceUrl: "",
  mediaId: "",
  reviewed: false,
  notes: "",
  rows: [],
};
const phases = [
  ["Orientation and prerequisites", 5],
  ["Core concepts and terminology", 10],
  ["Worked examples with traces", 10],
  ["Practicals and observed results", 10],
  ["Applications and common mistakes", 5],
  ["Practice questions and solutions", 5],
  ["Revision, viva and assessment", 5],
];
function outline(topic, count) {
  return phases
    .flatMap(([phase, n]) =>
      Array.from({ length: n }, (_, i) => `${topic}: ${phase} ${i + 1}`),
    )
    .slice(0, count)
    .concat(
      count > 50
        ? Array.from(
            { length: count - 50 },
            (_, i) => `${topic}: extension workshop ${i + 1}`,
          )
        : [],
    );
}
function download(name, text) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/markdown;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function upload(file, importNotes = false) {
  const data = new FormData();
  data.append("file", file, file.name);
  const r = await fetch(
    `/api/admin/${importNotes ? "import-notes" : "uploads"}`,
    { method: "POST", body: data },
  );
  const result = await r.json();
  if (!r.ok) throw new Error(result.error || "Upload failed.");
  return result;
}
const lines = (value) =>
  value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
export default function TeacherStudio({
  api,
  courses,
  toast,
  refresh,
  practicals = [],
}) {
  const [items, setItems] = useState([]),
    [form, setForm] = useState(null),
    [page, setPage] = useState(0),
    [tab, setTab] = useState("Chapters"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [dirty, setDirty] = useState(false),
    [search, setSearch] = useState(""),
    [newTitle, setNewTitle] = useState(""),
    [newCourse, setNewCourse] = useState(courses[0].id),
    [aiCourse, setAiCourse] = useState(courses[0].id),
    [preview, setPreview] = useState(false),
    [assistant, setAssistant] = useState(null),
    [prompt, setPrompt] = useState(
      "Explain the concept step by step. Include a worked example, input-to-output trace, common mistakes and a check question.",
    ),
    [batch, setBatch] = useState(3),
    [aiPages, setAiPages] = useState([]),
    [maps, setMaps] = useState([]),
    [mapCourse, setMapCourse] = useState(courses[0].id),
    [mapping, setMappingState] = useState({ ...emptyMapping }),
    [mappingDirty, setMappingDirty] = useState(false);
  const setMapping = (value) => {
    setMappingState(value);
    setMappingDirty(true);
  };
  const prepare = (l) => ({
    ...l,
    courseIds:
      l.courseIds ||
      courses
        .filter((c) => c.units.some((u) => u.lessons.includes(l.id)))
        .map((c) => c.id),
    unitTitle:
      l.unitTitle ||
      courses.flatMap((c) => c.units).find((u) => u.lessons.includes(l.id))
        ?.title ||
      "Teacher chapters",
    targetPages: l.targetPages || 50,
    chapterPlan: l.chapterPlan || [],
    mediaIds: l.mediaIds || [],
    videoUrl: l.videoUrl || "",
    appearance: l.appearance || {
      font: "handwritten",
      accent: "mint",
      pageBreaks: true,
    },
  });
  async function load() {
    const [data, status, saved] = await Promise.all([
      api("/admin/lessons"),
      api("/admin/assistant/status"),
      api("/admin/syllabus"),
    ]);
    setItems(data);
    setAssistant(status);
    setMaps(saved);
    if (!form && data.length) setForm(prepare(data[0]));
    const selected = saved.find((x) => x.courseId === mapCourse);
    if (selected?.sourceTitle && !mappingDirty)
      setMappingState({ ...emptyMapping, ...selected });
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (!dirty && !mappingDirty) return;
    const before = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [dirty, mappingDirty]);
  useEffect(() => {
    if (form?.courseIds?.length) setAiCourse(form.courseIds[0]);
  }, [form?.id]);
  const edit = (changes) => {
    setForm((f) => ({ ...f, ...changes }));
    setDirty(true);
  };
  const pageEdit = (column, value) =>
    edit({
      notes: form.notes.map((n, i) =>
        i === page ? n.map((v, j) => (j === column ? value : v)) : n,
      ),
    });
  async function act(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function create(duplicateId) {
    await act(async () => {
      if (
        dirty &&
        !window.confirm("Continue without saving the current chapter changes?")
      )
        return;
      const chapter = await api("/admin/chapters", {
        method: "POST",
        body: JSON.stringify({
          title: duplicateId ? `${form.title.slice(0, 130)} (copy)` : newTitle,
          courseIds: duplicateId ? form.courseIds : [newCourse],
          targetPages: 50,
          ...(duplicateId ? { duplicateId } : {}),
        }),
      });
      setItems(await api("/admin/lessons"));
      setForm(prepare(chapter));
      setPage(0);
      setDirty(false);
      setNewTitle("");
      setAiPages([]);
      toast("A private chapter draft is ready.");
    });
  }
  async function save(publish) {
    await act(async () => {
      if (!form.courseIds.length)
        throw new Error("Choose at least one course.");
      if (!form.notes.every((n) => n[0].trim() && n[1].trim()))
        throw new Error("Complete each page heading and body before saving.");
      await api(`/admin/lessons/${form.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          status: publish ? "published" : "draft",
        }),
      });
      const data = await api("/admin/lessons");
      setItems(data);
      setForm(prepare(data.find((l) => l.id === form.id)));
      setDirty(false);
      await refresh();
      toast(
        publish
          ? "Chapter published to the selected courses."
          : "Chapter draft saved.",
      );
    });
  }
  function select(l) {
    if (
      dirty &&
      !window.confirm("Open another chapter without saving these changes?")
    )
      return;
    setForm(prepare(l));
    setPage(0);
    setDirty(false);
    setAiPages([]);
    setError("");
  }
  const movePage = (direction) => {
    const next = page + direction;
    if (next < 0 || next >= form.notes.length) return;
    const notes = [...form.notes];
    [notes[page], notes[next]] = [notes[next], notes[page]];
    edit({ notes });
    setPage(next);
  };
  const exportPrompt = () =>
    `Create original classroom material for ${form.title}.\nCourses: ${form.courseIds
      .map((id) => {
        const c = courses.find((x) => x.id === id);
        return `${c.board} Class ${c.grade} ${c.subject} (${c.code})`;
      })
      .join(
        "; ",
      )}.\nTarget: ${form.targetPages} logical pages. Work in batches; no filler or repeated pages.\n${prompt}\nDistinguish teacher-supplied material from verified board requirements. Include code, dry runs, practical solutions and viva questions. Do not claim official alignment without the official document.\nOutline:\n${form.chapterPlan.map((s, i) => `${i + 1}. ${s}`).join("\n")}\nCurrent chapter:\n${form.notes.map(([h, b]) => `## ${h}\n${b}`).join("\n\n")}`;
  return (
    <section className="teacher-studio">
      <div className="studio-intro">
        <div>
          <span className="overline">BUILD YOUR CLASSROOM LIBRARY</span>
          <h2>From one idea to a complete chapter.</h2>
          <p>
            Create chapters, organise up to 100 pages, attach your material, and
            publish to any of the eight courses.
          </p>
        </div>
        <span className="pill green">{items.length} chapters</span>
      </div>
      <div className="segmented studio-tabs">
        {["Chapters", "Syllabus mapping", "AI drafting"].map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {tab === "Chapters" && (
        <>
          <form
            className="studio-create"
            onSubmit={(e) => {
              e.preventDefault();
              create();
            }}
          >
            <label>
              New chapter title
              <input
                required
                minLength={3}
                maxLength={140}
                placeholder="e.g. Object-oriented programming"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </label>
            <label>
              Starting course
              <select
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.board} {c.grade} · {c.code}
                  </option>
                ))}
              </select>
            </label>
            <button className="button primary" disabled={busy}>
              <Plus size={16} />
              Create chapter
            </button>
          </form>
          <div className="studio-layout">
            <aside className="studio-library">
              <label>
                Find a chapter
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search all chapters"
                />
              </label>
              {items
                .filter((l) =>
                  `${l.title} ${l.category}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((l) => (
                  <button
                    key={l.id}
                    className={form?.id === l.id ? "selected" : ""}
                    onClick={() => select(l)}
                  >
                    <BookOpen size={15} />
                    <span>
                      {l.title}
                      <small>
                        {l.status} · {l.notes.length} pages
                      </small>
                    </span>
                  </button>
                ))}
            </aside>
            {form && (
              <div className="studio-editor">
                <div className="studio-editor-heading">
                  <div>
                    <span className="overline">
                      {form.custom ? "YOUR CHAPTER" : "EDITABLE SOURCE CHAPTER"}
                    </span>
                    <h3>{form.title}</h3>
                    <small>
                      {dirty ? "Unsaved changes" : "Saved content"} ·{" "}
                      {form.notes.length} content pages / {form.targetPages}{" "}
                      target
                    </small>
                  </div>
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() => create(form.id)}
                  >
                    <Copy size={15} />
                    Duplicate saved version
                  </button>
                </div>
                <div className="studio-fields">
                  <label>
                    Chapter title
                    <input
                      maxLength={140}
                      value={form.title}
                      onChange={(e) => edit({ title: e.target.value })}
                    />
                  </label>
                  <label>
                    Category
                    <input
                      maxLength={80}
                      value={form.category}
                      onChange={(e) => edit({ category: e.target.value })}
                    />
                  </label>
                  <label>
                    Course unit / section
                    <input
                      maxLength={120}
                      value={form.unitTitle}
                      onChange={(e) => edit({ unitTitle: e.target.value })}
                    />
                  </label>
                  <label>
                    Reading / class time (minutes)
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={form.minutes}
                      onChange={(e) =>
                        edit({ minutes: Number(e.target.value) })
                      }
                    />
                  </label>
                </div>
                <label>
                  Introduction
                  <textarea
                    maxLength={400}
                    rows={3}
                    value={form.summary}
                    onChange={(e) => edit({ summary: e.target.value })}
                  />
                </label>
                <fieldset className="course-checkboxes">
                  <legend>Publish this shared chapter in these courses</legend>
                  {courses.map((c) => (
                    <label key={c.id}>
                      <input
                        type="checkbox"
                        checked={form.courseIds.includes(c.id)}
                        onChange={(e) =>
                          edit({
                            courseIds: e.target.checked
                              ? [...form.courseIds, c.id]
                              : form.courseIds.filter((id) => id !== c.id),
                          })
                        }
                      />
                      {c.board} {c.grade} · {c.code}
                    </label>
                  ))}
                </fieldset>
                <details className="studio-planner">
                  <summary>
                    Chapter plan and appearance · target {form.targetPages}{" "}
                    pages
                  </summary>
                  <div className="studio-fields">
                    <label>
                      Target pages (1–100)
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={form.targetPages}
                        onChange={(e) =>
                          edit({
                            targetPages: Math.max(
                              1,
                              Math.min(100, Number(e.target.value) || 1),
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      Student font
                      <select
                        value={form.appearance.font}
                        onChange={(e) =>
                          edit({
                            appearance: {
                              ...form.appearance,
                              font: e.target.value,
                            },
                          })
                        }
                      >
                        <option value="handwritten">Handwritten style</option>
                        <option value="standard">Standard text</option>
                      </select>
                    </label>
                    <label>
                      Accent
                      <select
                        value={form.appearance.accent}
                        onChange={(e) =>
                          edit({
                            appearance: {
                              ...form.appearance,
                              accent: e.target.value,
                            },
                          })
                        }
                      >
                        {["mint", "blue", "lavender", "peach"].map((a) => (
                          <option key={a} value={a}>
                            {a === "mint" ? "violet" : a}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        checked={form.appearance.pageBreaks}
                        onChange={(e) =>
                          edit({
                            appearance: {
                              ...form.appearance,
                              pageBreaks: e.target.checked,
                            },
                          })
                        }
                      />
                      Start each note page on a new printed page
                    </label>
                  </div>
                  <button
                    className="button"
                    onClick={() =>
                      edit({
                        chapterPlan: outline(form.title, form.targetPages),
                      })
                    }
                  >
                    Build {form.targetPages}-page outline
                  </button>
                  <p className="caption">
                    An outline is a plan, not finished notes. Rename each page
                    to your exact topic; write pages yourself or request AI
                    drafts for review.
                  </p>
                  <textarea
                    aria-label="Chapter outline, one title per line"
                    rows={8}
                    value={form.chapterPlan.join("\n")}
                    onChange={(e) =>
                      edit({ chapterPlan: lines(e.target.value).slice(0, 100) })
                    }
                  />
                </details>
                <div className="page-editor-toolbar">
                  <label>
                    Page
                    <select
                      value={page}
                      onChange={(e) => setPage(Number(e.target.value))}
                    >
                      {form.notes.map(([heading], i) => (
                        <option key={i} value={i}>
                          {i + 1}. {heading || "Untitled"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="icon-button"
                    aria-label="Move page earlier"
                    disabled={!page}
                    onClick={() => movePage(-1)}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Move page later"
                    disabled={page === form.notes.length - 1}
                    onClick={() => movePage(1)}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Delete current page"
                    disabled={form.notes.length === 1}
                    onClick={() => {
                      if (window.confirm("Remove this page from the draft?")) {
                        edit({
                          notes: form.notes.filter((_, i) => i !== page),
                        });
                        setPage(Math.max(0, page - 1));
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    className="button"
                    disabled={form.notes.length >= 100}
                    onClick={() => {
                      edit({
                        notes: [
                          ...form.notes,
                          [
                            form.chapterPlan[form.notes.length] ||
                              `Page ${form.notes.length + 1}`,
                            "",
                          ],
                        ],
                      });
                      setPage(form.notes.length);
                    }}
                  >
                    <Plus size={15} />
                    Add page
                  </button>
                  <button
                    className="button"
                    onClick={() => setPreview(!preview)}
                  >
                    <Eye size={15} />
                    {preview ? "Edit page" : "Preview page"}
                  </button>
                </div>
                {preview ? (
                  <article
                    className={`studio-page-preview ${form.appearance.font === "handwritten" ? "handwritten-notes" : ""}`}
                  >
                    <span>PAGE {page + 1}</span>
                    <h3>{form.notes[page]?.[0]}</h3>
                    <p>{form.notes[page]?.[1]}</p>
                  </article>
                ) : (
                  <div className="studio-page-edit">
                    <label>
                      Page heading
                      <input
                        maxLength={120}
                        value={form.notes[page]?.[0] || ""}
                        onChange={(e) => pageEdit(0, e.target.value)}
                      />
                    </label>
                    <label>
                      Page content
                      <textarea
                        rows={15}
                        maxLength={12000}
                        value={form.notes[page]?.[1] || ""}
                        onChange={(e) => pageEdit(1, e.target.value)}
                        placeholder="Explain the concept, trace the process, add examples and questions…"
                      />
                    </label>
                    <small>
                      {form.notes[page]?.[1].length || 0} / 12,000 characters ·
                      A logical page can span more than one printed sheet.
                    </small>
                  </div>
                )}
                <details className="studio-planner">
                  <summary>
                    Objectives, worked example and practical solution
                  </summary>
                  <label>
                    Objectives — one per line
                    <textarea
                      value={form.objectives.join("\n")}
                      onChange={(e) =>
                        edit({ objectives: lines(e.target.value) })
                      }
                    />
                  </label>
                  {["title", "problem", "solution", "code"].map((key) => (
                    <label key={key}>
                      Worked example: {key}
                      <textarea
                        rows={key === "code" ? 7 : 3}
                        value={form.example[key]}
                        onChange={(e) =>
                          edit({
                            example: { ...form.example, [key]: e.target.value },
                          })
                        }
                      />
                    </label>
                  ))}
                  <label>
                    Practical task
                    <textarea
                      value={form.practical.task}
                      onChange={(e) =>
                        edit({
                          practical: {
                            ...form.practical,
                            task: e.target.value,
                          },
                        })
                      }
                    />
                  </label>
                  <label>
                    Procedure — one step per line
                    <textarea
                      value={form.practical.steps.join("\n")}
                      onChange={(e) =>
                        edit({
                          practical: {
                            ...form.practical,
                            steps: lines(e.target.value),
                          },
                        })
                      }
                    />
                  </label>
                  <label>
                    Worked practical solution
                    <textarea
                      rows={10}
                      value={form.practical.answer}
                      onChange={(e) =>
                        edit({
                          practical: {
                            ...form.practical,
                            answer: e.target.value,
                          },
                        })
                      }
                    />
                  </label>
                </details>
                {form.practicalId && (
                  <details className="studio-planner">
                    <summary>Practical journal observations and viva</summary>
                    {["expectedOutput", "pitfalls", "extension"].map((key) => (
                      <label key={key}>
                        {
                          {
                            expectedOutput: "Expected output / observation",
                            pitfalls: "Common mistakes",
                            extension: "Extension task",
                          }[key]
                        }
                        <textarea
                          rows={4}
                          value={form.practicalDetails?.[key] || ""}
                          onChange={(e) =>
                            edit({
                              practicalDetails: {
                                ...form.practicalDetails,
                                [key]: e.target.value,
                              },
                            })
                          }
                        />
                      </label>
                    ))}
                    <label>
                      Viva questions — one per line
                      <textarea
                        value={(form.practicalDetails?.viva || []).join("\n")}
                        onChange={(e) =>
                          edit({
                            practicalDetails: {
                              ...form.practicalDetails,
                              viva: lines(e.target.value),
                            },
                          })
                        }
                      />
                    </label>
                  </details>
                )}
                <details className="studio-planner">
                  <summary>Self-check question and simulation</summary>
                  <label>
                    Question
                    <textarea
                      value={form.quiz.question}
                      onChange={(e) =>
                        edit({
                          quiz: { ...form.quiz, question: e.target.value },
                        })
                      }
                    />
                  </label>
                  <label>
                    Options — 2 to 6, one per line
                    <textarea
                      value={form.quiz.options.join("\n")}
                      onChange={(e) =>
                        edit({
                          quiz: {
                            ...form.quiz,
                            options: lines(e.target.value),
                          },
                        })
                      }
                    />
                  </label>
                  <label>
                    Correct answer
                    <select
                      value={form.quiz.answer}
                      onChange={(e) =>
                        edit({
                          quiz: {
                            ...form.quiz,
                            answer: Number(e.target.value),
                          },
                        })
                      }
                    >
                      {form.quiz.options.map((option, i) => (
                        <option key={i} value={i}>
                          {i + 1}. {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Answer explanation
                    <textarea
                      value={form.quiz.explanation}
                      onChange={(e) =>
                        edit({
                          quiz: { ...form.quiz, explanation: e.target.value },
                        })
                      }
                    />
                  </label>
                  <label>
                    Interactive simulation
                    <select
                      value={form.lab || ""}
                      onChange={(e) => edit({ lab: e.target.value || null })}
                    >
                      <option value="">No simulation</option>
                      {Object.entries(labInfo).map(([id, l]) => (
                        <option key={id} value={id}>
                          {l.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </details>
                <details className="studio-planner">
                  <summary>Videos, images, PDFs and notes import</summary>
                  <label>
                    YouTube or Vimeo HTTPS link
                    <input
                      type="url"
                      value={form.videoUrl}
                      onChange={(e) => edit({ videoUrl: e.target.value })}
                    />
                  </label>
                  <div className="studio-fields">
                    <label>
                      Attach media (up to 4 MB)
                      <input
                        type="file"
                        disabled={busy}
                        accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.pdf,.txt,.md"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          e.target.value = "";
                          if (file)
                            act(async () => {
                              const item = await upload(file);
                              edit({
                                mediaIds: [...form.mediaIds, item.id],
                                mediaAttachments: [
                                  ...(form.mediaAttachments || []),
                                  item,
                                ],
                              });
                            });
                        }}
                      />
                    </label>
                    <label>
                      Import Markdown / text pages
                      <input
                        type="file"
                        disabled={busy}
                        accept=".md,.txt"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          e.target.value = "";
                          if (file)
                            act(async () => {
                              const result = await upload(file, true);
                              if (form.notes.length + result.notes.length > 100)
                                throw new Error(
                                  "A chapter can hold up to 100 pages. Split this import into a second chapter.",
                                );
                              edit({ notes: [...form.notes, ...result.notes] });
                              toast(
                                `${result.notes.length} pages added to this draft.`,
                              );
                            });
                        }}
                      />
                    </label>
                  </div>
                  <p className="caption">
                    Use Markdown headings (##) to separate pages. Larger videos
                    can use a YouTube or Vimeo link. Files become public when
                    the chapter is published.
                  </p>
                  {form.mediaAttachments?.map((file) => (
                    <div className="studio-attachment" key={file.id}>
                      <a
                        href={`/api/media/${file.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {file.name}
                      </a>
                      <button
                        className="text-button"
                        onClick={() =>
                          edit({
                            mediaIds: form.mediaIds.filter(
                              (id) => id !== file.id,
                            ),
                            mediaAttachments: form.mediaAttachments.filter(
                              (f) => f.id !== file.id,
                            ),
                          })
                        }
                      >
                        Detach
                      </button>
                    </div>
                  ))}
                </details>
                <div className="studio-savebar">
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() => save(false)}
                  >
                    <Save size={16} />
                    Save chapter draft
                  </button>
                  <button
                    className="button primary"
                    disabled={busy}
                    onClick={() => save(true)}
                  >
                    <Send size={16} />
                    Publish chapter
                  </button>
                  <button
                    className="button"
                    onClick={() =>
                      download(
                        `sewestian-${form.id}.md`,
                        `# ${form.title}\n\n${form.summary}\n\n${form.notes.map(([h, b]) => `## ${h}\n\n${b}`).join("\n\n")}\n\n## Practical solution\n\n${form.practical.answer}`,
                      )
                    }
                  >
                    <Download size={15} />
                    Export notes
                  </button>
                  <Link className="button" to={`/lesson/${form.id}`}>
                    Student view
                  </Link>
                </div>
                {form.publishedAt && (
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() =>
                      act(async () => {
                        if (
                          !window.confirm(
                            "Hide this chapter from students and keep it as a private draft?",
                          )
                        )
                          return;
                        await api(`/admin/chapters/${form.id}/unpublish`, {
                          method: "POST",
                        });
                        await load();
                        await refresh();
                        setForm({
                          ...form,
                          publishedAt: null,
                          status: "draft",
                        });
                        toast(
                          "Chapter hidden from students. The draft is retained.",
                        );
                      })
                    }
                  >
                    Return published chapter to a private draft
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
      {tab === "AI drafting" && form && (
        <div className="studio-ai">
          <div className="studio-ai-heading">
            <Sparkles size={30} />
            <div>
              <h3>Your lesson drafting assistant</h3>
              <p>
                Draft pages for <strong>{form.title}</strong>. Review the
                proposed text, then add it to the chapter. Nothing is published
                automatically.
              </p>
            </div>
          </div>
          <p className="callout">
            {assistant?.configured
              ? `Connected through the OpenAI API (${assistant.model}). Requests use your backend API account.`
              : "AI generation needs OPENAI_API_KEY on your backend. Chapter editing, outlines and prompt export already work without a key."}{" "}
            This is a Sewestian assistant, not an embedded Codex session.
          </p>
          <label>
            Teaching instructions
            <textarea
              rows={5}
              maxLength={6000}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </label>
          <div className="studio-fields">
            <label>
              Draft batch size
              <select
                value={batch}
                onChange={(e) => setBatch(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} pages
                  </option>
                ))}
              </select>
            </label>
            <label>
              Course context
              <select
                value={aiCourse}
                onChange={(e) => setAiCourse(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.board} {c.grade} {c.code}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="caption">
            Only the chapter title, your instructions, its outline and up to
            18,000 characters of selected chapter text are sent to the API. Do
            not include student personal data. API usage may incur charges.
          </p>
          <div className="button-row">
            <button
              className="button primary"
              disabled={
                busy ||
                !assistant?.configured ||
                form.notes.length + batch > 100
              }
              onClick={() =>
                act(async () => {
                  const result = await api("/admin/assistant/draft", {
                    method: "POST",
                    body: JSON.stringify({
                      topic: form.title,
                      instructions: prompt,
                      courseId: aiCourse,
                      pageCount: batch,
                      startPage: form.notes.length + 1,
                      context:
                        `Outline:\n${form.chapterPlan.join("\n")}\nRecent pages:\n${form.notes
                          .slice(-3)
                          .map(([h, b]) => `${h}\n${b}`)
                          .join("\n")}`.slice(0, 18000),
                    }),
                  });
                  setAiPages(result.pages);
                })
              }
            >
              <Sparkles size={16} />
              {busy ? "Drafting…" : "Draft next pages"}
            </button>
            <button
              className="button"
              onClick={() =>
                download("sewestian-codex-prompt.md", exportPrompt())
              }
            >
              <Download size={16} />
              Export prompt for Codex / ChatGPT
            </button>
          </div>
          {aiPages.length > 0 && (
            <div className="ai-review">
              <h3>Review proposed pages</h3>
              <p>
                Check examples, syllabus fit and solutions before adding these
                pages to the draft.
              </p>
              {aiPages.map((p, i) => (
                <fieldset key={i}>
                  <label>
                    Page title
                    <input
                      value={p.title}
                      onChange={(e) =>
                        setAiPages((all) =>
                          all.map((v, j) =>
                            i === j ? { ...v, title: e.target.value } : v,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Draft content
                    <textarea
                      rows={9}
                      value={p.body}
                      onChange={(e) =>
                        setAiPages((all) =>
                          all.map((v, j) =>
                            i === j ? { ...v, body: e.target.value } : v,
                          ),
                        )
                      }
                    />
                  </label>
                </fieldset>
              ))}
              <div className="button-row">
                <button
                  className="button primary"
                  onClick={() => {
                    if (form.notes.length + aiPages.length > 100) {
                      setError("This batch would exceed 100 pages.");
                      return;
                    }
                    edit({
                      notes: [
                        ...form.notes,
                        ...aiPages.map((p) => [p.title, p.body]),
                      ],
                    });
                    setPage(form.notes.length);
                    setAiPages([]);
                    setTab("Chapters");
                    toast(
                      "Reviewed pages added. Save the chapter draft to keep them.",
                    );
                  }}
                >
                  Add reviewed pages to draft
                </button>
                <button className="button" onClick={() => setAiPages([])}>
                  Discard proposal
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {tab === "Syllabus mapping" && (
        <div className="studio-mapping">
          <h3>Connect the source, topic and learning material.</h3>
          <p>
            Attach a syllabus or provide its source link, then map topics to
            lessons and practicals. “Teacher-reviewed” records your review; it
            is not board certification.
          </p>
          <label>
            Board and class
            <select
              value={mapCourse}
              onChange={(e) => {
                if (
                  mappingDirty &&
                  !window.confirm(
                    "Open another syllabus without saving this mapping?",
                  )
                )
                  return;
                setMapCourse(e.target.value);
                setMappingDirty(false);
                setMappingState({
                  ...emptyMapping,
                  ...maps.find((m) => m.courseId === e.target.value),
                });
              }}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.board} {c.grade} · {c.code}
                </option>
              ))}
            </select>
          </label>
          <div className="studio-fields">
            <label>
              Academic session
              <input
                value={mapping.session}
                onChange={(e) =>
                  setMapping({ ...mapping, session: e.target.value })
                }
              />
            </label>
            <label>
              Source document title
              <input
                value={mapping.sourceTitle}
                onChange={(e) =>
                  setMapping({ ...mapping, sourceTitle: e.target.value })
                }
              />
            </label>
            <label>
              Source HTTPS link
              <input
                type="url"
                placeholder="https://…"
                value={mapping.sourceUrl}
                onChange={(e) =>
                  setMapping({ ...mapping, sourceUrl: e.target.value })
                }
              />
            </label>
            <label>
              Upload syllabus PDF or image
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files[0];
                  e.target.value = "";
                  if (file)
                    act(async () => {
                      const item = await upload(file);
                      setMapping({
                        ...mapping,
                        mediaId: item.id,
                        sourceTitle: mapping.sourceTitle || file.name,
                      });
                      toast("Syllabus attached. Save the mapping to share it.");
                    });
                }}
              />
              {mapping.mediaId && (
                <a
                  href={`/api/media/${mapping.mediaId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View attached source
                </a>
              )}
            </label>
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={mapping.reviewed}
              onChange={(e) =>
                setMapping({ ...mapping, reviewed: e.target.checked })
              }
            />
            I have checked these topic mappings against the stated source.
          </label>
          <label>
            Coverage notes and missing requirements
            <textarea
              value={mapping.notes}
              onChange={(e) =>
                setMapping({ ...mapping, notes: e.target.value })
              }
            />
          </label>
          <div className="button-row">
            <button
              className="button"
              onClick={() =>
                setMapping({
                  ...mapping,
                  rows: [
                    ...mapping.rows,
                    {
                      topic: "New topic",
                      sourcePage: "",
                      lessonIds: [],
                      practicalIds: [],
                    },
                  ],
                })
              }
            >
              Add topic row
            </button>
            <button
              className="button"
              onClick={() => {
                if (
                  mapping.rows.length &&
                  !window.confirm(
                    "Replace the current topic rows with the course units?",
                  )
                )
                  return;
                setMapping({
                  ...mapping,
                  rows: courses
                    .find((c) => c.id === mapCourse)
                    .units.map((u) => ({
                      topic: u.title,
                      sourcePage: "",
                      lessonIds: u.lessons,
                      practicalIds: [],
                    })),
                });
              }}
            >
              Start from current course units
            </button>
          </div>
          {mapping.rows.map((row, i) => (
            <details
              className="mapping-row"
              key={i}
              open={i === mapping.rows.length - 1}
            >
              <summary>
                {row.topic} · {row.lessonIds.length} lessons ·{" "}
                {row.practicalIds.length} practicals
              </summary>
              <label>
                Topic title
                <input
                  value={row.topic}
                  onChange={(e) =>
                    setMapping({
                      ...mapping,
                      rows: mapping.rows.map((r, j) =>
                        i === j ? { ...r, topic: e.target.value } : r,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Source page / section
                <input
                  value={row.sourcePage}
                  onChange={(e) =>
                    setMapping({
                      ...mapping,
                      rows: mapping.rows.map((r, j) =>
                        i === j ? { ...r, sourcePage: e.target.value } : r,
                      ),
                    })
                  }
                />
              </label>
              <div className="mapping-choices">
                <fieldset>
                  <legend>Linked lessons</legend>
                  {items.map((l) => (
                    <label key={l.id}>
                      <input
                        type="checkbox"
                        checked={row.lessonIds.includes(l.id)}
                        onChange={(e) =>
                          setMapping({
                            ...mapping,
                            rows: mapping.rows.map((r, j) =>
                              i === j
                                ? {
                                    ...r,
                                    lessonIds: e.target.checked
                                      ? [...r.lessonIds, l.id]
                                      : r.lessonIds.filter((id) => id !== l.id),
                                  }
                                : r,
                            ),
                          })
                        }
                      />
                      {l.title}
                    </label>
                  ))}
                </fieldset>
                <fieldset>
                  <legend>Linked practicals</legend>
                  {practicals
                    .filter((p) => p.courseIds.includes(mapCourse))
                    .map((p) => (
                      <label key={p.id}>
                        <input
                          type="checkbox"
                          checked={row.practicalIds.includes(p.id)}
                          onChange={(e) =>
                            setMapping({
                              ...mapping,
                              rows: mapping.rows.map((r, j) =>
                                i === j
                                  ? {
                                      ...r,
                                      practicalIds: e.target.checked
                                        ? [...r.practicalIds, p.id]
                                        : r.practicalIds.filter(
                                            (id) => id !== p.id,
                                          ),
                                    }
                                  : r,
                              ),
                            })
                          }
                        />
                        {p.title}
                      </label>
                    ))}
                </fieldset>
              </div>
              <button
                className="text-button"
                onClick={() =>
                  setMapping({
                    ...mapping,
                    rows: mapping.rows.filter((_, j) => j !== i),
                  })
                }
              >
                Remove topic row
              </button>
            </details>
          ))}
          <button
            className="button primary"
            disabled={busy}
            onClick={() =>
              act(async () => {
                await api(`/admin/syllabus/${mapCourse}`, {
                  method: "PUT",
                  body: JSON.stringify(mapping),
                });
                setMaps(await api("/admin/syllabus"));
                setMappingDirty(false);
                await refresh();
                toast("Syllabus mapping saved to the course.");
              })
            }
          >
            <Save size={16} />
            Save and share syllabus mapping
          </button>
        </div>
      )}
    </section>
  );
}
