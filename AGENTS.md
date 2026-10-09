# Sewestian website and offline Android contract

The owner wants requested features and fixes applied to BOTH the website and Android APK in Harikeshsharma01/Practice. Work in this checkout; do not create another worktree unless asked. Commit/push requested changes to the existing repository; a Git push is not proof of hosting deployment.

## Latest explicit product decision (8 October 2026)

There is no working hosted website and no Google OAuth configuration. The owner chose an **offline APK with local accounts and bundled lessons**, accepting no cross-device or teacher-message sync. This supersedes the old hosted/classroom chooser requirement. Do not restore that chooser or silently claim synchronization.

- Keep one React learning UI. Website API/data lives in Express and its MongoDB/local file store. Android uses the same UI built in `android` mode, a canonical content snapshot and device-local IndexedDB accounts. The APK has no native Home/Reload toolbar or server choice screen. Reading navigation scrolls with the page; retain the shared Your universe link.
- Every relevant shared UI/content change now requires rebuilding the offline APK as well as the website. Increment `version`/`versionCode` in `shared/android-release.json` for each new distributed Android revision, run `npm run android:apk`, then `npm run build`. The standalone builder verifies signatures and stages `/downloads/Sewestian.apk`; never bundle that download inside itself.
- Preserve `.android-private/` signing material privately; never commit or print it. Keep application ID and signing key for in-place updates. Report a missing signing key instead of generating an incompatible update silently.
- Signup/login gates learning on both clients. Website passwords use salted scrypt; offline device passwords use salted PBKDF2. Never store plaintext passwords or ask for Google passwords in Sewestian forms. Offline storage is not DRM against device owners/root access.
- Website Google OAuth is optional, server-configured and disabled without credentials. The offline APK cannot authenticate Google or sync messages. Native Credential Manager integration would require a future connected identity design and configured OAuth clients; do not pretend it works offline.
- Website student inbox follows signed-in accounts; teacher replies remain protected. Offline question drafts stay on the phone and must never be labelled as sent. No private server accounts, drafts, uploads or messages may enter the APK catalog snapshot.
- Run `npm test`, `node tests/accounts-browser.mjs` after building both targets, and relevant inbox/classroom/book browser checks. Existing `content-app` fixtures isolate older features with the learner gate off; `students.test.js` and `accounts-browser.mjs` must test the real mandatory gate. Native builds run origin/range tests. Keep actual-device versus browser validation explicit.
- Keep the website download page, APK/checksum, metadata and release notes consistent. Retain documented limitations (provisional syllabus, offline-only account scope, Google setup, physical-device testing).
