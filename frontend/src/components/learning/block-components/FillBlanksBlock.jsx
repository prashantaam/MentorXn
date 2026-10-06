import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

/*
 * Fill in the blanks: typed answers checked against accepted answers.
 * Each item uses one of two styles:
 *
 *  mode "inline"   -> blanks inside the sentence:
 *                     text = "Water freezes at {{0|zero}} °C."
 *                     ({{a|b}} = a blank; | separates accepted answers)
 *  mode "question" -> a question with a separate answer box:
 *                     text = "What is the opposite of hot?"
 *                     answers = "cold|freezing"
 *
 * data.items          = [{ mode, text, answers, explanation }]
 * data.case_sensitive = match capital letters exactly (default off)
 * data.show_answer    = offer "Show answer" after a wrong check (default on)
 */
const BLANK = /\{\{([^{}]+?)\}\}/g;

const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

const splitAnswers = (value) =>
  String(value || "")
    .split("|")
    .map((answer) => answer.trim())
    .filter(Boolean);

/* Inline text -> [{ text }, { blank: 0, accepted: [...] }, ...] */
function parseInline(text) {
  const source = String(text || "");
  const parts = [];
  let lastIndex = 0;
  let blankCount = 0;

  for (const match of source.matchAll(BLANK)) {
    if (match.index > lastIndex) {
      parts.push({ text: source.slice(lastIndex, match.index) });
    }
    parts.push({ blank: blankCount, accepted: splitAnswers(match[1]) });
    blankCount += 1;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    parts.push({ text: source.slice(lastIndex) });
  }

  return parts;
}

/* Every item as a list of blanks (a question item has exactly one). */
function describeItem(item) {
  if (item?.mode === "question") {
    return { mode: "question", blanks: [splitAnswers(item.answers)] };
  }

  const parts = parseInline(item?.text);
  return {
    mode: "inline",
    parts,
    blanks: parts.filter((part) => part.blank !== undefined).map((part) => part.accepted),
  };
}

