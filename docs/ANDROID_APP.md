# Sewestian offline Android app — 1.1 preview

[Download the current APK](https://github.com/Harikeshsharma01/Practice/raw/refs/heads/main/releases/Sewestian-1.1-offline-preview.apk), or use **Get Android app** at `/mobile` on your local/deployed Sewestian website. About 36 MB. Android 8.0+ with an updated System WebView; APKs do not install on iPhones.

## Install and sign in

1. Download/open the APK. Allow installation from your browser/file manager if Android requests it.
2. Open Sewestian. The app directly opens its bundled sign-in screen; there is no hosted-site or classroom-Wi-Fi chooser.
3. Select **Sign up**, enter a name/email and a Sewestian password of at least 12 characters. Do not enter a Google password.
4. Sign in to open the learning pages. **Your universe** and native **Home** return home; Back returns to the previous page. Sign out is in the website-style top bar.

The same app ID (`com.sewestian.learning`) and signing certificate are retained, with version code 2. Install over version 1 to retain app data; do not uninstall first. Old connected-website sessions are not local accounts: create a local account for this new edition.

## What works offline

The APK bundles the shared React UI, all 138 canonical lessons, provisional pathways, study-book generation, practical solutions, diagrams/simulations, fonts, and 138 narrated MP4s with caption assets. It serves these from a restricted virtual HTTPS origin inside Android, including byte-range requests for video playback/seeking. No Node/MongoDB service runs on the phone. Google and other external services are not bundled.

Local accounts use IndexedDB with per-account random salts and PBKDF2-SHA-256 (210,000 iterations). Session access is local, and reading progress is namespaced by account. Passwords are not stored in plaintext. This is a local access gate, not encrypted lesson DRM or verified ownership of an email address. A rooted/device-owner inspection of packaged assets cannot be prevented. Normal screenshots remain restricted by Android `FLAG_SECURE` where supported.

Clearing app data or uninstalling deletes local accounts/progress. There is no email verification, cloud backup, self-service password reset or cross-device account recovery in this offline edition. Use your website account separately on the website.

**Question notebook** saves drafts only on the phone and can export text for sharing yourself. It does not send messages or receive teacher replies. Online teacher tools remain on the website. Bundled content is a release snapshot of canonical repository material; live teacher edits, private uploads and private messages are not copied into the APK.

## Google and Credential Manager

Google sign-in is disabled in the offline app. It needs network access, a configured Google project/client and a connected identity-verification design; a Google button cannot replace those requirements. The owner supplied [Android Credential Manager documentation](https://developer.android.com/identity/credential-manager). Direct access to that page returned a workspace proxy 403 during this task. Native Credential Manager/Google SDK integration is not claimed in this build.

The website has a separately configurable OAuth implementation; see [account setup](ACCOUNTS.md). Password signup works without Google configuration. Do not put OAuth client secrets in the APK or repository.

## Build and update both targets

Requires the repository's Node/npm dependencies, Python 3.9+, Java 17+ (`jdk.compiler` and `keytool`), and Linux x86_64 for the standalone builder. Pinned official Google SDK archives are checksum verified. Existing toolchain override:

```bash
SEWESTIAN_ANDROID_SDK=/workspace/android-sdk npm run android:apk
npm run build
```

Without the override, the builder downloads into ignored `.android-sdk/`. It first builds the UI in Android mode, exports only canonical public catalog data, removes nested APK downloads, adds assets, runs JVM origin/range tests, compiles/signs/verifies the APK, updates `shared/android-release.json` and stages the website download. The website build then includes that verified APK at `/downloads/Sewestian.apk`.

For future distributed revisions, increase `versionCode` and change `version` in `shared/android-release.json`. Back up ignored `.android-private/` securely; the same signing key is required to update installed apps. Never commit it. The Gradle project can be opened in Android Studio using SDK 36 and Gradle 8.13; first run `npm run android:web`, and use your retained signing key. No Gradle wrapper or signing secrets are committed.

See [release validation and limitations](../releases/README.md). Browser tests of packaged assets do not prove physical Android behavior.
