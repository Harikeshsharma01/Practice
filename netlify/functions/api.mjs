// Runs the shared Express API (server/app.js) on Netlify. Express listens on
// a private loopback port inside the function instance and each /api request
// is relayed to it, so routes, uploads and cookies behave exactly as they do
// on the local and classroom servers.
import { once } from "node:events";
import { tmpdir } from "node:os";
import path from "node:path";
import { createApp, ensureAdmin } from "../../server/app.js";
import { createNetlifyStore } from "../../server/netlify-store.js";

export const config = { path: "/api/*" };

// Placeholder origin the app trusts; same-origin requests are mapped onto it
// so production, preview and custom-domain addresses all work.
const appOrigin = "https://sewestian.netlify.app";
let ready;
function start() {
  ready ??= (async () => {
    const store = createNetlifyStore();
    await ensureAdmin(store);
    const app = createApp(store, {
      production: !process.env.NETLIFY_DEV,
      clientOrigin: appOrigin,
      uploadDirectory: path.join(tmpdir(), "sewestian-uploads"),
    });
    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    return `http://127.0.0.1:${server.address().port}`;
  })().catch((error) => {
    ready = undefined;
    throw error;
  });
  return ready;
}

const forwarded = ["accept", "content-type", "cookie", "range", "user-agent"];
const dropped = ["connection", "keep-alive", "transfer-encoding", "set-cookie"];

export default async function handler(req, context) {
  let local;
  try {
    local = await start();
  } catch (error) {
    console.error(error.message);
    return Response.json(
      { error: "The learning server could not start. Please try again." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  const url = new URL(req.url);
  const headers = new Headers({
    "x-forwarded-for": context.ip || "",
    "x-forwarded-proto": "https",
  });
  for (const name of forwarded)
    if (req.headers.has(name)) headers.set(name, req.headers.get(name));
  const origin = req.headers.get("origin");
  if (origin) headers.set("origin", origin === url.origin ? appOrigin : origin);
  const response = await fetch(local + url.pathname + url.search, {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method)
      ? undefined
      : await req.arrayBuffer(),
    redirect: "manual",
  });
  const out = new Headers();
  for (const [name, value] of response.headers)
    if (!dropped.includes(name)) out.set(name, value);
  for (const value of response.headers.getSetCookie())
    out.append("set-cookie", value);
  return new Response(response.body, { status: response.status, headers: out });
}
