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
export function Lab({ id }) {
  return (
    {
      binary: <BinaryLab />,
      gates: <GatesLab />,
      cpu: <CpuLab />,
      sorting: <SortingLab />,
      network: <NetworkLab />,
    }[id] || null
  );
}
