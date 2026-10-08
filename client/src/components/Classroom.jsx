import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import {
  Wifi,
  ShieldCheck,
  Smartphone,
  Users,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";
import "./classroom.css";
export function ClassroomEntry({ access, api, refresh }) {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(false),
    [name, setName] = useState(""),
    [code, setCode] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(teacher ? "/auth/login" : "/classroom/join", {
        method: "POST",
        body: JSON.stringify(teacher ? { email, password } : { name, code }),
      });
      setPassword("");
      if (teacher) navigate("/admin");
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const pending = access.status === "pending",
    revoked = access.status === "revoked";
  return (
    <main className="classroom-entry">
      <div className="classroom-card">
        <div className="classroom-brand">✦ sewestian.</div>
        <span className="study-eyebrow">
          <Wifi size={15} />
          YOUR LOCAL CLASSROOM
        </span>
        <h1>
          {teacher
            ? "Welcome back, teacher."
            : pending
              ? "You’re in the waiting room."
              : revoked
                ? "Your access has been removed."
                : "Your seat in the learning universe."}
        </h1>
        <p>
          {teacher
            ? "Sign in to approve students and manage this class."
            : pending
              ? "Show your teacher the name and browser badge below. Lessons open after approval."
              : revoked
                ? "Ask your teacher to approve this browser again."
                : access.message ||
                  "Connect to your teacher’s Wi-Fi or hotspot, then enter the class code."}
        </p>
        {!teacher && (pending || revoked) ? (
          <div className="join-ticket">
            <strong>{access.name}</strong>
            <span>Browser badge · {access.badge}</span>
            <small>This page checks for approval automatically.</small>
          </div>
        ) : (
          <form onSubmit={submit}>
            {teacher ? (
              <>
                <label>
                  Email address
                  <input
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  Your name
                  <input
                    required
                    minLength={2}
                    maxLength={60}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label>
                  Six-digit class code
                  <input
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  />
                </label>
              </>
            )}
            <button
              className="button primary"
              disabled={
                busy ||
                (!teacher && (access.status === "phone" || !access.open))
              }
            >
              {busy
                ? "Connecting…"
                : teacher
                  ? "Enter teacher workspace"
                  : "Request a seat"}
            </button>
            {!teacher && !access.open && access.status !== "phone" && (
              <p>
                New joins are closed. Your teacher can start a class or reopen
                admissions.
              </p>
            )}
          </form>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="button"
          onClick={() => {
            setTeacher(!teacher);
            setError("");
          }}
        >
          {teacher ? "Back to student joining" : "Teacher sign-in"}
        </button>
        <p className="caption">
          Approval belongs to this browser and expires after four hours.
          Screenshot blocking is not supported by web browsers; a visible
          student watermark and privacy screen help discourage sharing.
        </p>
        <Link className="button" to="/mobile">
          Get the Android app
        </Link>
      </div>
    </main>
  );
}
export function ClassroomManager({ api, toast }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState("all");
  async function load() {
    try {
      setData(await api("/admin/classroom"));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);
  async function act(path, body) {
    setBusy(true);
    setError("");
    try {
      await api("/admin/classroom/" + path, {
        method: "POST",
        body: JSON.stringify(body || {}),
      });
      await load();
      toast("Classroom updated.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return <p role="status">{error || "Opening classroom controls…"}</p>;
  const counts = (state) =>
    data.members.filter((m) => m.status === state).length;
  return (
    <section className="classroom-manager">
      <header>
        <span className="study-eyebrow">
          <ShieldCheck size={16} />
          ADMIT. TEACH. STAY IN CONTROL.
        </span>
        <h2>Your classroom, one seat at a time.</h2>
        <p>
          Approve each student browser on your local network. Names are
          student-entered; check the browser badge with the person before
          approving.
        </p>
      </header>
      {!data.enabled ? (
        <div className="classroom-setup">
          <Wifi size={30} />
          <h3>Start a class from your teaching computer.</h3>
          <p>
            In your project folder, run <code>npm run classroom</code>. Open the
            address printed in the terminal, sign in here, then start a class.
            Students use the local network address shown here.
          </p>
          <p>
            This mode uses the computer’s directly connected private IPv4
            network. Keep the service off public tunnels and router port
            forwarding. The public Vercel website remains a separate site.
          </p>
        </div>
      ) : (
        <>
          <div className="classroom-stats">
            <div>
              <Users />
              <strong>{counts("pending")}</strong>
              <span>Awaiting approval</span>
            </div>
            <div>
              <Smartphone />
              <strong>{counts("approved")}</strong>
              <span>Approved browsers</span>
            </div>
            <div>
              <LockKeyhole />
              <strong>{data.open ? "Open" : "Closed"}</strong>
              <span>New admissions</span>
            </div>
          </div>
          <div className="classroom-controls">
            <div>
              <h3>Share with your class</h3>
              <p className="classroom-code">{data.code || "••••••"}</p>
              {data.addresses.map((url) => (
                <div className="classroom-address" key={url}>
                  <code>{url}</code>
                  <button
                    className="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(url);
                        toast("Classroom address copied.");
                      } catch {
                        toast("Select and copy the displayed address.");
                      }
                    }}
                  >
                    Copy
                  </button>
                </div>
              ))}
              {!data.addresses.length && (
                <p>
                  No private IPv4 address was detected. Connect this computer to
                  Wi-Fi or a hotspot first.
                </p>
              )}
              <p className="caption">
                A code requests admission; it does not automatically grant
                access.
              </p>
            </div>
            <div>
              <h3>Class settings</h3>
              {[
                ["open", "Accept new join requests"],
                ["phoneOnly", "Phone browsers only (best effort)"],
                ["privacy", "Student watermark and privacy screen"],
              ].map(([key, label]) => (
                <label className="classroom-option" key={key}>
                  <input
                    type="checkbox"
                    checked={data[key]}
                    disabled={busy}
                    onChange={(e) =>
                      act("settings", {
                        open: data.open,
                        phoneOnly: data.phoneOnly,
                        privacy: data.privacy,
                        [key]: e.target.checked,
                      })
                    }
                  />
                  {label}
                </label>
              ))}
              <p className="caption">
                Phone detection uses browser information and can be spoofed.
                Privacy mode hides content when the tab becomes hidden and locks
                it when a screenshot shortcut is received; operating-system
                screenshots cannot reliably be detected or blocked.
              </p>
              <button
                className="button primary"
                disabled={busy}
                onClick={() => act("new")}
              >
                Start new class · reset all access
              </button>
              <button
                className="button"
                disabled={busy}
                onClick={() => act("end")}
              >
                End class · remove all access
              </button>
            </div>
          </div>
          <div className="classroom-roster">
            <div className="classroom-roster-tools">
              <h3>Student browsers</h3>
              <select
                aria-label="Filter classroom browsers"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All requests</option>
                <option value="pending">Waiting</option>
                <option value="approved">Approved</option>
                <option value="revoked">Removed</option>
              </select>
              <button className="button" onClick={load}>
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>
            {data.members
              .filter((m) => filter === "all" || m.status === filter)
              .map((m) => (
                <article className="classroom-member" key={m.id}>
                  <div>
                    <strong>{m.name}</strong>
                    <small>
                      {m.device} · Badge {m.id.slice(0, 6)} · Expires{" "}
                      {new Date(m.expires).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                  <span className={"member-state " + m.status}>{m.status}</span>
                  <div>
                    {m.status !== "approved" && (
                      <button
                        className="button primary"
                        disabled={busy}
                        onClick={() =>
                          act("members/" + m.id, { status: "approved" })
                        }
                      >
                        Approve {m.name}
                      </button>
                    )}
                    {m.status !== "revoked" && (
                      <button
                        className="button"
                        disabled={busy}
                        onClick={() =>
                          act("members/" + m.id, { status: "revoked" })
                        }
                      >
                        Remove {m.name}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            {!data.members.length && (
              <p>
                No join requests yet. Start a class and share its address and
                code.
              </p>
            )}
          </div>
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
export function StudentPrivacy({ access, api, refresh }) {
  const printing = useRef(false);
  const [locked, setLocked] = useState(false),
    [error, setError] = useState("");
  const active =
    access?.enabled && access.allowed && !access.teacher && access.privacy;
  useEffect(() => {
    if (!active) {
      setLocked(false);
      return;
    }
    const hide = () => {
      if (document.hidden && !printing.current) {
        setLocked(true);
        document.querySelectorAll("video,audio").forEach((v) => v.pause());
      }
    };
    const key = (e) => {
      if (
        e.key === "PrintScreen" ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p")
      ) {
        e.preventDefault();
        document.querySelectorAll("video,audio").forEach((v) => v.pause());
        setLocked(true);
      }
    };
    const beforePrint = () => {
      printing.current = true;
    };
    const afterPrint = () => {
      printing.current = false;
    };
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("keyup", key);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("keyup", key);
      window.removeEventListener("keydown", key);
    };
  }, [active]);
  useEffect(() => {
    document.documentElement.dataset.classroomLocked =
      active && locked ? "true" : "false";
    return () => delete document.documentElement.dataset.classroomLocked;
  }, [active, locked]);
  if (!active) return null;
  return (
    <>
      <div className="student-watermark">
        Sewestian · {access.name} · {access.badge} · Personal classroom access
      </div>
      {locked && (
        <div
          className="privacy-lock"
          role="dialog"
          aria-modal="true"
          aria-label="Classroom privacy screen"
        >
          <LockKeyhole size={38} />
          <h2>Your lesson is paused.</h2>
          <p>
            The privacy screen hides the lesson after you leave the tab or a
            supported shortcut is received. It cannot guarantee screenshot
            prevention.
          </p>
          <button
            autoFocus
            className="button primary"
            onClick={async () => {
              try {
                const state = await api("/classroom/status");
                if (state.allowed) {
                  setLocked(false);
                  setError("");
                } else await refresh();
              } catch {
                setError("Reconnect to the classroom to resume.");
              }
            }}
          >
            Resume my lesson
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      )}
    </>
  );
}
