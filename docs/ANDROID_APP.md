# Sewestian Android app

The installable preview connects to the same MERN website you use in a browser. Choose your hosted HTTPS site or a teacher's local classroom server. Lessons, animations, simulations, teacher tools and approvals come from that server; the APK does not contain Node.js, MongoDB or an offline copy of the books/videos.

## Install on an Android phone

The website now has **Get Android app** at `/mobile`, with the APK hosted directly at `/downloads/Sewestian.apk`. Student questions, feedback and teacher replies are shared through the same backend; see [the shared platform guide](SHARED_PLATFORM.md). Connect both clients to the same server and use your private inbox code to carry a conversation across devices.

1. Download [Sewestian-1.0-preview.apk](https://github.com/Harikeshsharma01/Practice/raw/refs/heads/main/releases/Sewestian-1.0-preview.apk) on your phone.
2. Open the downloaded file. If Android asks, allow **Install unknown apps** for the browser or file manager you used, then install Sewestian. You can turn that permission off afterwards. This is a directly distributed preview, not a Google Play listing.
3. Open **Sewestian** and choose **Hosted website** or **Classroom Wi-Fi**.
4. Enter your real site/server address and tap **Open Sewestian**. Use **Connection** in the top bar to switch later; each mode remembers its last saved address.

Requires Android 8.0 or newer and an up-to-date Android System WebView. There are no CPU-specific native libraries in the APK. This does not guarantee compatibility with every phone; iPhones cannot install APK files. Devices without a functioning Android WebView cannot display the lessons.

## Hosted website

Enter your actual HTTPS frontend address, without `/admin` or another page path. The Vercel site's `/api` bridge and Render/MongoDB backend must already work. A “learning server has not been connected” message is a website/backend configuration problem; installing the APK does not fix hosting. See the deployment section of the main README.

The app requires a valid HTTPS certificate. It does not bypass certificate errors. External website links open in the phone's browser, where the app's screenshot protection does not apply.

## Classroom Wi-Fi

On the teaching computer, update the repository and install dependencies:

```bash
git pull origin main
npm ci
npm run classroom
```

Configure your teacher account first if needed, following [classroom setup](CLASSROOM_ACCESS.md). Keep this computer and terminal running. On the computer, open `http://localhost:4100`, sign in as teacher, and start a class from **Classroom access**.

On the phone, join the same Wi-Fi, choose **Classroom Wi-Fi**, and enter the computer's private IPv4 address and port, for example `192.168.1.20:4100`. Use the address shown by your own teacher workspace, not this example. `localhost` on a phone means the phone itself and is not accepted. Guest-network client isolation or a computer firewall can prevent connection.

Students enter their name and the six-digit class code, then wait for teacher approval. Existing expiry, removal, phone-browser preference and classroom network checks still apply. Bluetooth pairing alone does not grant access. Hosted mode does not inherit the local server's classroom restrictions.

## Phone features

- Native dark violet connection screen, saved addresses, reload and Android Back navigation.
- Website videos, including full-screen playback, subject to the phone's supported media formats.
- Teacher file uploads through Android's document picker; the server's existing upload size/type rules still apply.
- Notes, images, slides and same-site media downloads through Android's Save dialog, with a 12 MB per-file app limit. Larger files can be opened in a browser. Files you export remain accessible outside the app.
- Website print buttons open Android's print dialog, including **Save as PDF** when the device provides a print service. Exported pages are not protected by the app's secure window.
- Android `FLAG_SECURE` prevents ordinary screenshots and screen recording on supported devices. It cannot prevent an external camera, a modified operating system or previously downloaded material being copied. Website access in an external browser has only the browser privacy deterrents described in the classroom guide.

App sign-ins are separate from Chrome/browser sign-ins. **Clear saved connection and app sign-ins** removes the app's remembered addresses and cookies, not server lessons or other students' sessions. Clearing the app or reinstalling it may reset local reading progress and require classroom approval again.

## Build the APK

The Linux x86_64 standalone builder uses Node.js, Python 3.9+, Java 17+ with `jdk.compiler` and `keytool`, and official Google Android SDK platform/build tools. It downloads the pinned SDK archives on first use and checks Google's published SHA-1 archive checksums. No npm dependencies or Gradle download are required for the native build itself.

```bash
npm run android:apk
# Optional: reuse the standalone builder's SDK directory from another workspace:
SEWESTIAN_ANDROID_SDK=/path/to/sdk npm run android:apk
```

The SDK directory must have this builder's extracted layout; a normal Android Studio SDK uses a different build-tools directory layout. Without the override, downloads go into ignored `.android-sdk/`. The output is `releases/Sewestian-1.0-preview.apk` and its SHA-256 checksum file. The script validates APK signing and zip alignment. Java 8 bytecode is generated for Android 8+; compile-time Java warnings about deprecated compatibility APIs are expected.

Alternatively, open the `android/` Gradle project in Android Studio with SDK 36, Java 17+ and Gradle 8.13. This repository does not include a Gradle wrapper. Use Android Studio's signed APK workflow with your own keystore; the Gradle release build is not preconfigured with signing credentials.

### Keep the signing key private

The standalone builder creates a preview signing key and random password in ignored `.android-private/`. **Back up that directory privately before replacing this workspace.** It is deliberately not pushed to GitHub. Android updates require the same application ID and signing key; a new key cannot update an existing installation without uninstalling it, which can remove app-local data. A production release should use your own securely retained signing key and incremented version code.

The app ID is `com.sewestian.learning`, version `1.0-preview` / code `1`, minimum SDK 26, target SDK 36. Only Internet and network-state permissions are declared; there are no Bluetooth, location, camera or broad file-storage permissions. Local HTTP is enabled for the chosen private IPv4 classroom origin; other HTTP subresources are blocked by the app. Hosted connections must use HTTPS. Downloads preserve same-site cookies and do not follow redirects.

## Checks

```bash
mkdir -p android/.build/policy-test
java -m jdk.compiler/com.sun.tools.javac.Main -d android/.build/policy-test android/app/src/main/java/com/sewestian/learning/ConnectionPolicy.java android/ConnectionPolicyTest.java
java -cp android/.build/policy-test ConnectionPolicyTest
npm test
npm run build
node tests/classroom-browser.mjs
node tests/study-books-browser.mjs
```

Address-policy tests cover private IPv4, HTTPS hosting, unsafe/ambiguous addresses and same-origin resource rules. Browser tests exercise classroom admission, privacy controls and unit-book exports. Native device testing is recorded in [release notes](../releases/README.md); browser tests alone do not prove Android integration or classroom router compatibility.
