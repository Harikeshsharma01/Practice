import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  House,
  Orbit,
  FlaskConical,
  NotebookPen,
  Search,
  ChevronDown,
  ChevronRight,
  Check,
  CheckCheck,
  Clock,
  GraduationCap,
  Sparkles,
  Play,
  Download,
  Menu,
  X,
  Sun,
  ShieldCheck,
  LogOut,
  Bookmark,
  ExternalLink,
  Layers,
  FileText,
  Presentation,
  Image,
  Video,
  LockKeyhole,
  Mail,
  Send,
  Eye,
  Save,
  Info,
  Command,
  Compass,
  Star,
  CheckCircle2,
  AlertCircle,
  Globe,
} from "lucide-react";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/space-grotesk/latin-400.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import { Lab, labInfo } from "./components/Labs";
import CosmicScene from "./components/CosmicScene";
import TeacherStudio from "./components/TeacherStudio";
import PracticalLibrary, { SyllabusPanel } from "./components/PracticalLibrary";
import { lessonIds } from "../../shared/catalog";
import "@fontsource/kalam/latin-400.css";
import "./styles.css";
const Context = createContext();
const useApp = () => useContext(Context);
async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("The learning server is unavailable. Please try again.");
  }
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
function readLocal(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
const formatGrade = (g) => (g === "XI" ? "11" : "12");
function Logo({ small = false }) {
  return (
    <span className={`brand ${small ? "small" : ""}`}>
      <span className="brand-mark">
        S<span className="logo-star">✦</span>
      </span>
      {!small && (
        <span>
          sewestian<span className="brand-period">.</span>
        </span>
      )}
    </span>
  );
}
function OrbitalArt({ mini = false }) {
  const [charged, setCharged] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div
      className={`${mini ? "orbital-art mini" : "orbital-art"} ${charged ? "portal-awake" : ""}`}
      aria-hidden={mini ? true : undefined}
    >
      <div className="planet-glow" />
      <div className="orbit-ring orbit-one" />
      <div className="orbit-ring orbit-two" />
      <div className="orbit-ring orbit-three" />
      <div className="planet">
        <div className="planet-shade" />
        <span className="planet-s">S</span>
      </div>
      <div className="orbit-dot dot-one" />
      <div className="orbit-dot dot-two" />
      <div className="floating-code">&lt;/&gt;</div>
      <div className="floating-star">✧</div>
      <span className="art-star star-one">+</span>
      <span className="art-star star-two">✦</span>
      <span className="art-star star-three">+</span>
      {!mini && (
        <>
          <button
            className="planet-ignite"
            aria-label="Ignite the learning galaxy"
            aria-pressed={charged}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              window.dispatchEvent(
                new CustomEvent("sewestian-portal", {
                  detail: {
                    x: rect.x + rect.width / 2,
                    y: rect.y + rect.height / 2,
                  },
                }),
              );
              setCharged(true);
              clearTimeout(timer.current);
              timer.current = setTimeout(() => setCharged(false), 5000);
            }}
          >
            <span>
              {charged ? "Your universe is awake ✦" : "Touch to ignite ✦"}
            </span>
          </button>
          <Link
            className="orbit-destination orbit-notes"
            to="/notes"
            aria-label="Travel to the notes library"
          >
            <BookOpen size={17} />
            <span>Discover</span>
          </Link>
          <Link
            className="orbit-destination orbit-labs"
            to="/labs?lab=journey-web"
            aria-label="Travel into a live simulation"
          >
            <Orbit size={17} />
            <span>Explore</span>
          </Link>
          <div className="art-label">
            <span /> curiosity is your superpower
          </div>
          <div className="art-coordinate">
            19.0760° N &nbsp; 72.8777° E<br />
            <span>MADE FOR YOUR NEXT BIG IDEA</span>
          </div>
        </>
      )}
    </div>
  );
}
function App() {
  const [catalog, setCatalog] = useState(null),
    [error, setError] = useState(""),
    [effectsEnabled, setEffectsEnabled] = useState(
      () =>
        readLocal("sewestian-effects", true) &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [courseId, setCourseId] = useState(() =>
      readLocal("sewestian-course", "mh-11-cs1"),
    ),
    [completed, setCompleted] = useState(() =>
      readLocal("sewestian-progress", []),
    ),
    [bookmarks, setBookmarks] = useState(() =>
      readLocal("sewestian-bookmarks", []),
    ),
    [toast, setToast] = useState("");
  async function refresh() {
    try {
      setCatalog(await api("/catalog"));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  useEffect(() => {
    localStorage.setItem("sewestian-course", JSON.stringify(courseId));
  }, [courseId]);
  useEffect(() => {
    localStorage.setItem("sewestian-progress", JSON.stringify(completed));
  }, [completed]);
  useEffect(() => {
    localStorage.setItem("sewestian-bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(id);
    }
  }, [toast]);
  useEffect(() => {
    localStorage.setItem("sewestian-effects", JSON.stringify(effectsEnabled));
  }, [effectsEnabled]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      if (media.matches) setEffectsEnabled(false);
    };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  const value = {
    ...catalog,
    effectsEnabled,
    setEffectsEnabled,
    courseId,
    setCourseId,
    completed,
    setCompleted,
    bookmarks,
    setBookmarks,
    toast: setToast,
    refresh,
  };
  return (
    <Context.Provider value={value}>
      <BrowserRouter>
        <CosmicScene enabled={effectsEnabled} />
        {catalog ? (
          <Shell />
        ) : (
          <div className="boot">
            <Logo />
            <p>{error || "Opening your learning universe…"}</p>
            {error && (
              <button className="button primary" onClick={refresh}>
                Try again
              </button>
            )}
          </div>
        )}
        {toast && (
          <div className="toast" role="status">
            <CheckCircle2 size={18} />
            {toast}
          </div>
        )}
      </BrowserRouter>
    </Context.Provider>
  );
}
function Shell() {
  const { courses, courseId, effectsEnabled, setEffectsEnabled } = useApp(),
    [search, setSearch] = useState(false),
    [mobile, setMobile] = useState(false),
    location = useLocation();
  const course = courses.find((c) => c.id === courseId) || courses[0];
  useEffect(() => {
    setMobile(false);
    window.scrollTo(0, 0);
    window.dispatchEvent(new CustomEvent("sewestian-portal"));
  }, [location.pathname]);
  useEffect(() => {
    const key = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
      if (e.key === "Escape") {
        setSearch(false);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const nav = [
    ["/", "Home", House],
    ["/courses", "My courses", BookOpen],
    ["/notes", "Notes library", NotebookPen],
    ["/animations", "Visual learning", Orbit],
    ["/labs", "Practice lab", FlaskConical],
    ["/practicals", "Practical journal", FileText],
  ];
  return (
    <div className="app-shell">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <Link to="/" aria-label="Sewestian home">
          <Logo />
        </Link>
        <div className="workspace-label">YOUR LEARNING SPACE</div>
        <nav>
          {nav.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon size={19} />
              <span>{label}</span>
              {to === "/labs" && <span className="new-badge">TRY IT</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-course">
          <span className="overline">YOUR CURRENT PATH</span>
          <div className={`course-icon ${course.color}`}>
            <GraduationCap size={20} />
          </div>
          <strong>
            Class {course.grade} · {course.code}
          </strong>
          <span>{course.board} Board</span>
          <Link to="/courses">
            Switch learning path <ArrowRight size={14} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <div className="little-quote">
            <Sparkles size={18} />
            <p>
              Big ideas start with
              <br />a little curiosity.
            </p>
          </div>
          <Link className="teacher-link" to="/admin">
            <ShieldCheck size={18} />
            <span>Teacher workspace</span>
            <ArrowUpRight size={16} />
          </Link>
          <div className="sidebar-foot">
            <span className="online-dot" /> A little wiser, every day.
          </div>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={22} />
            </button>
            <span className="breadcrumb">
              Your universe <ChevronRight size={13} />{" "}
              <strong>
                {location.pathname.startsWith("/lesson")
                  ? "Learning room"
                  : location.pathname.startsWith("/course/")
                    ? "Course overview"
                    : location.pathname.startsWith("/book/")
                      ? "Course notebook"
                      : nav.find((n) => n[0] === location.pathname)?.[1] ||
                        "Teacher workspace"}
              </strong>
            </span>
          </div>
          <div className="topbar-actions">
            <button className="search-trigger" onClick={() => setSearch(true)}>
              <Search size={16} />
              <span>Find something to learn</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              className={`effects-toggle ${effectsEnabled ? "active" : ""}`}
              aria-label="Cosmic effects"
              aria-pressed={effectsEnabled}
              title={
                effectsEnabled
                  ? "Turn off cosmic motion and touch effects"
                  : "Turn on cosmic motion and touch effects"
              }
              onClick={() => setEffectsEnabled((value) => !value)}
            >
              <Sparkles size={17} />
              <span>{effectsEnabled ? "Magic on" : "Magic off"}</span>
            </button>
            <span className="topbar-divider" />
            <div className="avatar" title="Your local learner profile">
              S<span />
            </div>
          </div>
        </header>
        <main id="main-content" key={location.pathname} className="portal-page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<Course />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/book/:id" element={<CourseBook />} />
            <Route path="/lesson/:id" element={<Lesson />} />
            <Route path="/animations" element={<LabPage visual />} />
            <Route path="/labs" element={<LabPage />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/practicals" element={<PracticalPage />} />
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <Compass size={40} />
                  <h1>A little off course?</h1>
                  <Link className="button primary" to="/">
                    Back to your universe
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
        <footer className="footer">
          <Logo small />
          <span>Made for curious minds. Built for what’s next.</span>
          <Link to="/courses">
            Explore your syllabus <ArrowUpRight size={12} />
          </Link>
          <span>© {new Date().getFullYear()} Sewestian</span>
        </footer>
      </div>
      {search && <SearchModal close={() => setSearch(false)} />}
    </div>
  );
}
function Home() {
  const { courses, lessons, courseId, completed } = useApp();
  const course = courses.find((c) => c.id === courseId) || courses[0],
    ids = lessonIds(course),
    next =
      lessons.find((l) => ids.includes(l.id) && !completed.includes(l.id)) ||
      lessons.find((l) => ids.includes(l.id));
  return (
    <div className="page home-page">
      <div className="greeting">
        <div>
          <div className="eyebrow">
            <span /> A LITTLE CURIOSITY. ENDLESS POSSIBILITIES.
          </div>
          <h1>
            Hey, curious mind <span className="wave">✳</span>
          </h1>
          <p>Your next “aha!” moment is just around the corner.</p>
        </div>
        <Link className="path-pill" to="/courses">
          <GraduationCap size={17} />
          {course.board} · Class {course.grade}
          <ChevronDown size={15} />
        </Link>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-tag">
            <span /> OPEN A PORTAL. FOLLOW YOUR CURIOSITY.
          </div>
          <h2>
            Don’t just study it.
            <br />
            <span>Make discovery magic.</span>
            <br />
            Understand it.
          </h2>
          <p>
            From your first line of code to your next big idea.
            <br className="desktop" /> Notes, visuals, and hands-on experiments
            — now inside your own learning galaxy.
          </p>
          <div className="hero-buttons">
            <Link className="button primary" to="/courses">
              Find your learning path <ArrowUpRight size={18} />
            </Link>
            <Link className="text-button" to="/labs">
              <span className="play-outline">
                <Play size={11} />
              </span>
              Step into the lab
            </Link>
          </div>
          <div className="hero-bottom">
            <div className="mini-avatars">
              <span>A</span>
              <span>K</span>
              <span>R</span>
            </div>
            <span>Different boards. One shared curiosity.</span>
          </div>
        </div>
        <OrbitalArt />
      </section>
      <div className="feature-strip">
        <div>
          <span className="strip-icon">
            <GraduationCap size={21} />
          </span>
          <p>
            <strong>2 boards. 8 pathways.</strong>
            <span>A space for your syllabus</span>
          </p>
        </div>
        <div>
          <span className="strip-icon">
            <NotebookPen size={21} />
          </span>
          <p>
            <strong>Understand, don’t memorise.</strong>
            <span>Notes that connect the dots</span>
          </p>
        </div>
        <div>
          <span className="strip-icon">
            <Orbit size={21} />
          </span>
          <p>
            <strong>Learning comes alive.</strong>
            <span>Play, experiment, discover</span>
          </p>
        </div>
        <div>
          <span className="strip-icon">
            <Compass size={21} />
          </span>
          <p>
            <strong>Your pace. Your universe.</strong>
            <span>Make every little step count</span>
          </p>
        </div>
      </div>
      <SectionHeading
        eyebrow="A PLACE TO BEGIN"
        title="Pick your learning orbit"
        action="View all courses"
        to="/courses"
      />
      <div className="home-course-grid">
        {[courses[0], courses[1], courses[4], courses[6]].map((c) => (
          <CourseCard key={c.id} course={c} compact />
        ))}
      </div>
      <div className="home-lower">
        <section>
          <SectionHeading
            eyebrow="LESS READING. MORE REALISING."
            title="What if you could see it?"
            action="Explore the lab"
            to="/labs"
          />
          <div className="lab-preview">
            <div className="lab-preview-copy">
              <span className="pill green">
                <span /> INTERACTIVE EXPERIENCE
              </span>
              <h3>
                A tiny switch.
                <br />A whole new way to think.
              </h3>
              <p>
                Turn bits on. Watch numbers change.
                <br />
                Make the language of computers your own.
              </p>
              <Link to="/labs?lab=binary" className="text-button">
                Play with binary <ArrowUpRight size={17} />
              </Link>
            </div>
            <Link
              to="/labs?lab=binary"
              className="binary-art"
              aria-label="Open binary playground"
            >
              <div className="binary-float">
                42<span>DECIMAL</span>
              </div>
              <div className="binary-art-bits">
                {"00101010".split("").map((b, i) => (
                  <span key={i} className={b === "1" ? "on" : ""}>
                    {b}
                  </span>
                ))}
              </div>
              <div className="binary-art-line" />
              <span className="binary-caption">EVERY BIT HAS A STORY.</span>
            </Link>
          </div>
        </section>
        <section className="continue-section">
          <SectionHeading
            eyebrow="ONE STEP AT A TIME"
            title="Your next discovery"
          />
          <Link className="continue-card" to={`/lesson/${next.id}`}>
            <div className="continue-top">
              <div className="continue-icon">
                <BookOpen size={21} />
              </div>
              <span>
                {course.code} · CLASS {course.grade}
              </span>
              <ArrowUpRight size={17} />
            </div>
            <h3>{next.title}</h3>
            <p>{next.summary}</p>
            <div className="continue-meta">
              <Clock size={13} />
              {next.minutes} min <span>·</span> Notes + quick check
            </div>
            <div className="progress-track">
              <span
                style={{
                  width: `${(ids.filter((id) => completed.includes(id)).length / ids.length) * 100}%`,
                }}
              />
            </div>
            <div className="continue-bottom">
              <span>
                {ids.filter((id) => completed.includes(id)).length} of{" "}
                {ids.length} lessons explored
              </span>
              <ArrowRight size={17} />
            </div>
          </Link>
        </section>
      </div>
      <div className="syllabus-note">
        <Info size={16} />
        <span>
          Growing with your classroom. Course maps are provisional; official
          2026–27 syllabus alignment is awaiting source verification.
        </span>
        <Link to="/courses">
          View details <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}
function SectionHeading({ eyebrow, title, action, to }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="overline">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action && (
        <Link to={to}>
          {action}
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}
function CourseCard({ course: c, compact = false }) {
  const { completed } = useApp(),
    ids = lessonIds(c);
  return (
    <Link to={`/course/${c.id}`} className={`course-card ${c.color}`}>
      <div className="course-card-top">
        <div className={`course-icon ${c.color}`}>
          {c.code === "CS–II" ? (
            <Layers size={23} />
          ) : c.code === "802" ? (
            <Globe size={23} />
          ) : (
            <span>&lt;/&gt;</span>
          )}
        </div>
        <ArrowUpRight size={18} />
      </div>
      <span className="course-board">
        {c.board.toUpperCase()} BOARD <span>·</span> CLASS {c.grade}
      </span>
      <h3>{c.subject}</h3>
      <p>{c.description}</p>
      <div className="course-card-bottom">
        <span>
          <BookOpen size={13} />
          {ids.length} lessons
        </span>
        <span>
          {completed.filter((id) => ids.includes(id)).length > 0
            ? `${completed.filter((id) => ids.includes(id)).length} explored`
            : compact
              ? c.code
              : "Open course"}
          <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}
function Courses() {
  const { courses, sources } = useApp(),
    [board, setBoard] = useState("All boards"),
    [grade, setGrade] = useState("All classes");
  const filtered = courses.filter(
    (c) =>
      (board === "All boards" || c.board === board) &&
      (grade === "All classes" || c.grade === grade),
  );
  return (
    <div className="page">
      <PageIntro
        eyebrow="YOUR PATH, YOUR POSSIBILITIES"
        title="A universe built around you."
        description="Choose your board and class. Everything you need to explore, organised into one learning path."
      />
      <div className="filter-bar">
        <div className="segmented">
          {["All boards", "Maharashtra", "CBSE"].map((x) => (
            <button
              key={x}
              onClick={() => setBoard(x)}
              className={board === x ? "selected" : ""}
            >
              {x}
            </button>
          ))}
        </div>
        <select
          aria-label="Filter by class"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        >
          <option>All classes</option>
          <option value="XI">Class XI</option>
          <option value="XII">Class XII</option>
        </select>
        <span className="result-count">{filtered.length} learning paths</span>
      </div>
      <div className="course-grid">
        {filtered.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
      <div className="source-panel">
        <Info size={23} />
        <div>
          <h3>A clear note on syllabus coverage</h3>
          <p>
            These are original foundation lessons and provisional course maps,
            not a certified complete syllabus. Official board documents and the
            teacher’s shared notes could not be accessed during setup. Marks,
            required practical counts and session-specific units must be
            confirmed before classroom use. CBSE IT here means Information
            Technology (802), not Informatics Practices (065).
          </p>
          <div className="source-links">
            {sources.map((s) => (
              <a key={s.title} href={s.url} target="_blank" rel="noreferrer">
                {s.title}
                <ExternalLink size={12} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function PracticalPage() {
  const { courses, practicals } = useApp();
  return <PracticalLibrary courses={courses} practicals={practicals} />;
}
function PageIntro({ eyebrow, title, description, children }) {
  return (
    <div className="page-intro">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
function Course() {
  const { id } = useParams(),
    { courses, lessons, completed, setCourseId, courseId } = useApp();
  const c = courses.find((c) => c.id === id);
  if (!c) return <Missing />;
  const ids = lessonIds(c),
    count = ids.filter((id) => completed.includes(id)).length;
  return (
    <div className="page">
      <Link className="back-link" to="/courses">
        <ArrowLeft size={15} />
        All learning paths
      </Link>
      <div className={`course-banner ${c.color}`}>
        <div>
          <span className="eyebrow">
            {c.board.toUpperCase()} BOARD · CLASS {c.grade} · {c.code}
          </span>
          <h1>{c.subject}</h1>
          <p>{c.description}</p>
          <div className="button-row">
            <Link
              className="button primary"
              onClick={() => setCourseId(c.id)}
              to={`/lesson/${ids.find((id) => !completed.includes(id)) || ids[0]}`}
            >
              {count ? "Continue learning" : "Start exploring"}
              <ArrowRight size={16} />
            </Link>
            <button
              className="button"
              disabled={courseId === c.id}
              onClick={() => setCourseId(c.id)}
            >
              {courseId === c.id ? (
                <>
                  <Check size={16} />
                  Current path
                </>
              ) : (
                "Set as my path"
              )}
            </button>
            <Link className="button" to={`/book/${c.id}`}>
              <FileText size={16} />
              Open course book
            </Link>
            <Link className="button" to={`/practicals?course=${c.id}`}>
              Practical journal
            </Link>
          </div>
        </div>
        <div className="course-banner-icon">
          <GraduationCap size={70} />
        </div>
      </div>
      <SyllabusPanel course={c} lessons={lessons} />
      <div className="course-detail-grid">
        <div>
          <SectionHeading title="Your learning roadmap" />
          <div className="unit-list">
            {c.units.map((u, i) => (
              <section key={u.title} className="unit">
                <div className="unit-header">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <h3>{u.title}</h3>
                  <small>{u.lessons.length} lessons</small>
                </div>
                {u.lessons.map((id) => {
                  const l = lessons.find((l) => l.id === id);
                  return (
                    <Link className="lesson-row" key={id} to={`/lesson/${id}`}>
                      <span
                        className={
                          completed.includes(id)
                            ? "lesson-check checked"
                            : "lesson-check"
                        }
                      >
                        {completed.includes(id) ? (
                          <Check size={13} />
                        ) : (
                          <BookOpen size={14} />
                        )}
                      </span>
                      <div>
                        <strong>{l.title}</strong>
                        <small>
                          {l.category} {l.lab ? "· Interactive lab" : ""}
                        </small>
                      </div>
                      <span className="lesson-time">{l.minutes} min</span>
                      <ChevronRight size={15} />
                    </Link>
                  );
                })}
                {u.pending.map((p) => (
                  <div className="pending-row" key={p}>
                    <Clock size={14} />
                    <span>{p}</span>
                    <small>To verify</small>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </div>
        <aside className="course-summary">
          <span className="overline">YOUR LITTLE STEPS ADD UP</span>
          <h2>
            {Math.round((count / ids.length) * 100)}
            <span>%</span>
          </h2>
          <div className="progress-track">
            <span style={{ width: `${(count / ids.length) * 100}%` }} />
          </div>
          <p>
            {count} of {ids.length} available lessons explored
          </p>
          <hr />
          <div>
            <BookOpen size={17} />
            {ids.length} original foundation lessons
          </div>
          <div>
            <FlaskConical size={17} />
            {
              ids.filter((id) => lessons.find((l) => l.id === id).lab).length
            }{" "}
            linked interactive labs
          </div>
          <div>
            <NotebookPen size={17} />
            Worked examples & quick checks
          </div>
          <hr />
          <p className="caption">
            Progress is saved in this browser. Shared lessons count across your
            learning paths.
          </p>
          <div className="verification-label">
            <Info size={16} />
            Official alignment pending
          </div>
          <p className="caption">
            {c.session}. Pending units are visible in your roadmap.
          </p>
        </aside>
      </div>
    </div>
  );
}
function Notes() {
  const { lessons, courses, courseId, bookmarks } = useApp(),
    [q, setQ] = useState(""),
    [scope, setScope] = useState("all");
  const c = courses.find((c) => c.id === courseId),
    ids = lessonIds(c);
  const filtered = lessons.filter(
    (l) =>
      (scope !== "path" || ids.includes(l.id)) &&
      (scope !== "saved" || bookmarks.includes(l.id)) &&
      `${l.title} ${l.category} ${l.summary}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <div className="page">
      <PageIntro
        eyebrow="LESS CLUTTER. MORE CLARITY."
        title="Your ideas, all in one place."
        description="Original visual notes, worked examples and practical solutions. Shared concepts, without the duplicates."
      />
      <div className="filter-bar">
        <div className="segmented">
          {[
            ["all", "All notes"],
            ["path", "My learning path"],
            ["saved", "Bookmarked"],
          ].map(([v, t]) => (
            <button
              key={v}
              onClick={() => setScope(v)}
              className={scope === v ? "selected" : ""}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="inline-search">
          <Search size={17} />
          <input
            aria-label="Search notes"
            placeholder="Search a topic…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <div className="notes-grid">
        {filtered.map((l, i) => (
          <Link to={`/lesson/${l.id}`} key={l.id} className="note-card">
            <div
              className={`note-cover ${["mint", "lavender", "peach", "blue"][i % 4]}`}
            >
              <span className="note-cover-top">
                THE SEWESTIAN NOTEBOOK <span>↗</span>
              </span>
              <div className="note-cover-art">
                {l.lab === "binary"
                  ? "0101"
                  : l.lab === "gates"
                    ? "A ∧ B"
                    : l.id === "sql"
                      ? "SELECT *"
                      : l.category === "Programming"
                        ? "{ … }"
                        : l.lab === "network"
                          ? "↗ www"
                          : l.id === "html"
                            ? "⟨html⟩"
                            : "✧"}
              </div>
              <span className="note-cover-bottom">UNDERSTAND THE WHY.</span>
              {bookmarks.includes(l.id) && (
                <Bookmark
                  className="cover-bookmark"
                  size={17}
                  fill="currentColor"
                />
              )}
            </div>
            <div className="note-card-content">
              <span className="overline">{l.category}</span>
              <h3>{l.title}</h3>
              <p>{l.summary}</p>
              <div>
                <span>
                  <Clock size={13} />
                  {l.minutes} min read
                </span>
                {l.lab && <span className="lab-tag">Live lab</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Search size={32} />
          <h3>No notes here yet</h3>
          <p>Try another search or bookmark a lesson to save it here.</p>
        </div>
      )}
    </div>
  );
}
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function MediaAttachments({ attachments = [] }) {
  if (!attachments.length) return null;
  return (
    <section className="lesson-media">
      <span className="overline">FROM YOUR TEACHER</span>
      <div className="lesson-media-grid">
        {attachments.map((file) => (
          <figure key={file.id}>
            {file.type.startsWith("image/") ? (
              <img
                src={`/api/media/${file.id}`}
                alt={file.name}
                loading="lazy"
              />
            ) : file.type.startsWith("video/") ? (
              <video
                src={`/api/media/${file.id}`}
                controls
                preload="metadata"
                aria-label={file.name}
              />
            ) : file.type === "application/pdf" ? (
              <a
                className="uploaded-document"
                href={`/api/media/${file.id}`}
                target="_blank"
                rel="noreferrer"
              >
                <FileText size={24} />
                <span>{file.name}</span>
                <ExternalLink size={15} />
              </a>
            ) : (
              <a
                className="uploaded-document"
                href={`/api/media/${file.id}`}
                download={file.name}
              >
                <FileText size={24} />
                <span>{file.name}</span>
                <Download size={15} />
              </a>
            )}
            {file.type.startsWith("image/") && (
              <figcaption>{file.name}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
async function exportSlides(lesson) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Sewestian";
  pptx.subject = lesson.category;
  pptx.title = lesson.title;
  for (const [i, [title, body]] of [
    [lesson.title, lesson.summary],
    ...lesson.notes,
    [
      "Worked example",
      `${lesson.example.problem}\n\n${lesson.example.solution}`,
    ],
    ["Practical challenge", lesson.practical.task],
    [
      "Check your understanding",
      `${lesson.quiz.question}\n\n${lesson.quiz.options.map((x, i) => `${i + 1}. ${x}`).join("\n")}`,
    ],
    [
      "Answer & explanation",
      `${lesson.quiz.options[lesson.quiz.answer]}\n\n${lesson.quiz.explanation}`,
    ],
  ].entries()) {
    const s = pptx.addSlide();
    s.background = { color: "141A16" };
    s.addText("SEWESTIAN / " + lesson.category.toUpperCase(), {
      x: 0.7,
      y: 0.45,
      w: 11.8,
      h: 0.3,
      fontSize: 11,
      color: "C8E996",
    });
    s.addText(title, {
      x: 0.7,
      y: 1.2,
      w: 11.8,
      h: 1.1,
      fontSize: 30,
      bold: true,
      color: "FFFFFF",
      breakLine: false,
    });
    s.addText(body, {
      x: 0.7,
      y: 2.55,
      w: 11.6,
      h: 3.65,
      fontSize: 20,
      color: "D8DDD6",
      valign: "top",
      fit: "shrink",
    });
    s.addText(
      `Original foundation notes · syllabus alignment pending     ${i + 1}`,
      { x: 0.7, y: 7, w: 11.6, h: 0.2, fontSize: 10, color: "909C91" },
    );
  }
  await pptx.writeFile({ fileName: `sewestian-${lesson.id}.pptx` });
}
async function exportImage(lesson) {
  await document.fonts.load("25px Kalam");
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  const ctx = canvas.getContext("2d");
  ctx.font = "25px Kalam";
  const lines = [];
  for (const [title, body] of lesson.notes) {
    lines.push({ text: title, title: true });
    let line = "";
    for (const word of body.split(" ")) {
      if (ctx.measureText(line + word).width > 1190) {
        lines.push({ text: line });
        line = "";
      }
      line += word + " ";
    }
    lines.push({ text: line }, { text: "" });
  }
  if (lines.length > 350)
    throw new Error(
      "This page is too long for a PNG. Split it into shorter pages or print the course book as PDF.",
    );
  canvas.height = 360 + lines.length * 42;
  ctx.fillStyle = "#f4f1e8";
  ctx.fillRect(0, 0, 1400, canvas.height);
  ctx.strokeStyle = "#d5ddd8";
  for (let y = 315; y < canvas.height; y += 42) {
    ctx.beginPath();
    ctx.moveTo(70, y);
    ctx.lineTo(1330, y);
    ctx.stroke();
  }
  ctx.fillStyle = "#416444";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText("SEWESTIAN / THE VISUAL NOTEBOOK", 85, 75);
  ctx.fillStyle = "#222f26";
  ctx.font = "bold 44px sans-serif";
  ctx.fillText(lesson.title, 85, 160, 1230);
  ctx.font = "20px sans-serif";
  ctx.fillText(
    "Original foundation notes · official syllabus alignment pending",
    85,
    210,
  );
  let y = 295;
  for (const line of lines) {
    ctx.font = line.title ? "bold 27px sans-serif" : "25px Kalam";
    ctx.fillStyle = line.title ? "#315b39" : "#28392e";
    ctx.fillText(line.text, 85, y);
    y += 42;
  }
  canvas.toBlob(
    (blob) => downloadBlob(blob, `sewestian-${lesson.id}-notes.png`),
    "image/png",
  );
}
function Lesson() {
  const { id } = useParams(),
    { lessons, completed, setCompleted, bookmarks, setBookmarks, toast } =
      useApp(),
    [tab, setTab] = useState("Notes"),
    [answer, setAnswer] = useState(null),
    [solution, setSolution] = useState(false),
    [exporting, setExporting] = useState(false),
    [handwriting, setHandwriting] = useState(true),
    [notePage, setNotePage] = useState(0);
  const l = lessons.find((l) => l.id === id);
  useEffect(() => {
    setTab("Notes");
    setAnswer(null);
    setSolution(false);
    setNotePage(0);
    setHandwriting(l?.appearance?.font !== "standard");
  }, [id, l?.appearance?.font]);
  if (!l) return <Missing />;
  const saved = bookmarks.includes(id),
    done = completed.includes(id);
  async function exportFile(type) {
    setExporting(true);
    try {
      if (type === "ppt") await exportSlides(l);
      else await exportImage({ ...l, notes: [l.notes[notePage]] });
      toast(
        type === "ppt"
          ? "Your lesson slides are ready."
          : "Your note image is ready.",
      );
    } catch (error) {
      toast(error.message || "The export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }
  return (
    <div
      className={`page lesson-page chapter-accent-${l.appearance?.accent || "mint"}`}
    >
      <Link className="back-link" to="/notes">
        <ArrowLeft size={15} />
        Notes library
      </Link>
      <div className="lesson-intro">
        <div>
          <span className="eyebrow">
            {l.category.toUpperCase()} · {l.minutes} MIN EXPLORATION
          </span>
          <h1>{l.title}</h1>
          <p>{l.summary}</p>
        </div>
        <button
          aria-label={saved ? "Remove bookmark" : "Bookmark lesson"}
          className={saved ? "icon-button saved" : "icon-button"}
          onClick={() =>
            setBookmarks(
              saved ? bookmarks.filter((x) => x !== id) : [...bookmarks, id],
            )
          }
        >
          <Bookmark fill={saved ? "currentColor" : "none"} size={22} />
        </button>
      </div>
      <div className="lesson-tabs">
        {[
          "Notes",
          "Worked example",
          "Practical",
          "Quick check",
          ...(l.lab ? ["Live lab"] : []),
          "Video",
        ].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t === "Live lab" && <span className="tiny-dot" />}
            {t}
          </button>
        ))}
      </div>
      <div className="lesson-layout">
        <section className="lesson-body">
          {tab === "Notes" && (
            <article
              className={
                handwriting ? "notebook handwritten-notes" : "notebook"
              }
            >
              <div className="notebook-heading">
                <span>THE SEWESTIAN NOTEBOOK</span>
                <NotebookPen size={22} />
              </div>
              <h2>Let’s connect the dots.</h2>
              <p className="handwritten">
                A little understanding goes a long way ↗
              </p>
              <div className="chapter-pagination">
                <button
                  className="button"
                  disabled={notePage === 0}
                  onClick={() => setNotePage((p) => p - 1)}
                >
                  Previous page
                </button>
                <label>
                  Page
                  <select
                    value={notePage}
                    onChange={(e) => setNotePage(Number(e.target.value))}
                  >
                    {l.notes.map(([heading], i) => (
                      <option key={i} value={i}>
                        {i + 1}. {heading}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="button"
                  disabled={notePage >= l.notes.length - 1}
                  onClick={() => setNotePage((p) => p + 1)}
                >
                  Next page
                </button>
              </div>
              {l.notes.slice(notePage, notePage + 1).map(([title, body], i) => (
                <section className="note-section" key={i}>
                  <span className="note-number">
                    {String(notePage + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </section>
              ))}
              <MediaAttachments attachments={l.mediaAttachments} />
              <div className="notebook-tip">
                <Sparkles size={19} />
                <span>
                  Try explaining this topic to a friend without looking at your
                  notes. That’s where understanding starts.
                </span>
              </div>
            </article>
          )}
          {tab === "Worked example" && (
            <div className="content-panel">
              <span className="pill green">FROM CONCEPT TO CONTEXT</span>
              <h2>{l.example.title}</h2>
              <h4>The question</h4>
              <p>{l.example.problem}</p>
              <h4>Think it through</h4>
              <p>{l.example.solution}</p>
              <pre>
                <code>{l.example.code}</code>
              </pre>
              <div className="callout">
                <Info size={18} />
                Code examples are for study. Run them in your local Python, C++,
                SQL or browser environment as appropriate.
              </div>
            </div>
          )}
          {tab === "Practical" && (
            <div className="content-panel">
              <span className="pill green">LEARN BY DOING</span>
              <h2>Your turn to explore.</h2>
              <p>{l.practical.task}</p>
              <ol className="practical-steps">
                {l.practical.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <button className="button" onClick={() => setSolution(!solution)}>
                <Eye size={16} />
                {solution ? "Hide solution" : "Reveal worked solution"}
              </button>
              {solution && (
                <pre>
                  <code>{l.practical.answer}</code>
                </pre>
              )}
              <p className="caption">
                An original practice exercise. Check your teacher’s official
                journal list for required board practicals.
              </p>
            </div>
          )}
          {tab === "Quick check" && (
            <div className="content-panel">
              <span className="pill green">A MOMENT TO REFLECT</span>
              <h2>{l.quiz.question}</h2>
              <div className="quiz-options">
                {l.quiz.options.map((o, i) => (
                  <button
                    key={o}
                    onClick={() => setAnswer(i)}
                    className={
                      answer === i
                        ? i === l.quiz.answer
                          ? "correct"
                          : "incorrect"
                        : ""
                    }
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {o}
                    {answer === i &&
                      (i === l.quiz.answer ? (
                        <Check size={19} />
                      ) : (
                        <X size={19} />
                      ))}
                  </button>
                ))}
              </div>
              {answer !== null && (
                <div
                  className={
                    answer === l.quiz.answer
                      ? "quiz-feedback correct"
                      : "quiz-feedback"
                  }
                  role="status"
                >
                  <strong>
                    {answer === l.quiz.answer
                      ? "You connected the dots!"
                      : "A useful chance to rethink."}
                  </strong>
                  <p>{l.quiz.explanation}</p>
                  {answer !== l.quiz.answer && (
                    <button
                      className="text-button"
                      onClick={() => setAnswer(null)}
                    >
                      Try again <RotateIcon />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {tab === "Live lab" && (
            <div className="content-panel">
              <span className="pill green">TOUCH. CHANGE. UNDERSTAND.</span>
              <h2>{labInfo[l.lab].title}</h2>
              <Lab id={l.lab} />
            </div>
          )}
          {tab === "Video" && <VideoPanel lesson={l} />}
        </section>
        <aside className="lesson-aside">
          <div className="aside-panel">
            <span className="overline">BY THE END, YOU’LL BE ABLE TO</span>
            {l.objectives.map((o) => (
              <p key={o}>
                <CheckCircle2 size={16} />
                {o}
              </p>
            ))}
          </div>
          <div className="aside-panel">
            <span className="overline">TAKE YOUR LEARNING WITH YOU</span>
            <button onClick={() => setHandwriting(!handwriting)}>
              <NotebookPen size={17} />
              {handwriting
                ? "Switch to typed notes"
                : "Switch to handwritten style"}
            </button>
            <button disabled={exporting} onClick={() => exportFile("image")}>
              <Image size={17} />
              Download current page image
              <Download size={14} />
            </button>
            <button disabled={exporting} onClick={() => exportFile("ppt")}>
              <Presentation size={17} />
              Download lesson slides
              <Download size={14} />
            </button>
            <button
              onClick={() => {
                setTab("Notes");
                setTimeout(() => window.print(), 100);
              }}
            >
              <FileText size={17} />
              Print / save notes as PDF
              <ArrowUpRight size={14} />
            </button>
            <small>
              Notebook-style PNG, editable PPTX and printable notes. Exports use
              this lesson’s current content.
            </small>
          </div>
          <button
            className={
              done ? "button completion done" : "button completion primary"
            }
            onClick={() => {
              setCompleted(
                done ? completed.filter((x) => x !== id) : [...completed, id],
              );
              if (!done)
                toast("One more discovery. Progress saved in this browser.");
            }}
          >
            {done ? <CheckCheck size={18} /> : <Check size={18} />}{" "}
            {done ? "Lesson explored" : "Mark as explored"}
          </button>
          <p className="caption centered">
            Your learning journey, at your own pace.
          </p>
        </aside>
      </div>
    </div>
  );
}
function RotateIcon() {
  return <ArrowRight size={14} />;
}
function VideoPanel({ lesson }) {
  let embed = "";
  if (lesson.videoUrl) {
    const u = new URL(lesson.videoUrl);
    if (u.hostname.includes("youtu")) {
      const id =
        u.hostname === "youtu.be"
          ? u.pathname.slice(1)
          : u.searchParams.get("v") || u.pathname.split("/").pop();
      if (/^[A-Za-z0-9_-]{11}$/.test(id))
        embed = `https://www.youtube-nocookie.com/embed/${id}`;
    } else {
      const id = u.pathname.split("/").pop();
      if (/^\d+$/.test(id)) embed = `https://player.vimeo.com/video/${id}`;
    }
  }
  return (
    <div className="content-panel">
      <span className="pill green">ANOTHER WAY TO UNDERSTAND</span>
      <h2>See the lesson unfold.</h2>
      {embed ? (
        <iframe
          className="video-frame"
          title={`${lesson.title} lesson video`}
          src={embed}
          allow="fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="empty-state">
          <Video size={40} />
          <h3>Your teacher’s video belongs here.</h3>
          <p>
            {lesson.videoUrl
              ? "This video link cannot be embedded."
              : "No video has been published for this lesson yet."}
          </p>
          {lesson.videoUrl && (
            <a
              className="button"
              href={lesson.videoUrl}
              target="_blank"
              rel="noreferrer"
            >
              Watch on video platform
              <ExternalLink size={15} />
            </a>
          )}
          {lesson.lab && (
            <Link
              className="button primary"
              to={`/animations?lab=${lesson.lab}`}
            >
              Explore the visual simulation
              <ArrowRight size={15} />
            </Link>
          )}
        </div>
      )}
      <MediaAttachments
        attachments={(lesson.mediaAttachments || []).filter((file) =>
          file.type.startsWith("video/"),
        )}
      />
    </div>
  );
}
function LabPage({ visual = false }) {
  const location = useLocation(),
    requested = new URLSearchParams(location.search).get("lab"),
    [selected, setSelected] = useState(
      requested && labInfo[requested] ? requested : visual ? "cpu" : "binary",
    );
  useEffect(() => {
    if (requested && labInfo[requested]) setSelected(requested);
  }, [requested]);
  return (
    <div className="page">
      <PageIntro
        eyebrow={
          visual
            ? "MAKE THE INVISIBLE VISIBLE"
            : "A SAFE SPACE TO ASK “WHAT IF?”"
        }
        title={
          visual
            ? "Less imagining. More understanding."
            : "A little play. A lot of possibility."
        }
        description={
          visual
            ? "Follow the steps, connect the pieces, and see how computer science actually works."
            : "Flip switches, follow instructions and test an idea. There’s no wrong way to be curious."
        }
      />
      <label className="mobile-lab-picker">
        Choose a simulation
        <select
          aria-label="Choose a simulation"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {Object.entries(labInfo).map(([id, l]) => (
            <option key={id} value={id}>
              {l.title}
            </option>
          ))}
        </select>
      </label>
      <div className="lab-layout">
        <div className="lab-picker">
          {Object.entries(labInfo).map(([id, l]) => (
            <button
              key={id}
              className={selected === id ? "lab-option active" : "lab-option"}
              onClick={() => setSelected(id)}
            >
              <span className={`lab-option-icon ${l.color}`}>{l.icon}</span>
              <span>
                <strong>{l.title}</strong>
                <small>{l.category}</small>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
        <section className="lab-workspace">
          <div className="lab-workspace-header">
            <div>
              <span className="pill green">
                <span /> LIVE SIMULATION
              </span>
              <h2>{labInfo[selected].title}</h2>
              <p>{labInfo[selected].description}</p>
            </div>
            <FlaskConical size={24} />
          </div>
          <Lab key={selected} id={selected} />
          <div className="lab-workspace-footer">
            <span>
              <Sparkles size={15} />
              Small experiments. Lasting understanding.
            </span>
            <Link to={`/lesson/${labInfo[selected].lesson}`}>
              Read the notes
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>
      </div>
      <div className="callout">
        <Info size={18} />
        {Object.keys(labInfo).length} interactive labs are available. Journey
        simulations show input, intermediate state and output; use the controls
        to test what changes.
      </div>
    </div>
  );
}
function SearchModal({ close }) {
  const { lessons, courses } = useApp(),
    [query, setQuery] = useState(""),
    ref = useRef();
  useEffect(() => {
    ref.current?.focus();
    const previous = document.activeElement;
    return () => previous?.focus?.();
  }, []);
  const q = query.toLowerCase(),
    found = lessons
      .filter((l) =>
        `${l.title} ${l.category} ${l.summary} ${l.notes.map((n) => n.join(" ")).join(" ")}`
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 6),
    paths = courses
      .filter((c) =>
        `${c.board} ${c.grade} ${c.subject} ${c.code}`
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 3);
  return (
    <div className="modal-backdrop" onClick={close}>
      <section
        className="search-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Search your learning universe"
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            const focusable =
              e.currentTarget.querySelectorAll("button,input,a");
            const first = focusable[0],
              last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="search-modal-input">
          <Search size={22} />
          <input
            ref={ref}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you curious about?"
            aria-label="Search all learning content"
          />
          <button
            className="icon-button"
            aria-label="Close search"
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>
        <div className="search-results">
          <span className="overline">
            {query ? "LESSONS & IDEAS" : "START SOMEWHERE INTERESTING"}
          </span>
          {found.map((l) => (
            <Link onClick={close} to={`/lesson/${l.id}`} key={l.id}>
              <BookOpen size={18} />
              <span>
                <strong>{l.title}</strong>
                <small>
                  {l.category} · {l.minutes} min
                </small>
              </span>
              <ArrowUpRight size={16} />
            </Link>
          ))}
          {paths.length > 0 && <span className="overline">LEARNING PATHS</span>}
          {paths.map((c) => (
            <Link onClick={close} to={`/course/${c.id}`} key={c.id}>
              <GraduationCap size={18} />
              <span>
                <strong>{c.subject}</strong>
                <small>
                  {c.board} · Class {c.grade} · {c.code}
                </small>
              </span>
              <ArrowUpRight size={16} />
            </Link>
          ))}
          {!found.length && !paths.length && (
            <p className="empty-state">
              No matches yet. Try “Python”, “binary” or your board name.
            </p>
          )}
        </div>
        <div className="search-modal-footer">
          One search. Your whole learning universe.<kbd>ESC to close</kbd>
        </div>
      </section>
    </div>
  );
}
function Admin() {
  const { toast, refresh, courses } = useApp(),
    [workspaceTab, setWorkspaceTab] = useState("studio"),
    [status, setStatus] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [items, setItems] = useState([]),
    [selected, setSelected] = useState(""),
    [form, setForm] = useState(null);
  async function load() {
    try {
      const s = await api("/auth/status");
      setStatus(s);
      if (s.authenticated) {
        const data = await api("/admin/lessons");
        setItems(data);
        const target = data.find((l) => l.id === selected) || data[0];
        if (target) {
          setSelected(target.id);
          setForm({
            ...target,
            videoUrl: target.videoUrl || "",
            mediaIds: target.mediaIds || [],
          });
        }
      }
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setPassword("");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function save(publish) {
    setBusy(true);
    setError("");
    try {
      await api(`/admin/lessons/${selected}`, {
        method: "PUT",
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          notes: form.notes,
          videoUrl: form.videoUrl,
          mediaIds: form.mediaIds || [],
          status: publish ? "published" : "draft",
        }),
      });
      toast(
        publish
          ? "Lesson published to the student library."
          : "Draft saved. Students still see the published version.",
      );
      setItems(await api("/admin/lessons"));
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!status)
    return (
      <div className="page">
        <p role="status">{error || "Opening the teacher workspace…"}</p>
      </div>
    );
  return (
    <div className="page">
      <PageIntro
        eyebrow="THOUGHTFULLY TAUGHT. CLEARLY SHARED."
        title="Your classroom, behind the scenes."
        description="Shape a lesson, save a draft, and publish when it’s ready for your students."
      >
        {status.authenticated && (
          <button
            className="button"
            onClick={async () => {
              try {
                await api("/auth/logout", { method: "POST" });
                setStatus({ ...status, authenticated: false });
                setForm(null);
                setSelected("");
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        )}
      </PageIntro>
      {!status.authenticated ? (
        <div className="admin-entry">
          <div className="admin-art">
            <OrbitalArt mini />
            <h2>
              A little preparation.
              <br />A world of understanding.
            </h2>
            <p>Your teaching makes the difference.</p>
          </div>
          <form onSubmit={login} className="login-panel">
            <div className="login-icon">
              <ShieldCheck size={26} />
            </div>
            <h2>Welcome, teacher.</h2>
            <p>A quiet space to create your next great lesson.</p>
            {!status.configured && (
              <div className="callout">
                <Info size={18} />
                <span>
                  Teacher access needs initial setup. Set ADMIN_EMAIL and a
                  strong ADMIN_PASSWORD on the server, then restart it. The
                  project README has the exact steps.
                </span>
              </div>
            )}
            <label>
              Email address
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@your-school.edu"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your teacher password"
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="button primary"
              disabled={!status.configured || busy}
            >
              {busy ? "Signing in…" : "Enter your workspace"}
              <ArrowRight size={17} />
            </button>
            <small>
              <LockKeyhole size={13} />
              Protected access. Student learning stays public.
            </small>
          </form>
        </div>
      ) : (
        <>
          <div className="segmented workspace-switch">
            <button
              className={workspaceTab === "studio" ? "selected" : ""}
              onClick={() => setWorkspaceTab("studio")}
            >
              Chapter studio
            </button>
            <button
              className={workspaceTab === "quick" ? "selected" : ""}
              onClick={() => {
                setWorkspaceTab("quick");
                load();
              }}
            >
              Quick lesson editor
            </button>
          </div>
          {workspaceTab === "studio" ? (
            <TeacherStudio
              api={api}
              courses={courses}
              toast={toast}
              refresh={refresh}
            />
          ) : (
            <>
              <div className="admin-status">
                <span className="pill green">TEACHER WORKSPACE</span>
                <span>{items.length} lessons</span>
                <span>
                  {items.filter((l) => l.status === "draft").length} drafts
                </span>
                <span>
                  {items.filter((l) => l.status === "published").length}{" "}
                  published updates
                </span>
              </div>
              <div className="editor-layout">
                <aside className="editor-list">
                  {items.map((l) => (
                    <button
                      key={l.id}
                      className={selected === l.id ? "active" : ""}
                      onClick={() => {
                        setSelected(l.id);
                        setForm({
                          ...l,
                          videoUrl: l.videoUrl || "",
                          mediaIds: l.mediaIds || [],
                        });
                        setError("");
                      }}
                    >
                      <BookOpen size={16} />
                      <span>
                        {l.title}
                        <small>
                          {l.status === "original"
                            ? "Original lesson"
                            : l.status === "draft"
                              ? "Draft changes"
                              : "Published"}
                        </small>
                      </span>
                    </button>
                  ))}
                </aside>
                {form && (
                  <form
                    className="editor-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      save(false);
                    }}
                  >
                    <div className="editor-heading">
                      <h2>Make the next “aha!” moment.</h2>
                      <Link to={`/lesson/${selected}`} className="text-button">
                        Student view
                        <ArrowUpRight size={15} />
                      </Link>
                    </div>
                    <label>
                      Lesson title
                      <input
                        required
                        minLength={3}
                        maxLength={140}
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      A short introduction
                      <textarea
                        required
                        minLength={10}
                        maxLength={400}
                        rows={2}
                        value={form.summary}
                        onChange={(e) =>
                          setForm({ ...form, summary: e.target.value })
                        }
                      />
                    </label>
                    <span className="overline">NOTEBOOK SECTIONS</span>
                    {form.notes.map(([heading, body], i) => (
                      <fieldset key={i}>
                        <legend>Section {i + 1}</legend>
                        <label>
                          Heading
                          <input
                            required
                            maxLength={120}
                            value={heading}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                notes: form.notes.map((n, j) =>
                                  j === i ? [e.target.value, n[1]] : n,
                                ),
                              })
                            }
                          />
                        </label>
                        <label>
                          Explanation
                          <textarea
                            required
                            maxLength={12000}
                            rows={4}
                            value={body}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                notes: form.notes.map((n, j) =>
                                  j === i ? [n[0], e.target.value] : n,
                                ),
                              })
                            }
                          />
                        </label>
                      </fieldset>
                    ))}
                    <button
                      type="button"
                      className="button"
                      disabled={form.notes.length >= 100}
                      onClick={() =>
                        setForm({
                          ...form,
                          notes: [
                            ...form.notes,
                            ["New idea", "Explain the concept here."],
                          ],
                        })
                      }
                    >
                      Add notebook section
                    </button>
                    <label>
                      Lesson video · optional
                      <input
                        type="url"
                        value={form.videoUrl}
                        onChange={(e) =>
                          setForm({ ...form, videoUrl: e.target.value })
                        }
                        placeholder="https://www.youtube.com/watch?v=…"
                      />
                      <small>
                        A YouTube or Vimeo video you have permission to share.
                      </small>
                    </label>
                    <section className="teacher-uploads">
                      <span className="overline">YOUR TEACHING MATERIALS</span>
                      <p>
                        Attach an image, short video or PDF to this lesson.
                        Import a Markdown or text file to turn its headings into
                        notebook sections.
                      </p>
                      <div className="upload-controls">
                        <label>
                          Upload an image, video or PDF
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,application/pdf"
                            disabled={busy}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setBusy(true);
                              setError("");
                              try {
                                const data = new FormData();
                                data.append("file", file);
                                const response = await fetch(
                                  "/api/admin/uploads",
                                  {
                                    method: "POST",
                                    body: data,
                                  },
                                );
                                const result = await response.json();
                                if (!response.ok)
                                  throw new Error(
                                    result.error || "Upload failed.",
                                  );
                                setForm((current) => ({
                                  ...current,
                                  mediaIds: [
                                    ...(current.mediaIds || []),
                                    result.id,
                                  ],
                                  mediaAttachments: [
                                    ...(current.mediaAttachments || []),
                                    result,
                                  ],
                                }));
                                toast(
                                  "File attached. Save your lesson draft to keep it.",
                                );
                              } catch (error) {
                                setError(error.message);
                              } finally {
                                setBusy(false);
                                e.target.value = "";
                              }
                            }}
                          />
                        </label>
                        <label>
                          Import Markdown or text notes
                          <input
                            type="file"
                            accept=".md,.markdown,.txt,text/plain,text/markdown"
                            disabled={busy}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setBusy(true);
                              setError("");
                              try {
                                const data = new FormData();
                                data.append("file", file);
                                const response = await fetch(
                                  "/api/admin/import-notes",
                                  { method: "POST", body: data },
                                );
                                const result = await response.json();
                                if (!response.ok)
                                  throw new Error(
                                    result.error || "Notes import failed.",
                                  );
                                if (
                                  form.notes.length + result.notes.length >
                                  100
                                )
                                  throw new Error(
                                    "This lesson has room for 100 notebook pages. Shorten the import first.",
                                  );
                                setForm((current) => ({
                                  ...current,
                                  notes: [...current.notes, ...result.notes],
                                }));
                                toast(
                                  `${result.notes.length} sections imported. Save your draft to keep them.`,
                                );
                              } catch (error) {
                                setError(error.message);
                              } finally {
                                setBusy(false);
                                e.target.value = "";
                              }
                            }}
                          />
                        </label>
                      </div>
                      <small>
                        Uploads are limited to 4 MB each. Students can view
                        images, PDFs and short video clips after you publish.
                        Use the video link above for longer lessons.
                      </small>
                      {!!form.mediaAttachments?.length && (
                        <div className="upload-list">
                          {form.mediaAttachments.map((file) => (
                            <div key={file.id}>
                              <FileText size={15} />
                              <span>
                                {file.name}
                                <small>
                                  {(file.size / 1024).toFixed(0)} KB
                                </small>
                              </span>
                              <button
                                type="button"
                                className="icon-button"
                                aria-label={`Remove ${file.name}`}
                                onClick={() =>
                                  setForm({
                                    ...form,
                                    mediaIds: (form.mediaIds || []).filter(
                                      (id) => id !== file.id,
                                    ),
                                    mediaAttachments:
                                      form.mediaAttachments.filter(
                                        (item) => item.id !== file.id,
                                      ),
                                  })
                                }
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                    {error && (
                      <p className="form-error" role="alert">
                        {error}
                      </p>
                    )}
                    <div className="editor-actions">
                      <button className="button" disabled={busy}>
                        <Save size={16} />
                        Save draft
                      </button>
                      <button
                        type="button"
                        className="button primary"
                        disabled={busy}
                        onClick={(e) => {
                          if (e.currentTarget.form.reportValidity()) save(true);
                        }}
                      >
                        <Send size={16} />
                        Publish to students
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
function CourseBook() {
  const { id } = useParams(),
    { courses, lessons } = useApp();
  const course = courses.find((c) => c.id === id);
  if (!course) return <Missing />;
  const ids = lessonIds(course),
    chapters = ids.map((id) => lessons.find((l) => l.id === id));
  return (
    <div className="page book-page">
      <Link className="back-link" to={`/course/${id}`}>
        <ArrowLeft size={15} />
        Back to your course
      </Link>
      <div className="book-toolbar">
        <span className="eyebrow">YOUR COURSE, IN ONE NOTEBOOK</span>
        <button className="button primary" onClick={() => window.print()}>
          <Download size={16} />
          Print / save complete book as PDF
        </button>
      </div>
      <article className="course-book">
        <div className="book-cover">
          <Logo />
          <span className="book-edition">
            FOUNDATION EDITION · ORIGINAL LEARNING MATERIAL
          </span>
          <h1>{course.subject}</h1>
          <h2>
            {course.board} Board · Class {course.grade}
          </h2>
          <p>
            A little curiosity.
            <br />A world of understanding.
          </p>
          <span>
            {chapters.length} shared concepts · Notes · Worked examples ·
            Practical solutions
          </span>
        </div>
        <section className="book-frontmatter">
          <h2>Before you begin</h2>
          <p>
            This foundation edition collects the available lessons for this
            pathway without repeating shared topics. It is not the complete
            official board syllabus. Session-specific units, assessment weights
            and practical requirements are awaiting verification against
            official documents and your teacher’s material.
          </p>
          <h3>Inside this notebook</h3>
          <ol>
            {chapters.map((l) => (
              <li key={l.id}>
                <a href={`#book-${l.id}`}>{l.title}</a>
              </li>
            ))}
          </ol>
          <h3>Still to verify or develop</h3>
          <ul>
            {course.units
              .flatMap((u) => u.pending)
              .map((p) => (
                <li key={p}>{p}</li>
              ))}
          </ul>
        </section>
        {chapters.map((l, i) => (
          <section
            id={`book-${l.id}`}
            key={l.id}
            className={`book-chapter ${l.appearance?.pageBreaks ? "print-separate-pages" : ""}`}
          >
            <span className="overline">
              CHAPTER {String(i + 1).padStart(2, "0")} ·{" "}
              {l.category.toUpperCase()}
            </span>
            <h2>{l.title}</h2>
            <p className="chapter-summary">{l.summary}</p>
            <MediaAttachments attachments={l.mediaAttachments} />
            {l.notes.map(([title, body], j) => (
              <div className="book-note-page" key={j}>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
            <div className="book-example">
              <h3>Worked example · {l.example.title}</h3>
              <p>{l.example.problem}</p>
              <p>
                <strong>Solution:</strong> {l.example.solution}
              </p>
              <pre>{l.example.code}</pre>
            </div>
            <h3>Practical challenge</h3>
            <p>{l.practical.task}</p>
            <ol>
              {l.practical.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <h3>Worked solution</h3>
            <pre>{l.practical.answer}</pre>
            <h3>Quick check</h3>
            <p>{l.quiz.question}</p>
            <ol type="A">
              {l.quiz.options.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ol>
            <p className="book-answer">
              <strong>Answer: {l.quiz.options[l.quiz.answer]}.</strong>{" "}
              {l.quiz.explanation}
            </p>
            {l.lab && (
              <Link className="book-lab-link" to={`/labs?lab=${l.lab}`}>
                Explore this idea in the interactive lab{" "}
                <ArrowUpRight size={15} />
              </Link>
            )}
          </section>
        ))}
      </article>
    </div>
  );
}
function Missing() {
  return (
    <div className="empty-state">
      <h1>We couldn’t find that lesson.</h1>
      <Link className="button primary" to="/courses">
        Explore your courses
      </Link>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
