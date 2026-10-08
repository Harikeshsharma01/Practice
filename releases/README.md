# Sewestian 1.1 offline preview

[Download the new APK](https://github.com/Harikeshsharma01/Practice/raw/refs/heads/main/releases/Sewestian-1.1-offline-preview.apk) · [Checksum](Sewestian-1.1-offline-preview.apk.sha256) · [Install guide](../docs/ANDROID_APP.md)

Released 8 October 2026. Android 8.0+, app ID `com.sewestian.learning`, version code 2. About 36 MB. Install over the earlier version to keep app data; the original signing key is retained.

- Removed the hosted-site/classroom-Wi-Fi chooser. Home and Reload open bundled content.
- Local email/password signup/login before learning, plus Sign out. Passwords are salted hashes, not plaintext.
- Bundled canonical lessons, study books, simulations and 138 generated narrated videos/captions.
- Clickable **Your universe** home link and Back button shared with the website.
- Offline question drafts are explicitly not delivered to the teacher.
- Google sign-in is unavailable offline. Website Google OAuth needs separate operator configuration and real-provider validation.

Preview certificate SHA-256:

```
f80a24e19aa6391fe4e9a12ec999d1cb690914b22add8fb0499c754b24ff6502
```

Signing material stays in ignored `.android-private/`. Do not lose it or publish it.

## Verification and limits

The build verifies APK v2/v3 signatures, alignment, the bundled catalog/media, absence of nested APKs/private server data, and JVM origin/video-range rules. Backend tests cover mandatory login, password hashing, duplicate signup, student/teacher separation, logout, inbox isolation and mocked Google callbacks. Browser tests use the website and packaged Android-mode frontend; see the task report for executed results.

This new native offline asset integration has not been validated on a physical phone. The earlier software emulator had system/app response timeouts. Browser and JVM tests do not prove Android WebView, native downloads or PDF printing behavior on every device. Keep System WebView updated and test before student rollout.

The old 1.0 connected preview is retained in Git history/releases but is no longer the website's offered download. Offline accounts do not import old connected website sessions. Syllabus mappings remain provisional rather than officially verified.
