import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

/*
 * Flip Cards (Code Quest's "Flip the cards"): a grid of tiles
 * showing an icon and a term. Tapping a tile flips it to show the
 * term in bold with its explanation; tapping again flips it back.
 * Each card flips on its own.
 *
 * data.cards        = [{ icon, front, back }]
 * data.reading_mode = adds a Cards / Reading switch; Reading lists
 *                     every card with its icon and title, and clicking
 *                     one shows its definition
 *
 * .grid and .flip come from adventure-land.css; the extra
 * flip-card class keeps the block editor's click-to-edit working.
 */
const isOn = (value) => value === true || value === 1 || value === "1" || value === "true";

function FlipCardBlock({ block }) {
  const data = block?.data || {};
  const cards = Array.isArray(data.cards) ? data.cards : [];
  const allowReading = isOn(data.reading_mode);

  const [flipped, setFlipped] = useState({});
  const [expanded, setExpanded] = useState({});
  const [view, setView] = useState("cards");

  const toggle = (index) => setFlipped((current) => ({ ...current, [index]: !current[index] }));
  const toggleEntry = (index) => setExpanded((current) => ({ ...current, [index]: !current[index] }));

  // The teacher may turn reading mode off while it's showing (in the editor).
  const showReading = allowReading && view === "reading";

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="flip-cards-block"
    >
      {allowReading && cards.length > 0 && (
        <div className="flip-cards-block__views" role="group" aria-label="How to show the cards">
          <button
            type="button"
            className={`chip${showReading ? "" : " on"}`}
            aria-pressed={!showReading}
            onClick={() => setView("cards")}
          >
            🃏 Cards
          </button>
          <button
            type="button"
            className={`chip${showReading ? " on" : ""}`}
            aria-pressed={showReading}
            onClick={() => setView("reading")}
          >
            📖 Reading
          </button>
        </div>
      )}

      {cards.length === 0 ? (
        <p className="hint">Add cards in the settings panel.</p>
      ) : showReading ? (
        /* ---------- reading mode ---------- */
        <ol className="flip-cards-block__reading">
          {cards.map((card, index) => {
            const isOpen = Boolean(expanded[index]);
            const definitionId = `${block?.id ?? "flip"}-definition-${index}`;

            // Icon and title first; click to show the definition.
            return (
              <li key={index} className={`flip-cards-block__entry flip-card${isOpen ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="flip-cards-block__entry-head"
                  aria-expanded={isOpen}
                  aria-controls={definitionId}
                  onClick={() => toggleEntry(index)}
                >
                  {card?.icon && (
                    <span className="flip-cards-block__term-icon" aria-hidden="true">
                      {card.icon}
                    </span>
                  )}
                  <span className="flip-cards-block__term">{card?.front || `Card ${index + 1}`}</span>
                  <span className="flip-cards-block__chevron" aria-hidden="true">
                    ▶
                  </span>
                </button>

                <div id={definitionId} className="flip-cards-block__definition" hidden={!isOpen}>
                  <LearningText text={card?.back || ""} />
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        /* ---------- cards ---------- */
        <div className="grid">
          {cards.map((card, index) => {
            const isFlipped = Boolean(flipped[index]);
            const term = card?.front || `Card ${index + 1}`;

            return (
              <button
                key={index}
                type="button"
                className={`flip flip-card${isFlipped ? " on" : ""}`}
                aria-pressed={isFlipped}
                onClick={() => toggle(index)}
              >
                <span className="front">
                  {card?.icon && (
                    <span className="em" aria-hidden="true">
                      {card.icon}
                    </span>
                  )}
                  {term}
                </span>
                <span className="back">
                  <b>{term}</b>
                  <br />
                  <LearningText as="span" text={card?.back || ""} />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </LearningBlockShell>
  );
}

export default FlipCardBlock;
