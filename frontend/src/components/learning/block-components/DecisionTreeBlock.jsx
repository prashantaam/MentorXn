import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

/*
 * Decision tree / branching scenario: a sequence of choices where
 * each pick leads to a DIFFERENT next situation, ending in one of
 * several outcomes — judgment-based practice, not single-step recall.
 *
 * data.steps = [{ key, text, outcome, choices: [{ label, next }] }]
 *   - students start at the first step
 *   - choice.next is the key of the step it leads to
 *   - a step with no choices is an ending; outcome = good | bad | neutral
 */
const MAX_PATH = 100;

const normaliseKey = (value) => String(value ?? "").trim().toLowerCase();

function DecisionTreeBlock({ block }) {
  const data = block?.data || {};
  const steps = (Array.isArray(data.steps) ? data.steps : []).filter((step) =>
    String(step?.text ?? "").trim()
  );
  const signature = JSON.stringify(steps);

  // step key -> index (first one wins if a key is repeated)
  const indexByKey = new Map();
  steps.forEach((step, index) => {
    const key = normaliseKey(step.key);
    if (key && !indexByKey.has(key)) indexByKey.set(key, index);
  });

  // The visited steps, as indexes; the last one is the current step.
  const [walk, setWalk] = useState({ signature, path: [0] });

  // The steps changed (e.g. in the block editor): start again.
  if (walk.signature !== signature) {
    setWalk({ signature, path: [0] });
  }

  if (steps.length === 0) {
    return (
      <LearningBlockShell title={block?.title} icon={block?.icon} subtitle={data.subtitle} className="decision-tree-block">
        <p className="hint">Add steps in the settings panel.</p>
      </LearningBlockShell>
    );
  }

  const path = walk.path.filter((index) => index < steps.length);
  const currentIndex = path[path.length - 1] ?? 0;
  const current = steps[currentIndex];
  const choices = (Array.isArray(current.choices) ? current.choices : []).filter((choice) =>
    String(choice?.label ?? "").trim()
  );
  const isEnding = choices.length === 0;
  const outcome = ["good", "bad", "neutral"].includes(current.outcome) ? current.outcome : "neutral";

  // The labels of the choices made so far, for the trail.
  const trail = path.slice(1).map((stepIndex, position) => {
    const from = steps[path[position]];
    const choice = (from?.choices || []).find(
      (item) => indexByKey.get(normaliseKey(item?.next)) === stepIndex
    );
    return choice?.label || "…";
  });

  const choose = (nextIndex) =>
    setWalk((currentWalk) => ({
      ...currentWalk,
      path: [...currentWalk.path, nextIndex].slice(-MAX_PATH),
    }));

  const back = () =>
    setWalk((currentWalk) => ({ ...currentWalk, path: currentWalk.path.slice(0, -1) }));

  const restart = () => setWalk({ signature, path: [0] });

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="decision-tree-block"
    >
      {trail.length > 0 && (
        <p className="decision-tree-block__trail">
          <span className="hint">Your choices:</span>{" "}
          {trail.map((label, index) => (
            <span key={index}>
              {index > 0 && <span aria-hidden="true"> → </span>}
              <span className="tag">{label}</span>
            </span>
          ))}
        </p>
      )}

      <div
        className={`decision-tree-block__node${isEnding ? ` is-ending is-${outcome}` : " panel"}`}
        data-visual-index={currentIndex}
        aria-live="polite"
      >
        {isEnding && (
          <span className="decision-tree-block__badge">
            {outcome === "good" ? "✅ Good outcome" : outcome === "bad" ? "😬 Not the best outcome" : "🏁 The end"}
          </span>
        )}
        <LearningText text={current.text} />
      </div>

      {!isEnding && (
        <div className="chips decision-tree-block__choices" role="group" aria-label="Your choices">
          {choices.map((choice, index) => {
            const nextIndex = indexByKey.get(normaliseKey(choice.next));

            // A choice pointing at a missing step: make it visible to the teacher.
            if (nextIndex === undefined) {
              return (
                <span
                  key={index}
                  className="decision-tree-block__broken"
                  title={`No step has the key "${choice.next || ""}"`}
                >
                  ⚠ {choice.label} → “{choice.next || "?"}” not found
                </span>
              );
            }

            return (
              <button key={index} type="button" className="chip" onClick={() => choose(nextIndex)}>
                <LearningText as="span" text={choice.label} />
              </button>
            );
          })}
        </div>
      )}

      {path.length > 1 && (
        <div className="row">
          <button type="button" className="btn sm ghost" onClick={back}>
            ↩ Back
          </button>
          <button type="button" className="btn sm ghost" onClick={restart}>
            ↺ Start over
          </button>
        </div>
      )}
    </LearningBlockShell>
  );
}

export default DecisionTreeBlock;
