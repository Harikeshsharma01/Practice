// Deterministic teaching models. No network requests, file writes or user code execution.
const frame = (node, title, detail, state, code = "") => ({
  node,
  title,
  detail,
  state,
  code,
});
export const journeyInfo = {
  "journey-web": {
    title: "Browser to server and back",
    category: "Behind the scenes",
    description:
      "Follow a request through DNS, a secure connection, application code, a database and the browser renderer.",
    icon: "↔",
    color: "mint",
    lesson: "networks",
    nodes: ["Browser", "DNS", "Connection", "Server", "Database", "Renderer"],
  },
  "journey-sort": {
    title: "Follow every comparison",
    category: "Algorithms",
    description:
      "Track the moving values, comparisons and swaps from an unsorted array to its final order.",
    icon: "⇄",
    color: "blue",
    lesson: "practical-cpp-bubble-sort",
    nodes: ["Input", "Compare", "Swap", "Sorted tail", "Output"],
  },
  "journey-program": {
    title: "Source code to a running program",
    category: "Programming",
    description:
      "Travel from source text through compilation, input, memory and output. Change the values and operator.",
    icon: "{ }",
    color: "lavender",
    lesson: "cpp",
    nodes: [
      "Source",
      "Compiler",
      "Executable",
      "Input",
      "Memory / ALU",
      "Output",
    ],
  },
  "journey-sql": {
    title: "Inside a SELECT query",
    category: "Databases",
    description:
      "Inspect the source rows, filter decisions, projected columns and final sorted result.",
    icon: "SQL",
    color: "blue",
    lesson: "sql",
    nodes: [
      "Query",
      "Parse",
      "Table scan",
      "Filter",
      "Project",
      "Sort / result",
    ],
  },
  "journey-file": {
    title: "Text to bytes and back",
    category: "Files",
    description:
      "Watch UTF-8 encode text, move bytes through a buffer and decode them again.",
    icon: "010",
    color: "peach",
    lesson: "functions-files",
    nodes: ["Text", "UTF-8", "Buffer", "Stored bytes", "Read", "Decoded text"],
  },
  "journey-circuit": {
    title: "Signals, borrow and stored state",
    category: "Digital electronics",
    description:
      "Trace a subtractor, R–S latch, J–K flip-flop or three-bit counter one event at a time.",
    icon: "⚡",
    color: "peach",
    lesson: "practical-logic-jk",
    nodes: ["Inputs", "Logic", "Clock / enable", "State", "Output"],
  },
  "journey-cpu": {
    title: "8085 register journey",
    category: "Processor",
    description:
      "Follow two bytes into registers, through addition, into flags and out to memory.",
    icon: "A+B",
    color: "lavender",
    lesson: "practical-8085-add",
    nodes: ["Program", "Register A", "Register B", "ALU", "Flags", "Memory"],
  },
};
export function buildJourney(id, config = {}) {
  if (id === "journey-sort") {
    const values = String(config.values || "5,1,4,2")
      .split(",")
      .map((x) => Number(x.trim()));
    if (
      values.length < 2 ||
      values.length > 10 ||
      values.some((n) => !Number.isFinite(n) || Math.abs(n) > 999)
    )
      throw new Error(
        "Enter 2–10 numbers, separated by commas, from −999 to 999.",
      );
    let comparisons = 0,
      swaps = 0;
    const frames = [];
    const add = (node, title, detail, active = []) =>
      frames.push(
        frame(node, title, detail, {
          array: [...values],
          active,
          comparisons,
          swaps,
        }),
      );
    add(
      0,
      "The starting array",
      "Every value travels through adjacent comparisons.",
    );
    for (let pass = 0; pass < values.length - 1; pass++) {
      let changed = false;
      for (let j = 0; j < values.length - 1 - pass; j++) {
        comparisons++;
        add(
          1,
          `Compare indices ${j} and ${j + 1}`,
          `${values[j]} > ${values[j + 1]} is ${values[j] > values[j + 1]}.`,
          [j, j + 1],
        );
        if (values[j] > values[j + 1]) {
          [values[j], values[j + 1]] = [values[j + 1], values[j]];
          swaps++;
          changed = true;
          add(
            2,
            "Exchange the neighbouring values",
            "The larger value moves one position towards the end.",
            [j, j + 1],
          );
        }
      }
      add(
        3,
        `Pass ${pass + 1} completed`,
        `The largest remaining value has reached its final position.${changed ? "" : " No swaps occurred, so the array is sorted."}`,
      );
      if (!changed) break;
    }
    add(
      4,
      "Sorted destination reached",
      "The array is in ascending order. Compare the work done for reversed and already sorted inputs.",
    );
    return frames;
  }
  if (id === "journey-web") {
    const host = config.host || "classroom.example",
      failure = !!config.failure;
    const frames = [
      frame(
        0,
        "A learner opens a page",
        `The browser needs the resource at https://${host}/notes.`,
        { host, method: "GET", resource: "/notes" },
      ),
      frame(
        1,
        "Resolve the hostname",
        "A DNS resolver looks up an IP address for the host. This is a model, not a live lookup.",
        {
          host,
          cache: "miss",
          address: failure
            ? "unresolved"
            : "203.0.113.10 (documentation address)",
        },
      ),
    ];
    if (failure)
      return [
        ...frames,
        frame(
          0,
          "No destination could be resolved",
          "The request stops before contacting the server. Check the hostname or resolver, then switch off “DNS failure” and replay.",
          { error: "DNS resolution failed", serverContacted: false },
        ),
      ];
    return [
      ...frames,
      frame(
        2,
        "Establish the connection",
        "In this simplified HTTP/1.1-over-TLS model, TCP establishes a reliable byte stream, then TLS negotiates encryption and checks server identity.",
        { transport: "TCP", security: "TLS", encrypted: true },
      ),
      frame(
        3,
        "The server receives a request",
        "HTTP carries a method and path. The application selects the matching route.",
        { route: "GET /notes", status: "processing" },
      ),
      frame(
        4,
        "Read the published notes",
        "The application requests published records. Database access happens on the server, not directly in the browser.",
        { query: "published lessons", rows: 3 },
      ),
      frame(
        3,
        "Send the response",
        "The server serialises the result and sends HTTP headers and a response body.",
        { status: 200, contentType: "application/json", rows: 3 },
      ),
      frame(
        5,
        "Render the lesson list",
        "The browser reads the response and updates the visible page. Change the hostname or simulate a DNS failure to compare the path.",
        { screen: "3 lesson cards", destination: "learner’s screen" },
      ),
    ];
  }
  if (id === "journey-program") {
    const a = Number(config.a ?? 8),
      b = Number(config.b ?? 5),
      op = config.op || "+";
    if (!Number.isFinite(a) || !Number.isFinite(b))
      throw new Error("Enter finite numeric inputs.");
    const result =
      op === "+"
        ? a + b
        : op === "-"
          ? a - b
          : op === "*"
            ? a * b
            : b === 0
              ? "division error"
              : a / b;
    return [
      frame(
        0,
        "Write the source",
        "Source text describes what to do, but the CPU does not execute C++ source directly.",
        { language: "C++17" },
        `double a, b;\ncin >> a >> b;\ncout << a ${op} b;`,
      ),
      frame(
        1,
        "Compile and link",
        "The compiler checks the program and translates it. Linking resolves library references.",
        { syntax: "valid", artifact: "executable" },
      ),
      frame(
        2,
        "Load and start",
        "The operating system loads the executable and starts it at the program entry path.",
        { process: "running", a: "uninitialised", b: "uninitialised" },
      ),
      frame(
        3,
        "Read the inputs",
        "The input operation parses numbers and stores them in named variables.",
        { a, b },
      ),
      frame(
        4,
        "Evaluate the expression",
        b === 0 && op === "/"
          ? "A robust program checks for a zero divisor before performing division."
          : "The expression reads both stored values and applies the selected operator.",
        { a, b, operator: op, result },
      ),
      frame(
        5,
        "Display the result",
        "The output stream formats the result as text. Change either input or the operator to see which stages stay the same.",
        { output: String(result) },
      ),
    ];
  }
  if (id === "journey-sql") {
    const minimum = Number(config.minimum ?? 80);
    if (!Number.isFinite(minimum) || minimum < 0 || minimum > 100)
      throw new Error("Use a mark threshold from 0 to 100.");
    const rows = [
      { roll: 1, name: "Asha", marks: 92 },
      { roll: 2, name: "Kabir", marks: 78 },
      { roll: 3, name: "Meera", marks: 85 },
    ];
    const keep = [];
    const code = `SELECT name, marks FROM Student\nWHERE marks >= ${minimum}\nORDER BY marks DESC;`;
    const frames = [
      frame(
        0,
        "Submit the query",
        "A SELECT asks for data without modifying the stored rows.",
        { minimum },
        code,
      ),
      frame(
        1,
        "Parse the query",
        "The database checks names and syntax, then plans execution. This teaching trace uses a simple table scan; real optimisers may use indexes.",
        { table: "Student", columns: "name, marks" },
      ),
      frame(
        2,
        "Read the source rows",
        "The storage layer supplies the records to examine.",
        { rows },
      ),
    ];
    for (const row of rows) {
      const matches = row.marks >= minimum;
      if (matches) keep.push(row);
      frames.push(
        frame(
          3,
          `Check ${row.name}`,
          `${row.marks} >= ${minimum}: ${matches ? "keep" : "discard"} this row.`,
          { current: row, matched: [...keep] },
        ),
      );
    }
    frames.push(
      frame(
        4,
        "Keep only requested columns",
        "Projection chooses name and marks from each matching row.",
        { rows: keep.map(({ name, marks }) => ({ name, marks })) },
      ),
    );
    frames.push(
      frame(
        5,
        "Sort the result",
        "ORDER BY marks DESC places the largest mark first. An empty result is valid when no row matches.",
        {
          rows: keep
            .sort((a, b) => b.marks - a.marks)
            .map(({ name, marks }) => ({ name, marks })),
        },
      ),
    );
    return frames;
  }
  if (id === "journey-file") {
    const text = String(config.text ?? "Mumbai ✓").slice(0, 100),
      bytes = [...new TextEncoder().encode(text)],
      restored = new TextDecoder().decode(new Uint8Array(bytes));
    return [
      frame(
        0,
        "Start with Unicode text",
        "A character and a byte are different units. Some characters need more than one UTF-8 byte.",
        { text, codePoints: [...text].length },
      ),
      frame(
        1,
        "Encode as UTF-8",
        "The encoder maps the text into a sequence of bytes.",
        {
          hex: bytes.map((b) => b.toString(16).padStart(2, "0")).join(" "),
          byteCount: bytes.length,
        },
      ),
      frame(
        2,
        "Place bytes in a buffer",
        "A buffer groups bytes before the operating system writes them. This simulator keeps the bytes only in memory.",
        { bytes },
      ),
      frame(
        3,
        "Reach the stored representation",
        "A real file preserves these bytes until changed. File contents carry no Python or JavaScript string object.",
        { byteCount: bytes.length, mode: "binary bytes" },
      ),
      frame(
        4,
        "Read the byte sequence",
        "Reading returns bytes; decoding requires the intended character encoding.",
        { bytes, encoding: "UTF-8" },
      ),
      frame(
        5,
        "Decode back to text",
        "Matching encoding and decoding reproduces the text. Try Devanagari letters and compare code points with byte count.",
        { text: restored, matches: restored === text },
      ),
    ];
  }
  if (id === "journey-cpu") {
    const a = Number(config.a ?? 255),
      b = Number(config.b ?? 1);
    if (
      !Number.isInteger(a) ||
      !Number.isInteger(b) ||
      a < 0 ||
      a > 255 ||
      b < 0 ||
      b > 255
    )
      throw new Error("8085 registers hold integers from 0 to 255.");
    const total = a + b,
      result = total & 255,
      hex = (n) => n.toString(16).toUpperCase().padStart(2, "0") + "H";
    return [
      frame(
        0,
        "Fetch the instruction sequence",
        "The program counter selects an instruction; fetch and decode determine the operation.",
        { program: "MVI A; MVI B; ADD B; STA 2500H; HLT" },
      ),
      frame(
        1,
        "Load accumulator A",
        "MVI places an immediate byte in the destination register.",
        { A: hex(a) },
        `MVI A, ${hex(a)}`,
      ),
      frame(
        2,
        "Load register B",
        "The second operand is stored separately. A remains unchanged.",
        { A: hex(a), B: hex(b) },
        `MVI B, ${hex(b)}`,
      ),
      frame(
        3,
        "Add in the ALU",
        "The mathematical sum may need nine bits. Only its low eight bits are stored in A.",
        { decimalSum: total, A: hex(result), B: hex(b) },
        "ADD B",
      ),
      frame(
        4,
        "Update status flags",
        "Carry represents overflow beyond eight bits. Zero, sign, parity and auxiliary carry describe the result.",
        {
          CY: total > 255 ? 1 : 0,
          Z: result === 0 ? 1 : 0,
          S: (result >> 7) & 1,
          P: result.toString(2).replace(/0/g, "").length % 2 === 0 ? 1 : 0,
          AC: (a & 15) + (b & 15) > 15 ? 1 : 0,
        },
      ),
      frame(
        5,
        "Store and halt",
        "STA copies A to memory address 2500H. HLT stops execution until an appropriate interrupt or reset.",
        { address: "2500H", value: hex(result), A: hex(result) },
        "STA 2500H\nHLT",
      ),
    ];
  }
  if (id === "journey-circuit") {
    const mode = config.mode || "full-subtractor",
      a = Number(config.a ?? 0) & 1,
      b = Number(config.b ?? 1) & 1,
      c = Number(config.c ?? 0) & 1,
      initial = Number(config.q ?? 0) & 1;
    if (mode === "counter")
      return Array.from({ length: 9 }, (_, i) =>
        frame(
          i === 0 ? 0 : i === 8 ? 4 : 3,
          i === 0 ? "Reset to 000" : `Clock edge ${i}`,
          i === 8
            ? "The three-bit counter wraps from 111 to 000."
            : "One rising edge advances the stored count by one.",
          {
            clock: i,
            count: i % 8,
            Q2Q1Q0: (i % 8).toString(2).padStart(3, "0"),
          },
        ),
      );
    if (mode === "jk" || mode === "rs") {
      const forbidden = mode === "rs" && a === 1 && b === 1;
      const next = forbidden
        ? "invalid"
        : mode === "jk"
          ? a
            ? b
              ? 1 - initial
              : 1
            : b
              ? 0
              : initial
          : a
            ? 1
            : b
              ? 0
              : initial;
      return [
        frame(
          0,
          "Set the control inputs",
          mode === "jk"
            ? "A represents J; B represents K."
            : "A represents S; B represents R for an active-high NOR latch.",
          { A: a, B: b, previousQ: initial },
        ),
        frame(
          1,
          "Apply the state rule",
          forbidden
            ? "Both set and reset are asserted: this NOR-latch input is forbidden."
            : a === 0 && b === 0
              ? "Both inputs are low: retain the stored bit."
              : "The control inputs request a change.",
          { mode, nextQ: next },
        ),
        frame(
          2,
          mode === "jk"
            ? "Apply a rising clock edge"
            : "Allow the latch to settle",
          mode === "jk"
            ? "A J–K flip-flop changes state only at its active clock edge in this model."
            : "This is a level-sensitive NOR latch, not an edge-triggered flip-flop.",
          { previousQ: initial, nextQ: next },
        ),
        frame(
          3,
          "Store the resulting state",
          "The next output depends on both the inputs and the previous stored state.",
          { Q: next },
        ),
        frame(
          4,
          "Inspect the output",
          forbidden
            ? "Do not use the forbidden input combination."
            : `Q is ${next}. Change the initial state and replay to compare.`,
          {
            Q: next,
            complement: typeof next === "number" ? 1 - next : "undefined",
          },
        ),
      ];
    }
    const borrowIn = mode === "half-subtractor" ? 0 : c,
      xor = a ^ b,
      difference = xor ^ borrowIn,
      borrow = ((1 - a) & b) | ((1 - xor) & borrowIn);
    return [
      frame(
        0,
        "Set the binary inputs",
        "A is the minuend bit, B is the subtrahend bit and Bin is the incoming borrow.",
        { A: a, B: b, Bin: borrowIn },
      ),
      frame(
        1,
        "Compute A XOR B",
        "The first XOR produces the intermediate difference.",
        { A: a, B: b, xor },
      ),
      frame(
        2,
        "Combine the incoming borrow",
        "A full subtractor XORs the intermediate difference with Bin. A half subtractor has Bin fixed at 0.",
        { intermediate: xor, Bin: borrowIn, D: difference },
      ),
      frame(
        3,
        "Determine borrow out",
        "Bout = (NOT A AND B) OR (NOT(A XOR B) AND Bin).",
        {
          firstBorrow: (1 - a) & b,
          secondBorrow: (1 - xor) & borrowIn,
          Bout: borrow,
        },
      ),
      frame(
        4,
        "Read the two outputs",
        "D is the difference bit. Bout requests a borrowed unit from the next higher bit position.",
        {
          D: difference,
          Bout: borrow,
          check: `${a} - ${b} - ${borrowIn} = ${difference} - 2×${borrow}`,
        },
      ),
    ];
  }
  throw new Error("Unknown journey.");
}
