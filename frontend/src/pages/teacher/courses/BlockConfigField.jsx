function BlockConfigField({
  field,
  value,
  onChange,
}) {
  if (!field?.name) {
    return null;
  }

  const fieldId = `block-config-${field.name}`;

  const label = field.label || field.name;

  const requiredMark = field.required
    ? " *"
    : "";

  /*
   * =========================================
   * Text
   * =========================================
   */

  if (field.type === "text") {
    return (
      <>
        <label htmlFor={fieldId}>
          {label}
          {requiredMark}
        </label>

        <input
          id={fieldId}
          type="text"
          value={value ?? ""}
          placeholder={
            field.placeholder || ""
          }
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
        />
      </>
    );
  }

  /*
   * =========================================
   * Number
   * =========================================
   */

  if (field.type === "number") {
    return (
      <>
        <label htmlFor={fieldId}>
          {label}
          {requiredMark}
        </label>

        <input
          id={fieldId}
          type="number"
          value={value ?? ""}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={
            field.placeholder || ""
          }
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
        />
      </>
    );
  }

  /*
   * =========================================
   * Textarea
   * =========================================
   */

  if (
    field.type === "textarea"
  ) {
    return (
      <>
        <label htmlFor={fieldId}>
          {label}
          {requiredMark}
        </label>

        <textarea
          id={fieldId}
          rows={
            field.rows || 5
          }
          value={value ?? ""}
          placeholder={
            field.placeholder || ""
          }
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
        />
      </>
    );
  }

  /*
   * =========================================
   * Code
   * =========================================
   */

  if (field.type === "code") {
    return (
      <>
        <label htmlFor={fieldId}>
          {label}
          {requiredMark}
        </label>

        <textarea
          id={fieldId}
          rows={
            field.rows || 10
          }
          value={value ?? ""}
          placeholder={
            field.placeholder || ""
          }
          className="course-playground-code-input"
          spellCheck="false"
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
        />
      </>
    );
  }

  /*
   * =========================================
   * Boolean
   * =========================================
   */

  if (
    field.type === "boolean"
  ) {
    return (
      <label className="course-playground-checkbox">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) =>
            onChange(
              event.target.checked
            )
          }
        />

        <span>
          {label}
        </span>
      </label>
    );
  }

  /*
   * =========================================
   * Select
   * =========================================
   */

  if (field.type === "select") {
    const options =
      Array.isArray(field.options)
        ? field.options
        : [];

    return (
      <>
        <label htmlFor={fieldId}>
          {label}
          {requiredMark}
        </label>

        <select
          id={fieldId}
          value={value ?? ""}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
        >
          {options.map(
            (option, index) => {
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
                    `${field.name}-${optionValue}-${index}`
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
      </>
    );
  }

  /*
   * =========================================
   * Repeater
   * =========================================
   */

  if (
    field.type === "repeater"
  ) {
    const items =
      Array.isArray(value)
        ? value
        : [];

    const itemFields =
      Array.isArray(field.fields)
        ? field.fields
        : [];

    const addItem = () => {
      const newItem = {};

      itemFields.forEach(
        (itemField) => {
          if (!itemField?.name) {
            return;
          }

          if (
            Object.prototype.hasOwnProperty.call(
              itemField,
              "default"
            )
          ) {
            newItem[
              itemField.name
            ] =
              itemField.default;

            return;
          }

          if (
            itemField.type ===
            "boolean"
          ) {
            newItem[
              itemField.name
            ] = false;

            return;
          }

          if (
            itemField.type ===
            "repeater"
          ) {
            newItem[
              itemField.name
            ] = [];

            return;
          }

          if (
            itemField.type ===
            "select"
          ) {
            const firstOption =
              itemField
                .options?.[0];

            newItem[
              itemField.name
            ] =
              typeof firstOption ===
              "string"
                ? firstOption
                : firstOption
                    ?.value ?? "";

            return;
          }

          newItem[
            itemField.name
          ] = "";
        }
      );

      onChange([
        ...items,
        newItem,
      ]);
    };

    const removeItem = (
      itemIndex
    ) => {
      onChange(
        items.filter(
          (_, index) =>
            index !== itemIndex
        )
      );
    };

    const changeItemField = (
      itemIndex,
      itemFieldName,
      newValue
    ) => {
      onChange(
        items.map(
          (item, index) =>
            index === itemIndex
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
      <div className="course-playground-repeater">
        <div className="course-playground-repeater-heading">
          <label>
            {label}
            {requiredMark}
          </label>

          {field.help && (
            <span>
              {field.help}
            </span>
          )}
        </div>

        {items.length === 0 && (
          <div className="course-playground-repeater-empty">
            No items added yet.
          </div>
        )}

        {items.map(
          (item, itemIndex) => (
            <div
              key={
                `${field.name}-${itemIndex}`
              }
              className="course-playground-repeater-item"
            >
              <div className="course-playground-repeater-item-heading">
                <strong>
                  {field.item_label ||
                    field.itemLabel ||
                    "Item"}{" "}
                  {itemIndex + 1}
                </strong>

                <button
                  type="button"
                  className="course-playground-repeater-remove"
                  onClick={() =>
                    removeItem(
                      itemIndex
                    )
                  }
                >
                  Remove
                </button>
              </div>

              <div className="course-playground-repeater-fields">
                {itemFields.map(
                  (itemField) => (
                    <BlockConfigField
                      key={
                        `${field.name}-${itemIndex}-${itemField.name}`
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
                        changeItemField(
                          itemIndex,
                          itemField.name,
                          newValue
                        )
                      }
                    />
                  )
                )}
              </div>
            </div>
          )
        )}

        <button
          type="button"
          className="course-playground-repeater-add"
          onClick={addItem}
        >
          + Add{" "}
          {field.item_label ||
            field.itemLabel ||
            "Item"}
        </button>
      </div>
    );
  }

  /*
   * =========================================
   * Unknown field type
   * =========================================
   *
   * We deliberately fall back to a normal
   * text field so an unsupported schema field
   * does not break the entire configuration
   * drawer.
   */

  return (
    <>
      <label htmlFor={fieldId}>
        {label}
        {requiredMark}
      </label>

      <input
        id={fieldId}
        type="text"
        value={
          typeof value === "string" ||
          typeof value === "number"
            ? value
            : ""
        }
        placeholder={
          field.placeholder || ""
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />
    </>
  );
}

export default BlockConfigField;