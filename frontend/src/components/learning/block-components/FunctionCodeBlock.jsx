import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import InfoPanel from "../shared/InfoPanel";
import LearningText from "../shared/LearningText";
import {
  FormulaError,
  RuntimeCodeError,
  evaluate,
  formatValue,
  renderTemplate,
} from "../../../lib/functionCode/expression";
import { highlightLine } from "../../../lib/functionCode/highlight";
import { buildConfig } from "../../../lib/functionCode/presets";

/*
 * =========================================================
 * FunctionCode: a reusable code playground
 * =========================================================
 *
 * One block for Code Quest-style playgrounds. data.kind picks
 * a ready-made setup (lib/functionCode/presets.js):
 *
 *   string - string methods ("Try it on your own text")
 *   number - number operators and functions
 *   array  - a list to change ("The toy list")
 *   custom - the teacher's own functions ("Try the machines")
 *
 * data.language = "python" | "javascript"
 *
 * Each kind becomes a set of variables and actions:
 *   variables = [{ name, label, type, default, show, show_for }]
 *     type: text | number | list
 *     show_for: only show the input while these chips are selected
 *   actions   = [{ label, style, effect, target, value,
 *                  code, output, result, message, note }]
 *     style:  chip   -> a live tab (re-runs as inputs change)
 *             button -> runs once when pressed
 *     effect: none | append | prepend | pop | pop_first | remove | set | reset
 *     output: value (Result: 'HELLO') | printed (Printed: HELLO) | none
 *
 * Formulas (value, result, {{ … }}) run in a safe built-in
 * interpreter (lib/functionCode/expression.js), never eval().
 * =========================================================
 */
const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/* "Robot, Teddy, 3" -> ["Robot", "Teddy", 3] */
const parseList = (text) =>
  String(text ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (/^-?\d+(\.\d+)?$/.test(item) ? Number(item) : item));

function startingValues(variables) {
  return Object.fromEntries(
    variables.map((variable) => [
      variable.name,
      variable.type === "list" ? parseList(variable.default) : String(variable.default ?? ""),
    ])
  );
}

/* Input text -> the value formulas see. */
function buildEnv(variables, values, extra = {}) {
  const env = {};
  variables.forEach((variable) => {
    const raw = values[variable.name];
    if (variable.type === "number") {
      const number = Number(String(raw ?? "").trim());
      env[variable.name] = String(raw ?? "").trim() === "" || Number.isNaN(number) ? 0 : number;
    } else {
      env[variable.name] = raw;
    }
  });
  // `last` (the item an action added or removed) defaults to None / null.
  return { last: null, ...env, ...extra };
}

/* What an action shows: code, result, message, note and any error. */
function describeAction(action, baseEnv, language) {
  // Custom functions read their own inputs under the parameter names.
  const env = action.alias
    ? { ...baseEnv, ...Object.fromEntries(Object.entries(action.alias).map(([param, name]) => [param, baseEnv[name]])) }
    : baseEnv;

  const output = {
    code: renderTemplate(action.code, env, language),
    message: action.message ? renderTemplate(action.message, env, language) : "",
    note: action.note ? renderTemplate(action.note, env, language) : "",
  };

  const mode = action.output || "value";
  if (mode !== "none" && String(action.result ?? "").trim()) {
    try {
      const value = evaluate(action.result, env, language);
      output.result = formatValue(value, language, { quote: mode !== "printed" });
      output.resultLabel = mode === "printed" ? "Printed:" : "Result:";
    } catch (error) {
      if (error instanceof RuntimeCodeError) output.error = error.message;
      else output.setup = error.message;
    }
  }

  return output;
}

