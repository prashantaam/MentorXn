import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

/*
 * Word bank (cloze fill-in): a sentence with blanks plus a bank of
 * word chips (including a distractor or two). Tap a word to drop it
 * into the next blank; tap a filled blank to send its word back.
 *
 * data.sentence          = "The {{cat}} sat on the {{mat}}."  ({{word}} = a blank)
 * data.distractors       = "dog, hat"  (extra wrong words, comma separated)
 * data.shuffle_bank      = shuffle the word chips (default on)
 * data.correct_message   / data.incorrect_message
 */
const BLANK = /\{\{([^{}]+?)\}\}/g;

const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

const sameWord = (a, b) =>
  String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();

const shuffled = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/* "The {{cat}} sat." -> [{ text: "The " }, { blank: 0, answer: "cat" }, { text: " sat." }] */
function parseSentence(sentence) {
  const source = String(sentence || "");
  const parts = [];
  let lastIndex = 0;
  let blankCount = 0;

  for (const match of source.matchAll(BLANK)) {
    if (match.index > lastIndex) {
      parts.push({ text: source.slice(lastIndex, match.index) });
    }
    parts.push({ blank: blankCount, answer: match[1].trim() });
    blankCount += 1;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    parts.push({ text: source.slice(lastIndex) });
  }

  return parts;
}

/* A fresh attempt: new chip order, every blank empty. */
function newAttempt(chips, blankCount, shuffle, signature) {
  const ids = chips.map((_, index) => index);

  return {
    signature,
    bankOrder: shuffle ? shuffled(ids) : ids,
    filled: Array(blankCount).fill(null), // chip index per blank
    checked: false,
  };
}

function WordBankBlock({ block }) {
  const data = block?.data || {};
  const parts = parseSentence(data.sentence);
  const answers = parts.filter((part) => part.blank !== undefined).map((part) => part.answer);
  const distractors = String(data.distractors || "")
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);
  const chips = [...answers, ...distractors];
  const shuffle = isOn(data.shuffle_bank, true);
  const signature = JSON.stringify([chips, shuffle]);

  const [attempt, setAttempt] = useState(() => newAttempt(chips, answers.length, shuffle, signature));

  // The sentence or words changed (e.g. in the block editor): start again.
  if (attempt.signature !== signature) {
    setAttempt(newAttempt(chips, answers.length, shuffle, signature));
  }

  const used = new Set(attempt.filled.filter((chip) => chip !== null));
  const allFilled = answers.length > 0 && attempt.filled.every((chip) => chip !== null);
  const isCorrect = (blank) => sameWord(chips[attempt.filled[blank]], answers[blank]);
  const allCorrect = allFilled && answers.every((_, blank) => isCorrect(blank));

  const placeChip = (chip) =>
    setAttempt((current) => {
      const slot = current.filled.indexOf(null);
      if (slot === -1 || current.filled.includes(chip)) return current;

      const filled = [...current.filled];
      filled[slot] = chip;
      return { ...current, filled, checked: false };
    });

  const clearBlank = (blank) =>
    setAttempt((current) => {
      if (current.filled[blank] === null) return current;

      const filled = [...current.filled];
      filled[blank] = null;
      return { ...current, filled, checked: false };
    });

  const check = () => setAttempt((current) => ({ ...current, checked: true }));
  const reset = () => setAttempt(newAttempt(chips, answers.length, shuffle, signature));

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="word-bank-block"
    >
      {answers.length > 0 ? (
        <>
          <p className="word-bank-block__sentence">
            {parts.map((part, index) => {
              if (part.text !== undefined) {
                return <LearningText key={index} as="span" text={part.text} />;
              }

              const chip = attempt.filled[part.blank];
              const state = attempt.checked && chip !== null ? (isCorrect(part.blank) ? " good" : " bad") : "";

              return (
                <button
                  key={index}
                  type="button"
                  className={`tag word-bank-block__blank${chip === null ? " is-empty" : ""}${state}`}
                  aria-label={
                    chip === null
                      ? `Blank ${part.blank + 1}, empty`
                      : `Blank ${part.blank + 1}: ${chips[chip]}. Tap to send it back`
                  }
                  onClick={() => clearBlank(part.blank)}
                >
                  {chip === null ? "____" : chips[chip]}
                </button>
              );
            })}
          </p>

          <div className="chips word-bank-block__bank" role="group" aria-label="Word bank">
            {attempt.bankOrder.map((chip) => (
              <button
                key={chip}
                type="button"
                className={`chip${used.has(chip) ? " on" : ""}`}
                disabled={used.has(chip) || allFilled}
                onClick={() => placeChip(chip)}
              >
                {chips[chip]}
              </button>
            ))}
          </div>

          <div className="row">
            <button type="button" className="btn sm ghost" onClick={reset}>
              ↺ Reset
            </button>
            <button type="button" className="btn sm" disabled={!allFilled} onClick={check}>
              ✅ Check
            </button>
          </div>

          <div aria-live="polite">
            {attempt.checked && (
              <div className={`fb ${allCorrect ? "good" : "warn"}`}>
                <LearningText
                  as="span"
                  text={
                    allCorrect
                      ? data.correct_message || "🎉 Correct!"
                      : data.incorrect_message ||
                        "Not quite — tap a red word to send it back, then try again."
                  }
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="hint">Add a sentence with {"{{blanks}}"} in the settings panel.</p>
      )}
    </LearningBlockShell>
  );
}

export default WordBankBlock;
