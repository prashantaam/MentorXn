import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";

import {
  CSS,
} from "@dnd-kit/utilities";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

const toBoolean = (
  value,
  defaultValue = false
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return defaultValue;
  }

  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  );
};

const shuffleArray = (items) => {
  const result = [...items];

  for (
    let i = result.length - 1;
    i > 0;
    i -= 1
  ) {
    const randomIndex =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      result[i],
      result[randomIndex],
    ] = [
      result[randomIndex],
      result[i],
    ];
  }

  return result;
};

function SortableItem({
  item,
  sourceIndex,
  disabled = false,
  submitted = false,
  isCorrect = false,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled,
  });

  const style = {
    transform:
      CSS.Transform.toString(
        transform
      ),
    transition,
  };

  let className =
    "arrange-text-item";

  if (isDragging) {
    className +=
      " is-dragging";
  }

  if (submitted) {
    className += isCorrect
      ? " is-correct"
      : " is-incorrect";
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={className}
      style={style}
      disabled={disabled}
      data-visual-index={
        sourceIndex
      }
      {...attributes}
      {...listeners}
    >
      <span className="arrange-text-item-handle">
        ⋮⋮
      </span>

      <LearningText
        text={item.text}
      />

      {submitted && (
        <span
          className="arrange-text-item-result"
          aria-hidden="true"
        >
          {isCorrect
            ? "✓"
            : "✕"}
        </span>
      )}
    </button>
  );
}

