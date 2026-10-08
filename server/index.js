import "dotenv/config";
import { createStore } from "./store.js";
import { createApp, hashPassword } from "./app.js";
const production = process.env.NODE_ENV === "production";
if (production && (!process.env.MONGODB_URI || !process.env.CLIENT_ORIGIN))
  throw new Error(
    "Production requires MONGODB_URI and CLIENT_ORIGIN. See README.md.",
  );
const store = await createStore({ mongoUri: process.env.MONGODB_URI });
if (
  process.env.ADMIN_EMAIL &&
  process.env.ADMIN_PASSWORD &&
  !(await store.get("admin"))
) {
  if (process.env.ADMIN_PASSWORD.length < 12)
    throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
  await store.set("admin", {
    email: process.env.ADMIN_EMAIL.toLowerCase(),
    passwordHash: hashPassword(process.env.ADMIN_PASSWORD),
  });
  console.log(
    "Teacher account initialised. Remove ADMIN_PASSWORD from runtime settings after first setup.",
  );
}
const app = createApp(store, {
  production,
  classroomLan: process.env.CLASSROOM_LAN === "1",
  clientOrigin: process.env.CLIENT_ORIGIN,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
});
const port = Number(process.env.PORT) || 4000;
app.listen(port, "0.0.0.0", () =>
  console.log(`Sewestian API listening on ${port}; storage: ${store.mode}`),
);
