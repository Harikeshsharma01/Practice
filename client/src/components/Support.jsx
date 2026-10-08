import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MessageCircle,
  Download,
  RefreshCw,
  Send,
  Smartphone,
} from "lucide-react";
import release from "../../../shared/android-release.json";
import "./support.css";

export function AppDownload() {
  return (
    <section className="support-page app-download">
      <Link to="/" className="back-link">
        ← Sewestian learning home
      </Link>
      <span className="overline">LEARN WITHOUT A SERVER</span>
      <div className="app-download-icon">
        <Smartphone size={44} />
      </div>
      <h1>
        Your learning universe.
        <br />
        Now available offline.
      </h1>
      <p>
        Create a local account on your Android phone and open bundled lessons,
        notes, simulations and narrated videos. No hosted-site or Wi-Fi setup
        screen.
      </p>
      <a
        className="button primary"
        href="/downloads/Sewestian.apk"
        download="Sewestian.apk"
      >
        <Download size={18} /> Download Android APK
      </a>
      <p className="support-muted">
        Version {release.version} · Android {release.minimumAndroid}+ · Offline
        preview · about 36 MB
      </p>
      <div className="support-card">
        <h2>Install. Sign up. Start exploring.</h2>
        <ol>
          <li>
            Download and install the APK. Allow installation from your browser
            if Android asks.
          </li>
          <li>
            Open Sewestian, choose Sign up, and create a local email/password
            account. Do not use your Google password.
          </li>
          <li>
            Log in to learn. Use Your universe or the app's Home button to
            return home, and Back to return to the previous page.
          </li>
        </ol>
        <p>
          Updating with the same signing key keeps app data. Clearing data or
          uninstalling deletes local accounts and progress.
        </p>
      </div>
      <div className="support-card">
        <h2>Know where your work is saved</h2>
        <p>
          Website accounts live on the website server. Offline APK accounts and
          progress stay on the phone. They do not sync. The offline question
          notebook saves drafts locally; it does not send messages to your
          teacher.
        </p>
        <p>
          Google sign-in is unavailable in this offline edition. The website can
          offer Google sign-in after the teacher configures Google OAuth.
          iPhones cannot install APK files.
        </p>
        <p className="support-muted">
          This is a preview. Native integration still requires physical-phone
          testing. Bundled course maps remain provisional and need teacher
          syllabus review.
        </p>
        <details>
          <summary>Verify the download</summary>
          <p className="support-code">SHA-256: {release.sha256}</p>
          <a href="/downloads/Sewestian.apk.sha256" download>
            Download checksum
          </a>
        </details>
      </div>
    </section>
  );
}

