import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";

/*
 * Operators: math, comparison & logic (from Code Quest). Three small
 * playgrounds, each showing a live line of code and its result:
 *
 *  - Arithmetic  a (+ - * / %) b
 *  - Comparison  a (== != < > <= >=) b  -> True / False
 *  - Boolean     A (and / or / not) B
 *
 * data.language        = "python" | "javascript" (syntax + results)
 * data.show_arithmetic / show_comparison / show_logic (default on)
 * data.arithmetic_a/_b, data.comparison_a/_b = starting numbers
 */
const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

const LANGUAGES = {
  python: {
    comparison: ["==", "!=", "<", ">", "<=", ">="],
    logic: { and: "and", or: "or", not: "not" },
    bool: (value) => (value ? "True" : "False"),
    end: "",
  },
  javascript: {
    comparison: ["===", "!==", "<", ">", "<=", ">="],
    logic: { and: "&&", or: "||", not: "!" },
    bool: (value) => (value ? "true" : "false"),
    end: ";",
  },
};

const ARITHMETIC = ["+", "-", "*", "/", "%"];

const toNumber = (raw) => {
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
};

/* Arithmetic with each language's own rules. */
function calculate(language, rawA, rawB, op) {
  const a = toNumber(rawA);
  const b = toNumber(rawB);

  if (language === "python") {
    // Python: / always gives a float; % follows the divisor's sign; /0 is an error.
    const isFloat = op === "/" || /[.eE]/.test(String(rawA)) || /[.eE]/.test(String(rawB));
    if ((op === "/" || op === "%") && b === 0) return { error: "ZeroDivisionError: division by zero" };

    const value =
      op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : op === "/" ? a / b : ((a % b) + b) % b;

    return { text: isFloat && Number.isInteger(value) ? `${value}.0` : String(value) };
  }

  const value = op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : op === "/" ? a / b : a % b;
  return { text: String(value) };
}

function compare(rawA, rawB, op) {
  const a = toNumber(rawA);
  const b = toNumber(rawB);
  return { "==": a === b, "===": a === b, "!=": a !== b, "!==": a !== b, "<": a < b, ">": a > b, "<=": a <= b, ">=": a >= b }[op];
}

/* One coloured line in the .code panel: tokens = [[text, class], ...] */
function CodeLine({ tokens }) {
  return (
    <pre className="code operators-block__code">
      <span className="ln">
        {tokens.map(([text, kind], index) =>
          kind ? (
            <i key={index} className={kind}>
              {text}
            </i>
          ) : (
            <span key={index}>{text}</span>
          )
        )}
      </span>
    </pre>
  );
}

