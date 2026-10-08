import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

/*
 * Build a sentence (from Word Quest): one row of word choices per
 * part of the sentence (Subject, Verb, Object, ...). Students pick
 * one chip per row and watch the sentence build, each part in its
 * own colour so the pattern (e.g. Subject → Verb → Object) shows.
 *
 * Fixes and additions over Word Quest's version:
 * - every row is labelled with its part, in that part's colour
 *   (Word Quest's rows had no labels and every word was the same
 *   yellow, so the colours taught nothing);
 * - any number of parts, and parts can be optional ("leave out");
 * - the first letter is capitalised and the ending is configurable;
 * - a breakdown says what each part does;
 * - 🎲 Surprise me;
 * - Challenge mode: build the sentence a prompt asks for, then
 *   Check. Wrong parts are marked, so silly combinations like
 *   "The cat cooked a beautiful picture" get caught.
 *
 * data.parts      = [{ label, description, options (one per line), optional }]
 * data.mode       = "explore" | "challenge"
 * data.challenges = [{ prompt, answer (the full sentence), why }]
 * data.ending     = "." | "!" | "?" | "none"
 */
const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

const ROLE_COUNT = 6;

const toLines = (value) =>
  String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/* For comparing: lower case, no punctuation (apostrophes kept) and no spaces. */
const squash = (text) =>
  String(text ?? "")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\p{L}\p{N}']/gu, "");

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/*
 * Which option of each part builds the answer sentence?
 * Returns [optionIndex | null (left out), ...] or null if the
 * answer can't be built from the choices.
 */
function solve(parts, answer) {
  const target = squash(answer);
  if (!target) return null;

  const walk = (partIndex, rest) => {
    if (partIndex === parts.length) return rest === "" ? [] : null;

    const part = parts[partIndex];
    for (let optionIndex = 0; optionIndex < part.options.length; optionIndex += 1) {
      const piece = squash(part.options[optionIndex]);
      if (piece && rest.startsWith(piece)) {
        const tail = walk(partIndex + 1, rest.slice(piece.length));
        if (tail) return [optionIndex, ...tail];
      }
    }
    if (part.optional) {
      const tail = walk(partIndex + 1, rest);
      if (tail) return [null, ...tail];
    }
    return null;
  };

  return walk(0, target);
}

