/**
 * =========================================================
 * MentorXn - Generic Visual Editor Utilities
 * =========================================================
 *
 * These helpers know nothing about individual block types.
 *
 * They operate only on:
 *
 * - configuration schema
 * - visual metadata
 * - DOM selectors
 * - template form data
 *
 * IMPORTANT:
 *
 * This file must remain block-agnostic.
 *
 * Do not add checks such as:
 *
 * if (component === "SequenceBlock")
 * if (component === "BigIdeasBlock")
 * if (component === "QuizBlock")
 *
 * Individual templates describe their visual editing
 * behaviour through configuration_schema.visual metadata.
 *
 * =========================================================
 */


/**
 * Return all fields from a configuration schema.
 */
export function getSchemaFields(
  schema
) {
  return Array.isArray(
    schema?.fields
  )
    ? schema.fields
    : [];
}


/**
 * Return only fields that contain visual metadata.
 */
export function getVisualFields(
  schema
) {
  return getSchemaFields(
    schema
  ).filter(
    (field) =>
      Boolean(
        field?.visual
          ?.selector
      )
  );
}


/**
 * Return fields that are normal block settings.
 *
 * These do not need to be clicked in the preview.
 */
export function getSettingFields(
  schema
) {
  return getSchemaFields(
    schema
  ).filter(
    (field) =>
      !field?.visual
        ?.selector
  );
}


/**
 * Resolve the source-data index for a visually selected
 * repeater item.
 *
 * Normally the rendered DOM order matches the source array:
 *
 * DOM item 1 -> items[0]
 * DOM item 2 -> items[1]
 * DOM item 3 -> items[2]
 *
 * Some interactive blocks may render their items in a
 * different order, for example after shuffling.
 *
 * Those blocks can expose the original source index:
 *
 * <div data-visual-index="3">
 *
 * and declare the attribute in their schema:
 *
 * visual: {
 *   selector: ".some-item",
 *   selection_type: "repeater",
 *   index_attribute: "data-visual-index"
 * }
 *
 * If no index_attribute is configured, the editor falls
 * back to DOM position.
 */
function resolveRepeaterIndex({
  field,
  matchedElement,
  root,
  selector,
}) {
  const indexAttribute =
    field?.visual
      ?.index_attribute;

  /*
   * First preference:
   *
   * Use an explicitly supplied source index.
   *
   * This supports shuffled/reordered visual blocks without
   * requiring the generic editor to know anything about
   * the individual block component.
   */
  if (indexAttribute) {
    const rawIndex =
      matchedElement.getAttribute(
        indexAttribute
      );

    if (
      rawIndex !== null &&
      rawIndex !== ""
    ) {
      const parsedIndex =
        Number(rawIndex);

      if (
        Number.isInteger(
          parsedIndex
        ) &&
        parsedIndex >= 0
      ) {
        return parsedIndex;
      }
    }
  }

  /*
   * Default behaviour:
   *
   * Use the position of the matched element in the DOM.
   *
   * This works for normal repeaters whose rendered order
   * matches their source-data order.
   */
  const elements =
    Array.from(
      root.querySelectorAll(
        selector
      )
    );

  return elements.indexOf(
    matchedElement
  );
}


/**
 * Find the visual schema entry represented by a DOM click.
 *
 * ---------------------------------------------------------
 * Repeater field
 * ---------------------------------------------------------
 *
 * Schema:
 *
 * visual: {
 *   selector: ".some-item",
 *   selection_type: "repeater"
 * }
 *
 * Clicking the second matching element produces:
 *
 * {
 *   type: "repeater",
 *   fieldName: "items",
 *   index: 1
 * }
 *
 * ---------------------------------------------------------
 * Reordered repeater
 * ---------------------------------------------------------
 *
 * A block may expose:
 *
 * data-visual-index="4"
 *
 * and configure:
 *
 * index_attribute: "data-visual-index"
 *
 * The selection will then use index 4 regardless of where
 * that item currently appears in the DOM.
 *
 * ---------------------------------------------------------
 * Normal field
 * ---------------------------------------------------------
 *
 * {
 *   type: "field",
 *   fieldName: "subtitle"
 * }
 */