function ArrangeTextBlock({
  block,
}) {
  const data =
    block?.data || {};

  const sourceItems =
    useMemo(() => {
      const items =
        Array.isArray(data.items)
          ? data.items
          : [];

      return items
        .map(
          (item, index) => ({
            id:
              `arrange-item-${index}`,
            text:
              String(
                item?.text ?? ""
              ).trim(),
            sourceIndex:
              index,
          })
        )
        .filter(
          (item) =>
            item.text !== ""
        );
    }, [data.items]);

  const correctOrder =
    useMemo(
      () =>
        sourceItems.map(
          (item) => item.id
        ),
      [sourceItems]
    );

  const itemById =
    useMemo(
      () =>
        Object.fromEntries(
          sourceItems.map(
            (item) => [
              item.id,
              item,
            ]
          )
        ),
      [sourceItems]
    );

  const shuffleItems =
    toBoolean(
      data.shuffle_items,
      true
    );

  const sensors =
    useSensors(
      useSensor(
        PointerSensor,
        {
          activationConstraint: {
            distance: 5,
          },
        }
      ),
      useSensor(
        KeyboardSensor,
        {
          coordinateGetter:
            sortableKeyboardCoordinates,
        }
      )
    );

  const [
    studentOrder,
    setStudentOrder,
  ] = useState([]);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    activeItemId,
    setActiveItemId,
  ] = useState(null);

  const initialiseExercise =
    () => {
      const ids =
        sourceItems.map(
          (item) => item.id
        );

      setStudentOrder(
        shuffleItems
          ? shuffleArray(ids)
          : ids
      );

      setSubmitted(false);
      setActiveItemId(null);
    };

  useEffect(() => {
    initialiseExercise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sourceItems,
    shuffleItems,
  ]);

  const activeItem =
    activeItemId
      ? itemById[
          activeItemId
        ]
      : null;

  const correctCount =
    submitted
      ? studentOrder.reduce(
          (
            total,
            itemId,
            index
          ) =>
            total +
            (
              itemId ===
              correctOrder[index]
                ? 1
                : 0
            ),
          0
        )
      : 0;

  const allCorrect =
    submitted &&
    studentOrder.length > 0 &&
    correctCount ===
      correctOrder.length;

  const handleDragStart = (
    event
  ) => {
    if (submitted) {
      return;
    }

    setActiveItemId(
      String(event.active.id)
    );
  };

  const handleDragCancel =
    () => {
      setActiveItemId(null);
    };

  const handleDragEnd = (
    event
  ) => {
    setActiveItemId(null);

    if (submitted) {
      return;
    }

    const {
      active,
      over,
    } = event;

    if (
      !over ||
      active.id === over.id
    ) {
      return;
    }

    setStudentOrder(
      (current) => {
        const oldIndex =
          current.indexOf(
            String(active.id)
          );

        const newIndex =
          current.indexOf(
            String(over.id)
          );

        if (
          oldIndex < 0 ||
          newIndex < 0
        ) {
          return current;
        }

        return arrayMove(
          current,
          oldIndex,
          newIndex
        );
      }
    );
  };

  const handleReset = () => {
    initialiseExercise();
  };

  const handleSubmit = () => {
    if (
      studentOrder.length === 0
    ) {
      return;
    }

    setSubmitted(true);
    setActiveItemId(null);
  };

  if (
    sourceItems.length < 2
  ) {
    return (
      <LearningBlockShell
        title={
          block?.title ||
          data.title
        }
        icon={
          block?.icon ||
          data.icon
        }
        className="arrange-text-block"
      >
        <div className="arrange-text-empty">
          Add at least two items
          to this exercise.
        </div>
      </LearningBlockShell>
    );
  }

  return (
    <LearningBlockShell
      title={
        block?.title ||
        data.title
      }
      icon={
        block?.icon ||
        data.icon
      }
      className="arrange-text-block"
    >
      {data.subtitle && (
        <LearningText
          text={data.subtitle}
          className="arrange-text-block-instructions"
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={
          closestCenter
        }
        onDragStart={
          handleDragStart
        }
        onDragCancel={
          handleDragCancel
        }
        onDragEnd={
          handleDragEnd
        }
      >
        <SortableContext
          items={
            studentOrder
          }
          strategy={
            horizontalListSortingStrategy
          }
        >
          <div
            className="arrange-text-area"
            aria-label="Arrange items into the correct order"
          >
            {studentOrder.map(
              (
                itemId,
                index
              ) => {
                const item =
                  itemById[
                    itemId
                  ];

                if (!item) {
                  return null;
                }

                const isCorrect =
                  itemId ===
                  correctOrder[
                    index
                  ];

                return (
                  <SortableItem
                    key={itemId}
                    item={item}
                    sourceIndex={
                      item.sourceIndex
                    }
                    disabled={
                      submitted
                    }
                    submitted={
                      submitted
                    }
                    isCorrect={
                      isCorrect
                    }
                  />
                );
              }
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeItem ? (
            <div className="arrange-text-item arrange-text-item--overlay">
              <span className="arrange-text-item-handle">
                ⋮⋮
              </span>

              <LearningText
                text={
                  activeItem.text
                }
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {submitted && (
        <>
          <div
            className={
              allCorrect
                ? "arrange-text-feedback arrange-text-feedback--correct"
                : "arrange-text-feedback arrange-text-feedback--incorrect"
            }
            aria-live="polite"
          >
            <LearningText
              text={
                allCorrect
                  ? data.correct_message ||
                    "🎉 Perfect! Everything is in the correct order."
                  : data.incorrect_message ||
                    "Not quite. Compare your order with the correct answer and try again. 💪"
              }
            />
          </div>

          {!allCorrect && (
            <section className="arrange-text-answer">
              <h3 className="arrange-text-answer-title">
                Correct answer
              </h3>

              <div className="arrange-text-correct-order">
                {correctOrder.map(
                  (itemId) => {
                    const item =
                      itemById[
                        itemId
                      ];

                    if (!item) {
                      return null;
                    }

                    return (
                      <span
                        key={
                          `correct-${itemId}`
                        }
                        className="arrange-text-answer-item"
                      >
                        <LearningText
                          text={
                            item.text
                          }
                        />
                      </span>
                    );
                  }
                )}
              </div>
            </section>
          )}

          <div className="arrange-text-score">
            <strong>
              {correctCount} /{" "}
              {correctOrder.length}
            </strong>{" "}
            pieces are in the
            correct position.
          </div>

          {allCorrect &&
            data.complete_message && (
              <div className="arrange-text-complete-message">
                <LearningText
                  text={
                    data.complete_message
                  }
                />
              </div>
            )}
        </>
      )}

      <div className="block-button-group block-button-group--mobile-stack arrange-text-actions">
        <button
          type="button"
          className="block-button block-button--white"
          onClick={
            handleReset
          }
        >
          ↻ Reset
        </button>

        <button
          type="button"
          className="block-button block-button--primary"
          onClick={
            handleSubmit
          }
          disabled={
            submitted ||
            studentOrder.length ===
              0
          }
        >
          Submit
        </button>
      </div>
    </LearningBlockShell>
  );
}

export default ArrangeTextBlock;
