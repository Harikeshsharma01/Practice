# Sewestian

A responsive learning portal for Maharashtra and CBSE classes XI and XII, built with React, Express, Node.js and a MongoDB persistence adapter. The galaxy visual experience includes a nebula backdrop, animated starfield, touch stardust, glowing course portals, an interactive Sewestian planet, a saved effects toggle and reduced-motion support, course roadmaps, handwritten-style notebooks, examples, quizzes and interactive simulations.

## What is available

- Eight provisional board/class pathways: Maharashtra XI/XII CS–I and CS–II; CBSE XI/XII Computer Science (083) and Information Technology (802).
- Eighty-seven lessons: 26 foundation lessons and 61 practical workshops, with 592 logical note sections. One canonical lesson can belong to several courses without duplication.
- Twenty-one interactive simulations, including seven step-by-step journeys from input to output: binary and hex, six logic gates, a simplified CPU cycle, bubble sort, networking, full addition, recursive call stacks, binary search, Python list indices, stacks and queues, a safe sample SQL filter, subnet calculation, colour contrast and CSS layouts.
- Search, board/class filters, bookmarks and learning progress saved in the student's browser.
- Worked examples, practical tasks with solutions, self-check questions, notebook-style PNG exports and editable PPTX exports.
- Printable course books combining available notes, examples, exercises and solutions. Browser printing can save these as PDFs.
- Teacher authentication with a salted scrypt password hash and an eight-hour HttpOnly session cookie. Drafts remain private; publishing changes the public lesson. Teachers can add YouTube/Vimeo links, upload 4 MB images, short videos and PDFs, and import headings from Markdown/text notes. The chapter studio supports new chapters, duplication, up to 100 logical pages per chapter, a 50-page outline planner, course assignments, page ordering, editable examples/solutions/quizzes, and appearance controls.
- Practical journal filters, worked solutions, viva prompts and observations saved in the student’s browser.
- Syllabus evidence uploads and teacher-reviewed topic mappings, with source page references.
- Optional OpenAI API drafting in batches of up to five pages, teacher review before applying, and prompt export for Codex/ChatGPT. No embedded Codex session or autonomous publishing.
- Responsive layouts, keyboard navigation, reduced-motion support and locally served fonts.

See [the teacher guide](docs/TEACHER_GUIDE.md) for the complete workflow and photo transcription notes.

## Content status — please read before classroom use

This is a foundation edition, **not a completed or officially verified curriculum**. The two supplied journal photos were transcribed into 35 labeled practical entries; their ambiguous or inferred items are flagged for teacher review. The supplied ChatGPT share links, CBSE academic website, Maharashtra board website and eBalbharati were blocked by the workspace's network proxy (403). Their contents were not imported. Course maps are explicitly provisional and show pending areas. The 2026–27 curriculum, unit allocation, marking scheme, practical counts, prescribed programming environments and institutional requirements must be checked against official documents before claiming syllabus coverage. Provide the official PDFs and shared notes for exact alignment; references and access results are in `docs/SOURCE_STATUS.md`.

CBSE IT means **Information Technology (802)** here, not Informatics Practices (065). The Maharashtra course maps need textbook and bifocal-subject verification. No claim of affiliation with ALLEN or a board is made. Videos are empty until a teacher adds a link or uploads a permitted short clip. Uploaded media is validated and visible only when its lesson is published. The Vercel upload path supports a maximum of 4 MB per file; use a YouTube or Vimeo link for longer videos. “Handwritten” is a handwriting-font presentation of original typed notes, not scanned handwriting. There is no AI image/video service or arbitrary code execution. Optional text drafting requires a backend OpenAI API key; it is disabled without that key. Student progress is per browser, without cross-device accounts.

## Local development

Use the existing checkout at `/workspace/Sewestian`. This task already has an isolated workspace; do not create an additional Git worktree unless asked.

Requires Node 22.12+ (Node 24 also works) and npm. Dependencies are locked in `package-lock.json`.

```bash
cd /workspace/Sewestian
npm ci --cache /workspace/.npm-cache
cp .env.example .env
npm run dev
```

Vite normally serves the frontend at `http://localhost:5173` and proxies `/api` to Express on port 4000. If that port is busy, Vite automatically uses its next available port, such as `http://localhost:5174`; open the exact address Vite prints in the terminal. The development API accepts the matching same-origin request, including localhost, loopback, and LAN addresses forwarded by Vite. Production login still requires the exact configured `CLIENT_ORIGIN`. If `MONGODB_URI` is absent in development, the server explicitly uses an ignored `.data/` JSON store. It preserves local drafts and uploaded media across restarts but is not used for production.

For MongoDB development, set `MONGODB_URI` in `.env` to a reachable database. Never commit secrets.

To enable teacher access, set `ADMIN_EMAIL` and your own password of at least 12 characters in `.env`, then restart the API. These initialise an account only when one does not exist. There is no public registration or built-in password. Remove `ADMIN_PASSWORD` from the runtime configuration after initialisation; the database retains only its salted hash. For a password reset, an operator must replace the `admin` document's hash using the exported `hashPassword` function and revoke existing `session-*` documents. Do not expose a reset endpoint without an authenticated recovery workflow.

