import React, { useEffect, useMemo, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { buildJourney, journeyInfo } from "../../../shared/journeys.js";
export { journeyInfo };
export default function JourneyLab({ id }) {
  const [config, setConfig] = useState({}),
    [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(1200);
  const model = useMemo(() => {
    try {
      return { frames: buildJourney(id, config) };
    } catch (error) {
      return { error: error.message, frames: [] };
    }
  }, [id, config]);
  const frames = model.frames,
    current = frames[Math.min(step, frames.length - 1)],
    info = journeyInfo[id];
  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [id, config]);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () =>
        setStep((value) => {
          if (value >= frames.length - 1) {
            setPlaying(false);
            return value;
          }
          return value + 1;
        }),
      speed,
    );
    return () => clearInterval(timer);
  }, [playing, speed, frames.length]);
  const change = (key, value) => setConfig((c) => ({ ...c, [key]: value }));
  const numeric = (label, key, value, min, max) => (
    <label>
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={config[key] ?? value}
        onChange={(e) => change(key, e.target.value)}
      />
    </label>
  );
  return (
    <div className="journey-lab">
      <div className="journey-controls">
        {id === "journey-web" && (
          <>
            <label>
              Destination hostname
              <input
                maxLength={80}
                value={config.host ?? "classroom.example"}
                onChange={(e) => change("host", e.target.value)}
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={!!config.failure}
                onChange={(e) => change("failure", e.target.checked)}
              />
              Simulate DNS failure
            </label>
          </>
        )}
        {id === "journey-sort" && (
          <label>
            Starting numbers
            <input
              value={config.values ?? "5,1,4,2"}
              onChange={(e) => change("values", e.target.value)}
            />
          </label>
        )}
        {(id === "journey-program" || id === "journey-cpu") && (
          <>
            {numeric(
              "Input A",
              "a",
              id === "journey-cpu" ? 255 : 8,
              id === "journey-cpu" ? 0 : -1000,
              id === "journey-cpu" ? 255 : 1000,
            )}
            {numeric(
              "Input B",
              "b",
              id === "journey-cpu" ? 1 : 5,
              id === "journey-cpu" ? 0 : -1000,
              id === "journey-cpu" ? 255 : 1000,
            )}
            {id === "journey-program" && (
              <label>
                Operator
                <select
                  value={config.op ?? "+"}
                  onChange={(e) => change("op", e.target.value)}
                >
                  {["+", "-", "*", "/"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}
        {id === "journey-sql" &&
          numeric("Minimum marks", "minimum", 80, 0, 100)}
        {id === "journey-file" && (
          <label>
            Text to encode
            <input
              maxLength={100}
              value={config.text ?? "Mumbai ✓"}
              onChange={(e) => change("text", e.target.value)}
            />
          </label>
        )}
        {id === "journey-circuit" && (
          <>
            <label>
              Circuit
              <select
                value={config.mode ?? "full-subtractor"}
                onChange={(e) => change("mode", e.target.value)}
              >
                <option value="half-subtractor">Half subtractor</option>
                <option value="full-subtractor">Full subtractor</option>
                <option value="rs">Active-high R–S NOR latch</option>
                <option value="jk">J–K flip-flop</option>
                <option value="counter">Three-bit counter</option>
              </select>
            </label>
            {config.mode !== "counter" && (
              <>
                {numeric("A / S / J", "a", 0, 0, 1)}
                {numeric("B / R / K", "b", 1, 0, 1)}
                {numeric("Borrow in", "c", 0, 0, 1)}
                {numeric("Previous Q", "q", 0, 0, 1)}
              </>
            )}
          </>
        )}
      </div>
      {model.error ? (
        <p className="form-error" role="alert">
          {model.error}
        </p>
      ) : (
        <>
          <div className="journey-route" aria-label="Origin to destination">
            {info.nodes.map((node, i) => (
              <React.Fragment key={node}>
                <button
                  className={
                    current.node === i
                      ? "current"
                      : frames.slice(0, step).some((f) => f.node === i)
                        ? "visited"
                        : ""
                  }
                  onClick={() => {
                    const found = frames.findIndex((f) => f.node === i);
                    if (found >= 0) {
                      setStep(found);
                      setPlaying(false);
                    }
                  }}
                  disabled={!frames.some((f) => f.node === i)}
                >
                  <span className="journey-orb">
                    {current.node === i ? "✦" : i + 1}
                  </span>
                  <span>{node}</span>
                </button>
                {i < info.nodes.length - 1 && (
                  <ArrowRight className="route-arrow" size={17} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="journey-track" aria-hidden="true">
            <span
              className="journey-particle"
              style={{
                "--travel": `${(current.node / (info.nodes.length - 1)) * 100}%`,
              }}
            />
          </div>
          <div className="journey-playbar">
            <button
              className="icon-button"
              aria-label="Previous step"
              disabled={!step}
              onClick={() => {
                setPlaying(false);
                setStep((s) => s - 1);
              }}
            >
              <SkipBack size={18} />
            </button>
            <button
              className="button primary"
              onClick={() => {
                if (step === frames.length - 1) setStep(0);
                setPlaying(!playing);
              }}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}{" "}
              {playing ? "Pause" : "Play journey"}
            </button>
            <button
              className="icon-button"
              aria-label="Next step"
              disabled={step >= frames.length - 1}
              onClick={() => {
                setPlaying(false);
                setStep((s) => s + 1);
              }}
            >
              <SkipForward size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Reset journey"
              onClick={() => {
                setPlaying(false);
                setStep(0);
              }}
            >
              <RotateCcw size={17} />
            </button>
            <label>
              Speed
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              >
                <option value={2200}>Slow</option>
                <option value={1200}>Normal</option>
                <option value={500}>Fast</option>
              </select>
            </label>
            <span>
              {step + 1} / {frames.length}
            </span>
          </div>
          <input
            className="journey-scrubber"
            aria-label="Journey step"
            type="range"
            min={0}
            max={frames.length - 1}
            value={step}
            onChange={(e) => {
              setPlaying(false);
              setStep(Number(e.target.value));
            }}
          />
          <div className="journey-inspect">
            <div aria-live="polite">
              <span className="overline">WHAT HAPPENS HERE</span>
              <h3>{current.title}</h3>
              <p>{current.detail}</p>
              {current.code && (
                <pre>
                  <code>{current.code}</code>
                </pre>
              )}
            </div>
            <div>
              <span className="overline">INSIDE THE SYSTEM</span>
              {current.state.array && (
                <div className="journey-array">
                  {current.state.array.map((n, i) => (
                    <span
                      key={i}
                      className={
                        current.state.active.includes(i) ? "active" : ""
                      }
                    >
                      <small>[{i}]</small>
                      {n}
                    </span>
                  ))}
                </div>
              )}
              <dl>
                {Object.entries(current.state)
                  .filter(([key]) => !["array", "active"].includes(key))
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>
                        {typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
          </div>
          <details className="journey-trail">
            <summary>Travel log · {step + 1} events</summary>
            <ol>
              {frames.slice(0, step + 1).map((f, i) => (
                <li key={i}>
                  <button
                    onClick={() => {
                      setPlaying(false);
                      setStep(i);
                    }}
                  >
                    {f.title}
                  </button>
                </li>
              ))}
            </ol>
          </details>
        </>
      )}
      <p className="caption">
        Interactive teaching model. Change an input, predict the effect, then
        replay. No live network request, physical circuit, file write or code
        execution occurs.
      </p>
    </div>
  );
}
