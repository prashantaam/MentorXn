import {
  useEffect,
  useMemo,
  useState,
} from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";


function ToggleExplorerBlock({
  block,
}) {
  const data =
    block?.data || {};

  const items =
    Array.isArray(data.items)
      ? data.items
      : [];

  const onIcon =
    data.on_icon ||
    "💡";

  const offIcon =
    data.off_icon ||
    "⚪";

  const inputLabel =
    data.input_label ||
    "Decimal number";

  const showInput =
    data.show_input !== false;

  const showBinary =
    data.show_binary !== false;

  const showTotal =
    data.show_total !== false;

  const [
    activeStates,
    setActiveStates,
  ] = useState([]);

  /*
   * Convert teacher-configured values
   * into safe numeric values.
   */
  const numericItems =
    useMemo(
      () =>
        items.map(
          (item) => ({
            ...item,
            numericValue:
              Number(
                item?.value
              ) || 0,
          })
        ),
      [items]
    );

  /*
   * Maximum value that can be
   * represented when every toggle
   * is switched on.
   */
  const maximumValue =
    useMemo(
      () =>
        numericItems.reduce(
          (
            total,
            item
          ) =>
            total +
            Math.max(
              0,
              item.numericValue
            ),
          0
        ),
      [numericItems]
    );

  /*
   * Reset the explorer when a
   * different block is loaded or
   * its item count changes.
   */
  useEffect(() => {
    setActiveStates(
      numericItems.map(
        () => false
      )
    );
  }, [
    block?.id,
    numericItems.length,
  ]);

  /*
   * Current weighted total.
   */
  const total =
    numericItems.reduce(
      (
        result,
        item,
        index
      ) =>
        result +
        (
          activeStates[
            index
          ]
            ? item.numericValue
            : 0
        ),
      0
    );

  /*
   * Binary-style representation
   * of the current ON/OFF state.
   */
  const binary =
    numericItems
      .map(
        (
          _item,
          index
        ) =>
          activeStates[
            index
          ]
            ? "1"
            : "0"
      )
      .join("");

  const handleToggle =
    (index) => {
      setActiveStates(
        (current) => {
          const next = [
            ...current,
          ];

          next[index] =
            !next[index];

          return next;
        }
      );
    };

  /*
   * Turn switches ON/OFF from
   * a numeric value.
   *
   * This uses a greedy weighted
   * calculation, which works
   * naturally for values such as:
   *
   * 16, 8, 4, 2, 1
   */
  const handleNumberChange =
    (event) => {
      let requestedValue =
        Number(
          event.target.value
        );

      if (
        Number.isNaN(
          requestedValue
        )
      ) {
        requestedValue = 0;
      }

      requestedValue =
        Math.max(
          0,
          Math.min(
            maximumValue,
            requestedValue
          )
        );

      let remaining =
        requestedValue;

      const nextStates =
        numericItems.map(
          (item) => {
            const value =
              Math.max(
                0,
                item.numericValue
              );

            if (
              value > 0 &&
              remaining >= value
            ) {
              remaining -=
                value;

              return true;
            }

            return false;
          }
        );

      setActiveStates(
        nextStates
      );
    };

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      className="toggle-explorer-block"
    >
      {data.description && (
        <LearningText
          text={
            data.description
          }
          className="toggle-explorer-description"
        />
      )}

      {numericItems.length >
      0 ? (
        <>
          <div
            className="toggle-explorer-items"
            aria-label="Toggle explorer"
          >
            {numericItems.map(
              (
                item,
                index
              ) => {
                const isActive =
                  Boolean(
                    activeStates[
                      index
                    ]
                  );

                return (
                  <button
                    key={`toggle-item-${index}`}
                    type="button"
                    className={
                      `toggle-explorer-item${
                        isActive
                          ? " is-active"
                          : ""
                      }`
                    }
                    aria-pressed={
                      isActive
                    }
                    onClick={() =>
                      handleToggle(
                        index
                      )
                    }
                  >
                    <span
                      className="toggle-explorer-icon"
                      aria-hidden="true"
                    >
                      {isActive
                        ? onIcon
                        : offIcon}
                    </span>

                    <span className="toggle-explorer-label">
                      {item.label ||
                        item.numericValue}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {showInput && (
            <div className="toggle-explorer-input-row">
              <label className="toggle-explorer-input-label">
                <span>
                  {inputLabel}
                </span>

                <input
                  type="number"
                  min="0"
                  max={
                    maximumValue
                  }
                  value={
                    total
                  }
                  onChange={
                    handleNumberChange
                  }
                  className="toggle-explorer-input"
                />
              </label>
            </div>
          )}

          {(showBinary ||
            showTotal) && (
            <div
              className="toggle-explorer-result"
              aria-live="polite"
            >
              {showBinary && (
                <div className="toggle-explorer-result-item">
                  <span className="toggle-explorer-result-label">
                    Binary:
                  </span>

                  <strong className="toggle-explorer-binary">
                    {binary}
                  </strong>
                </div>
              )}

              {showBinary &&
                showTotal && (
                  <span
                    className="toggle-explorer-equals"
                    aria-hidden="true"
                  >
                    =
                  </span>
                )}

              {showTotal && (
                <div className="toggle-explorer-result-item">
                  <span className="toggle-explorer-result-label">
                    Decimal:
                  </span>

                  <strong>
                    {total}
                  </strong>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="block-empty">
          No toggle items have been configured yet.
        </div>
      )}
    </LearningBlockShell>
  );
}

export default ToggleExplorerBlock;