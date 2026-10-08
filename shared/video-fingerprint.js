import { createHash } from "node:crypto";
import { hindiExplanations } from "./hindi-explanations.js";
// Increment when the renderer's visual style or narration recipe changes.
export const videoStyleVersion = 2;
export const videoHash = (lesson) =>
  createHash("sha256")
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
        videoStyleVersion,
      ]),
    )
    .digest("hex")
    .slice(0, 16);
