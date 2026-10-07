// Teaching groupings, not a claim of verified board unit boundaries.
const ids = (s) => s.split(" ");
const foundations = ids(
  "computer-systems number-systems hardware-io memory-hierarchy data-units signed-binary unicode-encoding cpu-buses boot-process operating-systems",
);
const systems = ids(
  "operating-systems boot-process process-states cpu-scheduling virtual-memory file-systems permissions deadlocks os-services backup-recovery",
);
const digital = ids(
  "number-systems signed-binary logic-gates boolean-laws half-adder multiplexer decoder practical-logic-half-subtractor practical-logic-full-subtractor practical-logic-counter",
);
const web = ids(
  "html html-semantics css-layout css-box-model colour-codes forms-validation dom-events http-tls practical-html-background-link practical-html-table-image",
);
const networks = ids(
  "networks network-addressing network-layers dns tcp-udp http-tls network-devices network-topologies dhcp cybersecurity",
);
const processor = ids(
  "computer-systems cpu-buses 8085-architecture 8085-addressing 8085-flags 8085-stack 8085-branch interrupts practical-8085-add practical-8085-transfer",
);
const society = ids(
  "cyber-safety cybersecurity digital-citizenship copyright-licensing permissions backup-recovery communication green-skills teamwork self-management",
);
const work = ids(
  "communication self-management teamwork entrepreneurship green-skills digital-citizenship copyright-licensing cyber-safety documents presentations",
);
const productivity = ids(
  "spreadsheets spreadsheet-references spreadsheet-functions charts documents presentations html html-semantics forms-validation practical-sheet-gradebook",
);
const database = ids(
  "sql database-design database-keys normalisation sql-grouping transactions practical-sql-create practical-sql-filter practical-sql-aggregate practical-sql-join",
);
const cpp = ids(
  "algorithms cpp recursion searching practical-cpp-hello practical-cpp-arithmetic practical-cpp-maximum-three practical-cpp-sequence practical-cpp-array-max practical-cpp-area-function",
);
const python = ids(
  "algorithms python-basics control-flow python-functions lists-and-tuples data-structures practical-py-arithmetic practical-py-grade practical-py-word-frequency practical-py-tuple-record",
);
const advancedPython = ids(
  "python-functions functions-files data-structures-plus practical-py-text-file practical-py-filter-file practical-py-csv practical-py-binary practical-py-stack practical-py-exceptions practical-py-mysql",
);
const cppObjects = ids(
  "cpp practical-cpp-rectangle-class practical-cpp-lifecycle practical-cpp-circle practical-cpp-ratio practical-cpp-inheritance practical-cpp-array-pointers practical-cpp-virtual practical-cpp-reference-swap practical-cpp-binary-search",
);
const circuits = ids(
  "practical-logic-basic practical-logic-universal practical-logic-half-adder practical-logic-full-adder practical-logic-half-subtractor practical-logic-full-subtractor practical-logic-three-circuits practical-logic-rs practical-logic-jk practical-logic-counter",
);
export const unitPlan = {
  "mh-11-cs1": [foundations, systems, cpp, web, cpp],
  "mh-11-cs2": [digital, foundations, circuits, circuits],
  "mh-12-cs1": [cppObjects, web, systems, cppObjects],
  "mh-12-cs2": [digital, processor, networks, processor],
  "cbse-11-cs": [foundations, python, society, python, python],
  "cbse-12-cs": [advancedPython, networks, database, advancedPython],
  "cbse-11-it": [work, foundations, productivity, productivity],
  "cbse-12-it": [work, [...database, ...web], [...database, ...productivity]],
};
export function expandUnits(course, units) {
  return units.map((unit, i) => ({
    ...unit,
    lessons: [
      ...new Set([...unit.lessons, ...(unitPlan[course.id]?.[i] || [])]),
    ],
    bookId: `${course.id}-unit-${i + 1}`,
    bookPages: 50,
  }));
}
