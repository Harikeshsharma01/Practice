import "dotenv/config";
import { createStore } from "./store.js";
import { createApp, ensureAdmin } from "./app.js";
const production = process.env.NODE_ENV === "production";
if (production && (!process.env.MONGODB_URI || !process.env.CLIENT_ORIGIN))
  throw new Error(
    "Production requires MONGODB_URI and CLIENT_ORIGIN. See README.md.",
  );
const store = await createStore({ mongoUri: process.env.MONGODB_URI });
if (await ensureAdmin(store))
  console.log(
    "Teacher account initialised. Remove ADMIN_PASSWORD from runtime settings after first setup.",
  );
const app = createApp(store, {
  production,
  classroomLan: process.env.CLASSROOM_LAN === "1",
  clientOrigin: process.env.CLIENT_ORIGIN,
});
const port = Number(process.env.PORT) || 4000;
app.listen(port, "0.0.0.0", () =>
  console.log(`Sewestian API listening on ${port}; storage: ${store.mode}`),
);
