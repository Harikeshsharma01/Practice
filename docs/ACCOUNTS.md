# Website and offline accounts

## Start the website locally

```bash
npm ci
npm run local
```

Open the local website on port 4100 using your browser. This runs ordinary signup/login mode, without classroom-code admission. Email/password signup works immediately; no Google project or hosting account is required. With no `MONGODB_URI`, accounts, sessions and teacher messages are persisted in ignored `.data/` files on the computer running Express. With MongoDB configured, the same records are stored there. Passwords use salted scrypt; raw passwords are never saved. Keep backups/private access controls on that storage.

The home/course/catalog/media routes require a student or teacher session. Signup creates a student only; it never grants teacher rights. Teacher sign-in continues to use the separately initialized administrator account from `.env`. Optional `npm run classroom` still adds network/code/approval restrictions after login; it is not the new APK's connection mode.

Website sessions use HttpOnly cookies, server-side expiry/revocation and origin checks. Student conversations follow the signed-in account on this server. Google and password accounts are separate identities: matching email strings are not enough to auto-link an unverified password account to Google. Use the same sign-in method to return to the same account. Account linking, email verification and self-service password reset are not included.

## Configure Google on the website

This integration is prepared but **not live-verified**: no Google credentials were supplied. Mocked tests cover state, PKCE, identity verification calls, nonce and replay rejection. The button is disabled until all settings are valid.

1. Create/configure your Google Cloud OAuth consent screen and a **Web application** OAuth client. During testing, allow your intended test users.
2. Register an exact authorized redirect URI on your frontend origin: `https://YOUR-WEBSITE/api/student/google/callback`. For local development use `http://localhost:4100/api/student/google/callback` (or the actual local frontend port).
3. Set these **backend-only** environment variables securely:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (the exact registered callback above)
4. For hosted operation, keep `CLIENT_ORIGIN`, Vercel `SERVER_API_URL`, Render and MongoDB configured as described in README. Restart/redeploy after changing environment settings.
5. Test the real provider flow, cancellation, returning to the same account and logout before classroom use.

The server uses the Google authentication library to exchange authorization codes and verify ID-token audience/signature/expiry, plus its own state cookie, PKCE, nonce, verified-email and single-use checks. Only name/email and a provider identifier are used. Google tokens/passwords are not persisted in student records. Never send Google passwords or client secrets in chat.

## Offline APK is separate

The user selected an offline APK because no working website is available. Its local accounts do not sync with this server; website signup does not create a phone account. The APK bundles canonical lessons/videos and its own local password gate. Google authentication and teacher messaging are unavailable there. See [Android instructions](ANDROID_APP.md).

## Validation

`npm test` includes real-default account/authentication tests. Existing content/classroom component tests use an explicit isolated fixture with the learner gate off so they still test their original boundaries; these are not evidence of learner authentication. `node tests/accounts-browser.mjs` exercises both the real website gate and the Android-mode packaged frontend, including password rejection, local storage, Home/Back and videos without API requests. APK signature/range checks are additional to these browser tests.
