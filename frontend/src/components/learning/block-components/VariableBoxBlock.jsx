import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";

/*
 * Variable Box (from Code Quest): students type a variable
 * name and a value, press "Assign it", and see the line of code,
 * the type the language works out by itself, and a shelf of the
 * boxes made so far. Invalid or reserved names get an error.
 *
 * data.language      = "python" | "javascript"
 * data.default_name  / data.default_value = the first box (assigned on load)
 * data.max_boxes     = how many boxes the shelf keeps (default 6)
 */
const RESERVED = {
  python:
    "False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield print len",
  javascript:
    "break case catch class const continue debugger default delete do else export extends false finally for function if import in instanceof let new null return super switch this throw true try typeof var void while with yield",
};

const NAME_PATTERN = {
  python: /^[A-Za-z_][A-Za-z0-9_]*$/,
  javascript: /^[A-Za-z_$][A-Za-z0-9_$]*$/,
};

const EMOJI = { number: "🔢", string: "🔤", boolean: "💡", list: "📋" };

/* Work out the value's kind and how it's written in code. */
function describeValue(language, raw) {
  const text = String(raw ?? "").trim();

  if (/^\[.*\]$/.test(text)) {
    return { kind: "list", literal: text, type: language === "python" ? "list" : "object" };
  }
  if (language === "python" ? text === "True" || text === "False" : text === "true" || text === "false") {
    return { kind: "boolean", literal: text, type: language === "python" ? "bool" : "boolean" };
  }
  if (/^-?\d+(\.\d+)?$/.test(text)) {
    const type = language === "python" ? (text.includes(".") ? "float" : "int") : "number";
    return { kind: "number", literal: text, type };
  }

  // Anything else is text: keep the student's own quotes, or add some.
  const quoted = /^"[^"]*"$/.test(text) || /^'[^']*'$/.test(text);
  return {
    kind: "string",
    literal: quoted ? text : `"${text.replace(/"/g, '\\"')}"`,
    type: language === "python" ? "str" : "string",
  };
}

/* Try to assign: returns the new state, or the same shelf with an error. */
function assign(language, maxBoxes, shelf, rawName, rawValue) {
  const name = String(rawName ?? "").trim();

  if (!NAME_PATTERN[language].test(name)) {
    return {
      shelf,
      result: {
        ok: false,
        message: "💥 Names can't start with a number or contain spaces or symbols.",
      },
    };
  }
  if (RESERVED[language].split(" ").includes(name)) {
    return { shelf, result: { ok: false, message: `💥 "${name}" is a special reserved word. Pick another name.` } };
  }

  const value = describeValue(language, rawValue);
  const box = { name, ...value };
  const existing = shelf.findIndex((item) => item.name === name);
  const reassigned = existing !== -1;

  const nextShelf = reassigned
    ? shelf.map((item, index) => (index === existing ? box : item))
    : [...shelf, box].slice(-maxBoxes);

  const typeText = language === "python" ? `type(${name}) is ${value.type}` : `typeof ${name} is "${value.type}"`;

  return {
    shelf: nextShelf,
    lastBox: box,
    result: {
      ok: true,
      message: reassigned
        ? `♻️ Reassigned! ${name} now holds ${value.literal} — the old value is gone.`
        : `✅ Assigned! ${typeText} — nobody had to declare that ahead of time.`,
    },
  };
}

function VariableBoxBlock({ block }) {
  const data = block?.data || {};
  const language = data.language === "javascript" ? "javascript" : "python";
  const maxBoxes = Math.min(12, Math.max(1, Number(data.max_boxes) || 6));
  const defaultName = String(data.default_name ?? "age");
  const defaultValue = String(data.default_value ?? "8");
  const signature = JSON.stringify([language, maxBoxes, defaultName, defaultValue]);

  // Start with the teacher's example already assigned, like Code Quest.
  const fresh = () => ({
    signature,
    name: defaultName,
    value: defaultValue,
    attempts: 0,
    ...assign(language, maxBoxes, [], defaultName, defaultValue),
  });

  const [state, setState] = useState(fresh);

  // Settings changed (e.g. in the block editor): start again.
  if (state.signature !== signature) {
    setState(fresh());
  }

  const submit = (event) => {
    event.preventDefault();
    setState((current) => ({
      ...current,
      attempts: current.attempts + 1,
      ...assign(language, maxBoxes, current.shelf, current.name, current.value),
    }));
  };

  const box = state.lastBox;

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="variable-box-block"
    >
      <form className="form" onSubmit={submit}>
        <label>
          Box name
          <input
            type="text"
            value={state.name}
            maxLength={16}
            spellCheck="false"
            autoComplete="off"
            onChange={(event) => setState((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
        <label>
          Value
          <input
            type="text"
            value={state.value}
            maxLength={24}
            spellCheck="false"
            autoComplete="off"
            onChange={(event) => setState((current) => ({ ...current, value: event.target.value }))}
          />
        </label>
        <button type="submit" className="btn">
          Assign it
        </button>
      </form>

      {box && (
        <pre className="code variable-box-block__code">
          {language === "python" ? (
            <>
              <span className="ln">
                {box.name} = <i className={box.kind === "string" ? "s" : box.kind === "boolean" ? "k" : "n"}>{box.literal}</i>
              </span>
              <span className="ln">
                <i className="k">print</i>(<i className="k">type</i>({box.name})) <i className="c">{`# <class '${box.type}'>`}</i>
              </span>
            </>
          ) : (
            <>
              <span className="ln">
                <i className="k">let</i> {box.name} = <i className={box.kind === "string" ? "s" : box.kind === "boolean" ? "k" : "n"}>{box.literal}</i>;
              </span>
              <span className="ln">
                console.log(<i className="k">typeof</i> {box.name}); <i className="c">{`// "${box.type}"`}</i>
              </span>
            </>
          )}
        </pre>
      )}

      <div aria-live="polite">
        {state.result && (
          <div
            key={state.attempts}
            className={`fb ${state.result.ok ? "good" : "bad shake"}`}
          >
            {state.result.message}
            {state.result.ok && box?.kind === "list" && language === "javascript" && (
              <span className="hint"> (arrays are a kind of object in JavaScript)</span>
            )}
          </div>
        )}
      </div>

      {state.shelf.length > 0 && (
        <div className="row variable-box-block__shelf" aria-label="Your boxes">
          {state.shelf.map((item) => (
            <div key={item.name} className="box">
              <span className="big" aria-hidden="true">
                {EMOJI[item.kind]}
              </span>
              <b>{item.literal}</b>
              <small>
                {item.type} {item.name}
              </small>
            </div>
          ))}
        </div>
      )}
    </LearningBlockShell>
  );
}

export default VariableBoxBlock;