function BuildSentenceBlock({ block }) {
  const data = block?.data || {};

  const parts = (Array.isArray(data.parts) ? data.parts : [])
    .map((part) => ({
      label: String(part?.label ?? "").trim(),
      description: String(part?.description ?? "").trim(),
      options: toLines(part?.options),
      optional: isOn(part?.optional, false),
    }))
    .filter((part) => part.options.length > 0);

  const challenges = (Array.isArray(data.challenges) ? data.challenges : [])
    .map((challenge, index) => ({
      index,
      prompt: String(challenge?.prompt ?? "").trim(),
      answer: String(challenge?.answer ?? "").trim(),
      why: String(challenge?.why ?? "").trim(),
    }))
    .filter((challenge) => challenge.prompt || challenge.answer);

  const isChallenge = data.mode === "challenge" && challenges.length > 0;
  const ending = data.ending === "none" ? "" : ["!", "?"].includes(data.ending) ? data.ending : ".";
  const shouldCapitalise = isOn(data.capitalize, true);
  const showPattern = isOn(data.show_pattern, true);
  const showBreakdown = isOn(data.show_breakdown, true);
  const showRandom = isOn(data.show_random, true);

  const signature = JSON.stringify([parts, challenges, isChallenge]);

  // Explore starts with the first choice of every row; a challenge starts empty.
  const startPicks = (challenge) => parts.map(() => (challenge ? undefined : 0));

  const fresh = () => ({
    signature,
    picks: startPicks(isChallenge),
    round: 0,
    result: null, // after Check: [true | false per part]
    tries: 0,
    firstTry: 0,
    finished: false,
  });

  const [state, setState] = useState(fresh);
  const isStale = state.signature !== signature;

  // Settings changed (e.g. in the block editor): start again.
  if (isStale) {
    setState(fresh());
  }

  const view = isStale ? fresh() : state;
  const challenge = isChallenge ? challenges[Math.min(view.round, challenges.length - 1)] : null;
  const expected = challenge ? solve(parts, challenge.answer) : null;
  const solved = Boolean(view.result && view.result.every(Boolean));

  /* The parts that are in the sentence, in order. */
  const chosen = parts
    .map((part, index) => ({ part, index, pick: view.picks[index] }))
    .filter((item) => item.pick !== undefined && item.pick !== null);

  const allPicked = parts.every((part, index) => view.picks[index] !== undefined);

  const words = chosen.map((item) => item.part.options[item.pick]);
  const lastWord = words[words.length - 1] ?? "";
  const needsEnding = ending && !/[.!?]$/.test(lastWord);

  const pick = (partIndex, optionIndex) =>
    setState((current) => ({
      ...current,
      picks: current.picks.map((value, index) => (index === partIndex ? optionIndex : value)),
      // Changing a word after Check clears the marks (but not once solved).
      result: current.result && !current.result.every(Boolean) ? null : current.result,
    }));

  const surprise = () =>
    setState((current) => ({
      ...current,
      picks: parts.map((part) => {
        const count = part.options.length + (part.optional ? 1 : 0);
        const choice = Math.floor(Math.random() * count);
        return choice === part.options.length ? null : choice;
      }),
    }));

  const check = () => {
    if (!expected) return;
    setState((current) => {
      const result = parts.map((part, index) => (current.picks[index] ?? null) === expected[index]);
      const right = result.every(Boolean);
      return {
        ...current,
        result,
        tries: current.tries + 1,
        firstTry: current.firstTry + (right && current.tries === 0 ? 1 : 0),
      };
    });
  };

  const next = () =>
    setState((current) => {
      const isLast = current.round >= challenges.length - 1;
      return isLast
        ? { ...current, finished: true }
        : { ...current, round: current.round + 1, picks: startPicks(true), result: null, tries: 0 };
    });

  const restart = () => setState(fresh());

  const roleOf = (index) => `build-sentence-block__role--${index % ROLE_COUNT}`;
  const wrongCount = view.result ? view.result.filter((ok) => !ok).length : 0;

  if (parts.length === 0) {
    return (
      <LearningBlockShell title={block?.title} icon={block?.icon} subtitle={data.subtitle} className="build-sentence-block">
        <p className="hint">Add the parts of the sentence (and their word choices) in the settings panel.</p>
      </LearningBlockShell>
    );
  }

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="build-sentence-block"
    >
      {/* ---------- challenge prompt ---------- */}
      {challenge && !view.finished && (
        <div className="build-sentence-block__challenge" data-visual-index={challenge.index}>
          <span className="tag">
            Challenge {view.round + 1} of {challenges.length}
          </span>
          {challenge.prompt && <LearningText as="p" text={challenge.prompt} />}
          {!expected && (
            <p className="build-sentence-block__warning">
              ⚠️ This challenge&apos;s answer can&apos;t be built from the word choices — check its spelling in the settings.
            </p>
          )}
        </div>
      )}

      {view.finished ? (
        <div className="build-sentence-block__done" aria-live="polite">
          <div className="big">🏆</div>
          <p>
            All {challenges.length} sentences built! First-try score: <b>{view.firstTry} / {challenges.length}</b>
          </p>
          <button type="button" className="block-button block-button--primary" onClick={restart}>
            ↺ Start again
          </button>
        </div>
      ) : (
        <>
          {/* ---------- one row of chips per part ---------- */}
          <div className="build-sentence-block__parts">
            {parts.map((part, partIndex) => {
              const label = part.label || `Part ${partIndex + 1}`;
              const mark = view.result ? (view.result[partIndex] ? "is-right" : "is-wrong") : "";

              return (
                <div
                  key={partIndex}
                  className={`build-sentence-block__part ${roleOf(partIndex)} ${mark}`}
                  data-visual-index={partIndex}
                >
                  <span className="build-sentence-block__label">
                    {label}
                    {part.optional && <small> (optional)</small>}
                  </span>

                  <div className="chips" role="radiogroup" aria-label={label}>
                    {part.options.map((option, optionIndex) => {
                      const isOnChip = view.picks[partIndex] === optionIndex;
                      return (
                        <button
                          key={optionIndex}
                          type="button"
                          role="radio"
                          aria-checked={isOnChip}
                          className={`chip${isOnChip ? " on" : ""}`}
                          disabled={solved}
                          onClick={() => pick(partIndex, optionIndex)}
                        >
                          {option}
                        </button>
                      );
                    })}

                    {part.optional && (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={view.picks[partIndex] === null}
                        className={`chip build-sentence-block__none${view.picks[partIndex] === null ? " on" : ""}`}
                        disabled={solved}
                        onClick={() => pick(partIndex, null)}
                      >
                        — leave out
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---------- the sentence ---------- */}
          <div className="panel build-sentence-block__output" aria-live="polite">
            {showPattern && chosen.length > 0 && (
              <div className="build-sentence-block__pattern" aria-label="Pattern">
                {chosen.map((item, index) => (
                  <span key={item.index} className="build-sentence-block__pattern-step">
                    {index > 0 && <span aria-hidden="true">→</span>}
                    <span className={`build-sentence-block__badge ${roleOf(item.index)}`}>
                      {item.part.label || `Part ${item.index + 1}`}
                    </span>
                  </span>
                ))}
              </div>
            )}

            <p className="code build-sentence-block__sentence">
              {chosen.length === 0 ? (
                <span className="build-sentence-block__placeholder">Pick a word from each row…</span>
              ) : (
                <>
                  {chosen.map((item, index) => {
                    const word = words[index];
                    const text = index === 0 && shouldCapitalise ? capitalise(word) : word;
                    const glue = index > 0 && !/^[,.;:!?'’]/.test(word) ? " " : "";
                    return (
                      <span key={item.index}>
                        {glue}
                        <b className={`build-sentence-block__word ${roleOf(item.index)}`}>{text}</b>
                      </span>
                    );
                  })}
                  {needsEnding && ending}
                </>
              )}
            </p>

            {showBreakdown && chosen.length > 0 && (
              <ul className="build-sentence-block__breakdown">
                {chosen.map((item) => (
                  <li key={item.index}>
                    <span className={`build-sentence-block__badge ${roleOf(item.index)}`}>
                      {item.part.label || `Part ${item.index + 1}`}
                    </span>
                    <b>{item.part.options[item.pick]}</b>
                    {item.part.description && (
                      <span className="build-sentence-block__description"> — {item.part.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {data.hint && !isChallenge && (
              <LearningText as="p" className="hint build-sentence-block__hint" text={data.hint} />
            )}
          </div>

          {/* ---------- feedback (challenge) ---------- */}
          {challenge && view.result && (
            <div className={`fb ${solved ? "good" : "warn"}`} aria-live="polite">
              {solved ? (
                <>
                  🎉 That&apos;s it!
                  {challenge.why && (
                    <>
                      {" "}
                      <LearningText as="span" text={challenge.why} />
                    </>
                  )}
                </>
              ) : (
                `Not quite — ${wrongCount} ${wrongCount === 1 ? "part needs" : "parts need"} changing. The red ${
                  wrongCount === 1 ? "row is" : "rows are"
                } wrong.`
              )}
            </div>
          )}

          {/* ---------- buttons ---------- */}
          <div className="build-sentence-block__actions">
            {isChallenge ? (
              solved ? (
                <button type="button" className="block-button block-button--primary" onClick={next}>
                  {view.round >= challenges.length - 1 ? "🏁 Finish" : "Next challenge ▶"}
                </button>
              ) : (
                <button
                  type="button"
                  className="block-button block-button--primary"
                  disabled={!allPicked || !expected}
                  onClick={check}
                >
                  ✔ Check
                </button>
              )
            ) : (
              showRandom && (
                <button type="button" className="block-button block-button--white" onClick={surprise}>
                  🎲 Surprise me
                </button>
              )
            )}
          </div>
        </>
      )}
    </LearningBlockShell>
  );
}

export default BuildSentenceBlock;
