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
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import InfoPanel from "../shared/InfoPanel";
import LearningText from "../shared/LearningText";

const AVAILABLE_ID = "available";

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

function DraggableItem({
  item,
  disabled = false,
  submitted = false,
  isCorrect = false,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: item.id,
    disabled,
    data: {
      type: "item",
      itemId: item.id,
    },
  });

  const style = transform
    ? {
        transform:
          `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  let className =
    "drag-bucket-item";

  if (isDragging) {
    className += " is-dragging";
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
      {...attributes}
      {...listeners}
    >
      <LearningText
        text={item.text}
      />
    </button>
  );
}

function DroppableArea({
  id,
  className = "",
  children,
  disabled = false,
}) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id,
    disabled,
    data: {
      type: "bucket",
      bucketId: id,
    },
  });

  const classes = [
    className,
    isOver && !disabled
      ? "is-over"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={setNodeRef}
      className={classes}
    >
      {children}
    </div>
  );
}

function DragBucketBlock({ block }) {
  const data =
    block?.data || {};

  const buckets =
    useMemo(
      () =>
        Array.isArray(data.buckets)
          ? data.buckets
          : [],
      [data.buckets]
    );

  /*
   * Convert the teacher configuration into a flat
   * draggable item list.
   *
   * The bucket that owns an item is its answer key.
   */
  const sourceItems =
    useMemo(() => {
      const items = [];

      buckets.forEach(
        (bucket, bucketIndex) => {
          const bucketItems =
            Array.isArray(bucket?.items)
              ? bucket.items
              : [];

          bucketItems.forEach(
            (item, itemIndex) => {
              const text =
                String(
                  item?.text ?? ""
                ).trim();

              if (!text) {
                return;
              }

              items.push({
                id:
                  `drag-item-${bucketIndex}-${itemIndex}`,
                text,
                correctBucketId:
                  `bucket-${bucketIndex}`,
                correctBucketLabel:
                  bucket?.label ||
                  `Bucket ${bucketIndex + 1}`,
              });
            }
          );
        }
      );

      return items;
    }, [buckets]);

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
    itemOrder,
    setItemOrder,
  ] = useState([]);

  const [
    placements,
    setPlacements,
  ] = useState({});

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    activeItemId,
    setActiveItemId,
  ] = useState(null);

  const initialiseExercise = () => {
    const ids =
      sourceItems.map(
        (item) => item.id
      );

    setItemOrder(
      shuffleItems
        ? shuffleArray(ids)
        : ids
    );

    setPlacements(
      Object.fromEntries(
        ids.map(
          (id) => [
            id,
            AVAILABLE_ID,
          ]
        )
      )
    );

    setSubmitted(false);
    setActiveItemId(null);
  };

  useEffect(() => {
    initialiseExercise();
    // Reinitialise whenever the teacher changes
    // the configured exercise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sourceItems,
    shuffleItems,
  ]);

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

  const activeItem =
    activeItemId
      ? itemById[activeItemId]
      : null;

  const itemsForLocation = (
    locationId
  ) =>
    itemOrder
      .filter(
        (itemId) =>
          placements[itemId] ===
          locationId
      )
      .map(
        (itemId) =>
          itemById[itemId]
      )
      .filter(Boolean);

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

  const handleDragCancel = () => {
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

    if (!over) {
      return;
    }

    const itemId =
      String(active.id);

    const overId =
      String(over.id);

    const validLocations =
      new Set([
        AVAILABLE_ID,
        ...buckets.map(
          (_, bucketIndex) =>
            `bucket-${bucketIndex}`
        ),
      ]);

    if (
      !itemById[itemId] ||
      !validLocations.has(overId)
    ) {
      return;
    }

    setPlacements(
      (current) => ({
        ...current,
        [itemId]: overId,
      })
    );
  };

  const handleReset = () => {
    initialiseExercise();
  };

  const handleSubmit = () => {
    if (
      sourceItems.length === 0
    ) {
      return;
    }

    setSubmitted(true);
    setActiveItemId(null);
  };

  const correctCount =
    submitted
      ? sourceItems.filter(
          (item) =>
            placements[item.id] ===
            item.correctBucketId
        ).length
      : 0;

  const allCorrect =
    submitted &&
    sourceItems.length > 0 &&
    correctCount ===
      sourceItems.length;

  const unplacedCount =
    sourceItems.filter(
      (item) =>
        placements[item.id] ===
        AVAILABLE_ID
    ).length;

  if (
    buckets.length === 0 ||
    sourceItems.length === 0
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
        className="drag-bucket-block"
      >
        <div className="drag-bucket-empty">
          Add at least two buckets and
          some draggable items to this
          exercise.
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
      className="drag-bucket-block"
    >
      {data.subtitle && (
        <LearningText
          text={data.subtitle}
          className="drag-bucket-block-instructions"
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
        <section className="drag-bucket-source-section">
          <div className="drag-bucket-section-heading">
            Available items
          </div>

          <DroppableArea
            id={AVAILABLE_ID}
            className="drag-bucket-available"
            disabled={submitted}
          >
            {itemsForLocation(
              AVAILABLE_ID
            ).length > 0 ? (
              itemsForLocation(
                AVAILABLE_ID
              ).map((item) => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  disabled={submitted}
                  submitted={
                    submitted
                  }
                  isCorrect={false}
                />
              ))
            ) : (
              <div className="drag-bucket-placeholder">
                {submitted
                  ? "No items left here."
                  : "Drag items back here if you want to change your answer."}
              </div>
            )}
          </DroppableArea>
        </section>

        <div className="drag-bucket-grid">
          {buckets.map(
            (
              bucket,
              bucketIndex
            ) => {
              const bucketId =
                `bucket-${bucketIndex}`;

              const bucketItems =
                itemsForLocation(
                  bucketId
                );

              return (
                <DroppableArea
                  key={bucketId}
                  id={bucketId}
                  className="drag-bucket"
                  disabled={
                    submitted
                  }
                >
                  <div
                    className="drag-bucket-title"
                    data-visual-index={
                      bucketIndex
                    }
                  >
                    <LearningText
                      text={
                        bucket?.label ||
                        `Bucket ${bucketIndex + 1}`
                      }
                    />
                  </div>

                  <div className="drag-bucket-items">
                    {bucketItems.length >
                    0 ? (
                      bucketItems.map(
                        (item) => {
                          const isCorrect =
                            item.correctBucketId ===
                            bucketId;

                          return (
                            <DraggableItem
                              key={
                                item.id
                              }
                              item={
                                item
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
                      )
                    ) : (
                      <div className="drag-bucket-placeholder">
                        Drop items
                        here
                      </div>
                    )}
                  </div>
                </DroppableArea>
              );
            }
          )}
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className="drag-bucket-item drag-bucket-item--overlay">
              <LearningText
                text={
                  activeItem.text
                }
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {!submitted &&
        unplacedCount > 0 && (
          <div className="drag-bucket-status">
            {unplacedCount}{" "}
            {unplacedCount === 1
              ? "item is"
              : "items are"}{" "}
            still available.
          </div>
        )}

      {submitted && (
        <>
          <div
            className={
              allCorrect
                ? "drag-bucket-feedback drag-bucket-feedback--correct"
                : "drag-bucket-feedback drag-bucket-feedback--incorrect"
            }
            aria-live="polite"
          >
            <LearningText
              text={
                allCorrect
                  ? data.correct_message ||
                    "🎉 Great work! You sorted every item correctly."
                  : data.incorrect_message ||
                    "Not quite. Review the correct answers below and try again. 💪"
              }
            />
          </div>

          <InfoPanel as="section" className="drag-bucket-answers">
            <h3 className="drag-bucket-answers-title">
              Correct answers
            </h3>

            <div className="drag-bucket-answer-grid">
              {buckets.map(
                (
                  bucket,
                  bucketIndex
                ) => {
                  const bucketId =
                    `bucket-${bucketIndex}`;

                  const answers =
                    sourceItems.filter(
                      (item) =>
                        item.correctBucketId ===
                        bucketId
                    );

                  return (
                    <div
                      key={
                        `answer-${bucketId}`
                      }
                      className="drag-bucket-answer"
                    >
                      <strong>
                        {bucket?.label ||
                          `Bucket ${bucketIndex + 1}`}
                      </strong>

                      <div className="drag-bucket-answer-items">
                        {answers.map(
                          (item) => (
                            <span
                              key={
                                `correct-${item.id}`
                              }
                              className="drag-bucket-answer-chip"
                            >
                              {
                                item.text
                              }
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </InfoPanel>

          <div className="drag-bucket-score">
            You placed{" "}
            <strong>
              {correctCount} /{" "}
              {sourceItems.length}
            </strong>{" "}
            correctly.
          </div>

          {allCorrect &&
            data.complete_message && (
              <div className="drag-bucket-complete-message">
                <LearningText
                  text={
                    data.complete_message
                  }
                />
              </div>
            )}
        </>
      )}

      <div className="block-button-group block-button-group--mobile-stack drag-bucket-actions">
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
            sourceItems.length ===
              0
          }
        >
          Submit
        </button>
      </div>
    </LearningBlockShell>
  );
}

export default DragBucketBlock;
