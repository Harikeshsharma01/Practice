import { readFile, mkdir, copyFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const root = new URL("../", import.meta.url);
const release = JSON.parse(
  await readFile(new URL("shared/android-release.json", root), "utf8"),
);
if (!/^Sewestian-[a-zA-Z0-9.-]+\.apk$/.test(release.file))
  throw Error("Invalid Android release filename");
const file = new URL("releases/" + release.file, root);
const bytes = await readFile(file);
const sha = createHash("sha256").update(bytes).digest("hex");
if (sha !== release.sha256)
  throw Error(
    "APK checksum differs from shared/android-release.json. Rebuild/update the release before publishing.",
  );
const directory = new URL("public/downloads/", root);
await mkdir(directory, { recursive: true });
await copyFile(file, new URL("Sewestian.apk", directory));
await writeFile(
  new URL("Sewestian.apk.sha256", directory),
  sha + "  Sewestian.apk\n",
);
console.log(
  `Website APK prepared: ${release.version} (${bytes.length} bytes), checksum verified.`,
);
