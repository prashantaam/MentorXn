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
  const allFields = getSchemaFields(schema);
  const settingFields = getSettingFields(schema);
  const selectedSchemaField = getSelectedSchemaField(schema, selection);
  const selectedFields = getFieldsForSelection(schema, selection);
  const title = getSelectionTitle(schema, selection);

  const handleFieldChange = (fieldName, value) => {
    onChange({
      ...form,
      [fieldName]: value,
    });
  };

  const handleRepeaterChange = (childFieldName, value) => {
    if (!selection || selection.type !== "repeater") {
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

  if (selection?.type === "repeater" && selectedSchemaField) {
    const items = Array.isArray(form?.[selection.fieldName])
      ? form[selection.fieldName]
      : [];

    const item = items[selection.index];

    if (!item) {
      return (
        <div className="visual-properties-panel">
          <div className="visual-block-editor-properties-body">
            <div className="visual-block-editor-empty">
              This item no longer exists.
            </div>

            <button
              type="button"
              className="visual-block-editor-show-all"
              onClick={onClearSelection}
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
          <span>EDIT</span>
          <h2>{title}</h2>
          <p>Changes appear instantly in the preview.</p>
        </div>

        <div className="visual-block-editor-properties-body">
          <div className="visual-block-editor-selection-badge">
            Editing {title}
          </div>

          {selectedFields.map((field) => (
            <div key={field.name} className="visual-block-editor-field">
              <BlockConfigField
                field={field}
                value={item?.[field.name]}
                siblingValues={item}
                onChange={(value) =>
                  handleRepeaterChange(field.name, value)
                }
              />
            </div>
          ))}

          <button
            type="button"
            className="visual-block-editor-show-all"
            onClick={onClearSelection}
          >
            ← Block settings
          </button>
        </div>
      </div>
    );
  }

  if (selection?.type === "field" && selectedFields.length > 0) {
    return (
      <div className="visual-properties-panel">
        <div className="visual-block-editor-panel-heading">
          <span>EDIT</span>
          <h2>{title}</h2>
          <p>Changes appear instantly in the preview.</p>
        </div>

        <div className="visual-block-editor-properties-body">
          <div className="visual-block-editor-selection-badge">
            Editing {title}
          </div>

          {selectedFields.map((field) => (
            <div key={field.name} className="visual-block-editor-field">
              <BlockConfigField
                field={field}
                value={form?.[field.name]}
                siblingValues={form}
                onChange={(value) =>
                  handleFieldChange(field.name, value)
                }
              />
            </div>
          ))}

          <button
            type="button"
            className="visual-block-editor-show-all"
            onClick={onClearSelection}
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
        <span>BLOCK SETTINGS</span>
        <h2>Edit block</h2>
        <p>
          Click editable content in the preview, or manage the complete block
          below.
        </p>
      </div>

      <div className="visual-block-editor-properties-body">
        <div className="visual-block-editor-tip">
          <strong>✨ Visual editing</strong>
          <span>
            Click highlighted content in the preview to edit that part directly.
          </span>
        </div>

        {allFields.map((field) => (
          <div key={field.name} className="visual-block-editor-field">
            <BlockConfigField
              field={field}
              value={form?.[field.name]}
              siblingValues={form}
              onChange={(value) => handleFieldChange(field.name, value)}
            />
          </div>
        ))}

        {settingFields.length > 0 && null}
      </div>
    </div>
  );
}

export default VisualPropertiesPanel;