function OperatorsBlock({ block }) {
  const data = block?.data || {};
  const language = data.language === "javascript" ? "javascript" : "python";
  const lang = LANGUAGES[language];

  const defaults = {
    a: String(data.arithmetic_a ?? 7),
    b: String(data.arithmetic_b ?? 2),
    ca: String(data.comparison_a ?? 5),
    cb: String(data.comparison_b ?? 5),
  };
  const signature = JSON.stringify([defaults, language]);

  const fresh = () => ({
    signature,
    a: defaults.a,
    b: defaults.b,
    op: "%",
    ca: defaults.ca,
    cb: defaults.cb,
    cop: lang.comparison[0],
    A: true,
    B: false,
    lop: "and",
  });

  const [state, setState] = useState(fresh);

  // Starting numbers or language changed (e.g. in the block editor): reset.
  if (state.signature !== signature) {
    setState(fresh());
  }

  const set = (key) => (event) =>
    setState((current) => ({
      ...current,
      [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value,
    }));

  const arith = calculate(language, state.a, state.b, state.op);
  const isEqual = compare(state.ca, state.cb, state.cop);
  const logicResult =
    state.lop === "not" ? !state.A : state.lop === "and" ? state.A && state.B : state.A || state.B;

  const num = (raw) => [String(toNumber(raw)), "n"];

  const showArithmetic = isOn(data.show_arithmetic, true);
  const showComparison = isOn(data.show_comparison, true);
  const showLogic = isOn(data.show_logic, true);

  // With a single panel the block title already names it, so skip its heading.
  const showHeadings = [showArithmetic, showComparison, showLogic].filter(Boolean).length > 1;

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="operators-block"
    >
      {/* ---------- arithmetic ---------- */}
      {showArithmetic && (
        <section className="operators-block__part operators-block__arith">
          {showHeadings && <h3>🧮 Arithmetic</h3>}
          <div className="form">
            <label>
              a <input type="number" value={state.a} onChange={set("a")} />
            </label>
            <label>
              op
              <select value={state.op} onChange={set("op")}>
                {ARITHMETIC.map((op) => (
                  <option key={op}>{op}</option>
                ))}
              </select>
            </label>
            <label>
              b <input type="number" value={state.b} onChange={set("b")} />
            </label>
          </div>
          <CodeLine tokens={[["result = "], num(state.a), [` ${state.op} `], num(state.b), [lang.end]]} />
          <div className="panel" aria-live="polite">
            result = <b>{arith.error || arith.text}</b>
            {state.op === "%" && !arith.error && (
              <span className="hint">
                {" "}
                (the remainder after dividing {toNumber(state.a)} by {toNumber(state.b)})
              </span>
            )}
          </div>
        </section>
      )}

      {/* ---------- comparison ---------- */}
      {showComparison && (
        <section className="operators-block__part operators-block__compare">
          {showHeadings && <h3>⚖️ Comparison</h3>}
          <div className="form">
            <label>
              a <input type="number" value={state.ca} onChange={set("ca")} />
            </label>
            <label>
              op
              <select value={state.cop} onChange={set("cop")}>
                {lang.comparison.map((op) => (
                  <option key={op}>{op}</option>
                ))}
              </select>
            </label>
            <label>
              b <input type="number" value={state.cb} onChange={set("cb")} />
            </label>
          </div>
          <CodeLine tokens={[["is_it = "], num(state.ca), [` ${state.cop} `], num(state.cb), [lang.end]]} />
          <div className="panel" aria-live="polite">
            is_it = <span className={`tag ${isEqual ? "good" : "bad"}`}>{lang.bool(isEqual)}</span>
          </div>
        </section>
      )}

      {/* ---------- boolean logic ---------- */}
      {showLogic && (
        <section className="operators-block__part operators-block__logic">
          {showHeadings && <h3>🔀 Boolean logic</h3>}
          <div className="row">
            <label>
              <input type="checkbox" checked={state.A} onChange={set("A")} /> A
            </label>
            <select value={state.lop} onChange={set("lop")} aria-label="Logic operator">
              {Object.entries(lang.logic).map(([key, symbol]) => (
                <option key={key} value={key}>
                  {symbol}
                </option>
              ))}
            </select>
            {state.lop !== "not" && (
              <label>
                <input type="checkbox" checked={state.B} onChange={set("B")} /> B
              </label>
            )}
          </div>
          <CodeLine
            tokens={
              state.lop === "not"
                ? [["result = "], [lang.logic.not, "k"], [language === "python" ? " A" : "A"], [lang.end]]
                : [["result = A "], [lang.logic[state.lop], "k"], [" B"], [lang.end]]
            }
          />
          <div className="panel" aria-live="polite">
            A = <b>{lang.bool(state.A)}</b>
            {state.lop !== "not" && (
              <>
                , B = <b>{lang.bool(state.B)}</b>
              </>
            )}{" "}
            → result = <span className={`tag ${logicResult ? "good" : "bad"}`}>{lang.bool(logicResult)}</span>
          </div>
        </section>
      )}
    </LearningBlockShell>
  );
}

export default OperatorsBlock;