/* Run a button's effect: returns new values plus what to show. */
function runAction(action, variables, values, language) {
  const effect = action.effect || "none";
  const env = buildEnv(variables, values);

  if (effect === "none") return { values, output: describeAction(action, env, language) };

  if (effect === "reset") {
    const fresh = startingValues(variables);
    return { values: fresh, output: describeAction(action, buildEnv(variables, fresh), language) };
  }

  const target = String(action.target ?? "").trim();
  const variable = variables.find((item) => item.name === target);

  try {
    if (!variable) throw new FormulaError(`"${target || "(empty)"}" is not one of this block's variables.`);

    const isList = variable.type === "list";
    const list = isList ? [...values[target]] : null;
    let last;

    if (["append", "prepend", "remove"].includes(effect) || effect === "set") {
      if (!String(action.value ?? "").trim()) throw new FormulaError(`The "${effect}" action needs a value formula.`);
    }

    if (effect === "set") {
      last = evaluate(action.value, env, language);
      const stored = isList
        ? Array.isArray(last) ? last : [last]
        : formatValue(last, language, { quote: false });
      const nextValues = { ...values, [target]: stored };
      return { values: nextValues, output: describeAction(action, buildEnv(variables, nextValues, { last }), language) };
    }

    if (!isList) throw new FormulaError(`"${effect}" only works on a list variable, and ${target} is ${variable.type}.`);

    if (effect === "append" || effect === "prepend") {
      last = evaluate(action.value, env, language);
      if (effect === "append") list.push(last);
      else list.unshift(last);
    } else if (effect === "pop" || effect === "pop_first") {
      if (list.length === 0) {
        if (language === "python") throw new RuntimeCodeError("IndexError: pop from empty list");
        last = undefined;
      } else {
        last = effect === "pop" ? list.pop() : list.shift();
      }
    } else if (effect === "remove") {
      last = evaluate(action.value, env, language);
      const index = list.findIndex((item) => formatValue(item, language) === formatValue(last, language));
      if (index === -1) {
        if (language === "python") throw new RuntimeCodeError("ValueError: list.remove(x): x not in list");
      } else {
        list.splice(index, 1);
      }
    } else {
      throw new FormulaError(`Unknown effect "${effect}".`);
    }

    const nextValues = { ...values, [target]: list };
    return { values: nextValues, output: describeAction(action, buildEnv(variables, nextValues, { last }), language) };
  } catch (error) {
    // Nothing was added or removed, so {{last}} shows as "…".
    const output = describeAction({ ...action, output: "none", message: "", note: "" }, { ...env, last: "…" }, language);
    if (error instanceof RuntimeCodeError) output.error = error.message;
    else output.setup = error.message;
    return { values, output };
  }
}

/* The dark code panel, one highlighted line per row. */
function CodePanel({ code, language }) {
  if (!String(code ?? "").trim()) return null;

  return (
    <pre className="code function-code-block__code">
      {String(code)
        .replace(/\s+$/, "")
        .split("\n")
        .map((line, lineIndex) => (
          <span key={lineIndex} className="ln">
            {line === ""
              ? " "
              : highlightLine(line, language).map(([text, kind], tokenIndex) =>
                  kind ? (
                    <i key={tokenIndex} className={kind}>
                      {text}
                    </i>
                  ) : (
                    <span key={tokenIndex}>{text}</span>
                  )
                )}
          </span>
        ))}
    </pre>
  );
}

