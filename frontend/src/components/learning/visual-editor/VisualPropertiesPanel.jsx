import { useState } from "react";

import BlockConfigField from "../../../pages/teacher/courses/BlockConfigField";

import {
  getFieldsForSelection,
  getSchemaFields,
  getSelectedSchemaField,
  getSelectionTitle,
  getSettingFields,
  updateRepeaterItem,
} from "./visualEditorUtils";


/* =========================================================
   Configuration Section
   ========================================================= */

function ConfigSection({
  section,
  fields,
  form,
  onFieldChange,
  defaultOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="visual-block-editor-config-section">
      <button
        type="button"
        className="visual-block-editor-config-section-header"
        onClick={() =>
          setIsOpen((current) => !current)
        }
        aria-expanded={isOpen}
      >
        <span
          className="visual-block-editor-config-section-toggle"
          aria-hidden="true"
        >
          {isOpen ? "▼" : "▶"}
        </span>

        <strong>
          {section?.title || "Settings"}
        </strong>
      </button>

      {isOpen && (
        <div className="visual-block-editor-config-section-body">
          {fields.map((field) => (
            <div
              key={field.name}
              className="visual-block-editor-field"
            >
              <BlockConfigField
                field={field}
                value={form?.[field.name]}
                siblingValues={form}
                onChange={(value) =>
                  onFieldChange(
                    field.name,
                    value
                  )
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* =========================================================
   Global Block Settings
   ========================================================= */

/*
 * Block Settings are platform-level settings.
 *
 * A block developer should not have to create a separate
 * collapsible Block Settings section for every template.
 *
 * Backwards compatibility:
 *
 * Existing templates may already contain a section named
 * "Block Settings". Its fields are automatically moved into
 * the global Block Settings section below.
 *
 * Any top-level fields that are not assigned to one of the
 * remaining block-specific sections are also treated as
 * global/common settings. This allows shared fields injected
 * by the platform (for example Message Display) to appear
 * automatically without each block Seeder having to list them.
 */

function isBlockSettingsSection(section) {
  const title = String(
    section?.title ||
    section?.label ||
    section?.name ||
    ""
  )
    .trim()
    .toLowerCase();

  return (
    title === "block settings" ||
    title === "block_settings" ||
    title === "1. block settings"
  );
}

function getSectionFieldNames(section) {
  return Array.isArray(section?.fields)
    ? section.fields
    : [];
}

function getGlobalBlockSettingFields(
  allFields,
  sections
) {
  const blockSettingsSection =
    sections.find(
      isBlockSettingsSection
    );

  const explicitGlobalNames =
    getSectionFieldNames(
      blockSettingsSection
    );

  const blockSpecificFieldNames =
    new Set(
      sections
        .filter(
          (section) =>
            !isBlockSettingsSection(
              section
            )
        )
        .flatMap(
          getSectionFieldNames
        )
    );

  /*
   * Preserve the order declared by an existing Block Settings
   * section first.
   */
  const explicitGlobalFields =
    explicitGlobalNames
      .map((fieldName) =>
        allFields.find(
          (field) =>
            field.name === fieldName
        )
      )
      .filter(Boolean);

  const explicitGlobalSet =
    new Set(
      explicitGlobalFields.map(
        (field) => field.name
      )
    );

  /*
   * Shared/global fields injected by the platform will not
   * normally belong to a block-specific section.
   *
   * Add them automatically so things such as Message Display
   * remain available to every block template.
   */
  const automaticallyGlobalFields =
    allFields.filter(
      (field) =>
        !explicitGlobalSet.has(
          field.name
        ) &&
        !blockSpecificFieldNames.has(
          field.name
        )
    );

  return [
    ...explicitGlobalFields,
    ...automaticallyGlobalFields,
  ];
}


/* =========================================================
   Visual Properties Panel
   ========================================================= */

function VisualPropertiesPanel({
  schema,
  form,
  selection,
  onChange,
  onClearSelection,
  onSelectionChange,
}) {
  const allFields =
    getSchemaFields(schema);

  const settingFields =
    getSettingFields(schema);

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

  /**
   * Optional section configuration.
   *
   * Block Settings are handled globally by this component.
   *
   * schema.sections therefore only needs to describe the
   * block-specific sections such as Inputs, Actions, Results,
   * Questions, Buckets, etc.
   *
   * Existing templates that still define "Block Settings"
   * remain compatible.
   */
  const sections =
    Array.isArray(schema?.sections)
      ? schema.sections
      : [];

  const blockSpecificSections =
    sections.filter(
      (section) =>
        !isBlockSettingsSection(
          section
        )
    );

  const globalBlockSettingFields =
    getGlobalBlockSettingFields(
      allFields,
      sections
    );


  /* =======================================================
     Top-Level Field Change
     ======================================================= */

  const handleFieldChange = (
    fieldName,
    value
  ) => {
    onChange({
      ...form,
      [fieldName]: value,
    });
  };


  /* =======================================================
     Repeater Item Change
     ======================================================= */

  const handleRepeaterChange = (
    childFieldName,
    value
  ) => {
    if (
      !selection ||
      selection.type !== "repeater"
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


  /* =======================================================
     Repeater Item Selected
     ======================================================= */

  if (
    selection?.type === "repeater" &&
    selectedSchemaField
  ) {
    const items =
      Array.isArray(
        form?.[selection.fieldName]
      )
        ? form[selection.fieldName]
        : [];

    const item =
      items[selection.index];

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
          <span>
            EDIT
          </span>

          <h2>
            {title}
          </h2>

          <p>
            Changes appear instantly in the preview.
          </p>
        </div>

        <div className="visual-block-editor-properties-body">
          <div className="visual-block-editor-item-bar">
            <div className="visual-block-editor-selection-badge">
              Editing {title}
            </div>

            {/* Move the selected item up or down the list; the panel follows it. */}
            {items.length > 1 && (
              <div className="visual-block-editor-move" role="group" aria-label="Move this item">
                {[
                  ["↑ Move up", -1],
                  ["↓ Move down", 1],
                ].map(([label, step]) => {
                  const target = selection.index + step;
                  const canMove = target >= 0 && target < items.length;

                  return (
                    <button
                      key={label}
                      type="button"
                      className="visual-block-editor-move__btn"
                      disabled={!canMove}
                      onClick={() => {
                        const moved = [...items];
                        [moved[selection.index], moved[target]] = [moved[target], moved[selection.index]];
                        onChange({ ...form, [selection.fieldName]: moved });
                        onSelectionChange?.({ ...selection, index: target });
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedFields.map(
            (field) => (
              <div
                key={field.name}
                className="visual-block-editor-field"
              >
                <BlockConfigField
                  field={field}
                  value={
                    item?.[
                      field.name
                    ]
                  }
                  siblingValues={item}
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
            onClick={onClearSelection}
          >
            ← Block settings
          </button>
        </div>
      </div>
    );
  }


  /* =======================================================
     Individual Top-Level Field Selected
     ======================================================= */

  if (
    selection?.type === "field" &&
    selectedFields.length > 0
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
            Changes appear instantly in the preview.
          </p>
        </div>

        <div className="visual-block-editor-properties-body">
          <div className="visual-block-editor-selection-badge">
            Editing {title}
          </div>

          {selectedFields.map(
            (field) => (
              <div
                key={field.name}
                className="visual-block-editor-field"
              >
                <BlockConfigField
                  field={field}
                  value={
                    form?.[
                      field.name
                    ]
                  }
                  siblingValues={form}
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
            onClick={onClearSelection}
          >
            ← Block settings
          </button>
        </div>
      </div>
    );
  }


  /* =======================================================
     Default Block Settings View
     ======================================================= */

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
          Click editable content in the preview,
          or manage the complete block below.
        </p>
      </div>

      <div className="visual-block-editor-properties-body">

        {/* ===============================================
            Global Block Settings

            Always rendered first and open by default.

            Existing Block Settings sections are absorbed
            here automatically.

            Shared/global fields that are not assigned to a
            block-specific section are also included here.
            =============================================== */}

        {globalBlockSettingFields.length > 0 && (
          <ConfigSection
            section={{
              title: "Block Settings",
            }}
            fields={
              globalBlockSettingFields
            }
            form={form}
            onFieldChange={
              handleFieldChange
            }
            defaultOpen={true}
          />
        )}


        {/* ===============================================
            Block-Specific Sections

            These come from schema.sections.

            They are closed by default because the global
            Block Settings section is the primary section.
            =============================================== */}

        {blockSpecificSections.length > 0 ? (
          blockSpecificSections.map(
            (
              section,
              sectionIndex
            ) => {
              const sectionFieldNames =
                getSectionFieldNames(
                  section
                );

              const sectionFields =
                sectionFieldNames
                  .map(
                    (fieldName) =>
                      allFields.find(
                        (field) =>
                          field.name ===
                          fieldName
                      )
                  )
                  .filter(Boolean);

              if (
                sectionFields.length ===
                0
              ) {
                return null;
              }

              return (
                <ConfigSection
                  key={
                    section.title ||
                    section.label ||
                    section.name ||
                    sectionIndex
                  }
                  section={{
                    ...section,
                    title:
                      section.title ||
                      section.label ||
                      section.name ||
                      "Settings",
                  }}
                  fields={
                    sectionFields
                  }
                  form={form}
                  onFieldChange={
                    handleFieldChange
                  }
                  defaultOpen={false}
                />
              );
            }
          )
        ) : (
          /*
           * Backwards compatibility for templates without
           * schema.sections.
           *
           * Global settings are already shown above.
           * Render any remaining fields using the original
           * flat configuration layout.
           */
          allFields
            .filter(
              (field) =>
                !globalBlockSettingFields.some(
                  (globalField) =>
                    globalField.name ===
                    field.name
                )
            )
            .map(
              (field) => (
                <div
                  key={field.name}
                  className="visual-block-editor-field"
                >
                  <BlockConfigField
                    field={field}
                    value={
                      form?.[
                        field.name
                      ]
                    }
                    siblingValues={
                      form
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
            )
        )}

        {settingFields.length > 0 &&
          null}
      </div>
    </div>
  );
}

export default VisualPropertiesPanel;
