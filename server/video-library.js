import manifest from "../shared/generated-videos.json" with { type: "json" };
import { videoHash } from "../shared/video-fingerprint.js";
export function generatedVideo(lesson) {
  const entry = manifest[lesson.id];
  return entry && entry.hash === videoHash(lesson) ? entry : null;
}
