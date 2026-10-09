import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import InfoPanel from "../shared/InfoPanel";
import LearningText from "../shared/LearningText";

/*
 * Step through an expression: pick an expression (chips), then press
 * Next step to rewrite it one step at a time. Each step adds a line
 * to the code panel and shows its note underneath.
 *
 * data.expressions = [{ label, steps: [{ state, note }] }]
 *   - steps[0] is the starting expression
 *   - label is the chip text (defaults to the first step)
 */
function ExpressionStepperBlock({ block }) {
  const data = block?.data || {};
  const expressions = (Array.isArray(data.expressions) ? data.expressions : [])
    .map((expression) => ({
      ...expression,
      steps: (Array.isArray(expression?.steps) ? expression.steps : []).filter((step) =>
        String(step?.state ?? "").trim()
      ),
    }))
    .filter((expression) => expression.steps.length > 0);
  const signature = JSON.stringify(expressions);

  const [view, setView] = useState({ signature, active: 0, step: 0 });

  // The expressions changed (e.g. in the block editor): start again.
  if (view.signature !== signature) {
    setView({ signature, active: 0, step: 0 });
  }

  if (expressions.length === 0) {
    return (
      <LearningBlockShell title={block?.title} icon={block?.icon} subtitle={data.subtitle} className="expression-stepper-block">
        <p className="hint">Add an expression and its steps in the settings panel.</p>
      </LearningBlockShell>
    );
  }

  const activeIndex = Math.min(view.active, expressions.length - 1);
  const expression = expressions[activeIndex];
  const step = Math.min(view.step, expression.steps.length - 1);
  const isLast = step >= expression.steps.length - 1;
  const note = expression.steps[step]?.note;

  const pick = (index) => setView((current) => ({ ...current, active: index, step: 0 }));
  const next = () => setView((current) => ({ ...current, step: Math.min(expression.steps.length - 1, current.step + 1) }));
  const restart = () => setView((current) => ({ ...current, step: 0 }));

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="expression-stepper-block"
    >
      {expressions.length > 1 && (
        <div className="chips" role="group" aria-label="Choose an expression">
          {expressions.map((item, index) => (
            <button
              key={index}
              type="button"
              className={`chip${index === activeIndex ? " on" : ""}`}
              aria-pressed={index === activeIndex}
              onClick={() => pick(index)}
            >
              {item.label || item.steps[0].state}
            </button>
          ))}
        </div>
      )}

      <div className="row">
        <button type="button" className="btn" disabled={isLast} onClick={next}>
          ▶ Next step
        </button>
        <button type="button" className="btn ghost" disabled={step === 0} onClick={restart}>
          ↺ Restart
        </button>
        <span className="hint expression-stepper-block__count">
          Step {step + 1} of {expression.steps.length}
        </span>
      </div>

      <InfoPanel className="expression-stepper-block__out" data-visual-index={activeIndex}>
        <pre className="code" aria-live="polite">
          {expression.steps.slice(0, step + 1).map((item, index) => (
            <span key={index} className={`ln${index === step ? " hit" : ""}`}>
              {item.state}
            </span>
          ))}
        </pre>
        {note && <LearningText as="p" text={note} className="hint expression-stepper-block__note" />}
      </InfoPanel>
    </LearningBlockShell>
  );
}

export default ExpressionStepperBlock;