function FunctionCodeBlock({ block }) {
  const data = block?.data || {};
  const language = data.language === "javascript" ? "javascript" : "python";

  // The kind's ready-made setup (lib/functionCode/presets.js).
  const config = buildConfig(data, language);

  const variables = config.variables
    .map((variable) => ({
      ...variable,
      name: String(variable?.name ?? "").trim(),
      type: ["text", "number", "list"].includes(variable?.type) ? variable.type : "text",
    }))
    .filter((variable) => variable.name);

  const actions = config.actions.filter((action) => String(action?.label ?? "").trim());

  const chipIndexes = actions.map((action, index) => (action.style === "button" ? null : index)).filter((index) => index !== null);
  const signature = JSON.stringify([language, config]);

  const fresh = () => ({
    signature,
    values: startingValues(variables),
    chip: chipIndexes[0] ?? null, // selected chip
    snapshot: null, // { index, output } after a button press
  });

  const [state, setState] = useState(fresh);

  // The setup changed (e.g. in the block editor): start again.
  const isStale = state.signature !== signature;
  if (isStale) {
    setState(fresh());
  }

  // Render this pass with the fresh values too: the old state may
  // not have the new kind's variables yet.
  const view = isStale ? fresh() : state;

  // Teacher setup problems worth flagging in the preview.
  const setupWarnings = [];
  const seen = new Set();
  variables.forEach((variable) => {
    if (!NAME_PATTERN.test(variable.name)) setupWarnings.push(`Variable name "${variable.name}" can only use letters, numbers and _.`);
    if (seen.has(variable.name)) setupWarnings.push(`Two variables are called "${variable.name}".`);
    seen.add(variable.name);
  });

  if (actions.length === 0 && variables.length === 0) {
    return (
      <LearningBlockShell title={block?.title} icon={block?.icon} subtitle={data.subtitle} className="function-code-block">
        <p className="hint">
          {data.kind
            ? "Add something to show in the settings panel."
            : "Choose what this block shows (strings, numbers, a list or your own functions) in the settings panel."}
        </p>
      </LearningBlockShell>
    );
  }

  const env = buildEnv(variables, view.values);
  const selectedChip = view.chip !== null ? actions[view.chip] : null;
  const selectedLabel = String(selectedChip?.label ?? "").trim().toLowerCase();

  const isInputVisible = (variable) => {
    if (variable.type === "list" || !isOn(variable.show, true)) return false;
    const showFor = String(variable.show_for ?? "")
      .split(",")
      .map((label) => label.trim().toLowerCase())
      .filter(Boolean);
    return showFor.length === 0 || showFor.includes(selectedLabel);
  };

  const output = view.snapshot
    ? view.snapshot.output
    : selectedChip
      ? describeAction(selectedChip, env, language)
      : null;

  const setValue = (name, value) =>
    setState((current) => ({ ...current, values: { ...current.values, [name]: value } }));

  const selectChip = (index) => {
    const action = actions[index];
    if (action.effect && action.effect !== "none") {
      // A chip with an effect behaves like a button.
      pressButton(index);
      return;
    }
    setState((current) => ({ ...current, chip: index, snapshot: null }));
  };

  const pressButton = (index) =>
    setState((current) => {
      const result = runAction(actions[index], variables, current.values, language);
      return { ...current, values: result.values, snapshot: { index, output: result.output } };
    });

  /*
   * Click-to-edit in the block editor: custom functions map to the
   * "functions" settings. The other kinds are set up in the
   * settings panel instead.
   */
  const chipClass = () => (config.kind === "custom" ? " function-code-block__fn" : "");
  const visualIndex = (action) => (config.kind === "custom" ? action.visualIndex : undefined);

  const chips = actions.map((action, index) => ({ action, index })).filter(({ action }) => action.style !== "button");
  const buttons = actions.map((action, index) => ({ action, index })).filter(({ action }) => action.style === "button");
  const lists = variables.map((variable, index) => ({ variable, index })).filter(({ variable }) => variable.type === "list" && isOn(variable.show, true));
  const inputs = variables.map((variable, index) => ({ variable, index })).filter(({ variable }) => isInputVisible(variable));

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="function-code-block"
    >
      {setupWarnings.length > 0 && (
        <p className="function-code-block__setup">⚠ {setupWarnings.join(" ")}</p>
      )}

      <CodePanel code={renderTemplate(config.introCode, env, language)} language={language} />

      {lists.map(({ variable }) => (
        <div key={variable.name} className="function-code-block__list">
          <span className="function-code-block__list-name">{variable.label || variable.name}</span>
          <div className="row">
            {view.values[variable.name].length > 0 ? (
              view.values[variable.name].map((item, itemIndex) => (
                <div key={itemIndex} className="box">
                  <b>{formatValue(item, language, { quote: false })}</b>
                  <small>index {itemIndex}</small>
                </div>
              ))
            ) : (
              <span className="hint">(empty list)</span>
            )}
          </div>
        </div>
      ))}

      {chips.length > 0 && (
        <div className="chips" role="group" aria-label="Choose an action">
          {chips.map(({ action, index }) => (
            <button
              key={index}
              type="button"
              className={`chip${chipClass()}${view.chip === index && !view.snapshot ? " on" : ""}`}
              aria-pressed={view.chip === index && !view.snapshot}
              data-visual-index={visualIndex(action, index)}
              onClick={() => selectChip(index)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {inputs.length > 0 && (
        <div className="form">
          {inputs.map(({ variable }) => (
            <label key={variable.name}>
              {variable.label || variable.name}
              <input
                type={variable.type === "number" ? "number" : "text"}
                value={view.values[variable.name] ?? ""}
                spellCheck="false"
                autoComplete="off"
                onChange={(event) => setValue(variable.name, event.target.value)}
              />
            </label>
          ))}
        </div>
      )}

      {buttons.length > 0 && (
        <div className="block-button-group function-code-block__buttons">
          {buttons.map(({ action, index }) => (
            <button
              key={index}
              type="button"
              // Same buttons as the other blocks: removing / resetting gets the white style.
              className={`block-button ${["pop", "pop_first", "remove", "reset"].includes(action.effect) ? "block-button--white" : "block-button--primary"}${chipClass()}`}
              data-visual-index={visualIndex(action, index)}
              onClick={() => pressButton(index)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {output && (
        <div className="function-code-block__output" aria-live="polite">
          <CodePanel code={output.code} language={language} />

          {output.setup && <p className="function-code-block__setup">⚠ Setup: {output.setup}</p>}

          {output.error && <div className="fb bad">💥 {output.error}</div>}

          {!output.error && output.message && (
            <div className="fb good">
              <LearningText as="span" text={output.message} />
            </div>
          )}

          {!output.error && (output.result !== undefined || output.note) && (
            <InfoPanel className="function-code-block__result">
              {output.result !== undefined && (
                <>
                  <b>{output.resultLabel}</b> <code className="function-code-block__value">{output.result}</code>
                </>
              )}
              {output.note && (
                <>
                  {output.result !== undefined && <br />}
                  <LearningText as="span" text={output.note} className="hint" />
                </>
              )}
            </InfoPanel>
          )}
        </div>
      )}
    </LearningBlockShell>
  );
}

export default FunctionCodeBlock;