function FillBlanksBlock({ block }) {
  const data = block?.data || {};
  const items = (Array.isArray(data.items) ? data.items : []).filter((item) =>
    String(item?.text ?? "").trim()
  );
  const caseSensitive = isOn(data.case_sensitive, false);
  const offerAnswer = isOn(data.show_answer, true);

  const described = items.map(describeItem);
  const signature = JSON.stringify([items, caseSensitive]);

  /*
   * values[item][blank]  = what the student typed
   * results[item]        = [true/false per blank] after Check
   * revealed[item]       = "Show answer" pressed
   */
  const [state, setState] = useState({ signature, values: {}, results: {}, revealed: {} });

  // The questions changed (e.g. in the block editor): start again.
  if (state.signature !== signature) {
    setState({ signature, values: {}, results: {}, revealed: {} });
  }

  const normalise = (value) => {
    const text = String(value ?? "").trim().replace(/\s+/g, " ");
    return caseSensitive ? text : text.toLowerCase();
  };

  const typed = (itemIndex, blankIndex) => state.values[itemIndex]?.[blankIndex] ?? "";

  const setTyped = (itemIndex, blankIndex, value) =>
    setState((current) => {
      const results = { ...current.results };
      delete results[itemIndex]; // editing clears the marks
      return {
        ...current,
        results,
        values: {
          ...current.values,
          [itemIndex]: { ...current.values[itemIndex], [blankIndex]: value },
        },
      };
    });

  const check = (itemIndex) =>
    setState((current) => {
      const marks = described[itemIndex].blanks.map((accepted, blankIndex) =>
        accepted.some(
          (answer) => normalise(answer) === normalise(current.values[itemIndex]?.[blankIndex])
        )
      );

      return {
        ...current,
        results: { ...current.results, [itemIndex]: marks },
        // A wrong check means this question no longer scores.
        missed: marks.every(Boolean)
          ? current.missed
          : { ...current.missed, [itemIndex]: true },
      };
    });

  const reveal = (itemIndex) =>
    setState((current) => ({ ...current, revealed: { ...current.revealed, [itemIndex]: true } }));

  const tryAgain = () => setState({ signature, values: {}, results: {}, revealed: {} });

  // Every question checked and finished (right, or answer shown).
  const finishedCount = items.filter(
    (_, itemIndex) => state.results[itemIndex]?.every(Boolean) || state.revealed[itemIndex]
  ).length;

  // A point only for questions right on the first check.
  const correctCount = items.filter(
    (_, itemIndex) => state.results[itemIndex]?.every(Boolean) && !state.missed?.[itemIndex]
  ).length;

  const renderInput = (itemIndex, blankIndex, accepted, label, wide) => {
    const marks = state.results[itemIndex];
    const mark = marks ? (marks[blankIndex] ? " is-right" : " is-wrong") : "";
    const longest = Math.max(4, ...accepted.map((answer) => answer.length));

    return (
      <input
        key={`blank-${blankIndex}`}
        type="text"
        className={`fill-blanks-block__input${wide ? " is-wide" : ""}${mark}`}
        style={wide ? undefined : { width: `${longest + 3}ch` }}
        value={typed(itemIndex, blankIndex)}
        aria-label={label}
        aria-invalid={marks ? !marks[blankIndex] : undefined}
        autoComplete="off"
        spellCheck="false"
        onChange={(event) => setTyped(itemIndex, blankIndex, event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            check(itemIndex);
          }
        }}
      />
    );
  };

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="fill-blanks-block"
    >
      {items.length > 0 ? (
        <>
          {items.map((item, itemIndex) => {
            const info = described[itemIndex];
            const marks = state.results[itemIndex];
            const allRight = marks?.every(Boolean);
            const allFilled = info.blanks.every((_, blankIndex) => typed(itemIndex, blankIndex).trim());
            const number = items.length > 1 ? `${itemIndex + 1}. ` : "";

            return (
              <div key={itemIndex} className="fill-blanks-block__item" data-visual-index={itemIndex}>
                {info.mode === "question" ? (
                  <>
                    <p className="fill-blanks-block__question">
                      {number}
                      <LearningText as="span" text={item.text} />
                    </p>
                    {renderInput(itemIndex, 0, info.blanks[0], `Answer to question ${itemIndex + 1}`, true)}
                  </>
                ) : (
                  <p className="fill-blanks-block__sentence">
                    {number}
                    {info.parts.map((part, partIndex) =>
                      part.text !== undefined ? (
                        <LearningText key={`text-${partIndex}`} as="span" text={part.text} />
                      ) : (
                        renderInput(itemIndex, part.blank, part.accepted, `Blank ${part.blank + 1}`, false)
                      )
                    )}
                  </p>
                )}

                <div className="row">
                  <button
                    type="button"
                    className="btn sm"
                    disabled={!allFilled || allRight}
                    onClick={() => check(itemIndex)}
                  >
                    ✅ Check
                  </button>

                  {offerAnswer && marks && !allRight && !state.revealed[itemIndex] && (
                    <button type="button" className="btn sm ghost" onClick={() => reveal(itemIndex)}>
                      👀 Show answer
                    </button>
                  )}
                </div>

                <div aria-live="polite">
                  {marks && (
                    <div className={`fb ${allRight ? "good" : "warn"}`}>
                      {allRight
                        ? "🎉 Correct!"
                        : info.blanks.length > 1
                          ? "Not quite — fix the red boxes and check again."
                          : "Not quite — try again."}
                      {allRight && item.explanation && (
                        <>
                          {" "}
                          <LearningText as="span" text={item.explanation} />
                        </>
                      )}
                    </div>
                  )}

                  {state.revealed[itemIndex] && !allRight && (
                    <div className="panel fill-blanks-block__answer">
                      <b>Answer:</b>{" "}
                      {info.blanks.map((accepted) => accepted[0] || "—").join(", ")}
                      {item.explanation && (
                        <>
                          {" — "}
                          <LearningText as="span" text={item.explanation} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {items.length > 1 && finishedCount === items.length && (
            <div className="row fill-blanks-block__summary">
              <b>
                Score: {correctCount} / {items.length}
              </b>
              <button type="button" className="btn sm ghost" onClick={tryAgain}>
                ↺ Start over
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="hint">Add questions in the settings panel.</p>
      )}
    </LearningBlockShell>
  );
}

export default FillBlanksBlock;
