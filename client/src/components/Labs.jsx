import JourneyLab, { journeyInfo } from "./JourneyLab";
import React, { useState, useEffect } from "react";
import {
  Play,
  RotateCcw,
  ArrowRight,
  ChevronRight,
  Globe,
  Server,
  Monitor,
  Network,
  Check,
} from "lucide-react";
export const labInfo = {
  ...journeyInfo,
  binary: {
    title: "Binary playground",
    category: "Number systems",
    description:
      "Eight switches. 256 possibilities. Discover what every bit is worth.",
    icon: "01",
    color: "mint",
    lesson: "number-systems",
  },
  gates: {
    title: "Logic gate studio",
    category: "Digital logic",
    description: "Flip a switch and see Boolean logic happen in real time.",
    icon: "&",
    color: "peach",
    lesson: "logic-gates",
  },
  cpu: {
    title: "Inside the processor",
    category: "Computer systems",
    description: "Step through the fetch, decode and execute cycle.",
    icon: "CPU",
    color: "lavender",
    lesson: "computer-systems",
  },
  sorting: {
    title: "The sorting room",
    category: "Algorithms",
    description: "Watch bubble sort bring a little order to the chaos.",
    icon: "↗",
    color: "blue",
    lesson: "algorithms",
  },
  network: {
    title: "A packet’s journey",
    category: "Computer networks",
    description: "Follow a web request from your browser to a server.",
    icon: "www",
    color: "mint",
    lesson: "networks",
  },
  adder: {
    title: "Full-adder studio",
    category: "Digital logic",
    description: "Build a binary addition from A, B and the carry-in.",
    icon: "+",
    color: "peach",
    lesson: "half-adder",
  },
  trace: {
    title: "Recursion & call stack",
    category: "Programming",
    description: "Step through a recursive call and watch its stack unwind.",
    icon: "fn",
    color: "lavender",
    lesson: "recursion",
  },
  search: {
    title: "Binary-search trail",
    category: "Algorithms",
    description: "Choose which half to keep at every comparison.",
    icon: "⌕",
    color: "blue",
    lesson: "searching",
  },
  arrays: {
    title: "Array-index explorer",
    category: "Data structures",
    description: "Tap an index, update a list and inspect each position.",
    icon: "[ ]",
    color: "mint",
    lesson: "lists-and-tuples",
  },
  stack: {
    title: "Stack & queue workshop",
    category: "Data structures",
    description: "Push and pop a stack; enqueue and dequeue a line.",
    icon: "⇵",
    color: "lavender",
    lesson: "data-structures-plus",
  },
  query: {
    title: "Database-query builder",
    category: "Databases",
    description: "Choose a filter and see the safe SELECT result update.",
    icon: "SQL",
    color: "blue",
    lesson: "database-design",
  },
  address: {
    title: "IPv4 subnet explorer",
    category: "Networks",
    description: "Reveal the network and host part of an address.",
    icon: "IP",
    color: "mint",
    lesson: "network-addressing",
  },
  rgb: {
    title: "RGB colour mixer",
    category: "Digital media",
    description: "Blend light, read its hex code and compare text contrast.",
    icon: "RGB",
    color: "peach",
    lesson: "colour-codes",
  },
  layout: {
    title: "Responsive layout studio",
    category: "Web development",
    description: "Change a grid and see how it wraps at phone size.",
    icon: "▦",
    color: "blue",
    lesson: "css-layout",
  },
};
export function BinaryLab() {
  const [number, setNumber] = useState(42);
  return (
    <div className="lab-content">
      <div className="lab-readout">
        <span>DECIMAL</span>
        <strong>{number}</strong>
        <span>
          HEX <b>{number.toString(16).toUpperCase().padStart(2, "0")}</b>
        </span>
      </div>
      <div className="bit-row">
        {Array.from({ length: 8 }, (_, i) => {
          const value = 2 ** (7 - i),
            on = !!(number & value);
          return (
            <div key={value}>
              <span>{value}</span>
              <button
                aria-label={`Toggle bit ${value}`}
                aria-pressed={on}
                className={on ? "bit active" : "bit"}
                onClick={() => setNumber(number ^ value)}
              >
                {on ? 1 : 0}
              </button>
              <small>
                2<sup>{7 - i}</sup>
              </small>
            </div>
          );
        })}
      </div>
      <label className="range-label">
        Explore a number{" "}
        <input
          aria-label="Decimal number"
          type="range"
          min="0"
          max="255"
          value={number}
          onChange={(e) => setNumber(+e.target.value)}
        />
        <input
          className="number-input"
          aria-label="Enter decimal number"
          type="number"
          min="0"
          max="255"
          value={number}
          onChange={(e) =>
            setNumber(Math.max(0, Math.min(255, Number(e.target.value) || 0)))
          }
        />
      </label>
      <div className="lab-explanation">
        <span className="tiny-dot" />{" "}
        {Array.from({ length: 8 }, (_, i) => 2 ** (7 - i))
          .filter((v) => number & v)
          .join(" + ") || "0"}{" "}
        = <b>{number}</b>
        <p>
          Each glowing bit adds its place value. Tap a bit to change the number.
        </p>
      </div>
    </div>
  );
}
export function GatesLab() {
  const [gate, setGate] = useState("AND"),
    [a, setA] = useState(false),
    [b, setB] = useState(true);
  const calc = (x, y) =>
    ({
      AND: x && y,
      OR: x || y,
      XOR: x !== y,
      NAND: !(x && y),
      NOR: !(x || y),
      NOT: !x,
    })[gate];
  const out = calc(a, b);
  return (
    <div className="lab-content">
      <div className="segmented gate-choices">
        {["AND", "OR", "XOR", "NAND", "NOR", "NOT"].map((g) => (
          <button
            key={g}
            className={g === gate ? "selected" : ""}
            onClick={() => setGate(g)}
          >
            {g}
          </button>
        ))}
      </div>
      <div className="gate-circuit">
        <div className="gate-inputs">
          <button
            className={a ? "signal on" : "signal"}
            aria-label="Input A"
            aria-pressed={a}
            onClick={() => setA(!a)}
          >
            A <b>{+a}</b>
          </button>
          {gate !== "NOT" && (
            <button
              className={b ? "signal on" : "signal"}
              aria-label="Input B"
              aria-pressed={b}
              onClick={() => setB(!b)}
            >
              B <b>{+b}</b>
            </button>
          )}
        </div>
        <div className="wire" />
        <div className="gate-symbol">{gate}</div>
        <div className={out ? "wire on" : "wire"} />
        <div className={out ? "bulb on" : "bulb"}>
          <span />
          {out ? "ON · 1" : "OFF · 0"}
        </div>
      </div>
      <div className="truth-table">
        <table>
          <thead>
            <tr>
              <th>A</th>
              {gate !== "NOT" && <th>B</th>}
              <th>{gate}</th>
            </tr>
          </thead>
          <tbody>
            {(gate === "NOT"
              ? [
                  [false, false],
                  [true, false],
                ]
              : [
                  [false, false],
                  [false, true],
                  [true, false],
                  [true, true],
                ]
            ).map(([x, y], i) => (
              <tr
                key={i}
                className={
                  x === a && (gate === "NOT" || y === b) ? "current" : ""
                }
              >
                <td>{+x}</td>
                {gate !== "NOT" && <td>{+y}</td>}
                <td>{+calc(x, y)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          The highlighted row is your live input. Change a switch to test
          another combination.
        </p>
      </div>
    </div>
  );
}
export function CpuLab() {
  const [step, setStep] = useState(0);
  const stages = [
    {
      name: "Ready",
      text: "Memory holds an ADD instruction. The accumulator contains 7. Step through the cycle to add 5.",
      reg: 7,
    },
    {
      name: "Fetch",
      text: "The control unit fetches ADD 5 from memory into the instruction register and advances the program counter.",
      reg: 7,
    },
    {
      name: "Decode",
      text: "The control unit identifies an addition operation and the operand 5.",
      reg: 7,
    },
    {
      name: "Execute",
      text: "The ALU adds 5 to the accumulator’s value of 7. The result, 12, is stored in the accumulator.",
      reg: 12,
    },
  ];
  return (
    <div className="lab-content">
      <div className="cpu-flow">
        {["Memory", "Control unit", "ALU", "Register"].map((x, i) => (
          <React.Fragment key={x}>
            <div className={step === i ? "cpu-box active" : "cpu-box"}>
              <small>
                {["ADD 5", "IR: ADD 5", "7 + 5", `ACC: ${stages[step].reg}`][i]}
              </small>
              <strong>{x}</strong>
            </div>
            {i < 3 && <ChevronRight size={20} />}
          </React.Fragment>
        ))}
      </div>
      <div className="stage-track">
        {stages.map((s, i) => (
          <button
            key={s.name}
            className={i === step ? "active" : ""}
            onClick={() => setStep(i)}
          >
            {i + 1}. {s.name}
          </button>
        ))}
      </div>
      <p className="stage-description">{stages[step].text}</p>
      <button
        className="button primary"
        onClick={() => setStep((step + 1) % 4)}
      >
        {step === 3 ? <RotateCcw size={16} /> : <Play size={16} />}{" "}
        {step === 3 ? "Start again" : "Next step"}
      </button>
      <p className="caption">
        A simplified teaching model; real processor architectures vary.
      </p>
    </div>
  );
}
export function SortingLab() {
  const initial = [55, 25, 80, 40, 65, 15];
  const [values, setValues] = useState(initial),
    [index, setIndex] = useState(0),
    [pass, setPass] = useState(0),
    [running, setRunning] = useState(false),
    [message, setMessage] = useState(
      "Compare adjacent bars. Put the smaller value on the left.",
    );
  const done = pass >= values.length - 1;
  function step() {
    if (done) {
      setRunning(false);
      return;
    }
    const next = [...values];
    let swapped = false;
    if (next[index] > next[index + 1]) {
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      swapped = true;
    }
    setMessage(
      `${values[index]} and ${values[index + 1]}: ${swapped ? "swap their positions." : "already in order."}`,
    );
    setValues(next);
    if (index >= values.length - pass - 2) {
      setPass(pass + 1);
      setIndex(0);
    } else setIndex(index + 1);
  }
  useEffect(() => {
    if (!running || done) return;
    const timer = setTimeout(step, 650);
    return () => clearTimeout(timer);
  }, [running, index, pass, values]);
  return (
    <div className="lab-content">
      <div className="sort-bars">
        {values.map((v, i) => (
          <div
            key={i}
            className={
              done || i >= values.length - pass
                ? "sorted"
                : i === index || i === index + 1
                  ? "comparing"
                  : ""
            }
            style={{ height: `${v * 2}px` }}
          >
            <span>{v}</span>
          </div>
        ))}
      </div>
      <p className="stage-description">
        {done ? "Sorted! Every value is now in ascending order." : message}
      </p>
      <div className="button-row">
        <button
          className="button primary"
          disabled={done}
          onClick={() => setRunning(!running)}
        >
          <Play size={16} />
          {running ? "Pause" : "Animate"}
        </button>
        <button className="button" disabled={done || running} onClick={step}>
          Next comparison
        </button>
        <button
          className="icon-button"
          aria-label="Reset sorting"
          onClick={() => {
            setValues(initial);
            setPass(0);
            setIndex(0);
            setRunning(false);
            setMessage("Compare adjacent bars.");
          }}
        >
          <RotateCcw size={18} />
        </button>
      </div>
      <p className="caption">
        Pass {Math.min(pass + 1, 5)} of 5 · Bubble sort · Ascending order
      </p>
    </div>
  );
}
export function NetworkLab() {
  const [stage, setStage] = useState(0);
  const icons = [Monitor, Globe, Network, Server];
  const texts = [
    "Your browser needs the address of the requested website.",
    "DNS resolves the domain name to the server’s address.",
    "The request travels across networks. HTTPS uses TLS to protect the exchange.",
    "The server processes the request and returns a response.",
    "The browser receives the response and renders the page.",
  ];
  return (
    <div className="lab-content">
      <div className="network-route">
        {icons.map((Icon, i) => (
          <React.Fragment key={i}>
            <div
              className={
                Math.min(stage, 3) === i
                  ? "network-node active"
                  : "network-node"
              }
            >
              <Icon size={30} />
              <span>{["Browser", "DNS", "Network", "Server"][i]}</span>
            </div>
            {i < 3 && (
              <div className={stage > i ? "packet-line active" : "packet-line"}>
                <span />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="stage-description">{texts[stage]}</p>
      <button
        className="button primary"
        onClick={() => setStage((stage + 1) % 5)}
      >
        {stage === 4 ? <RotateCcw size={16} /> : <ArrowRight size={16} />}{" "}
        {stage === 4 ? "Send another request" : "Follow the request"}
      </button>
      <p className="caption">
        Conceptual sequence; cached DNS and reused connections can shorten the
        journey.
      </p>
    </div>
  );
}
export function FullAdderLab() {
  const [bits, setBits] = useState([false, true, false]);
  const total = bits.filter(Boolean).length;
  const rows = Array.from({ length: 8 }, (_, n) => [
    !!(n & 4),
    !!(n & 2),
    !!(n & 1),
  ]);
  return (
    <div className="lab-content">
      <div className="adder-inputs">
        {["A", "B", "Carry in"].map((name, i) => (
          <button
            key={name}
            className={bits[i] ? "signal on" : "signal"}
            aria-label={name}
            aria-pressed={bits[i]}
            onClick={() => setBits(bits.map((x, j) => (i === j ? !x : x)))}
          >
            {name}
            <b>{+bits[i]}</b>
          </button>
        ))}
      </div>
      <div className="adder-result">
        <div>
          <span>SUM · A ⊕ B ⊕ Cin</span>
          <strong>{total % 2}</strong>
        </div>
        <div>
          <span>CARRY OUT · majority</span>
          <strong>{+(total >= 2)}</strong>
        </div>
      </div>
      <table className="wide-truth-table">
        <thead>
          <tr>
            {["A", "B", "Cin", "Sum", "Cout"].map((x) => (
              <th key={x}>{x}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              className={r.every((x, j) => x === bits[j]) ? "current" : ""}
              key={i}
            >
              {r.map((x, j) => (
                <td key={j}>{+x}</td>
              ))}
              <td>{+(r.filter(Boolean).length % 2)}</td>
              <td>{+(r.filter(Boolean).length >= 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="caption">
        A half adder cannot receive a previous carry; a full adder handles all
        three inputs.
      </p>
    </div>
  );
}

export function TraceLab() {
  const [step, setStep] = useState(0);
  const frames = [
    { n: 4, label: "Call factorial(4)" },
    { n: 3, label: "4 waits; call factorial(3)" },
    { n: 2, label: "4 and 3 wait; call factorial(2)" },
    { n: 1, label: "2 waits; call factorial(1)" },
    { n: 1, label: "Base case: return 1" },
    { n: 2, label: "Resume factorial(2): 2 × 1 = 2" },
    { n: 3, label: "Resume factorial(3): 3 × 2 = 6" },
    { n: 4, label: "Resume factorial(4): 4 × 6 = 24" },
  ];
  return (
    <div className="lab-content">
      <div className="trace-stack">
        {Array.from({ length: 4 }, (_, i) => {
          const waiting = Math.max(0, 3 - Math.max(0, Math.min(step, 4)));
          return (
            <div
              key={i}
              className={
                i < waiting || step === i ? "trace-frame active" : "trace-frame"
              }
            >
              <span>CALL FRAME {i + 1}</span>
              <b>
                {i < waiting
                  ? `factorial(${4 - i}) waiting`
                  : step >= 4 && i >= waiting
                    ? `factorial(${i + 1}) resumes`
                    : "ready"}
              </b>
            </div>
          );
        }).reverse()}
      </div>
      <div className="stage-description" role="status">
        Step {step + 1} of {frames.length}: {frames[step].label}.{" "}
        {step === 4
          ? "The base case stops recursion."
          : step > 4
            ? "The saved calls return their own results."
            : "A new call waits for the next result."}
      </div>
      <div className="button-row">
        <button
          className="button primary"
          disabled={step === frames.length - 1}
          onClick={() => setStep(step + 1)}
        >
          <ArrowRight size={16} />
          Next stack step
        </button>
        <button className="button" onClick={() => setStep(0)}>
          <RotateCcw size={16} />
          Restart
        </button>
      </div>
      <pre>
        <code>{`factorial(${frames[step].n})${step >= 4 ? ` returns ${step === 4 ? 1 : [1, 1, 2, 6, 24][step - 3]}` : " is active"}`}</code>
      </pre>
    </div>
  );
}

export function SearchLab() {
  const values = [4, 8, 12, 17, 23, 29, 31],
    [target, setTarget] = useState(23),
    [range, setRange] = useState([0, values.length - 1]),
    [done, setDone] = useState(false),
    [message, setMessage] = useState("Start with the complete sorted range."),
    [comparisons, setComparisons] = useState(0);
  function next() {
    if (done) return;
    const [low, high] = range;
    if (low > high) {
      setMessage(`${target} is not in this list.`);
      setDone(true);
      return;
    }
    const mid = Math.floor((low + high) / 2),
      current = values[mid],
      count = comparisons + 1;
    setComparisons(count);
    if (current === target) {
      setMessage(
        `Found ${current} at index ${mid} after ${count} comparisons.`,
      );
      setDone(true);
    } else {
      const updated = current < target ? [mid + 1, high] : [low, mid - 1];
      setRange(updated);
      setMessage(
        `${current} ${current < target ? "is less" : "is greater"} than ${target}. Keep indices ${updated[0]}–${updated[1]}.`,
      );
    }
  }
  function reset(t = 23) {
    setTarget(t);
    setRange([0, values.length - 1]);
    setDone(false);
    setComparisons(0);
    setMessage("Start with the complete sorted range.");
  }
  const [low, high] = range,
    mid = low <= high ? Math.floor((low + high) / 2) : -1;
  return (
    <div className="lab-content">
      <label className="range-label">
        Find a value{" "}
        <select value={target} onChange={(e) => reset(+e.target.value)}>
          {[4, 8, 12, 17, 23, 29, 31, 19].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <div className="search-strip">
        {values.map((v, i) => (
          <div
            className={
              i === mid && !done
                ? "search-value current"
                : i < low || i > high
                  ? "search-value discarded"
                  : done && v === target
                    ? "search-value found"
                    : "search-value"
            }
            key={v}
          >
            <b>{v}</b>
            <span>index {i}</span>
          </div>
        ))}
      </div>
      <p className="stage-description" role="status">
        {message}
      </p>
      <div className="button-row">
        <button className="button primary" disabled={done} onClick={next}>
          <ArrowRight size={16} />
          Compare the middle
        </button>
        <button className="button" onClick={() => reset()}>
          <RotateCcw size={16} />
          Restart
        </button>
        <span className="caption">Comparisons: {comparisons}</span>
      </div>
    </div>
  );
}

export function ArrayLab() {
  const [values, setValues] = useState([18, 21, 19, 25]),
    [index, setIndex] = useState(1);
  return (
    <div className="lab-content">
      <p className="stage-description">
        Python starts counting at index <b>0</b>. Select an item to inspect its
        value.
      </p>
      <div className="array-cells">
        {values.map((v, i) => (
          <button
            key={i}
            aria-label={`Select list index ${i}`}
            className={index === i ? "array-cell current" : "array-cell"}
            onClick={() => setIndex(i)}
          >
            <small>index {i}</small>
            <strong>{v}</strong>
          </button>
        ))}
      </div>
      <div className="array-detail">
        <code>readings[{index}]</code> <span>=</span>{" "}
        <strong>{values[index]}</strong>
        <small>
          {" "}
          · list length {values.length} · last index {values.length - 1}
        </small>
      </div>
      <div className="button-row">
        <button
          className="button"
          onClick={() =>
            setValues(values.map((v, i) => (i === index ? v + 1 : v)))
          }
        >
          Increase selected value
        </button>
        <button
          className="button"
          onClick={() => {
            setValues([...values, 26]);
            setIndex(values.length);
          }}
        >
          Append 26
        </button>
        <button
          className="button"
          disabled={!values.length}
          onClick={() => {
            const next = values.slice(0, -1);
            setValues(next);
            setIndex(Math.min(index, Math.max(0, next.length - 1)));
          }}
        >
          Pop last value
        </button>
        <button
          className="icon-button"
          aria-label="Reset example list"
          onClick={() => {
            setValues([18, 21, 19, 25]);
            setIndex(1);
          }}
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}

export function StackLab() {
  const [mode, setMode] = useState("stack"),
    [items, setItems] = useState(["A", "B"]),
    [next, setNext] = useState("C");
  const ordered = mode === "stack" ? [...items].reverse() : items;
  const add = () => {
    setItems([...items, next]);
    setNext(String.fromCharCode(Math.min(next.charCodeAt(0) + 1, 90)));
  };
  return (
    <div className="lab-content">
      <div className="segmented gate-choices">
        {["stack", "queue"].map((x) => (
          <button
            key={x}
            className={mode === x ? "selected" : ""}
            onClick={() => setMode(x)}
          >
            {x === "stack" ? "Stack · LIFO" : "Queue · FIFO"}
          </button>
        ))}
      </div>
      <div
        className={
          mode === "stack"
            ? "structure-items stack-items"
            : "structure-items queue-items"
        }
      >
        {ordered.length ? (
          ordered.map((v, i) => (
            <div
              key={`${v}-${i}`}
              className={i === 0 ? "structure-item active" : "structure-item"}
            >
              {v}
              <small>
                {mode === "stack" && i === 0
                  ? "TOP"
                  : mode === "queue" && i === 0
                    ? "FRONT"
                    : ""}
              </small>
            </div>
          ))
        ) : (
          <span className="caption">This {mode} is empty.</span>
        )}
      </div>
      <div className="button-row">
        <button className="button primary" onClick={add}>
          {mode === "stack" ? "Push" : "Enqueue"} {next}
        </button>
        <button
          className="button"
          disabled={!items.length}
          onClick={() =>
            setItems(
              items.slice(
                mode === "stack" ? 0 : 1,
                mode === "stack" ? -1 : undefined,
              ),
            )
          }
        >
          {mode === "stack" ? "Pop top" : "Dequeue front"}
        </button>
        <button
          className="button"
          onClick={() => {
            setItems(["A", "B"]);
            setNext("C");
          }}
        >
          Reset
        </button>
      </div>
      <p className="caption">
        Stack: newest first out. Queue: oldest first out.
      </p>
    </div>
  );
}

export function QueryLab() {
  const records = [
    { name: "Asha", className: "XI", subject: "Python", marks: 87 },
    { name: "Kabir", className: "XII", subject: "SQL", marks: 92 },
    { name: "Riya", className: "XI", subject: "Python", marks: 68 },
    { name: "Neel", className: "XII", subject: "Networks", marks: 74 },
  ];
  const [filter, setFilter] = useState("all");
  const result = records
    .filter((r) =>
      filter === "top"
        ? r.marks >= 75
        : filter === "xi"
          ? r.className === "XI"
          : true,
    )
    .sort((a, b) => (filter === "top" ? b.marks - a.marks : 0));
  const where = filter === "top" ? " WHERE marks >= 75" : "";
  const sort = filter === "top" ? " ORDER BY marks DESC" : "";
  return (
    <div className="lab-content">
      <label className="range-label">
        Explore these sample rows{" "}
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All students</option>
          <option value="top">Marks at least 75</option>
          <option value="xi">Class XI only</option>
        </select>
      </label>
      <pre>
        <code>{`SELECT name, class, subject, marks\nFROM students${where}${sort};`}</code>
      </pre>
      <div className="table-scroll">
        <table className="wide-truth-table">
          <thead>
            <tr>
              <th>name</th>
              <th>class</th>
              <th>subject</th>
              <th>marks</th>
            </tr>
          </thead>
          <tbody>
            {result.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.className}</td>
                <td>{r.subject}</td>
                <td>{r.marks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="caption">
        This visual uses a fixed teaching dataset. The dropdown selects safe,
        predefined queries; it does not execute student-entered SQL.
      </p>
    </div>
  );
}

export function AddressLab() {
  const [octet, setOctet] = useState(42),
    [prefix, setPrefix] = useState(24);
  const mask =
    prefix === 0 ? 0n : BigInt.asUintN(32, -1n << BigInt(32 - prefix));
  const ip = 0xc0a80a00n + BigInt(octet),
    network = ip & mask,
    broadcast = network | BigInt.asUintN(32, ~mask);
  const format = (n) =>
    [24n, 16n, 8n, 0n].map((shift) => Number((n >> shift) & 255n)).join(".");
  const usable =
    prefix < 31
      ? String(2 ** (32 - prefix) - 2)
      : prefix === 31
        ? "2 (point-to-point)"
        : "1";
  return (
    <div className="lab-content">
      <div className="address-display">
        {format(ip)}
        <span> / {prefix}</span>
      </div>
      <label className="range-label">
        Final address octet{" "}
        <input
          type="range"
          aria-label="Final IP address octet"
          min="1"
          max="254"
          value={octet}
          onChange={(e) => setOctet(+e.target.value)}
        />
        <b>{octet}</b>
      </label>
      <label className="range-label">
        Prefix length{" "}
        <input
          type="range"
          aria-label="Prefix length"
          min="8"
          max="30"
          value={prefix}
          onChange={(e) => setPrefix(+e.target.value)}
        />
        <b>/{prefix}</b>
      </label>
      <div className="address-cards">
        <div>
          <span>NETWORK</span>
          <strong>{format(network)}</strong>
        </div>
        <div>
          <span>EXAMPLE ADDRESS</span>
          <strong>{format(ip)}</strong>
        </div>
        <div>
          <span>BROADCAST</span>
          <strong>{format(broadcast)}</strong>
        </div>
      </div>
      <div className="lab-explanation">
        This simple IPv4 teaching model counts <b>{usable}</b> usable host
        addresses for the selected subnet.
      </div>
      <p className="caption">
        Special subnet rules apply for /31 point-to-point links and /32 host
        routes.
      </p>
    </div>
  );
}

function contrast(a, b) {
  const lum = (x) => {
    const q = x / 255;
    return q <= 0.04045 ? q / 12.92 : ((q + 0.055) / 1.055) ** 2.4;
  };
  const L = [...a.matchAll(/[a-f\d]{2}/gi)].map((m) => lum(parseInt(m[0], 16)));
  const l = 0.2126 * L[0] + 0.7152 * L[1] + 0.0722 * L[2];
  return (1.05 / (l + 0.05)).toFixed(2);
}
export function RgbLab() {
  const [rgb, setRgb] = useState([211, 245, 139]),
    hex =
      "#" +
      rgb
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase(),
    black = contrast(hex, "#000000"),
    white = contrast(hex, "#FFFFFF");
  return (
    <div className="lab-content">
      <div
        className="colour-swatch"
        style={{
          backgroundColor: hex,
          color: +black > +white ? "#000" : "#fff",
        }}
      >
        <strong>Sewestian</strong>
        <span>A little learning goes a long way.</span>
        <code>{hex}</code>
      </div>
      {["Red", "Green", "Blue"].map((name, i) => (
        <label className="range-label rgb-slider" key={name}>
          {name}
          <input
            aria-label={`${name} colour channel`}
            type="range"
            min="0"
            max="255"
            value={rgb[i]}
            onChange={(e) =>
              setRgb(rgb.map((v, j) => (i === j ? +e.target.value : v)))
            }
          />
          <code>{rgb[i]}</code>
        </label>
      ))}
      <div className="contrast-pair">
        <span>
          Black text <b>{black}:1</b>
        </span>
        <span>
          White text <b>{white}:1</b>
        </span>
        <p>
          AA normal-text guidance: at least 4.5:1. Always check actual
          foreground and background.
        </p>
      </div>
    </div>
  );
}

export function LayoutLab() {
  const [columns, setColumns] = useState(3),
    [narrow, setNarrow] = useState(false);
  const count = narrow ? 1 : columns;
  return (
    <div className="lab-content">
      <div className="segmented gate-choices">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            className={columns === n ? "selected" : ""}
            onClick={() => setColumns(n)}
          >
            {n} {n === 1 ? "column" : "columns"}
          </button>
        ))}
        <button
          className={narrow ? "selected" : ""}
          onClick={() => setNarrow(!narrow)}
        >
          {narrow ? "↔ Phone preview" : "▣ Desktop preview"}
        </button>
      </div>
      <div
        className="layout-preview"
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      >
        {[
          "HTML",
          "CSS",
          "curiosity",
          "ideas",
          "try · learn · try",
          "Sewestian",
        ].map((x, i) => (
          <div key={i}>{x}</div>
        ))}
      </div>
      <pre>
        <code>{`.cards {\n display: grid;\n grid-template-columns: repeat(${count}, minmax(0, 1fr));\n gap: 12px;\n}`}</code>
      </pre>
      <p className="caption">
        This live layout playground runs a fixed CSS pattern; switch the
        viewport control and try different column counts.
      </p>
    </div>
  );
}

export function Lab({ id }) {
  if (journeyInfo[id]) return <JourneyLab key={id} id={id} />;
  return (
    {
      binary: <BinaryLab />,
      gates: <GatesLab />,
      cpu: <CpuLab />,
      sorting: <SortingLab />,
      network: <NetworkLab />,
      adder: <FullAdderLab />,
      trace: <TraceLab />,
      search: <SearchLab />,
      arrays: <ArrayLab />,
      stack: <StackLab />,
      query: <QueryLab />,
      address: <AddressLab />,
      rgb: <RgbLab />,
      layout: <LayoutLab />,
    }[id] || null
  );
}
