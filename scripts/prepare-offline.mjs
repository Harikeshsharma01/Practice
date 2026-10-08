import { mkdir, writeFile, rm } from "node:fs/promises";
import { publicCatalog } from "../server/teaching.js";
// Deliberately export canonical published teaching material, never local drafts,
// teacher accounts, private uploads, messages, or the .data store.
const catalog = await publicCatalog({
  list: async () => [],
  get: async () => null,
});
const root = new URL("../android/.build/web/", import.meta.url);
await rm(new URL("downloads/", root), { recursive: true, force: true });
await mkdir(new URL("offline/", root), { recursive: true });
await writeFile(new URL("offline/catalog.json", root), JSON.stringify(catalog));
console.log(
  `Bundled ${catalog.courses.length} pathways and ${catalog.lessons.length} canonical lessons. No private server data included.`,
);
