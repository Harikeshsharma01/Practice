# Teaching with Sewestian

## What was added on 7 October 2026

The catalog has 87 lessons: the 26 foundation lessons plus 61 practical workshops. There are 592 note sections across the catalog and 21 interactive labs. Note sections are logical reading pages, not a claim of 592 full printed sheets or complete board coverage.

35 practical entries were transcribed or interpreted from your two journal photographs:

| Photograph                                       | Assigned course      | Entries | Qualification                                                                                                                                                                |
| ------------------------------------------------ | -------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Photo 1: HTML, sorting, C++ classes and pointers | Maharashtra XII CS–I | 13      | Class assignment is inferred. Includes the crossed-out reverse-string item as optional revision and the handwritten swap-by-reference item. Confirm their journal numbering. |
| Photo 2: upper C++ program list                  | Maharashtra XI CS–I  | 12      | FYJC assignment inferred from the adjacent heading. The unclear item “find practical of a number” is interpreted as factorial.                                               |
| Photo 2: FYJC Computer Science–II experiments    | Maharashtra XI CS–II | 10      | Heading is visible. “Any three circuits” still requires teacher selection; the R–S implementation must match your trainer.                                                   |

The other 26 exercises are original supplementary suggestions for Python, SQL, IT, and 8085. They are not a retrieved official practical list. Modern C++17 examples may need adaptation if the institution prescribes an older compiler or library.

## Use the practical journal

1. Open **Practical journal** from the navigation.
2. Choose a board/class and optionally filter to your journal photos.
3. Read the aim and procedure. Try the problem before revealing its solution.
4. Use **Explore the simulation** to inspect related behaviour. Some links demonstrate a supporting concept rather than executing that exact program.
5. Record the observed result and mark completion. This student journal is stored in that browser only.
6. Download the filtered journal as Markdown for an offline copy including solutions and your observations.

## Follow a process from origin to destination

Open **Visual learning** or **Practice lab** and choose a journey. Set the input, press Play or step manually, inspect the current state, and use the travel log to return to an earlier event. Changing inputs resets the trace. These are deterministic teaching models, not live requests, general code execution, an actual filesystem or physical circuits.

New journeys cover a browser request, bubble-sort comparisons, compiled program execution, SQL SELECT processing, UTF-8 file encoding, subtractors and sequential circuits, and 8085 addition/register/flag changes. The circuit journey contains half/full subtractors, an active-high NOR R–S latch, an edge-triggered J–K model and a three-bit counter.

## Create a substantial chapter

1. Sign in at **Teacher workspace**. The new **Chapter studio** opens by default.
2. Enter a chapter title, choose its starting course and select **Create chapter**. It starts as a private draft.
3. Choose every course that should share the same chapter. Shared chapters have one canonical copy.
4. Set the course unit, objectives, example, practical solution, self-check question and linked simulation.
5. Use **Chapter plan and appearance** to set a target of 50 pages (or any target up to 100). **Build outline** creates an editable plan, not finished content.
6. Write pages, add pages, reorder them, preview them, or import Markdown/text. Markdown headings separate pages. Each page permits up to 12,000 characters; a chapter permits up to 100 pages. Requests are capped at 2 MB, so very large chapters may need splitting.
7. Add images, short videos, PDFs or text files up to 4 MB each. Use a YouTube/Vimeo link for larger videos. Attached files stay private until the chapter is published.
8. Save a draft, then publish after review. **Return to a private draft** hides the published chapter and retains your content.
9. Export chapter notes as Markdown. Students can turn pages, export the current page as a PNG, download slides, or print the complete course book to PDF. A long logical page can occupy several printed sheets; the page-break option controls where sections begin.

Duplicate a saved chapter when two classes need deliberately different explanations. Select a new course assignment for the duplicate. Duplication uses saved content, so save your changes first.

This update provides capacity and authoring tools for 50-page chapters. It does not claim to have written 50 finished pages for every chapter of all eight syllabuses.

## Map the official syllabus

In **Syllabus mapping**, select a course, supply the academic session and document title, and attach a syllabus PDF/image or provide its HTTPS source link. Add topic rows, source page numbers, lesson links and practical links. Save the map to show it on the course page. Use the review checkbox only after you compare the map with that source.

“Teacher-reviewed” records your review, not certification by CBSE or MSBSHSE. Official board sites returned proxy-level 403 errors on 7 October 2026; remaining official lists and their 2026–27 applicability could not be confirmed. CBSE IT here means **802**, not Informatics Practices **065**. See SOURCE_STATUS.md for precise source status.

## AI help in the teacher workspace

**AI drafting** is a custom Sewestian assistant using the OpenAI Responses API. A ChatGPT/Codex session cannot simply be embedded in another website. You can export a chapter prompt to use in Codex/ChatGPT without connecting an API account.

To enable integrated drafting, set `OPENAI_API_KEY` in the backend’s secure environment settings (Render for the hosted deployment), and optionally set `OPENAI_MODEL`. The default model is `gpt-4.1-mini`. Restart the backend. Never set the API key as a Vite variable or commit it to GitHub. ChatGPT subscriptions and API billing are separate.

The assistant requests one to five pages per batch. It sends the title, teacher instructions, course, outline and a limited chapter excerpt to the API with `store: false`. Avoid sending student personal data. Returned pages remain a proposal until you edit and add them to your draft. Saving and publishing remain separate actions. No automatic syllabus verification or autonomous code modification occurs.

The route and review flow were tested with a mocked provider. Live AI output was not tested because no API key was configured. A provider timeout, unavailable model or billing issue produces a visible error and leaves the draft unchanged.

## Hosting

The frontend requires Vercel `SERVER_API_URL` pointing to your Render backend. Render requires a working `MONGODB_URI` and an exact `CLIENT_ORIGIN` for the production Vercel address. Uploads use MongoDB GridFS in production and the ignored local `.data` folder in development. The update does not supply hosting credentials or establish that your deployed backend is connected.

## Galaxy controls and local viewing

The new galaxy theme includes a nebula sky, animated stars, pointer constellations, touch stardust, glowing course portals and an interactive planet. Tap **Touch to ignite** on the home planet; use **Discover** and **Explore** to open learning areas. **Magic on/off** in the top bar stores your effects preference. Reduced motion starts with effects off, animations pause in hidden browser tabs, and decorative canvases never intercept clicks.

On your own computer, update your existing Practice checkout with `git pull origin main`, install the locked dependencies with `npm ci`, then run `npm run dev`. Open the address printed by Vite. Keep the terminal open while using the site. This starts both the React frontend and Express backend. If you have not created `.env`, copy `.env.example` without overwriting an existing configuration, then set your own teacher account credentials. Set `MONGODB_URI` when you want MongoDB storage; development otherwise uses the clearly labeled local file store. Production still requires MongoDB.
