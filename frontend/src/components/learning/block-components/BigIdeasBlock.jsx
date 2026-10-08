import {
  useEffect,
  useState,
} from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

/*
 * Optional example for an idea, shown in a dark box like Word
 * Quest's sentences. Words wrapped in **double stars** are
 * highlighted in bold yellow; the explanation goes below the box.
 */
function ExampleBox({ text }) {
  const parts = String(text ?? "").split(/(\*\*[^*]+\*\*)/g);

  return (
    <pre className="code big-ideas-example">
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
          <b key={index} className="hlword">
            {part.slice(2, -2)}
          </b>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </pre>
  );
}

/* Example box (if any) + explanation underneath. */
function IdeaDetails({ item, explanationClassName }) {
  const hasExample = Boolean(String(item?.example ?? "").trim());

  return (
    <>
      {hasExample && <ExampleBox text={item.example} />}
      {item?.content && (
        <LearningText
          text={item.content}
          className={`${explanationClassName}${hasExample ? " big-ideas-explanation" : ""}`}
        />
      )}
    </>
  );
}

function BigIdeasBlock({
  block,
}) {
  const [
    selected,
    setSelected,
  ] = useState(null);

  const data =
    block?.data || {};

  const items =
    Array.isArray(data.items)
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

  const isInfoCards =
    displayStyle ===
    "info_cards";

  /*
   * "Open the first idea by default": until the student picks
   * one, the first idea counts as selected.
   */
  const rawOpenFirst =
    data.open_first ?? false;

  const openFirst =
    rawOpenFirst === true ||
    rawOpenFirst === 1 ||
    rawOpenFirst === "1" ||
    rawOpenFirst === "true";

  const activeIndex =
    selected === null &&
    openFirst &&
    items.length > 0
      ? 0
      : selected;

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
  }, [
    items,
    selected,
  ]);

  /*
   * Info Cards do not use selection.
   *
   * This also clears an old selection when switching
   * from Cards/Buttons to Info Cards.
   */
  useEffect(() => {
    if (
      isInfoCards &&
      selected !== null
    ) {
      setSelected(null);
    }
  }, [
    isInfoCards,
    selected,
  ]);

  const getItemTitle = (
    item,
    index
  ) => {
    return (
      item?.title ||
      item?.label ||
      `Idea ${index + 1}`
    );
  };

  const handleSelect = (
    index
  ) => {
    setSelected(index);
  };

  const renderIdea = (
    item,
    index
  ) => {
    const title =
      getItemTitle(
        item,
        index
      );

    const isSelected =
      activeIndex === index;

    /*
     * =====================================================
     * Info Card Display
     *
     * Static card:
     * icon + title on one line
     * explanation always visible
     * =====================================================
     */

    if (isInfoCards) {
      return (
        <article
          key={`idea-${index}`}
          className="big-ideas-info-card"
        >
          <div className="big-ideas-info-card-heading">
            {item?.icon && (
              <span
                className="big-ideas-info-card-icon"
                aria-hidden="true"
              >
                {item.icon}
              </span>
            )}

            <LearningText
              text={title}
              className="big-ideas-info-card-title"
            />
          </div>

          <IdeaDetails
            item={item}
            explanationClassName="big-ideas-info-card-content"
          />
        </article>
      );
    }

    /*
     * =====================================================
     * Button Display
     * =====================================================
     */

    if (
      displayStyle ===
      "buttons"
    ) {
      return (
        <button
          key={`idea-${index}`}
          type="button"
          className={
            `big-ideas-button${
              isSelected
                ? " on"
                : ""
            }`
          }
          aria-pressed={
            isSelected
          }
          onClick={() =>
            handleSelect(index)
          }
        >
          {item?.icon && (
            <span
              className="big-ideas-button-icon"
              aria-hidden="true"
            >
              {item.icon}
            </span>
          )}

          <LearningText
            text={title}
          />
        </button>
      );
    }

    /*
     * =====================================================
     * Card Display
     * =====================================================
     */

    return (
      <button
        key={`idea-${index}`}
        type="button"
        className={
          `big-ideas-card${
            isSelected
              ? " on"
              : ""
          }`
        }
        aria-pressed={
          isSelected
        }
        onClick={() =>
          handleSelect(index)
        }
      >
        {item?.icon && (
          <span
            className="big-ideas-card-icon"
            aria-hidden="true"
          >
            {item.icon}
          </span>
        )}

        <LearningText
          text={title}
          className="big-ideas-card-title"
        />
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
      {items.length > 0 ? (
        <>
          {/* ===============================================
              Ideas
          =============================================== */}

          <div
            className={
              `big-ideas-items ` +
              `big-ideas-items--${displayStyle}` +
              `${
                showFlow
                  ? " has-flow"
                  : ""
              }`
            }
          >
            {items.map(
              (
                item,
                index
              ) => (
                <div
                  key={`idea-wrapper-${index}`}
                  className="big-ideas-item-wrapper"
                >
                  {renderIdea(
                    item,
                    index
                  )}

                  {showFlow &&
                    index <
                      items.length -
                        1 && (
                      <span
                        className="big-ideas-flow-arrow"
                        aria-hidden="true"
                      >
                        ➜
                      </span>
                    )}
                </div>
              )
            )}
          </div>

          {/* ===============================================
              Explanation

              Cards and Buttons reveal content here.

              Info Cards already show their content directly,
              so they do not need this panel.
          =============================================== */}

          {!isInfoCards && (
            <div
              className="big-ideas-panel"
              aria-live="polite"
            >
              {activeIndex === null ||
              !items[activeIndex] ? (
                "👆 Select an idea to explore it."
              ) : (
                <IdeaDetails
                  item={items[activeIndex]}
                  explanationClassName="big-ideas-panel-text"
                />
              )}
            </div>
          )}
        </>
      ) : (
        <div className="block-empty">
          No ideas have been configured yet.
        </div>
      )}
    </LearningBlockShell>
  );
}

export default BigIdeasBlock;