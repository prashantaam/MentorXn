import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

/*
 * Progressive hint ladder: instead of showing everything at once,
 * each "Give me a hint" reveals ONE more, increasingly specific hint
 * — preserving some challenge.
 *
 * data.question = the question
 * data.hints    = [{ text }]  (least to most specific)
 * data.answer   = optional; revealed after the last hint
 */
function HintLadderBlock({ block }) {
  const data = block?.data || {};
  const hints = (Array.isArray(data.hints) ? data.hints : []).filter((hint) =>
    String(hint?.text ?? "").trim()
  );
  const answer = String(data.answer ?? "").trim();
  const signature = JSON.stringify([hints, answer]);

  const [progress, setProgress] = useState({ signature, shown: 0, answerShown: false });

  // The hints changed (e.g. in the block editor): hide them again.
  if (progress.signature !== signature) {
    setProgress({ signature, shown: 0, answerShown: false });
  }

  const { shown, answerShown } = progress;
  const allHintsShown = shown >= hints.length;

  const nextHint = () =>
    setProgress((current) => ({ ...current, shown: Math.min(hints.length, current.shown + 1) }));

  const revealAnswer = () => setProgress((current) => ({ ...current, answerShown: true }));

  const reset = () => setProgress({ signature, shown: 0, answerShown: false });

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="hint-ladder-block"
    >
      {data.question && (
        <p className="hint-ladder-block__question">
          <LearningText as="b" text={data.question} />
        </p>
      )}

      {hints.length > 0 ? (
        <>
          {/* The ladder: one rung per hint, filled in as hints are revealed. */}
          <div className="hint-ladder-block__rungs" aria-hidden="true">
            {hints.map((_, index) => (
              <span key={index} className={index < shown ? "is-used" : ""} />
            ))}
          </div>

          <ol className="hint-ladder-block__hints" aria-live="polite">
            {hints.slice(0, shown).map((hint, index) => (
              <li key={index} className="panel hint-ladder-block__hint" data-visual-index={index}>
                <b>Hint {index + 1}:</b> <LearningText as="span" text={hint.text} />
              </li>
            ))}
          </ol>

          <div aria-live="polite">
            {answerShown && answer && (
              <div className="fb good hint-ladder-block__answer">
                ✅ <b>Answer:</b> <LearningText as="span" text={answer} />
              </div>
            )}
          </div>

          <div className="row">
            {!allHintsShown ? (
              <button type="button" className="btn sm" onClick={nextHint}>
                💡 {shown === 0 ? "Give me a hint" : "Give me another hint"}
              </button>
            ) : (
              answer &&
              !answerShown && (
                <button type="button" className="btn sm" onClick={revealAnswer}>
                  ✅ Show the answer
                </button>
              )
            )}

            {shown > 0 && (
              <button type="button" className="btn sm ghost" onClick={reset}>
                ↺ Hide hints
              </button>
            )}

            <span className="hint hint-ladder-block__count">
              {shown} / {hints.length} hints used
            </span>
          </div>
        </>
      ) : (
        <p className="hint">Add hints in the settings panel.</p>
      )}
    </LearningBlockShell>
  );
}

export default HintLadderBlock;
