import BlockConfigField from "../../../pages/teacher/courses/BlockConfigField";

import {
  getFieldsForSelection,
  getSchemaFields,
  getSelectedSchemaField,
  getSelectionTitle,
  getSettingFields,
  updateRepeaterItem,
} from "./visualEditorUtils";


function VisualPropertiesPanel({
  schema,
  form,
  selection,
  onChange,
  onClearSelection,
}) {
  const allFields =
    getSchemaFields(
      schema
    );

  const settingFields =
    getSettingFields(
      schema
    );

  const selectedSchemaField =
    getSelectedSchemaField(
      schema,
      selection
    );

  const selectedFields =
    getFieldsForSelection(
      schema,
      selection
    );

  const title =
    getSelectionTitle(
      schema,
      selection
    );


  /*
   * =========================================
   * Top-Level Field Change
   * =========================================
   */

  const handleFieldChange = (
    fieldName,
    value
  ) => {
    onChange({
      ...form,
      [fieldName]:
        value,
    });
  };


  /*
   * =========================================
   * Repeater Item Change
   * =========================================
   */

  const handleRepeaterChange = (
    childFieldName,
    value
  ) => {
    if (
      !selection ||
      selection.type !==
        "repeater"
    ) {
      return;
    }

    onChange(
      updateRepeaterItem(
        form,
        selection.fieldName,
        selection.index,
        childFieldName,
        value
      )
    );
  };


  /*
   * =========================================
   * Repeater Item
   * =========================================
   */

  if (
    selection?.type ===
      "repeater" &&
    selectedSchemaField
  ) {
    const items =
      Array.isArray(
        form?.[
          selection.fieldName
        ]
      )
        ? form[
            selection.fieldName
          ]
        : [];

    const item =
      items[
        selection.index
      ];

    if (!item) {
      return (
        <div className="visual-properties-panel">
          <div className="visual-block-editor-properties-body">
            <div className="visual-block-editor-empty">
              This item no longer
              exists.
            </div>

            <button
              type="button"
              className="visual-block-editor-show-all"
              onClick={
                onClearSelection
              }
            >
              ← Block settings
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="visual-properties-panel">
        <div className="visual-block-editor-panel-heading">
          <span>
            EDIT
          </span>

          <h2>
            {title}
          </h2>

          <p>
            Changes appear
            instantly in the
            preview.
          </p>
        </div>

        <div className="visual-block-editor-properties-body">
          <div className="visual-block-editor-selection-badge">
            Editing {title}
          </div>

          {selectedFields.map(
            (field) => (
              <div
                key={
                  field.name
                }
                className="visual-block-editor-field"
              >
                <BlockConfigField
                  field={
                    field
                  }
                  value={
                    item?.[
                      field.name
                    ]
                  }
                  onChange={(
                    value
                  ) =>
                    handleRepeaterChange(
                      field.name,
                      value
                    )
                  }
                />
              </div>
            )
          )}

          <button
            type="button"
            className="visual-block-editor-show-all"
            onClick={
              onClearSelection
            }
          >
            ← Block settings
          </button>
        </div>
      </div>
    );
  }


  /*
   * =========================================
   * Normal Visual Field
   * =========================================
   */

  if (
    selection?.type ===
    "field" &&
    selectedFields.length >
      0
  ) {
    return (
      <div className="visual-properties-panel">
        <div className="visual-block-editor-panel-heading">
          <span>
            EDIT
          </span>

          <h2>
            {title}
          </h2>

          <p>
            Changes appear
            instantly in the
            preview.
          </p>
        </div>

        <div className="visual-block-editor-properties-body">
          <div className="visual-block-editor-selection-badge">
            Editing {title}
          </div>

          {selectedFields.map(
            (field) => (
              <div
                key={
                  field.name
                }
                className="visual-block-editor-field"
              >
                <BlockConfigField
                  field={
                    field
                  }
                  value={
                    form?.[
                      field.name
                    ]
                  }
                  onChange={(
                    value
                  ) =>
                    handleFieldChange(
                      field.name,
                      value
                    )
                  }
                />
              </div>
            )
          )}

          <button
            type="button"
            className="visual-block-editor-show-all"
            onClick={
              onClearSelection
            }
          >
            ← Block settings
          </button>
        </div>
      </div>
    );
  }


  /*
   * =========================================
   * Default Block Settings
   * =========================================
   */

  return (
    <div className="visual-properties-panel">
      <div className="visual-block-editor-panel-heading">
        <span>
          BLOCK SETTINGS
        </span>

        <h2>
          Edit block
        </h2>

        <p>
          Click editable content
          in the preview, or manage
          the complete block below.
        </p>
      </div>

      <div className="visual-block-editor-properties-body">
        <div className="visual-block-editor-tip">
          <strong>
            ✨ Visual editing
          </strong>

          <span>
            Click highlighted
            content in the preview
            to edit that part
            directly.
          </span>
        </div>

        {/*
         * Keep all fields available here.
         *
         * This remains the complete /
         * advanced editor and preserves
         * repeater add/remove functionality.
         */}

        {allFields.map(
          (field) => (
            <div
              key={
                field.name
              }
              className="visual-block-editor-field"
            >
              <BlockConfigField
                field={
                  field
                }
                value={
                  form?.[
                    field.name
                  ]
                }
                onChange={(
                  value
                ) =>
                  handleFieldChange(
                    field.name,
                    value
                  )
                }
              />
            </div>
          )
        )}

        {/*
         * settingFields is intentionally
         * calculated above because later
         * we can split this screen into:
         *
         * Content
         * Block Settings
         *
         * without changing the schema.
         */}

        {settingFields.length >
          0 && null}
      </div>
    </div>
  );
}

export default VisualPropertiesPanel;