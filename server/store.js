import mongoose from "mongoose";
import {
  mkdir,
  readFile,
  writeFile,
  rename,
  copyFile,
  unlink,
  readdir,
  stat,
} from "node:fs/promises";
import { createReadStream as readStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import crypto from "node:crypto";
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
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "sewestian_media",
    });
    return {
      mode: "mongodb",
      async list(prefix) {
        const safe = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return Document.find({ key: { $regex: "^" + safe } })
          .select("key value -_id")
          .lean();
      },
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
      async putFile(source, metadata) {
        const id = new mongoose.Types.ObjectId();
        const upload = bucket.openUploadStreamWithId(id, metadata.name, {
          contentType: metadata.type,
          metadata: { name: metadata.name, type: metadata.type },
        });
        await pipeline(readStream(source), upload);
        const saved = {
          ...metadata,
          id: id.toHexString(),
          size: (await bucket.find({ _id: id }).next())?.length ?? 0,
        };
        await Document.updateOne(
          { key: `upload-${saved.id}` },
          { $set: { value: saved } },
          { upsert: true },
        );
        return saved;
      },
      async getFile(id) {
        if (!/^[a-f\d]{24}$/i.test(id)) return null;
        const objectId = new mongoose.Types.ObjectId(id);
        const [file] = await bucket.find({ _id: objectId }).toArray();
        if (!file) return null;
        return {
          metadata: {
            id,
            name: file.metadata?.name ?? file.filename,
            type: file.metadata?.type ?? "application/octet-stream",
            size: file.length,
          },
          stream: bucket.openDownloadStream(objectId),
        };
      },
      async deleteFile(id) {
        if (!/^[a-f\d]{24}$/i.test(id)) return;
        await bucket.delete(new mongoose.Types.ObjectId(id));
        await Document.deleteOne({ key: `upload-${id}` });
      },
    };
  }
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const uploadDirectory = path.join(directory, "uploads");
  await mkdir(uploadDirectory, { recursive: true, mode: 0o700 });
  const file = (key) => path.join(directory, `${encodeURIComponent(key)}.json`);
  return {
    mode: "local-development",
    async list(prefix) {
      const names = (await readdir(directory)).filter(
        (name) => name.startsWith(prefix) && name.endsWith(".json"),
      );
      return Promise.all(
        names.map(async (name) => ({
          key: name.slice(0, -5),
          value: JSON.parse(await readFile(path.join(directory, name), "utf8")),
        })),
      );
    },
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
    async putFile(source, metadata) {
      const id = crypto.randomUUID();
      const target = path.join(uploadDirectory, id);
      await copyFile(source, target);
      const saved = { ...metadata, id, size: (await stat(target)).size };
      await this.set(`upload-${id}`, saved);
      return saved;
    },
    async getFile(id) {
      if (!/^[\da-f-]{36}$/i.test(id)) return null;
      const metadata = await this.get(`upload-${id}`);
      if (!metadata) return null;
      const target = path.join(uploadDirectory, id);
      try {
        await stat(target);
      } catch (error) {
        if (error.code === "ENOENT") return null;
        throw error;
      }
      return { metadata, stream: readStream(target) };
    },
    async deleteFile(id) {
      const target = path.join(uploadDirectory, id);
      await unlink(target).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      });
      await this.delete(`upload-${id}`);
    },
  };
}
