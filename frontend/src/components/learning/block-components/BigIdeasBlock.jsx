import { useEffect, useState } from "react";
import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

function BigIdeasBlock({ block }) {
  const [selected, setSelected] = useState(null);

  const data = block?.data || {};

  const items = Array.isArray(data.items)
    ? data.items
    : [];

  /*
   * Support both the new snake_case configuration
   * and any earlier camelCase data.
   */
  const displayStyle =
    data.display_style ||
    data.displayStyle ||
    "cards";

  const rawShowFlow =
    data.show_flow ??
    data.showFlow ??
    false;

  const showFlow =
    rawShowFlow === true ||
    rawShowFlow === 1 ||
    rawShowFlow === "1" ||
    rawShowFlow === "true";

  /*
   * If the items change and the currently selected
   * item no longer exists, clear the selection.
   */
  useEffect(() => {
    if (
      selected !== null &&
      !items[selected]
    ) {
      setSelected(null);
    }
  }, [items, selected]);

  const getItemTitle = (item, index) => {
    return (
      item?.title ||
      item?.label ||
      `Idea ${index + 1}`
    );
  };

  const renderIdea = (item, index) => {
    const title = getItemTitle(item, index);
    const isSelected = selected === index;

    if (displayStyle === "buttons") {
      return (
        <button
          key={`idea-${index}`}
          type="button"
          className={
            `big-ideas-button${
              isSelected ? " on" : ""
            }`
          }
          aria-pressed={isSelected}
          onClick={() => setSelected(index)}
        >
          {item?.icon && (
            <span
              className="big-ideas-button-icon"
              aria-hidden="true"
            >
              {item.icon}
            </span>
          )}

          <span>{title}</span>
        </button>
      );
    }

    return (
      <button
        key={`idea-${index}`}
        type="button"
        className={
          `big-ideas-card${
            isSelected ? " on" : ""
          }`
        }
        aria-pressed={isSelected}
        onClick={() => setSelected(index)}
      >
        {item?.icon && (
          <span
            className="big-ideas-card-icon"
            aria-hidden="true"
          >
            {item.icon}
          </span>
        )}

        <span className="big-ideas-card-title">
          {title}
        </span>
      </button>
    );
  };

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="big-ideas-block"
    >
      <div
        className={
          `big-ideas-items ` +
          `big-ideas-items--${displayStyle}` +
          `${showFlow ? " has-flow" : ""}`
        }
      >
        {items.map((item, index) => (
          <div
            key={`idea-wrapper-${index}`}
            className="big-ideas-item-wrapper"
          >
            {renderIdea(item, index)}

            {showFlow &&
              index < items.length - 1 && (
                <span
                  className="big-ideas-flow-arrow"
                  aria-hidden="true"
                >
                  ➜
                </span>
              )}
          </div>
        ))}
      </div>

      <div
        className="big-ideas-panel"
        aria-live="polite"
      >
        {selected === null ? (
          "👆 Select an idea to explore it."
        ) : (
          <LearningText
            text={items[selected]?.content}
          />
        )}
      </div>
    </LearningBlockShell>
  );
}

export default BigIdeasBlock;