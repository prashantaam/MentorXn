import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import InfoPanel from "../shared/InfoPanel";
import LearningText from "../shared/LearningText";

/*
 * Explain step by step (the Block Library's worked-example stepper):
 * reveals a solution one step at a time, with the running
 * "current state" shown above the steps.
 *
 * data.problem_label = e.g. "Solve:"
 * data.start_state   = e.g. "2 + 3 × 4"
 * data.steps         = [{ action, state }]  (state = result after the step)
 * data.final_message = shown once the last step is revealed
 */
function ExplainByStepsBlock({ block }) {
  const data = block?.data || {};
  const steps = (Array.isArray(data.steps) ? data.steps : []).filter(
    (step) => String(step?.action ?? "").trim() || String(step?.state ?? "").trim()
  );
  const signature = JSON.stringify([data.start_state, steps]);

  // -1 = nothing revealed yet.
  const [progress, setProgress] = useState({ signature, shown: -1 });

  // The example changed (e.g. edited in the block editor): start again.
  if (progress.signature !== signature) {
    setProgress({ signature, shown: -1 });
  }

  const shown = progress.shown;
  const isFinished = steps.length > 0 && shown >= steps.length - 1;

  // The latest state so far; a step without a state keeps the previous one.
  const currentState = steps
    .slice(0, shown + 1)
    .reduce((state, step) => (String(step?.state ?? "").trim() ? step.state : state), data.start_state || "");

  const next = () =>
    setProgress((current) => ({ ...current, shown: Math.min(current.shown + 1, steps.length - 1) }));

  const restart = () => setProgress((current) => ({ ...current, shown: -1 }));

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="explain-by-steps-block"
    >
      <p className="explain-by-steps-block__problem">
        {data.problem_label && <LearningText as="span" text={`${data.problem_label} `} />}
        <code className="explain-by-steps-block__state" aria-live="polite">
          {currentState || "…"}
        </code>
      </p>

      {steps.length > 0 ? (
        <>
          <div className="row">
            <button
              type="button"
              className="btn sm"
              aria-disabled={isFinished || undefined}
              onClick={() => !isFinished && next()}
            >
              {shown < 0 ? "▶ Show first step" : "▶ Next step"}
            </button>
            <button
              type="button"
              className="btn ghost sm"
              disabled={shown < 0}
              onClick={restart}
            >
              ↺ Restart
            </button>
            <span className="hint explain-by-steps-block__count">
              {Math.max(shown + 1, 0)} / {steps.length}
            </span>
          </div>

          <ol className="explain-by-steps-block__steps" aria-live="polite">
            {steps.slice(0, shown + 1).map((step, index) => (
              <InfoPanel
                as="li"
                key={index}
                className={`explain-by-steps-block__step${index === shown ? " is-latest" : ""}`}
                data-visual-index={index}
              >
                <strong>Step {index + 1}:</strong>{" "}
                <LearningText as="span" text={step?.action || ""} />
                {String(step?.state ?? "").trim() && (
                  <>
                    {" "}
                    <span aria-hidden="true">→</span>
                    <span className="mx-visually-hidden"> gives </span>{" "}
                    <code>{step.state}</code>
                  </>
                )}
              </InfoPanel>
            ))}
          </ol>

          {isFinished && data.final_message && (
            <div className="fb good">
              <LearningText as="span" text={data.final_message} />
            </div>
          )}
        </>
      ) : (
        <p className="hint">Add steps in the settings panel.</p>
      )}
    </LearningBlockShell>
  );
}

export default ExplainByStepsBlock;
