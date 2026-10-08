// Netlify storage for the shared API: documents in Netlify Database,
// uploaded media in Netlify Blobs. Same interface as createStore().
import { readFile } from "node:fs/promises";
import { Readable } from "node:stream";
import crypto from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { getStore } from "@netlify/blobs";
import { db } from "../db/index.js";
import { documents } from "../db/schema.js";

export function createNetlifyStore() {
  const media = getStore({ name: "sewestian-media", consistency: "strong" });
  return {
    mode: "netlify",
    async list(prefix) {
      return db
        .select({ key: documents.key, value: documents.value })
        .from(documents)
        .where(sql`starts_with(${documents.key}, ${prefix})`);
    },
    async get(key) {
      const [row] = await db
        .select({ value: documents.value })
        .from(documents)
        .where(eq(documents.key, key));
      return row?.value ?? null;
    },
    async set(key, value) {
      await db
        .insert(documents)
        .values({ key, value })
        .onConflictDoUpdate({
          target: documents.key,
          set: { value, updatedAt: new Date() },
        });
    },
    async delete(key) {
      await db.delete(documents).where(eq(documents.key, key));
    },
    async putFile(source, metadata) {
      const id = crypto.randomUUID();
      const bytes = await readFile(source);
      await media.set(id, bytes);
      const saved = { ...metadata, id, size: bytes.length };
      await this.set(`upload-${id}`, saved);
      return saved;
    },
    async getFile(id) {
      if (!/^[\da-f-]{36}$/i.test(id)) return null;
      const metadata = await this.get(`upload-${id}`);
      if (!metadata) return null;
      const body = await media.get(id, { type: "stream" });
      if (!body) return null;
      return { metadata, stream: Readable.fromWeb(body) };
    },
    async deleteFile(id) {
      if (!/^[\da-f-]{36}$/i.test(id)) return;
      await media.delete(id);
      await this.delete(`upload-${id}`);
    },
  };
}