## Checks

```bash
npm test
npm run build
# With npm run dev running and Chromium installed:
npm run test:ui
# After building, exercises an isolated teacher account against the built app:
npm run test:teacher
# Chapter studio, practical journal and journey browser coverage:
node tests/studio-browser.mjs
# Galaxy interaction checks with the dev server running:
node tests/cosmic-browser.mjs
# Optional bundled example execution checks (g++ and Python required):
node tests/practical-solutions.mjs
```

`npm test` exercises canonical mappings, authentication, private drafts, publishing, session invalidation, payload validation, untrusted origins, and persistence of the development store. Browser tests cover desktop/mobile navigation, search, quizzes, bookmarks/progress, PNG/PPTX downloads, course filters and simulations. `CHROMIUM_PATH` overrides the default `/usr/bin/chromium`; `TEST_BASE_URL` overrides the local test URL. Screenshots and downloaded exports go to `/tmp/sewestian-screenshots`.

A live MongoDB database, Vercel functions and Render deployment have **not** been validated in this workspace because those accounts/connections have not been supplied. A successful local test does not establish production readiness.

## Deploy to Vercel + Render + MongoDB Atlas

The repository contains `render.yaml`, `vercel.json` and `api/proxy.js`. These are deployment instructions, not evidence of an existing deployment. The user selected the existing `Harikeshsharma01/Practice` repository for this replacement. Publishing Git changes and deploying hosting services are separate steps; see the delivery report for confirmed push status.

1. Use the prepared `Harikeshsharma01/Practice` GitHub repository in your Vercel and Render accounts. The local project is named Sewestian; the GitHub repository name stays Practice. The replacement is a normal commit so earlier files remain recoverable through Git history.
2. Create a MongoDB Atlas database and an application database user. Configure Atlas network access for your Render service's outbound addresses. Obtain the connection URI through Atlas and store it only in Render's secure environment settings.
3. Import the repository in Render as a Blueprint using `render.yaml`. Set `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `CLIENT_ORIGIN` (the exact production Vercel origin, with no trailing slash). Render installs production dependencies and starts Express. Production intentionally refuses to start without MongoDB and the frontend origin; it never falls back to ephemeral file storage.
4. Import the repository in Vercel. The checked-in configuration builds Vite and serves the static frontend plus the API bridge. Set the server-side Vercel variable `SERVER_API_URL` to the actual HTTPS Render service URL, then deploy. This variable is not prefixed `VITE_` and is not sent to the browser.
5. If the final Vercel hostname differs from the provisional hostname, update Render's `CLIENT_ORIGIN` and restart. Requests use the Vercel same-origin `/api` bridge, keeping the secure session cookie first-party. Preview deployments need their own deliberately configured API/origin; do not wildcard the production origin.
6. Verify `/api/health` reports `storage: mongodb`; check the eight courses, one interactive lab, a PNG and PPTX download, teacher sign-in, a private draft, public publishing and sign-out. Restart the backend and confirm published content survives. Verify browser console and network responses over HTTPS.
7. Remove the one-time `ADMIN_PASSWORD` configuration after the admin account is initialised. Keep the database credentials secure. Add your custom domain after the production URLs work.

Render's free service can sleep, so the first API request may be slow. The UI and proxy display a retryable error rather than silently substituting stale lesson data. Select a suitable paid plan if your classroom requires always-on availability.

## Project map

- `client/src/main.jsx` — navigation, course and notebook views, search, exports and teacher editor.
- `client/src/components/Labs.jsx` — interactive learning simulations.
- `client/src/styles.css` — responsive visual design, reduced motion and print layouts.
- `shared/catalog.js` — canonical original lessons and provisional course mappings.
- `server/app.js` — validated API, authentication, draft/publish workflow.
- `server/store.js` — MongoDB and explicit local-development persistence.
- `api/proxy.js` — Vercel same-origin bridge to Render.
- `tests/` — integration and browser checks.

Next content work: obtain the official syllabus PDFs and the supplied shared-conversation contents; verify every course unit and practical requirement; expand missing lesson coverage; add institution-approved videos, chapter-specific diagrams and practical journal material. Teachers can now create and publish new chapters, edit worked examples and practical solutions, assign courses, and record syllabus mappings from the workspace. Official completeness and 50 finished pages per chapter remain content-authoring work, not claims made by this update.

## Optional lesson assistant

Set `OPENAI_API_KEY` only on the backend and optionally `OPENAI_MODEL` (default `gpt-4.1-mini`). The teacher workspace explains what is sent, supports 1–5 page batches, and requires teacher review before adding generated pages to a draft. The route uses the OpenAI Responses API and `store: false`. No live provider call was made during development; integration was verified with a mocked response. See the teacher guide for configuration and limitations.