export function SupportInbox({
  api,
  teacher = false,
  accountMode = false,
  defaultContext = "",
}) {
  const [params] = useSearchParams();
  const [threads, setThreads] = useState([]),
    [selected, setSelected] = useState(""),
    [detail, setDetail] = useState(null);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const [reply, setReply] = useState(""),
    [filter, setFilter] = useState("all");
  const [code, setCode] = useState(""),
    [restore, setRestore] = useState("");
  const [form, setForm] = useState({
    name: "",
    kind: "doubt",
    subject: "",
    context: params.get("topic")?.slice(0, 200) || defaultContext,
    message: "",
  });
  const root = teacher ? "/admin/support" : "/support";
  async function reload() {
    const data = await api(root);
    setThreads(data.threads);
  }
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (document.hidden) return;
      try {
        const data = await api(root);
        if (active) {
          setThreads(data.threads);
          setError("");
        }
      } catch (e) {
        if (active) setError(e.message);
      }
    };
    load();
    const timer = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [root, api]);
  useEffect(() => {
    setDetail(null);
    setReply("");
    if (!selected) return;
    let active = true;
    const load = async () => {
      if (document.hidden) return;
      try {
        const data = await api(`${root}/${selected}`);
        if (active) setDetail(data);
      } catch (e) {
        if (active) setError(e.message);
      }
    };
    load();
    const timer = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [root, selected, api]);
  async function act(fn) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  async function send(e) {
    e.preventDefault();
    await act(async () => {
      await api("/support/session", { method: "POST", body: "{}" });
      const thread = await api("/support", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ ...form, subject: "", message: "" });
      setSelected(thread.id);
      await reload();
      setNotice("Sent to your teacher. Return to this inbox for a reply.");
    });
  }
  async function sendReply(e) {
    e.preventDefault();
    await act(async () => {
      await api(`${root}/${selected}/replies`, {
        method: "POST",
        body: JSON.stringify({ message: reply }),
      });
      setReply("");
      setDetail(await api(`${root}/${selected}`));
      await reload();
      setNotice("Reply sent.");
    });
  }
  return (
    <section className="support-page">
      <span className="overline">A QUESTION IS THE START OF UNDERSTANDING</span>
      <h1>{teacher ? "Student inbox" : "Doubts & feedback"}</h1>
      <p>
        {teacher
          ? "Read student questions, reply personally and track what still needs attention."
          : "Ask your teacher a doubt, share an idea or report something that is not working. Conversations are private to your inbox and teacher."}
      </p>
      <p className="support-muted">
        Replies update every 15 seconds while this page is open. This is a
        teacher conversation, not an AI chat. No email or push notifications are
        sent.
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="support-notice">
          {notice}
        </p>
      )}
      {!teacher && !accountMode && (
        <details className="support-card">
          <summary>Continue this inbox on another device</summary>
          <p>
            Use the same server address in the website and APK. Save your
            private inbox code before clearing app data. Anyone with this code
            can read and reply to your conversations; do not share it with other
            students.
          </p>
          <button
            className="button"
            disabled={busy}
            onClick={() =>
              act(async () => {
                const data = await api("/support/session", {
                  method: "POST",
                  body: "{}",
                });
                setCode(data.code);
              })
            }
          >
            Show my private inbox code
          </button>
          {code && (
            <label>
              My private inbox code
              <input readOnly value={code} onFocus={(e) => e.target.select()} />
            </label>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              act(async () => {
                await api("/support/session", {
                  method: "POST",
                  body: JSON.stringify({ code: restore.trim() }),
                });
                setSelected("");
                setDetail(null);
                setCode("");
                setRestore("");
                await reload();
                setNotice("Inbox linked on this device.");
              });
            }}
          >
            <label>
              Saved inbox code
              <input
                autoComplete="off"
                value={restore}
                onChange={(e) => setRestore(e.target.value)}
                minLength={64}
                maxLength={64}
                required
              />
            </label>
            <button className="button" disabled={busy}>
              Link saved inbox
            </button>
          </form>
        </details>
      )}
      {accountMode && (
        <p className="support-notice">
          Your inbox is linked to this website account. Sign in with the same
          account on this server to read your replies. The offline APK has a
          separate local question notebook.
        </p>
      )}
      <div className="support-layout">
        <aside className="support-card support-list">
          <div className="support-toolbar">
            <h2>Conversations</h2>
            <button
              className="icon-button"
              aria-label="Refresh conversations"
              disabled={busy}
              onClick={() =>
                act(async () => {
                  await reload();
                  if (selected) setDetail(await api(`${root}/${selected}`));
                })
              }
            >
              <RefreshCw size={18} />
            </button>
          </div>
          <label>
            Filter conversations
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All conversations</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="doubt">Doubts</option>
              <option value="feedback">Feedback</option>
              <option value="issue">Issues</option>
            </select>
          </label>
          {!teacher && (
            <button
              className="button primary"
              onClick={() => {
                setSelected("");
                setDetail(null);
              }}
            >
              New question or feedback
            </button>
          )}
          {!threads.length && <p>No conversations yet.</p>}
          {threads
            .filter(
              (t) =>
                filter === "all" || t.status === filter || t.kind === filter,
            )
            .map((t) => (
              <button
                key={t.id}
                className={`support-thread ${selected === t.id ? "selected" : ""}`}
                onClick={() => setSelected(t.id)}
                aria-pressed={selected === t.id}
              >
                <strong>{t.subject}</strong>
                <span>
                  {teacher ? `${t.name} · ` : ""}
                  {t.kind} · {t.status}
                </span>
                <small>
                  {t.lastRole === "teacher"
                    ? "Teacher replied"
                    : "Student message"}{" "}
                  · {t.messageCount} messages
                </small>
              </button>
            ))}
        </aside>
        <div className="support-card support-conversation">
          {selected ? (
            detail ? (
              <>
                <span className="overline">
                  {detail.kind} · {detail.status}
                </span>
                <h2>{detail.subject}</h2>
                <p>
                  {detail.name}
                  {detail.context ? ` · ${detail.context}` : ""}
                </p>
                {teacher && (
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() =>
                      act(async () => {
                        await api(`${root}/${selected}/status`, {
                          method: "PUT",
                          body: JSON.stringify({
                            status:
                              detail.status === "open" ? "resolved" : "open",
                          }),
                        });
                        setDetail(await api(`${root}/${selected}`));
                        await reload();
                      })
                    }
                  >
                    {detail.status === "open"
                      ? "Mark resolved"
                      : "Reopen conversation"}
                  </button>
                )}
                <div
                  className="support-messages"
                  aria-label="Conversation messages"
                >
                  {detail.messages.map((m) => (
                    <article className={`support-message ${m.role}`} key={m.id}>
                      <strong>
                        {m.role === "teacher" ? "Teacher" : detail.name}
                      </strong>
                      <time dateTime={m.createdAt}>
                        {new Date(m.createdAt).toLocaleString()}
                      </time>
                      <p>{m.text}</p>
                    </article>
                  ))}
                </div>
                {teacher || detail.status === "open" ? (
                  <form onSubmit={sendReply}>
                    <label>
                      Your reply
                      <textarea
                        required
                        maxLength={5000}
                        rows={5}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                      />
                    </label>
                    <button className="button primary" disabled={busy}>
                      <Send size={16} />
                      {busy ? "Sending…" : "Send reply"}
                    </button>
                  </form>
                ) : (
                  <p>
                    This conversation is resolved. Start a new question if you
                    need more help.
                  </p>
                )}
              </>
            ) : (
              <p role="status">Loading conversation…</p>
            )
          ) : teacher ? (
            <div className="support-empty">
              <MessageCircle size={40} />
              <h2>Make the next idea click.</h2>
              <p>Select a student conversation to read and reply.</p>
            </div>
          ) : (
            <form onSubmit={send}>
              <h2>What would you like to ask?</h2>
              <label>
                Your name
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={form.name}
                  onChange={update("name")}
                  autoComplete="name"
                />
              </label>
              <label>
                Message type
                <select value={form.kind} onChange={update("kind")}>
                  <option value="doubt">Ask a doubt</option>
                  <option value="feedback">Share feedback</option>
                  <option value="issue">Report an issue</option>
                </select>
              </label>
              <label>
                Subject
                <input
                  required
                  minLength={3}
                  maxLength={160}
                  value={form.subject}
                  onChange={update("subject")}
                />
              </label>
              <label>
                Course, lesson or page (optional)
                <input
                  maxLength={200}
                  value={form.context}
                  onChange={update("context")}
                />
              </label>
              <label>
                Your message
                <textarea
                  required
                  minLength={3}
                  maxLength={5000}
                  rows={7}
                  value={form.message}
                  onChange={update("message")}
                  placeholder="Explain your question. For an issue, include what you tried and what happened."
                />
              </label>
              <p className="support-muted">
                Do not include passwords or sensitive personal details. Your
                name is a self-entered label, not a verified student account.
              </p>
              <button className="button primary" disabled={busy}>
                <Send size={17} />
                {busy ? "Sending…" : "Send to teacher"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
