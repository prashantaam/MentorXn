/*
 * =========================================================
 * MentorXn - Shared Learning Block Configuration
 * =========================================================
 *
 * Configuration fields defined here are automatically
 * available to every learning block.
 *
 * Individual block seeders do not need to define these
 * shared fields separately.
 *
 * Current shared features:
 *
 * - Messages
 *
 * =========================================================
 */


/*
 * =========================================================
 * Shared Messages Field
 * =========================================================
 */

const sharedMessagesField = {
  name: "messages",

  label: "Messages",

  type: "repeater",

  required: false,

  item_label: "Message",

  visual: {
    selector:
      ".learning-block-message",

    selection_type:
      "repeater",

    index_attribute:
      "data-visual-index",
  },

  fields: [
    /*
     * -----------------------------------------
     * Message Type
     * -----------------------------------------
     */

    {
      name: "type",

      label: "Message type",

      type: "select",

      required: true,

      default: "success",

      options: [
        {
          value: "success",
          label: "Success",
        },

        {
          value: "warning",
          label: "Warning",
        },

        {
          value: "danger",
          label: "Danger",
        },
      ],
    },


    /*
     * -----------------------------------------
     * Message
     * -----------------------------------------
     */

    {
      name: "text",

      label: "Message",

      type: "textarea",

      required: true,

      rows: 3,

      placeholder:
        "Enter a message for the learner.",
    },
  ],
};


/*
 * =========================================================
 * Shared Block Fields
 * =========================================================
 */

export const sharedBlockFields = [
  sharedMessagesField,
];


/*
 * =========================================================
 * Merge Shared Fields Into Template Schema
 * =========================================================
 *
 * Example:
 *
 * Template:
 *
 * title
 * icon
 * subtitle
 * items
 *
 * Becomes:
 *
 * title
 * icon
 * subtitle
 * items
 * messages
 *
 * The original schema object is NOT modified.
 *
 * =========================================================
 */

export function withSharedBlockFields(
  schema
) {
  /*
   * Get the template's existing fields.
   */

  const templateFields =
    Array.isArray(
      schema?.fields
    )
      ? schema.fields
      : [];


  /*
   * Build a set containing all existing
   * field names.
   */

  const existingFieldNames =
    new Set(
      templateFields
        .map(
          (field) =>
            field?.name
        )
        .filter(
          Boolean
        )
    );


  /*
   * Do not add a shared field if the
   * template already defines a field
   * using the same name.
   */

  const missingSharedFields =
    sharedBlockFields.filter(
      (sharedField) =>
        !existingFieldNames.has(
          sharedField.name
        )
    );


  /*
   * Return a new combined schema.
   */

  return {
    ...(schema || {}),

    fields: [
      ...templateFields,
      ...missingSharedFields,
    ],
  };
}