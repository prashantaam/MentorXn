import { useState } from "react";
import LearningBlockShell from "../block-component-settings/LearningBlockShell";

function ChipSelectorBlock({ block }) {
  const [selected, setSelected] = useState(null);

  const data = block?.data || {};
  const items = Array.isArray(data.items) ? data.items : [];

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="chip-selector-block"
    >
      <div className="chips">
        {items.map((item, index) => (
          <button
            key={`${item.label || "idea"}-${index}`}
            type="button"
            className={`chip${selected === index ? " on" : ""}`}
            onClick={() => setSelected(index)}
          >
            {item.label || `Idea ${index + 1}`}
          </button>
        ))}
      </div>

      {selected === null ? (
        <div className="panel">👆 Select an idea to explore it.</div>
      ) : (
        <div className="panel">{items[selected]?.content}</div>
      )}
    </LearningBlockShell>
  );
}

export default ChipSelectorBlock;
