import { useId, useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

/*
 * Accordion: a vertical list of collapsed items that expand on tap.
 * Good for FAQ-style content or optional detail.
 *
 * data.items          = [{ question, answer }]
 * data.allow_multiple = several items may be open at once
 * data.open_first     = the first item starts open
 */
const isOn = (value) => value === true || value === 1 || value === "1" || value === "true";

function AccordionBlock({ block }) {
  const data = block?.data || {};
  const items = Array.isArray(data.items) ? data.items : [];
  const allowMultiple = isOn(data.allow_multiple);

  const [openItems, setOpenItems] = useState(() => (isOn(data.open_first) ? [0] : []));
  const idPrefix = useId();

  // With single mode only the most recently opened item stays open.
  const visibleOpen = allowMultiple ? openItems : openItems.slice(-1);

  const toggle = (index) => {
    setOpenItems((current) => {
      if (current.includes(index)) {
        return current.filter((openIndex) => openIndex !== index);
      }
      return allowMultiple ? [...current, index] : [index];
    });
  };

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="accordion-block"
    >
      {items.length > 0 ? (
        items.map((item, index) => {
          const isOpen = visibleOpen.includes(index);
          const bodyId = `${idPrefix}-body-${index}`;

          return (
            <div
              key={index}
              className={`accItem${isOpen ? " open" : ""}`}
              data-visual-index={index}
            >
              <button
                type="button"
                className="accHead"
                aria-expanded={isOpen}
                aria-controls={bodyId}
                onClick={() => toggle(index)}
              >
                <span>{item?.question || `Item ${index + 1}`}</span>
                <span className="chev" aria-hidden="true">
                  ▶
                </span>
              </button>

              <div id={bodyId} className="accBody" hidden={!isOpen}>
                <LearningText text={item?.answer || ""} />
              </div>
            </div>
          );
        })
      ) : (
        <p className="hint">Add items in the settings panel.</p>
      )}
    </LearningBlockShell>
  );
}

export default AccordionBlock;
