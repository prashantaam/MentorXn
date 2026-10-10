import { useId, useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import InfoPanel from "../shared/InfoPanel";
import LearningText from "../shared/LearningText";

/*
 * Try it yourself (Word Quest's "✍️ Try it yourself"): a sentence
 * built from parts, each with an answer control in it.
 *
 * data.parts = [{
 *   before:  text before the control  ("While I ___ (cook) dinner")
 *   control: "dropdown" | "input" | "radio" | "checkbox"
 *   options: one per line, * in front of each correct one
 *            (dropdown/radio: one correct; checkbox: any number)
 *   answers: accepted answers for "input", separated by |
 *   after:   text after the control   (",")
 * }]
 * data.check_mode = "live" (feedback as soon as every part is
 *                   answered, like Word Quest) | "button" (Check)
 * data.dark_box   = the sentence in a black box
 * data.correct_message / data.incorrect_message
 */

const CONTROLS = ["dropdown", "input", "radio", "checkbox"];

const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

const normalise = (value) => String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();

/* "cooked\n*was cooking" -> [{ label: "cooked", correct: false }, { label: "was cooking", correct: true }] */
function parseOptions(text) {
  return String(text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line.startsWith("*")
        ? { label: line.slice(1).trim(), correct: true }
        : { label: line, correct: false }
    )
    .filter((option) => option.label);
}

function buildPart(raw) {
  const control = CONTROLS.includes(raw?.control) ? raw.control : "dropdown";

  return {
    control,
    before: String(raw?.before ?? ""),
    after: String(raw?.after ?? ""),
    options: control === "input" ? [] : parseOptions(raw?.options),
    answers: String(raw?.answers ?? "")
      .split("|")
      .map((answer) => answer.trim())
      .filter(Boolean),
  };
}

const emptyValue = (part) => (part.control === "checkbox" ? [] : part.control === "input" ? "" : null);

function isAnswered(part, value) {
  if (part.control === "checkbox") return value.length > 0;
  if (part.control === "input") return value.trim() !== "";
  return value !== null;
}

function isRight(part, value) {
  if (part.control === "input") return part.answers.some((answer) => normalise(answer) === normalise(value));
  if (part.control === "checkbox") {
    const wanted = part.options.map((option, index) => (option.correct ? index : null)).filter((i) => i !== null);
    return wanted.length === value.length && wanted.every((index) => value.includes(index));
  }
  return value !== null && Boolean(part.options[value]?.correct);
}

function TryItYourselfBlock({ block }) {
  const data = block?.data || {};
  const idPrefix = useId();

  const parts = (Array.isArray(data.parts) ? data.parts : [])
    .map(buildPart)
    .filter((part) => part.before.trim() || part.after.trim() || part.options.length || part.control === "input");

  const darkBox = isOn(data.dark_box, false);
  const liveCheck = data.check_mode !== "button";
  const signature = JSON.stringify(parts);

  const fresh = () => ({ signature, values: parts.map(emptyValue), checked: false });
  const [state, setState] = useState(fresh);
  const isStale = state.signature !== signature;

  // The parts changed (e.g. in the block editor): start again.
  if (isStale) {
    setState(fresh());
  }

  const view = isStale ? fresh() : state;
  const allAnswered = parts.length > 0 && parts.every((part, index) => isAnswered(part, view.values[index]));
  const showResult = liveCheck ? allAnswered : view.checked;
  const allRight = allAnswered && parts.every((part, index) => isRight(part, view.values[index]));
  const anyAnswered = parts.some((part, index) => isAnswered(part, view.values[index]));

  const setValue = (partIndex, value) =>
    setState((current) => ({
      ...current,
      checked: false,
      values: current.values.map((old, index) => (index === partIndex ? value : old)),
    }));

  const toggleCheckbox = (partIndex, optionIndex) =>
    setState((current) => {
      const old = current.values[partIndex] ?? [];
      const next = old.includes(optionIndex) ? old.filter((i) => i !== optionIndex) : [...old, optionIndex];
      return {
        ...current,
        checked: false,
        values: current.values.map((value, index) => (index === partIndex ? next : value)),
      };
    });

  const check = () => setState((current) => ({ ...current, checked: true }));
  const reset = () => setState(fresh());

  const renderControl = (part, partIndex) => {
    const value = view.values[partIndex];
    const mark = showResult ? (isRight(part, value) ? " is-right" : " is-wrong") : "";
    const name = `${idPrefix}-part-${partIndex}`;

    if (part.control === "input") {
      return (
        <input
          type="text"
          className={`try-it-block__input${mark}`}
          value={value}
          autoComplete="off"
          spellCheck={false}
          aria-label={`Answer ${partIndex + 1}`}
          style={{ width: `${Math.max(10, ...part.answers.map((answer) => answer.length)) + 5}ch` }}
          onChange={(event) => setValue(partIndex, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !liveCheck && allAnswered) check();
          }}
        />
      );
    }

    if (part.control === "dropdown") {
      return (
        <select
          className={`try-it-block__select${mark}`}
          value={value === null ? "" : String(value)}
          aria-label={`Answer ${partIndex + 1}`}
          onChange={(event) => setValue(partIndex, event.target.value === "" ? null : Number(event.target.value))}
        >
          <option value="">— choose —</option>
          {part.options.map((option, index) => (
            <option key={index} value={index}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    // Radio buttons (one answer) or checkboxes (any number).
    const isRadio = part.control === "radio";

    return (
      <span
        className={`try-it-block__choices${mark}`}
        role={isRadio ? "radiogroup" : "group"}
        aria-label={`Answer ${partIndex + 1}`}
      >
        {part.options.map((option, index) => {
          const isChecked = isRadio ? value === index : value.includes(index);

          return (
            <label key={index} className={`try-it-block__choice${isChecked ? " is-checked" : ""}`}>
              <input
                type={isRadio ? "radio" : "checkbox"}
                name={name}
                checked={isChecked}
                onChange={() => (isRadio ? setValue(partIndex, index) : toggleCheckbox(partIndex, index))}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </span>
    );
  };

  if (parts.length === 0) {
    return (
      <LearningBlockShell title={block?.title} icon={block?.icon} subtitle={data.subtitle} className="try-it-block">
        <p className="hint">Add the parts of the sentence in the settings panel.</p>
      </LearningBlockShell>
    );
  }

  return (
    <LearningBlockShell title={block?.title} icon={block?.icon} subtitle={data.subtitle} className="try-it-block">
      <div className={`try-it-block__sentence${darkBox ? " code try-it-block__sentence--dark" : ""}`}>
        {parts.map((part, index) => (
          <span key={index} className="try-it-block__part" data-visual-index={index}>
            {part.before.trim() && <LearningText as="span" text={part.before} className="try-it-block__text" />}
            {renderControl(part, index)}
            {part.after.trim() && <LearningText as="span" text={part.after} className="try-it-block__text" />}
          </span>
        ))}
      </div>

      {!liveCheck && (
        <div className="row try-it-block__actions">
          <button type="button" className="btn sm" disabled={!allAnswered || allRight} onClick={check}>
            ✅ Check
          </button>
          {anyAnswered && (
            <button type="button" className="btn sm ghost" onClick={reset}>
              ↺ Reset
            </button>
          )}
        </div>
      )}

      <div aria-live="polite">
        {showResult ? (
          <InfoPanel
            className={`try-it-block__result ${allRight ? "is-right" : "is-wrong"}`}
            text={
              allRight
                ? data.correct_message || "✅ Correct!"
                : data.incorrect_message || "Not quite — change the red answers and try again."
            }
          />
        ) : (
          liveCheck && (
            <InfoPanel className="try-it-block__result">
              <span className="hint">
                {anyAnswered ? "Answer every part to see if you're right." : "👆 Make your choices above."}
              </span>
            </InfoPanel>
          )
        )}
      </div>

      {liveCheck && anyAnswered && (
        <div className="row try-it-block__actions">
          <button type="button" className="btn sm ghost" onClick={reset}>
            ↺ Reset
          </button>
        </div>
      )}
    </LearningBlockShell>
  );
}

export default TryItYourselfBlock;
