# One Sewestian website and Android platform

## What stays in sync

The Android APK opens the same React website and Express API as the browser. When both connect to the **same server/database**, published lessons, videos, layouts, simulations, student conversations and teacher replies come from the same source. Website changes must first be deployed (or the local server rebuilt/restarted); use Reload in the APK to refresh. No duplicated lesson database is stored in the APK.

A hosted Vercel/Render deployment and a local classroom with its own `.data/` directory are separate installations. They do not automatically copy each other's content or messages. Choose the same hosted address everywhere for one online classroom, or the same local server for a Wi-Fi class. Deliberately sharing MongoDB can share stored content, but local classroom admission remains separate.

Android-specific features—permissions, connection setup, secure-window behavior, native uploads/printing—require an APK update. Students download and install it; the app never silently installs software. Web-only changes appear in the existing APK after deployment and refresh.

## Students: questions, feedback and issues

Open **Doubts & feedback** in the navigation, or **Ask your teacher about this lesson** from a lesson. Choose a doubt, feedback or issue, enter a name, subject and message, and send it. Return to the conversation to read the teacher's reply and add follow-up questions. The open page refreshes every 15 seconds. There are no email/push alerts or AI-generated replies.

Only your inbox and the authenticated teacher can access your conversations. Names are self-entered, not verified accounts. Save the **private inbox code** from “Continue this inbox on another device”; enter it on the other browser/APK to link the same inbox. Both must use the same server. This code grants full student access to that inbox, so keep it private. Cookies last 90 days; clearing app/browser data requires the saved code to recover access. The teacher never sees the recovery code. A lost code cannot be recovered through the public site.

In classroom mode, student inbox routes also require current teacher approval. Restoring an inbox code does not approve a new device or bypass removal. Closed classes prevent student access until the teacher admits the device again.

## Teacher replies

Sign in to **Teacher workspace → Student inbox**. Filter open/resolved conversations, doubts, feedback or issues. Select a conversation, reply, and mark it resolved when finished. Reopen it if students need to continue. Students cannot impersonate the teacher or open other students' conversations. Text is rendered as text; HTML supplied in a question is not executed.

Records persist in the existing MongoDB store, or the local development store in classroom/development mode. They are not committed to Git. Back up the chosen database with your normal teaching data. Messages use separate records so simultaneous replies cannot overwrite each other. This is a small-classroom inbox; listing very large message histories will need indexed pagination before larger-scale use.

## Website APK download

Students open **Get Android app** or the footer's **Download Android APK** link. `/mobile` works even when the learning API is unavailable. The actual download is served by the website at `/downloads/Sewestian.apk`, with a matching SHA-256 file. Students still need a working learning server after installing.

`npm run dev` and `npm run build` first validate the release against `shared/android-release.json`, then stage it in ignored `public/downloads/`. Vite includes these files in `dist/`; Vercel and the local Express website serve the same artifact. The canonical signed APK stays in `releases/`.

For native releases, update `version` and increment `versionCode` in `shared/android-release.json`, then run `npm run android:apk`. The builder and Gradle use that version source. The standalone builder signs/verifies the APK, updates the manifest checksum/file and stages the website download. Retain the signing key privately. Android Studio builds need the same deliberate signing/release-metadata process before replacing the download.

The root `AGENTS.md` records the owner's requirement for future coding sessions to update and check both experiences. It is a repository instruction, not a claim that requests outside this repository are remembered or executed automatically.
