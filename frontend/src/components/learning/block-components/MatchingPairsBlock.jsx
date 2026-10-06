import { useEffect, useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

/*
 * Matching pairs: two shuffled columns. Tap one item from each
 * side to pair them. Wrong pairs flash red and reset; matched
 * pairs lock in green.
 *
 * data.pairs            = [{ left, right }]
 * data.left_label       = optional heading for the left column
 * data.right_label      = optional heading for the right column
 * data.shuffle          = shuffle both columns (default on)
 * data.complete_message = shown once everything is matched
 */
const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

const shuffled = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const sameText = (a, b) =>
  String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();

/* A fresh round: new column orders, nothing matched. */
function newRound(pairs, shuffle, signature) {
  const indexes = pairs.map((_, index) => index);

  return {
    signature,
    leftOrder: shuffle ? shuffled(indexes) : indexes,
    rightOrder: shuffle ? shuffled(indexes) : indexes,
    matchedLeft: [],
    matchedRight: [],
    selected: null, // { side, index }
    wrong: null, // [{ side, index }, { side, index }]
  };
}

function MatchingPairsBlock({ block }) {
  const data = block?.data || {};
  const pairs = (Array.isArray(data.pairs) ? data.pairs : []).filter(
    (pair) => String(pair?.left ?? "").trim() || String(pair?.right ?? "").trim()
  );
  const shuffle = isOn(data.shuffle, true);
  const signature = JSON.stringify([pairs, shuffle]);

  const [round, setRound] = useState(() => newRound(pairs, shuffle, signature));

  // The pairs changed (e.g. edited in the block editor): start again.
  if (round.signature !== signature) {
    setRound(newRound(pairs, shuffle, signature));
  }

  // Clear the red flash after a moment.
  useEffect(() => {
    if (!round.wrong) return undefined;
    const timer = setTimeout(() => setRound((current) => ({ ...current, wrong: null })), 700);
    return () => clearTimeout(timer);
  }, [round.wrong]);

  const isMatched = (side, index) =>
    (side === "left" ? round.matchedLeft : round.matchedRight).includes(index);

  const isComplete = pairs.length > 0 && round.matchedLeft.length === pairs.length;

  const choose = (side, index) =>
    setRound((current) => {
      const matchedOnSide = side === "left" ? current.matchedLeft : current.matchedRight;
      if (matchedOnSide.includes(index)) return current;

      const { selected } = current;

      // First pick, or a different pick on the same side.
      if (!selected || selected.side === side) {
        return { ...current, selected: { side, index }, wrong: null };
      }

      const left = side === "left" ? index : selected.index;
      const right = side === "right" ? index : selected.index;

      // Pairs with the same answer text are interchangeable.
      if (sameText(pairs[left].right, pairs[right].right)) {
        return {
          ...current,
          matchedLeft: [...current.matchedLeft, left],
          matchedRight: [...current.matchedRight, right],
          selected: null,
          wrong: null,
        };
      }

      return { ...current, selected: null, wrong: [selected, { side, index }] };
    });

  const renderColumn = (side, order, label) => (
    <div className="matching-pairs-block__column" role="group" aria-label={label || `${side} column`}>
      {label && <div className="matching-pairs-block__label">{label}</div>}

      {order.map((index) => {
        const matched = isMatched(side, index);
        const selected = round.selected?.side === side && round.selected.index === index;
        const wrong = round.wrong?.some((pick) => pick.side === side && pick.index === index);

        return (
          <button
            key={index}
            type="button"
            className={[
              "matchitem",
              matched && "matched",
              selected && "selected",
              wrong && "wrongflash",
            ]
              .filter(Boolean)
              .join(" ")}
            // aria-disabled (not disabled) so the block editor can still select it.
            aria-disabled={matched || undefined}
            aria-pressed={selected}
            data-visual-index={index}
            onClick={() => choose(side, index)}
          >
            {matched && <span aria-hidden="true">✓ </span>}
            <LearningText as="span" text={pairs[index][side] || "…"} />
          </button>
        );
      })}
    </div>
  );

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="matching-pairs-block"
    >
      {pairs.length > 0 ? (
        <>
          <div className="matchgrid">
            {renderColumn("left", round.leftOrder, data.left_label)}
            {renderColumn("right", round.rightOrder, data.right_label)}
          </div>

          <div aria-live="polite">
            {isComplete ? (
              <div className="fb good">{data.complete_message || "🎉 All matched!"}</div>
            ) : round.wrong ? (
              <div className="fb bad">Not a pair — try again.</div>
            ) : null}
          </div>

          {(isComplete || round.matchedLeft.length > 0) && (
            <div className="row">
              <button
                type="button"
                className="btn sm ghost"
                onClick={() => setRound(newRound(pairs, shuffle, signature))}
              >
                ↺ Start over
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="hint">Add pairs in the settings panel.</p>
      )}
    </LearningBlockShell>
  );
}

export default MatchingPairsBlock;
