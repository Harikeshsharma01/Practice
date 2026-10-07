import { createHash } from "node:crypto";
import manifest from "../shared/generated-videos.json" with { type: "json" };
import { hindiExplanations } from "../shared/hindi-explanations.js";
export function generatedVideo(lesson) {
  const entry = manifest[lesson.id];
  if (!entry) return null;
  const hash = createHash("sha256")
    .update(
      JSON.stringify([
        lesson.title,
        lesson.summary,
        lesson.notes,
        lesson.example,
        lesson.practical,
        lesson.quiz,
        lesson.practicalDetails,
        hindiExplanations[lesson.id],
      ]),
    )
    .digest("hex")
    .slice(0, 16);
  return hash === entry.hash ? entry : null;
}
