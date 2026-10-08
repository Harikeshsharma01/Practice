# Website and offline APK: shared code, separate accounts

On 8 October 2026 the owner chose an offline APK because no working website or Google OAuth configuration was available. This supersedes the earlier hosted/classroom chooser design.

The website and APK use the same React learning source, navigation and canonical content. The website uses Express with MongoDB or a local server file store. The APK contains a built snapshot and device-local email/password accounts. There is no automatic account, progress, teacher-edit or message sync between them.

Future changes must be applied to the shared source, tested on both targets, and rebuilt into a new APK as well as deployed/restarted on the website. Unlike the original connected preview, the offline APK does **not** receive website updates just by reloading. Increment the version, preserve the signing key, rebuild, and have students install the replacement APK over their current installation.

The website's **Get Android app** page (`/mobile`) serves `/downloads/Sewestian.apk`. Build scripts verify it against `shared/android-release.json` and prevent embedding a nested APK inside the offline assets. The download page is available before sign-in; learning content requires login.

Website students use **Doubts & feedback** and teachers use **Teacher workspace → Student inbox** for real private conversations. The website inbox follows the logged-in account. The offline app has **Question notebook** instead, clearly marked as local drafts that have not been sent. Students can export a text file and share it themselves.

[Account/Google setup](ACCOUNTS.md) · [Android installation/building](ANDROID_APP.md)

The root `AGENTS.md` records the owner's ongoing requirement to update both targets. It is a repository instruction for future work, not an automatic deployment or a promise of memory outside this repository.
