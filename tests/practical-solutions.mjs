// Run only bundled, original teaching examples in an isolated scratch folder.
import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { practicals } from "../shared/practicals.js";
const cppCases = {
  "cpp-hello": ["16\n", "Next year: 17"],
  "cpp-arithmetic": ["10 2\n", "Fixed: 20\n12 8 20\n5"],
  "cpp-maximum-three": ["8 14 14\n", "14"],
  "cpp-parity": ["-8\n", "Even"],
  "cpp-switch": ["2\n", "Practicals"],
  "cpp-sequence": ["4\n", "1 2 3 4\n1 2 3 4"],
  "cpp-factorial": ["5\n", "120"],
  "cpp-prime": ["29\n", "Prime"],
  "cpp-fibonacci": ["7\n", "0 1 1 2 3 5 8"],
  "cpp-array-max": ["-9 -3 -7\n", "-3"],
  "cpp-pattern": ["3\n", "*\n**\n***"],
  "cpp-area-function": ["8 5\n", "40"],
  "cpp-bubble-sort": ["", "1 2 4 5"],
  "cpp-binary-search": ["12\n", "3"],
  "cpp-string-reverse": ["Sewestian\n", "naitseweS"],
  "cpp-rectangle-class": ["", "40"],
  "cpp-lifecycle": ["", "Before\nCreated\nInside\nDestroyed\nAfter"],
  "cpp-circle": ["", "3.14159\n6.28319"],
  "cpp-ratio": ["", "0.4\n2.5"],
  "cpp-inheritance": ["", "I am a person\nI study computer science"],
  "cpp-array-pointers": ["", null],
  "cpp-virtual": ["", "16"],
  "cpp-reference-swap": ["", "9 4"],
};
const pyCases = {
  "py-arithmetic": ["8\n5\n", "Area = 40.00"],
  "py-grade": ["75\n", "Distinction"],
  "py-factorial": ["6\n", "720"],
  "py-prime": ["", "2 3 5 7 11 13 17 19"],
  "py-palindrome": ["Never odd or even\n", "Palindrome"],
  "py-list-statistics": ["", "Total: 60\nMean: 15.0\nRange: 9 21"],
  "py-linear-search": ["", "1"],
  "py-word-frequency": ["", "{'learn': 2, 'code': 1, 'share': 1}"],
  "py-tuple-record": ["", "17: Asha scored 92"],
  "py-function": ["", "40\n8"],
  "py-text-file": ["", "Lines: 2\nWords: 4"],
  "py-filter-file": ["", "Apple\nApricot"],
  "py-csv": ["", "Asha 92"],
  "py-binary": ["", "Kabir"],
  "py-stack": ["", "Popped: Practical\nTop: Notes"],
  "py-exceptions": ["10\n0\n", "Cannot divide by zero\nAttempt finished"],
};
const dir = await mkdtemp(path.join(os.tmpdir(), "sewestian-solutions-"));
const normalize = (s) =>
  s
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .join("\n");
try {
  for (const [id, [input, expected]] of Object.entries(cppCases)) {
    const p = practicals.find((p) => p.id === id),
      source = path.join(dir, `${id}.cpp`),
      binary = path.join(dir, id);
    await writeFile(source, p.code);
    execFileSync(
      "g++",
      ["-std=c++17", "-Wall", "-Wextra", source, "-o", binary],
      { timeout: 15000 },
    );
    const output = normalize(
      execFileSync(binary, [], {
        input,
        encoding: "utf8",
        timeout: 2000,
        cwd: dir,
      }),
    );
    if (expected !== null) assert.equal(output, expected, id);
    else assert.match(output, /Sum: 19$/, id);
  }
  for (const [id, [input, expected]] of Object.entries(pyCases)) {
    const source = path.join(dir, `${id}.py`);
    await writeFile(source, practicals.find((p) => p.id === id).code);
    const output = normalize(
      execFileSync("python", [source], {
        input,
        encoding: "utf8",
        timeout: 2000,
        cwd: dir,
      }),
    );
    assert.ok(output.endsWith(expected), `${id}: ${output}`);
  }
  const sql = Object.fromEntries(
    practicals.filter((p) => p.language === "SQL").map((p) => [p.id, p.code]),
  );
  const sqlProgram = `import sqlite3,json\nsql=json.loads(${JSON.stringify(JSON.stringify(sql))})\nc=sqlite3.connect(':memory:')\nc.executescript(sql['sql-create'])\nassert c.execute(sql['sql-filter']).fetchall()==[('Asha',92),('Meera',85)]\nassert c.execute(sql['sql-aggregate']).fetchone()==(3,78,92,85)\nc.executescript(sql['sql-join'])\nassert c.execute('SELECT Student.name, Attendance.days_present FROM Student JOIN Attendance ON Student.roll=Attendance.roll ORDER BY Student.roll').fetchall()==[('Asha',42),('Kabir',38),('Meera',41)]\n`;
  const sqlFile = path.join(dir, "sql_check.py");
  await writeFile(sqlFile, sqlProgram);
  execFileSync("python", [sqlFile], { cwd: dir, timeout: 2000 });
  console.log(
    `PASS: ${Object.keys(cppCases).length} C++17 programs compiled and produced the expected observations; ${Object.keys(pyCases).length} Python examples executed; four portable SQL examples checked with SQLite. Java, MySQL connectivity, HTML rendering, physical circuits and 8085 execution are not covered by this script.`,
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
