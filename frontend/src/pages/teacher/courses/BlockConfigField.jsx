import {
  useState,
} from "react";


function BlockConfigField({
  field,
  value,
  onChange,
  showLabel = true,
  siblingValues = {},
}) {
  const [
    answerInput,
    setAnswerInput,
  ] = useState("");


  if (!field?.name) {
    return null;
  }


  /*
   * Top-level conditional visibility.
   *
   * Parent editors can pass the complete configuration object
   * as siblingValues. Repeater fields already pass their item
   * object as sibling values.
   */
  const condition =
    field?.show_when;

  if (
    condition?.field &&
    Object.prototype.hasOwnProperty.call(
      condition,
      "equals"
    ) &&
    siblingValues?.[
      condition.field
    ] !== condition.equals
  ) {
    return null;
  }


  const fieldId =
    `template-${field.name}`;


  const fieldLabel =
    field.label ||
    field.name;


  /*
   * =========================================
   * Create default value
   * =========================================
   */

  const getDefaultValue = (
    targetField
  ) => {
    if (
      Object.prototype.hasOwnProperty.call(
        targetField,
        "default"
      )
    ) {
      return targetField.default;
    }


    if (
      targetField.type ===
      "boolean"
    ) {
      return false;
    }


    if (
      targetField.type ===
        "repeater" ||
      targetField.type ===
        "answer_builder"
    ) {
      return [];
    }


    if (
      targetField.type ===
      "select"
    ) {
      const firstOption =
        targetField.options?.[0];


      return typeof firstOption ===
        "string"
        ? firstOption
        : firstOption?.value ??
            "";
    }


    return "";
  };


  /*
   * =========================================
   * Conditional field visibility
   * =========================================
   *
   * Used mainly by fields inside repeaters.
   *
   * Example:
   *
   * show_when: {
   *   field: "type",
   *   equals: "range"
   * }
   */

  const shouldShowField = (
    targetField,
    siblingValues = {}
  ) => {
    const condition =
      targetField?.show_when;


    if (!condition) {
      return true;
    }


    if (!condition.field) {
      return true;
    }


    const currentValue =
      siblingValues?.[
        condition.field
      ];


    if (
      Object.prototype.hasOwnProperty.call(
        condition,
        "equals"
      )
    ) {
      return (
        currentValue ===
        condition.equals
      );
    }


    return true;
  };


  /*
   * =========================================
   * Answer Builder
   * =========================================
   */

  if (
    field.type ===
    "answer_builder"
  ) {
    const answers =
      Array.isArray(value)
        ? value
        : [];


    const minimumItems =
      Number(
        field.min_items ?? 0
      );


    const handleAddAnswer =
      () => {
        const text =
          answerInput.trim();


        if (!text) {
          return;
        }


        onChange([
          ...answers,
          {
            text,
            correct: false,
          },
        ]);


        setAnswerInput("");
      };


    const handleAnswerKeyDown = (
      event
    ) => {
      if (
        event.key !== "Enter"
      ) {
        return;
      }


      event.preventDefault();


      handleAddAnswer();
    };


    const handleCorrectAnswer = (
      selectedIndex
    ) => {
      onChange(
        answers.map(
          (
            answer,
            index
          ) => ({
            ...answer,

            correct:
              index ===
              selectedIndex,
          })
        )
      );
    };


    const handleRemoveAnswer = (
      answerIndex
    ) => {
      if (
        answers.length <=
        minimumItems
      ) {
        return;
      }


      onChange(
        answers.filter(
          (_, index) =>
            index !==
            answerIndex
        )
      );
    };


    return (
      <div className="course-playground-template-field">
        {showLabel && (
          <label>
            {fieldLabel}

            {field.required &&
              " *"}
          </label>
        )}


        {field.help && (
          <p className="course-playground-field-help">
            {field.help}
          </p>
        )}


        <div className="course-playground-answer-builder">
          <div className="course-playground-answer-add-row">
            <input
              type="text"
              value={
                answerInput
              }
              placeholder={
                field.placeholder ||
                "Type an answer..."
              }
              onChange={(
                event
              ) =>
                setAnswerInput(
                  event.target
                    .value
                )
              }
              onKeyDown={
                handleAnswerKeyDown
              }
            />


            <button
              type="button"
              className="course-playground-small-add-button course-playground-answer-add-button"
              disabled={
                !answerInput.trim()
              }
              onClick={
                handleAddAnswer
              }
              aria-label="Add answer"
              title="Add answer"
            >
              +
            </button>
          </div>


          {answers.length ===
            0 && (
            <div className="course-playground-answer-empty">
              Add at least{" "}
              {minimumItems ||
                2}{" "}
              answers.
            </div>
          )}


          {answers.length >
            0 && (
            <div className="course-playground-answer-list">
              {answers.map(
                (
                  answer,
                  answerIndex
                ) => (
                  <div
                    key={
                      answerIndex
                    }
                    className={
                      `course-playground-answer-item${
                        answer.correct
                          ? " is-correct"
                          : ""
                      }`
                    }
                  >
                    <label className="course-playground-answer-choice">
                      <input
                        type="radio"
                        name={
                          `correct-answer-${field.name}`
                        }
                        checked={
                          Boolean(
                            answer.correct
                          )
                        }
                        onChange={() =>
                          handleCorrectAnswer(
                            answerIndex
                          )
                        }
                      />


                      <span className="course-playground-answer-text">
                        {answer.text}
                      </span>
                    </label>


                    <button
                      type="button"
                      className="course-playground-answer-remove"
                      disabled={
                        answers.length <=
                        minimumItems
                      }
                      onClick={() =>
                        handleRemoveAnswer(
                          answerIndex
                        )
                      }
                      aria-label={
                        `Remove ${answer.text}`
                      }
                      title={
                        answers.length <=
                        minimumItems
                          ? `At least ${minimumItems} answers are required`
                          : "Remove answer"
                      }
                    >
                      🗑️
                    </button>
                  </div>
                )
              )}
            </div>
          )}


          {answers.length >
            0 &&
            !answers.some(
              (answer) =>
                Boolean(
                  answer.correct
                )
            ) && (
              <p className="course-playground-answer-hint">
                Select the correct
                answer using the
                radio button.
              </p>
            )}
        </div>
      </div>
    );
  }


  /*
   * =========================================
   * Repeater
   * =========================================
   */

  if (
    field.type ===
    "repeater"
  ) {
    const items =
      Array.isArray(value)
        ? value
        : [];


    const itemFields =
      Array.isArray(
        field.fields
      )
        ? field.fields
        : [];


    /*
     * IMPORTANT:
     *
     * Use ?? instead of ||.
     *
     * min_items: 0 must remain 0.
     *
     * Examples:
     *
     * Inputs:
     * min_items = 1
     *
     * Actions:
     * min_items = 0
     *
     * Rules:
     * min_items = 0
     *
     * Output boxes:
     * min_items = 0
     */

    const minimumItems =
      Math.max(
        0,
        Number(
          field.min_items ??
            0
        )
      );


    const canRemoveItem =
      items.length >
      minimumItems;


    const handleAddItem =
      () => {
        const newItem = {};


        itemFields.forEach(
          (itemField) => {
            if (
              !itemField?.name
            ) {
              return;
            }


            newItem[
              itemField.name
            ] =
              getDefaultValue(
                itemField
              );
          }
        );


        onChange([
          ...items,
          newItem,
        ]);
      };


    const handleRemoveItem = (
      itemIndex
    ) => {
      /*
       * Protect the minimum at the
       * data level as well as the UI.
       */

      if (!canRemoveItem) {
        return;
      }


      onChange(
        items.filter(
          (_, index) =>
            index !==
            itemIndex
        )
      );
    };


    const handleItemChange = (
      itemIndex,
      itemFieldName,
      newValue
    ) => {
      onChange(
        items.map(
          (
            item,
            index
          ) =>
            index ===
            itemIndex
              ? {
                  ...item,

                  [itemFieldName]:
                    newValue,
                }
              : item
        )
      );
    };


    return (
      <div className="course-playground-template-field">
        {showLabel && (
          <label>
            {fieldLabel}

            {field.required &&
              " *"}
          </label>
        )}


        {field.help && (
          <p className="course-playground-field-help">
            {field.help}
          </p>
        )}


        <div className="course-playground-repeater">
          {items.map(
            (
              item,
              itemIndex
            ) => (
              <section
                key={
                  itemIndex
                }
                className="course-playground-question-editor"
              >
                <div className="course-playground-question-header">
                  <strong>
                    {field.item_label ||
                      "Item"}{" "}
                    {itemIndex + 1}
                  </strong>


                  {canRemoveItem && (
                    <button
                      type="button"
                      className="course-playground-question-remove"
                      onClick={() =>
                        handleRemoveItem(
                          itemIndex
                        )
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>


                {itemFields
                  .filter(
                    (
                      itemField
                    ) =>
                      shouldShowField(
                        itemField,
                        item
                      )
                  )
                  .map(
                    (
                      itemField
                    ) => (
                      <BlockConfigField
                        key={
                          itemField.name
                        }
                        field={
                          itemField
                        }
                        value={
                          item?.[
                            itemField
                              .name
                          ]
                        }
                        onChange={(
                          newValue
                        ) =>
                          handleItemChange(
                            itemIndex,
                            itemField.name,
                            newValue
                          )
                        }
                        siblingValues={
                          item
                        }
                      />
                    )
                  )}
              </section>
            )
          )}


          <button
            type="button"
            className="course-playground-small-add-button"
            onClick={
              handleAddItem
            }
          >
            + Add{" "}
            {field.item_label ||
              "Item"}
          </button>
        </div>
      </div>
    );
  }


  /*
   * =========================================
   * Standard field wrapper
   * =========================================
   */

  return (
    <div className="course-playground-template-field">
      {showLabel && (
        <label
          htmlFor={
            field.type ===
            "boolean"
              ? undefined
              : fieldId
          }
        >
          {fieldLabel}

          {field.required &&
            " *"}
        </label>
      )}


      {field.help && (
        <p className="course-playground-field-help">
          {field.help}
        </p>
      )}


      {field.type ===
      "textarea" ? (
        <textarea
          id={fieldId}
          rows={
            field.rows || 6
          }
          value={
            value ?? ""
          }
          placeholder={
            field.placeholder ||
            ""
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
        />
      ) : field.type ===
        "code" ? (
        <textarea
          id={fieldId}
          className="course-playground-content-editor"
          rows={
            field.rows || 10
          }
          spellCheck="false"
          value={
            value ?? ""
          }
          placeholder={
            field.placeholder ||
            ""
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
        />
      ) : field.type ===
        "boolean" ? (
        <label className="course-playground-checkbox">
          <input
            id={fieldId}
            type="checkbox"
            checked={
              Boolean(value)
            }
            onChange={(
              event
            ) =>
              onChange(
                event.target
                  .checked
              )
            }
          />


          <span>
            Enabled
          </span>
        </label>
      ) : field.type ===
        "select" ? (
        <select
          id={fieldId}
          value={
            value ??
            field.default ??
            ""
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
        >
          {(field.options ||
            []).map(
            (option) => {
              const optionValue =
                typeof option ===
                "string"
                  ? option
                  : option.value;


              const optionLabel =
                typeof option ===
                "string"
                  ? option
                  : option.label ??
                    option.value;


              return (
                <option
                  key={
                    optionValue
                  }
                  value={
                    optionValue
                  }
                >
                  {optionLabel}
                </option>
              );
            }
          )}
        </select>
      ) : (
        <input
          id={fieldId}
          type={
            field.type ===
            "number"
              ? "number"
              : "text"
          }
          value={
            value ?? ""
          }
          placeholder={
            field.placeholder ||
            ""
          }
          min={
            field.min
          }
          max={
            field.max
          }
          step={
            field.step
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
        />
      )}
    </div>
  );
}


export default BlockConfigField;