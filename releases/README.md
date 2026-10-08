# Sewestian Android preview 1.0

[Download the signed APK](https://github.com/Harikeshsharma01/Practice/raw/refs/heads/main/releases/Sewestian-1.0-preview.apk) · [Installation and connection guide](../docs/ANDROID_APP.md) · [SHA-256 checksum](Sewestian-1.0-preview.apk.sha256)

Built on 8 October 2026. Package `com.sewestian.learning`, version code 1. Android 8.0+ with a current Android System WebView is required. This is a signed preview distributed directly, not a Google Play release. iPhones cannot install it.

The app connects to your existing MERN service through a saved hosted HTTPS address or a private IPv4 classroom address. It includes native connection controls, Android Back, file picking, downloads up to 12 MB, print/PDF integration, full-screen video support and Android secure-window protection. Lessons and videos are loaded from the server; the small APK is not an offline content bundle.

The preview certificate's SHA-256 fingerprint is:

```
f80a24e19aa6391fe4e9a12ec999d1cb690914b22add8fb0499c754b24ff6502
```

Signing secrets are not included in Git. Retain `.android-private/` privately to rebuild updates with the same identity. For normal distribution, maintain your own release keystore and version numbers.

## Validation

- Android SDK 36 compilation, D8 conversion, APK v2/v3 signature verification and zip alignment passed.
- JVM address-policy tests passed: hosted HTTPS, private classroom IPv4, invalid addresses and resource-origin restrictions.
- Ten MERN integration tests, the Vite production build, classroom browser checks and study-book/video/export browser checks passed.
- Classroom browser checks include intentional-print backgrounding versus ordinary privacy locking.
- Installed and launched in an Android 15/API 35 x86_64 emulator with WebView 124. Android window inspection confirmed `FLAG_SECURE`; accessibility inspection confirmed the native connection chooser.
- The software-only emulator was too slow to complete reliable end-to-end lesson navigation and native upload/download/PDF checks. These remain on-device acceptance checks; the browser tests above do not substitute for them.

Physical phones, iOS, a live hosted backend, Bluetooth tethering and a real classroom router were not tested. Native file-picker, PDF printer and media behavior can vary by device. Keep the WebView updated and test your teaching workflow on the phones you plan to use.
