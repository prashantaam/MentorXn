import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

/*
 * True / False check: quick comprehension checks. Each statement
 * gets a True and a False button; answering locks it and explains.
 *
 * data.statements  = [{ statement, answer: "true" | "false", why }]
 * data.allow_retry = show "Try again" after answering (default off)
 */
const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

const toAnswer = (value) => isOn(value, true); // "true"/"false" select, or a boolean

function TrueFalseBlock({ block }) {
  const data = block?.data || {};
  const statements = (Array.isArray(data.statements) ? data.statements : []).filter((item) =>
    String(item?.statement ?? "").trim()
  );
  const allowRetry = isOn(data.allow_retry, false);
  const signature = JSON.stringify(statements.map((item) => [item.statement, item.answer]));

  // Chosen answer per statement: true, false or undefined.
  const [picked, setPicked] = useState({ signature, answers: {} });

  // The statements changed (e.g. in the block editor): start again.
  if (picked.signature !== signature) {
    setPicked({ signature, answers: {} });
  }

  const answers = picked.answers;
  const answeredCount = Object.keys(answers).length;
  const correctCount = statements.filter((item, index) => answers[index] === toAnswer(item.answer)).length;

  const choose = (index, value) =>
    setPicked((current) =>
      index in current.answers
        ? current
        : { ...current, answers: { ...current.answers, [index]: value } }
    );

  const retry = (index) =>
    setPicked((current) => {
      const next = { ...current.answers };
      delete next[index];
      return { ...current, answers: next };
    });

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="true-false-block"
    >
      {statements.length > 0 ? (
        <>
          {statements.map((item, index) => {
            const correctAnswer = toAnswer(item.answer);
            const answered = index in answers;
            const isRight = answered && answers[index] === correctAnswer;
            // With retries on, a wrong answer doesn't give the answer away.
            const revealAnswer = isRight || !allowRetry;

            const optionClass = (value) => {
              if (!answered) return value ? "btn" : "btn ghost";
              if (value === answers[index]) return `btn ${isRight ? "is-right" : "is-wrong"}`;
              return `btn ghost${revealAnswer && value === correctAnswer ? " is-answer" : ""}`;
            };

            return (
              <div key={index} className="true-false-block__item" data-visual-index={index}>
                <p className="true-false-block__statement">
                  {statements.length > 1 && <span className="num">{index + 1}</span>}
                  <LearningText as="b" text={item.statement} />
                </p>

                <div className="row" role="group" aria-label={`Statement ${index + 1}`}>
                  {[true, false].map((value) => (
                    <button
                      key={String(value)}
                      type="button"
                      className={optionClass(value)}
                      aria-pressed={answered ? answers[index] === value : undefined}
                      disabled={answered}
                      onClick={() => choose(index, value)}
                    >
                      {value ? "True" : "False"}
                    </button>
                  ))}

                  {answered && allowRetry && !isRight && (
                    <button type="button" className="btn sm ghost" onClick={() => retry(index)}>
                      ↺ Try again
                    </button>
                  )}
                </div>

                <div aria-live="polite">
                  {answered && !revealAnswer && <div className="fb warn">Not quite — try again.</div>}
                  {answered && revealAnswer && (
                    <div className={`fb ${isRight ? "good" : "warn"}`}>
                      {isRight ? "🎉 Correct" : `Not quite — it's ${correctAnswer ? "true" : "false"}`}
                      {item.why ? (
                        <>
                          {isRight ? " — " : ": "}
                          <LearningText as="span" text={item.why} />
                        </>
                      ) : (
                        "."
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {statements.length > 1 && answeredCount === statements.length && (
            <p className="true-false-block__score" aria-live="polite">
              Score: {correctCount} / {statements.length}
            </p>
          )}
        </>
      ) : (
        <p className="hint">Add statements in the settings panel.</p>
      )}
    </LearningBlockShell>
  );
}

export default TrueFalseBlock;
