/** Assemble published canonical content into numbered study pages without copying lessons.
 * Page count is a reading layout, not a claim of fifty printed A4 sheets or official coverage.
 */
const block = (title, text, kind = "text") => ({
  title,
  text: String(text || ""),
  kind,
});
export function buildUnitBook(course, unit, lessons) {
  const topics = unit.lessons
    .map((id) => lessons.find((l) => l.id === id))
    .filter(Boolean);
  if (!topics.length) return { pages: [], topics: [] };
  const pages = [];
  topics.forEach((lesson, index) => {
    const count =
      Math.floor(50 / topics.length) + (index < 50 % topics.length ? 1 : 0);
    const notes = (lesson.notes || []).filter(
      ([title, text]) =>
        text.trim() !== lesson.summary.trim() &&
        ![
          "A worked investigation",
          "Transfer the idea",
          "Procedure",
          "Expected observation",
          "Viva preparation",
          "Try a variation",
        ].includes(title),
    );
    const middle = Math.max(1, Math.ceil(notes.length / 2));
    const groups = [
      {
        kind: "Understand",
        blocks: [
          block("The central idea", lesson.summary),
          ...notes.slice(0, middle).map((n) => block(...n)),
        ],
      },
      {
        kind: "Behind the scenes",
        blocks: notes.slice(middle).map((n) => block(...n)),
      },
      {
        kind: "Worked example",
        blocks: [
          block("Problem", lesson.example.problem),
          block("Reasoning", lesson.example.solution),
          ...(lesson.example.code
            ? [block("Code / trace", lesson.example.code, "code")]
            : []),
        ],
      },
      {
        kind: "Practical investigation",
        blocks: [
          block("Your task", lesson.practical.task),
          block(
            "Procedure",
            lesson.practical.steps.map((s, i) => `${i + 1}. ${s}`).join("\n\n"),
          ),
          block(
            "Solution and observations",
            lesson.practical.answer,
            "solution",
          ),
          ...(lesson.practicalDetails
            ? [block("Change the input", lesson.practicalDetails.extension)]
            : []),
        ],
      },
      {
        kind: "Recall and explain",
        blocks: [
          block("Check yourself", lesson.quiz.question, "question"),
          block(
            "Choices",
            lesson.quiz.options
              .map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`)
              .join("\n"),
          ),
          block(
            "Answer and explanation",
            `${String.fromCharCode(65 + lesson.quiz.answer)}. ${lesson.quiz.options[lesson.quiz.answer]}\n\n${lesson.quiz.explanation}`,
            "solution",
          ),
          ...(lesson.practicalDetails
            ? [
                block("Viva", lesson.practicalDetails.viva.join("\n")),
                block("Mistake to avoid", lesson.practicalDetails.pitfalls),
              ]
            : []),
        ],
      },
    ].filter((g) => g.blocks.length);
    // Combine whole sections when a unit contains more than ten topics.
    while (groups.length > count) {
      const i = groups.length === 5 ? 0 : groups.length - 2;
      groups[i] = {
        kind: groups[i].kind + " + " + groups[i + 1].kind,
        blocks: [...groups[i].blocks, ...groups[i + 1].blocks],
      };
      groups.splice(i + 1, 1);
    }
    // If teachers hide a topic, repartition remaining substantive blocks; never invent padding.
    while (groups.length < count) {
      const i = groups.findIndex((g) => g.blocks.length > 1);
      if (i < 0) break;
      const group = groups[i],
        split = Math.ceil(group.blocks.length / 2);
      groups.splice(
        i,
        1,
        { ...group, blocks: group.blocks.slice(0, split) },
        {
          kind: group.kind + " · continued",
          blocks: group.blocks.slice(split),
        },
      );
    }
    groups.forEach((g) =>
      pages.push({
        ...g,
        number: pages.length + 1,
        topicId: lesson.id,
        title: lesson.title,
        blocks: g.blocks.filter((b) => b.text.trim()),
      }),
    );
  });
  return {
    id: unit.bookId,
    title: unit.title,
    courseId: course.id,
    course: `${course.board} · ${course.grade} · ${course.subject}`,
    pages,
    topics: topics.map((l) => ({
      id: l.id,
      title: l.title,
      page: pages.find((p) => p.topicId === l.id)?.number,
    })),
    sourceNote:
      "Original Sewestian study material. Teaching units and board alignment are provisional; compare with your current official syllabus and teacher-approved practical list.",
  };
}
