import { useId, useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import InfoPanel from "../shared/InfoPanel";
import LearningText from "../shared/LearningText";

/*
 * Clickable hierarchy: nested levels shown as a numbered list,
 * top to bottom. Tapping a level explains its place.
 *
 * data.levels = [{ icon, label, detail }]  (first = top level)
 * data.indent = indent each level under the one above (default on)
 * data.prompt = text shown before a level is tapped
 */
const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

function HierarchyBlock({ block }) {
  const data = block?.data || {};
  const levels = Array.isArray(data.levels) ? data.levels : [];
  const indent = isOn(data.indent, true);
  const prompt = data.prompt || "👆 Tap a level.";

  const [selected, setSelected] = useState(null);
  const panelId = useId();

  // A level may have been removed while selected (in the editor).
  const activeLevel = selected !== null ? levels[selected] : null;

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className={`hierarchy-block${indent ? " hierarchy-block--indent" : ""}`}
    >
      {levels.length > 0 ? (
        <>
          <ol className="hierarchy-block__levels">
            {levels.map((level, index) => (
              <li key={index} style={{ "--depth": index }}>
                <button
                  type="button"
                  className={`lyr${selected === index ? " on" : ""}`}
                  aria-pressed={selected === index}
                  aria-controls={panelId}
                  data-visual-index={index}
                  onClick={() => setSelected(index)}
                >
                  <span className="num" aria-hidden="true">
                    {level?.icon || index + 1}
                  </span>
                  <LearningText as="b" text={level?.label || `Level ${index + 1}`} />
                </button>
              </li>
            ))}
          </ol>

          <InfoPanel id={panelId} className="hierarchy-block__panel" aria-live="polite">
            {activeLevel ? (
              <>
                <b>{activeLevel.label || `Level ${selected + 1}`}:</b>{" "}
                <LearningText as="span" text={activeLevel.detail || ""} />
              </>
            ) : (
              <span className="hint">{prompt}</span>
            )}
          </InfoPanel>
        </>
      ) : (
        <p className="hint">Add levels in the settings panel.</p>
      )}
    </LearningBlockShell>
  );
}

export default HierarchyBlock;
