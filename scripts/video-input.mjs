import { lessons } from "../shared/catalog.js";
import { hindiExplanations } from "../shared/hindi-explanations.js";
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
const brief = (s, max = 450) => {
  const text = String(s || "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const prefix = text.slice(0, max);
  const stop = prefix.lastIndexOf(". ");
  return stop > max / 3
    ? prefix.slice(0, stop + 1)
    : prefix.slice(0, prefix.lastIndexOf(" ")) + "…";
};
export const videoHash = (l) =>
  createHash("sha256")
    .update(
      JSON.stringify([
        l.title,
        l.summary,
        l.notes,
        l.example,
        l.practical,
        l.quiz,
        l.practicalDetails,
        hindiExplanations[l.id],
      ]),
    )
    .digest("hex")
    .slice(0, 16);
writeFileSync(
  "/tmp/sewestian-video-input.json",
  JSON.stringify(
    lessons.map((l) => ({
      id: l.id,
      title: l.title,
      hash: videoHash(l),
      hindi: hindiExplanations[l.id],
      scenes: [
        {
          heading: "THE IDEA",
          text: brief(l.summary),
          narration: brief(l.summary),
        },
        {
          heading: "WORK THROUGH IT",
          text: brief(l.example.solution),
          code: l.example.code?.split("\n").slice(0, 8).join("\n"),
          narration: brief(l.example.solution, 650),
        },
        {
          heading: "CHECK YOUR UNDERSTANDING",
          text: brief(l.practicalDetails?.extension || l.quiz.question, 300),
          narration: brief(
            (l.practicalDetails?.extension || l.quiz.question) +
              " " +
              (l.practicalDetails?.pitfalls || l.quiz.explanation),
            500,
          ),
        },
      ],
    })),
    null,
    2,
  ),
);
