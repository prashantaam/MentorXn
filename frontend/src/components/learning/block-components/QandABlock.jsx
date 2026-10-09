import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import InfoPanel from "../shared/InfoPanel";
import LearningText from "../shared/LearningText";

/*
 * Q&A (was "Fill in the blanks"): questions with an answer box.
 * Typed answers are checked against one or more accepted answers.
 * Blanks inside a sentence now live in the "Fill the blank" block.
 *
 * data.items          = [{ text: "What is the opposite of hot?", answers: "cold|freezing", explanation }]
 * data.case_sensitive = match capital letters exactly (default off)
 * data.show_answer    = offer "Show answer" after a wrong check (default on)
 */
const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

const splitAnswers = (value) =>
  String(value || "")
    .split("|")
    .map((answer) => answer.trim())
    .filter(Boolean);

function QandABlock({ block }) {
  const data = block?.data || {};
  const items = (Array.isArray(data.items) ? data.items : []).filter((item) =>
    String(item?.text ?? "").trim()
  );
  const caseSensitive = isOn(data.case_sensitive, false);
  const offerAnswer = isOn(data.show_answer, true);

  const accepted = items.map((item) => splitAnswers(item.answers));
  const signature = JSON.stringify([items, caseSensitive]);

  /*
   * values[item]   = what the student typed
   * results[item]  = true / false after Check
   * missed[item]   = had a wrong check (no point for it)
   * revealed[item] = "Show answer" pressed
   */
  const fresh = () => ({ signature, values: {}, results: {}, missed: {}, revealed: {} });
  const [state, setState] = useState(fresh);

  // The questions changed (e.g. in the block editor): start again.
  if (state.signature !== signature) {
    setState(fresh());
  }

  const normalise = (value) => {
    const text = String(value ?? "").trim().replace(/\s+/g, " ");
    return caseSensitive ? text : text.toLowerCase();
  };

  const typed = (itemIndex) => state.values[itemIndex] ?? "";

  const setTyped = (itemIndex, value) =>
    setState((current) => {
      const results = { ...current.results };
      delete results[itemIndex]; // editing clears the mark
      return { ...current, results, values: { ...current.values, [itemIndex]: value } };
    });

  const check = (itemIndex) =>
    setState((current) => {
      const right = accepted[itemIndex].some(
        (answer) => normalise(answer) === normalise(current.values[itemIndex])
      );

      return {
        ...current,
        results: { ...current.results, [itemIndex]: right },
        // A wrong check means this question no longer scores.
        missed: right ? current.missed : { ...current.missed, [itemIndex]: true },
      };
    });

  const reveal = (itemIndex) =>
    setState((current) => ({ ...current, revealed: { ...current.revealed, [itemIndex]: true } }));

  const startOver = () => setState(fresh());

  // Every question finished (right, or answer shown).
  const finishedCount = items.filter(
    (_, itemIndex) => state.results[itemIndex] === true || state.revealed[itemIndex]
  ).length;

  // A point only for questions right on the first check.
  const correctCount = items.filter(
    (_, itemIndex) => state.results[itemIndex] === true && !state.missed[itemIndex]
  ).length;

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="q-and-a-block"
    >
      {items.length > 0 ? (
        <>
          {items.map((item, itemIndex) => {
            const result = state.results[itemIndex];
            const checked = result !== undefined;
            const isRight = result === true;
            const mark = checked ? (isRight ? " is-right" : " is-wrong") : "";

            return (
              <div key={itemIndex} className="q-and-a-block__item" data-visual-index={itemIndex}>
                <p className="q-and-a-block__question">
                  {items.length > 1 && `${itemIndex + 1}. `}
                  <LearningText as="span" text={item.text} />
                </p>

                <input
                  type="text"
                  className={`q-and-a-block__input${mark}`}
                  value={typed(itemIndex)}
                  placeholder="Type your answer…"
                  aria-label={`Answer to question ${itemIndex + 1}`}
                  aria-invalid={checked ? !isRight : undefined}
                  autoComplete="off"
                  spellCheck="false"
                  onChange={(event) => setTyped(itemIndex, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && typed(itemIndex).trim() && !isRight) {
                      event.preventDefault();
                      check(itemIndex);
                    }
                  }}
                />

                <div className="row">
                  <button
                    type="button"
                    className="btn sm"
                    disabled={!typed(itemIndex).trim() || isRight}
                    onClick={() => check(itemIndex)}
                  >
                    ✅ Check
                  </button>

                  {offerAnswer && checked && !isRight && !state.revealed[itemIndex] && (
                    <button type="button" className="btn sm ghost" onClick={() => reveal(itemIndex)}>
                      👀 Show answer
                    </button>
                  )}
                </div>

                <div aria-live="polite">
                  {checked && (
                    <div className={`fb ${isRight ? "good" : "warn"}`}>
                      {isRight ? "🎉 Correct!" : "Not quite — try again."}
                      {isRight && item.explanation && (
                        <>
                          {" "}
                          <LearningText as="span" text={item.explanation} />
                        </>
                      )}
                    </div>
                  )}

                  {state.revealed[itemIndex] && !isRight && (
                    <InfoPanel className="q-and-a-block__answer">
                      <b>Answer:</b> {accepted[itemIndex][0] || "—"}
                      {item.explanation && (
                        <>
                          {" — "}
                          <LearningText as="span" text={item.explanation} />
                        </>
                      )}
                    </InfoPanel>
                  )}
                </div>
              </div>
            );
          })}

          {items.length > 1 && finishedCount === items.length && (
            <div className="row q-and-a-block__summary">
              <b>
                Score: {correctCount} / {items.length}
              </b>
              <button type="button" className="btn sm ghost" onClick={startOver}>
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

export default QandABlock;