export function findVisualSelection({
  target,
  root,
  schema,
}) {
  if (
    !target ||
    !root ||
    !(target instanceof Element)
  ) {
    return null;
  }

  const visualFields =
    getVisualFields(
      schema
    );


  /*
   * =======================================================
   * Repeater regions
   * =======================================================
   *
   * Check repeater regions first.
   *
   * A repeater item may contain child elements, buttons,
   * text and other controls, so it should take priority
   * over broader block-level selectors.
   */
  const repeaterFields =
    visualFields.filter(
      (field) =>
        field.type ===
          "repeater" ||
        field.visual
          ?.selection_type ===
          "repeater"
    );

  for (
    const field of
    repeaterFields
  ) {
    const selector =
      field.visual
        ?.selector;

    if (!selector) {
      continue;
    }

    /*
     * closest() means clicking any child inside the visual
     * item still selects the item's wrapper.
     */
    const matchedElement =
      target.closest(
        selector
      );

    if (
      !matchedElement ||
      !root.contains(
        matchedElement
      )
    ) {
      continue;
    }

    /*
     * Determine which source-data item this rendered
     * element represents.
     *
     * This is intentionally generic:
     *
     * - ordinary repeater -> DOM position
     * - reordered repeater -> index_attribute
     */
    const index =
      resolveRepeaterIndex({
        field,
        matchedElement,
        root,
        selector,
      });

    if (index < 0) {
      continue;
    }

    return {
      type: "repeater",
      fieldName:
        field.name,
      index,
    };
  }


  /*
   * =======================================================
   * Normal visual fields
   * =======================================================
   */

  for (
    const field of
    visualFields
  ) {
    /*
     * Repeaters have already been processed above.
     */
    if (
      field.type ===
        "repeater" ||
      field.visual
        ?.selection_type ===
        "repeater"
    ) {
      continue;
    }

    const selector =
      field.visual
        ?.selector;

    if (!selector) {
      continue;
    }

    const matchedElement =
      target.closest(
        selector
      );

    if (
      matchedElement &&
      root.contains(
        matchedElement
      )
    ) {
      return {
        type: "field",

        fieldName:
          field.name,

        group:
          field.visual
            ?.group ||
          null,

        selector,
      };
    }
  }

  return null;
}


/**
 * Find the schema field represented by a selection.
 */
export function getSelectedSchemaField(
  schema,
  selection
) {
  if (!selection) {
    return null;
  }

  return (
    getSchemaFields(
      schema
    ).find(
      (field) =>
        field.name ===
        selection.fieldName
    ) || null
  );
}


/**
 * Find all fields that share the same selector.
 *
 * Example:
 *
 * title and icon may both map to:
 *
 * .learning-block > h2
 *
 * Clicking the heading can therefore display both.
 */
export function getFieldsForSelection(
  schema,
  selection
) {
  if (!selection) {
    return [];
  }

  const selectedField =
    getSelectedSchemaField(
      schema,
      selection
    );

  if (!selectedField) {
    return [];
  }


  /*
   * For a repeater selection, return the child fields
   * belonging to that repeater.
   *
   * Example:
   *
   * items:
   *   - icon
   *   - title
   *   - content
   */
  if (
    selection.type ===
    "repeater"
  ) {
    return Array.isArray(
      selectedField.fields
    )
      ? selectedField.fields
      : [];
  }


  /*
   * For a normal visual field, fields sharing the same
   * selector are edited together.
   *
   * Example:
   *
   * title + icon
   *
   * can both map to the block heading.
   */
  const selector =
    selectedField.visual
      ?.selector;

  if (!selector) {
    return [
      selectedField,
    ];
  }

  return getSchemaFields(
    schema
  ).filter(
    (field) =>
      field.visual
        ?.selector ===
      selector
  );
}


/**
 * Human-readable selection title.
 */
export function getSelectionTitle(
  schema,
  selection
) {
  if (!selection) {
    return "Block settings";
  }

  const field =
    getSelectedSchemaField(
      schema,
      selection
    );

  if (!field) {
    return "Edit content";
  }


  /*
   * Repeater selection.
   *
   * Example:
   *
   * Step 1
   * Step 2
   * Idea 1
   * Card 3
   */
  if (
    selection.type ===
    "repeater"
  ) {
    const itemLabel =
      field.item_label ||
      "Item";

    return `${itemLabel} ${
      selection.index + 1
    }`;
  }


  /*
   * Normal field.
   */
  return (
    field.label ||
    "Edit content"
  );
}


/**
 * Update one nested repeater item.
 *
 * Example:
 *
 * items[2].text = "New text"
 *
 * This returns a new form object rather than mutating the
 * existing React state.
 */
export function updateRepeaterItem(
  form,
  fieldName,
  index,
  childFieldName,
  value
) {
  const items =
    Array.isArray(
      form?.[fieldName]
    )
      ? form[fieldName]
      : [];

  const nextItems =
    items.map(
      (
        item,
        itemIndex
      ) => {
        if (
          itemIndex !== index
        ) {
          return item;
        }

        return {
          ...item,

          [childFieldName]:
            value,
        };
      }
    );

  return {
    ...form,

    [fieldName]:
      nextItems,
  };
}