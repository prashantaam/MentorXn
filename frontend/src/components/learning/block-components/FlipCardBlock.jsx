import {
  useState,
} from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";

function FlipCardsBlock({
  block,
}) {
  const [
    flippedCards,
    setFlippedCards,
  ] = useState({});

  const data =
    block?.data || {};

  const cards =
    Array.isArray(data.cards)
      ? data.cards
      : [];

  const handleFlip = (
    cardIndex
  ) => {
    setFlippedCards(
      (current) => ({
        ...current,

        [cardIndex]:
          !current[cardIndex],
      })
    );
  };

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="flip-cards-block"
    >
      <div className="flip-cards-grid">
        {cards.map(
          (card, cardIndex) => {
            const isFlipped =
              Boolean(
                flippedCards[
                  cardIndex
                ]
              );

            return (
              <button
                key={
                  `${card.front || "card"}-${cardIndex}`
                }
                type="button"
                className={`flip-card${
                  isFlipped
                    ? " is-flipped"
                    : ""
                }`}
                onClick={() =>
                  handleFlip(
                    cardIndex
                  )
                }
                aria-pressed={
                  isFlipped
                }
              >
                <span className="flip-card-inner">
                  <span className="flip-card-face flip-card-front">
                    {card.icon && (
                      <span
                        className="flip-card-icon"
                        aria-hidden="true"
                      >
                        {card.icon}
                      </span>
                    )}

                    <strong>
                      {card.front ||
                        `Card ${
                          cardIndex +
                          1
                        }`}
                    </strong>

                    <small>
                      Click to flip
                    </small>
                  </span>

                  <span className="flip-card-face flip-card-back">
                    <span>
                      {card.back ||
                        "No explanation provided."}
                    </span>

                    <small>
                      Click to flip back
                    </small>
                  </span>
                </span>
              </button>
            );
          }
        )}
      </div>

      {cards.length === 0 && (
        <div className="panel">
          No cards have been
          configured yet.
        </div>
      )}
    </LearningBlockShell>
  );
}

export default FlipCardsBlock;