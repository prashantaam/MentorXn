import {
  useEffect,
  useMemo,
  useState,
} from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";


/*
 * =========================================================
 * MentorXn - Sequence Block
 * =========================================================
 *
 * Allows students to arrange items into the correct sequence
 * using Up / Down controls.
 *
 * Teacher-authored text supports LearningText formatting:
 *
 * **bold**
 * `inline code`
 * [[label]]
 *
 * =========================================================
 */


/*
 * Fisher-Yates shuffle.
 *
 * Returns a new array and does not modify the original.
 */
const shuffleArray = (items) => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(
      Math.random() * (i + 1)
    );

    [
      shuffled[i],
      shuffled[randomIndex],
    ] = [
      shuffled[randomIndex],
      shuffled[i],
    ];
  }

  return shuffled;
};


/*
 * Create the starting order.
 *
 * If shuffle is enabled, we try to avoid starting with the
 * completely correct answer.
 */
const createStartingOrder = (
  items,
  shouldShuffle
) => {
  const indexes = items.map(
    (_, index) => index
  );

  if (
    !shouldShuffle ||
    indexes.length <= 1
  ) {
    return indexes;
  }

  let shuffled = shuffleArray(indexes);

  const isCorrectOrder = shuffled.every(
    (itemIndex, position) =>
      itemIndex === position
  );

  /*
   * If the random shuffle happens to produce the correct
   * sequence, rotate the items once so the activity does
   * not start already solved.
   */
  if (isCorrectOrder) {
    shuffled = [
      ...shuffled.slice(1),
      shuffled[0],
    ];
  }

  return shuffled;
};


function SequenceBlock({ block }) {
  const data = block?.data || {};

  const items = useMemo(
    () =>
      Array.isArray(data.items)
        ? data.items
        : [],
    [data.items]
  );


  /*
   * Support boolean values coming from either JSON booleans
   * or database/form values such as 1 and "true".
   */
  const rawShuffle =
    data.shuffle_items ??
    data.shuffleItems ??
    true;

  const shouldShuffle =
    rawShuffle === true ||
    rawShuffle === 1 ||
    rawShuffle === "1" ||
    rawShuffle === "true";


  const rawShowNumbers =
    data.show_numbers ??
    data.showNumbers ??
    true;

  const showNumbers =
    rawShowNumbers === true ||
    rawShowNumbers === 1 ||
    rawShowNumbers === "1" ||
    rawShowNumbers === "true";


  /*
   * order contains indexes pointing back to items.
   *
   * Example:
   *
   * items:
   * 0 Bread
   * 1 Filling
   * 2 Top slice
   *
   * order:
   * [2, 0, 1]
   */
  const [order, setOrder] =
    useState(() =>
      createStartingOrder(
        items,
        shouldShuffle
      )
    );

  const [feedback, setFeedback] =
    useState(null);


  /*
   * Reset the activity whenever the block content changes.
   *
   * This is important in Course Playground because a teacher
   * can edit the block and immediately preview the new data.
   */
  useEffect(() => {
    setOrder(
      createStartingOrder(
        items,
        shouldShuffle
      )
    );

    setFeedback(null);
  }, [
    items,
    shouldShuffle,
  ]);


  /*
   * Move one item up or down.
   */
  const moveItem = (
    currentPosition,
    direction
  ) => {
    const targetPosition =
      currentPosition + direction;

    if (
      targetPosition < 0 ||
      targetPosition >= order.length
    ) {
      return;
    }

    setOrder((currentOrder) => {
      const nextOrder = [
        ...currentOrder,
      ];

      [
        nextOrder[currentPosition],
        nextOrder[targetPosition],
      ] = [
        nextOrder[targetPosition],
        nextOrder[currentPosition],
      ];

      return nextOrder;
    });

    /*
     * Remove old feedback after the learner changes
     * the sequence.
     */
    setFeedback(null);
  };


  /*
   * Check how many items are in their correct position.
   */
  const handleCheck = () => {
    const correctCount =
      order.filter(
        (itemIndex, position) =>
          itemIndex === position
      ).length;

    const isCorrect =
      correctCount === items.length &&
      items.length > 0;

    if (isCorrect) {
      setFeedback({
        type: "correct",
        message:
          data.correct_message ||
          data.correctMessage ||
          "🎉 Perfect order! That's exactly what an algorithm is: clear steps, in the right sequence.",
      });

      return;
    }

    const customIncorrectMessage =
      data.incorrect_message ||
      data.incorrectMessage;

    setFeedback({
      type: "incorrect",

      message:
        customIncorrectMessage ||
        `Getting there! ${correctCount} of ${items.length} steps are already in the right spot.`,
    });
  };


  /*
   * Nothing to arrange.
   */
  if (items.length === 0) {
    return (
      <LearningBlockShell
        title={block?.title}
        icon={block?.icon}
        subtitle={data.subtitle}
        className="sequence-block"
      >
        <div className="sequence-block-empty">
          No sequence items have been added yet.
        </div>
      </LearningBlockShell>
    );
  }


  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      className="sequence-block"
    >
      {data.subtitle && (
        <LearningText
          text={data.subtitle}
          className="sequence-block-instructions"
        />
      )}


      {/* ===============================================
          Sequence Items
          =============================================== */}

      <div className="sequence-block-list">
        {order.map(
          (itemIndex, position) => {
            const item =
              items[itemIndex];

            const itemText =
              item?.text ||
              item?.title ||
              "";

            const isFirst =
              position === 0;

            const isLast =
              position ===
              order.length - 1;

            return (
              <div
                key={`sequence-${itemIndex}`}
                className="sequence-block-item"
              >
                {showNumbers && (
                  <span
                    className="sequence-block-number"
                    aria-hidden="true"
                  >
                    {position + 1}
                  </span>
                )}


                <LearningText
                  text={itemText}
                  className="sequence-block-item-text"
                />


                <div className="sequence-block-controls">
                  <button
                    type="button"
                    className="sequence-block-move-button"
                    disabled={isFirst}
                    aria-label={
                      `Move ${itemText} up`
                    }
                    onClick={() =>
                      moveItem(
                        position,
                        -1
                      )
                    }
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    className="sequence-block-move-button"
                    disabled={isLast}
                    aria-label={
                      `Move ${itemText} down`
                    }
                    onClick={() =>
                      moveItem(
                        position,
                        1
                      )
                    }
                  >
                    ↓
                  </button>
                </div>
              </div>
            );
          }
        )}
      </div>


      {/* ===============================================
          Check
          =============================================== */}

      <div className="sequence-block-actions">
        <button
          type="button"
          className="sequence-block-check-button"
          onClick={handleCheck}
        >
          ✅ Check my order
        </button>
      </div>


      {/* ===============================================
          Feedback
          =============================================== */}

      {feedback && (
        <div
          className={
            `sequence-block-feedback ` +
            `sequence-block-feedback--${feedback.type}`
          }
          aria-live="polite"
        >
          <LearningText
            text={feedback.message}
          />
        </div>
      )}
    </LearningBlockShell>
  );
}


export default SequenceBlock;