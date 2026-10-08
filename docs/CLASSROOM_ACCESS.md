# Local classroom access

## Start on the teaching computer

1. Update your existing Practice checkout with `git pull origin main` and run `npm ci`.
2. Ensure your teacher account is configured using `.env` as described in README.md. Do not overwrite an existing `.env`. `ADMIN_EMAIL` and a password of at least 12 characters initialise the account only if it does not already exist.
3. Connect the teaching computer and students' phones to the same trusted Wi-Fi network or hotspot. Stop other development/preview servers for this checkout so they cannot provide an alternative public route to the same content.
4. Run `npm run classroom`. This builds the frontend and starts a single local Express server on port **4100**. Set `CLASSROOM_PORT` if another port is needed. Keep the terminal and computer running during class.
5. On the teaching computer, open `localhost:4100`, select **Teacher sign-in**, then **Classroom access** in the workspace.
6. Select **Start new class · reset all access**. Share the six-digit code and the local network address displayed in the panel. When multiple addresses are listed, use the address of the adapter connected to the students' Wi-Fi.
7. Students open that address in their phone browser, enter their name and class code, and wait. Compare each displayed browser badge with the student's phone before pressing **Approve**.

The approved browser automatically opens the learning site. The teacher dashboard updates every five seconds. A browser session expires four hours after its join request. Names are student-entered labels, not verified identities. Clearing cookies or changing browsers creates a new join request requiring approval.

## Manage access

- **Accept new join requests** closes or reopens admissions without removing already approved students.
- **Remove** revokes one browser. Its next protected request is denied; the existing page closes back to the access screen on the next status check, normally within five seconds. Already delivered or downloaded content cannot be recalled.
- **Approve** restores a removed browser within the current, unexpired session.
- **End class** removes all student access and closes admissions. **Start new class** issues a new code and invalidates all prior approvals.
- **Phone browsers only** uses the browser's user-agent information. It is a convenience filter that can be spoofed, not hardware attestation. Teachers can still sign in on a computer.
- The roster is capped at 100 current browser requests, including pending and removed browsers. Starting a new class clears the old roster. Expired records never grant access.

Approval protects the local catalog, teacher-uploaded resources and bundled videos/posters/captions, including direct URLs. Teacher APIs additionally require teacher authentication. Static interface assets and simulation code are not confidential. Original bundled lesson sources and videos are also in the GitHub repository; this classroom control does not make previously public material private.

## Privacy screen and screenshots

The optional privacy setting displays the student's name and browser badge as a watermark. Hiding the tab pauses media and covers the lesson with a privacy screen. When the browser receives PrintScreen or the print keyboard shortcut, it also locks the view. Resuming checks that the browser is still approved.

A normal website **cannot guarantee prevention or detection of operating-system screenshots, screen recording, another camera, or developer-tool access**. Many screenshot shortcuts never reach the webpage. Closing a tab automatically is not reliable either. The feature is a visible deterrent and an inactivity privacy screen, not screenshot DRM. Legitimate lesson downloads and print exports remain available while a student is approved.

## Network requirements and Bluetooth

This mode checks the socket peer against directly attached private IPv4 subnets (plus loopback for the teacher's own computer). Public addresses, other private subnets, and forwarding-proxy headers are refused. IPv6-only student networks are not supported in this edition. The server checks local-network membership, not radio proximity: wired clients or VPN clients on an allowed subnet cannot be distinguished from Wi-Fi clients.

Use the classroom server directly. Do not put it behind a public tunnel, reverse proxy or router port-forward. Use your computer's firewall to limit access to the classroom's private network, and a trusted Wi-Fi network because the default local server uses HTTP. Some guest Wi-Fi networks enable client isolation, which prevents phones from reaching the teaching computer; use a suitable classroom network or hotspot instead.

Bluetooth discovery is not used for admission. If Bluetooth tethering provides a compatible IP network, the same network and approval checks apply, but a Bluetooth pairing alone does not grant website access.

## Public hosting and persistence

`npm run classroom` is a separate local runtime. It does **not** restrict your public Vercel/Render deployment. Students using a public hosted copy may still access content there. Use only the local classroom service when running a restricted class; public hosting needs a separate access policy if you also want to restrict that deployment.

Local mode uses the existing MongoDB store when `MONGODB_URI` is configured; otherwise it uses the ignored `.data/` development store. If local and hosted runtimes deliberately share a database, content edits are shared. There is no new database service or Bluetooth permission requirement. Local classroom mode is rejected in production hosting configuration.

## Verification

`npm test` covers subnet checks, unauthorised catalog/media/video requests, encoded-path checks, forwarded-header rejection, code validation, teacher-only approval, expiry, removal and old-cookie invalidation. After `npm run build`, `node tests/classroom-browser.mjs` verifies teacher and emulated Android student flows, mobile layout, watermark, privacy lock/resume and revocation. These are software tests; they do not prove that a particular classroom router or phone firewall configuration is correct.
