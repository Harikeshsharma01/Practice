import mongoose from "mongoose";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
const schema = new mongoose.Schema(
  { key: { type: String, unique: true }, value: mongoose.Schema.Types.Mixed },
  { timestamps: true },
);
const Document = mongoose.model("Document", schema);
export async function createStore({
  mongoUri,
  directory = path.resolve(".data"),
} = {}) {
  if (mongoUri) {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    return {
      mode: "mongodb",
      async get(key) {
        return (await Document.findOne({ key }).lean())?.value ?? null;
      },
      async set(key, value) {
        await Document.updateOne(
          { key },
          { $set: { value } },
          { upsert: true },
        );
      },
      async delete(key) {
        await Document.deleteOne({ key });
      },
    };
  }
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const file = (key) => path.join(directory, `${encodeURIComponent(key)}.json`);
  return {
    mode: "local-development",
    async get(key) {
      try {
        return JSON.parse(await readFile(file(key), "utf8"));
      } catch (e) {
        if (e.code === "ENOENT") return null;
        throw e;
      }
    },
    async set(key, value) {
      const target = file(key),
        temp = `${target}.${crypto.randomUUID()}.tmp`;
      await writeFile(temp, JSON.stringify(value), { mode: 0o600 });
      await rename(temp, target);
    },
    async delete(key) {
      const { unlink } = await import("node:fs/promises");
      await unlink(file(key)).catch((e) => {
        if (e.code !== "ENOENT") throw e;
      });
    },
  };
}
