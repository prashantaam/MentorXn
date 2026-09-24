import {
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../../context/AuthContext";

import "../../../styles/lblock-templates.css";


const COMPONENT_OPTIONS = [
  {
    value: "ContentBlock",
    label: "Content",
    icon: "📖",
    description:
      "Static learning content with text, code, mascot and other presentation fields.",
  },

  {
    value: "QuizBlock",
    label: "Quiz",
    icon: "🧠",
    description:
      "Question and answer based learning activities.",
  },

  {
    value: "InteractiveBlock",
    label: "Interactive",
    icon: "🧩",
    description:
      "Interactive learning experiences such as buttons, reveals and exploration.",
  },

  {
    value: "PracticeTerminalBlock",
    label: "Terminal",
    icon: "🖥️",
    description:
      "Safe simulated command-line learning activities.",
  },
];


const FIELD_TYPES = [
  {
    value: "text",
    label: "Text",
  },

  {
    value: "textarea",
    label: "Long Text",
  },

  {
    value: "code",
    label: "Code",
  },

  {
    value: "number",
    label: "Number",
  },

  {
    value: "boolean",
    label: "Yes / No",
  },
];


function makeFieldId() {
  return `${Date.now()}-${Math.random()}`;
}


function CreateLBlockTemplatePage() {
  const navigate =
    useNavigate();

  const {
    token,
  } = useAuth();


  /* ========================================
     TEMPLATE INFORMATION
  ======================================== */

  const [
    name,
    setName,
  ] = useState("");


  const [
    templateIcon,
    setTemplateIcon,
  ] = useState("📖");


  const [
    description,
    setDescription,
  ] = useState("");


  const [
    component,
    setComponent,
  ] = useState("ContentBlock");


  const [
    position,
    setPosition,
  ] = useState(0);


  /* ========================================
     TAGS
  ======================================== */

  const [
    tags,
    setTags,
  ] = useState([
    "Content",
  ]);


  const [
    tagInput,
    setTagInput,
  ] = useState("");


  /* ========================================
     STANDARD STUDENT FIELDS
  ======================================== */

  const [
    includeTitle,
    setIncludeTitle,
  ] = useState(true);


  const [
    includeIcon,
    setIncludeIcon,
  ] = useState(true);


  /* ========================================
     CUSTOM CONFIGURABLE FIELDS
  ======================================== */

  const [
    fields,
    setFields,
  ] = useState([]);


  /* ========================================
     EXAMPLE DATA
  ======================================== */

  const [
    exampleData,
    setExampleData,
  ] = useState({
    title: "",
    icon: "",
  });


  /* ========================================
     REQUEST STATE
  ======================================== */

  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  /* ========================================
     SELECTED COMPONENT
  ======================================== */

  const selectedComponent =
    useMemo(
      () =>
        COMPONENT_OPTIONS.find(
          (option) =>
            option.value === component
        ),
      [component]
    );


  /* ========================================
     COMPONENT CHANGE
  ======================================== */

  const handleComponentChange = (
    event
  ) => {
    const newComponent =
      event.target.value;

    setComponent(
      newComponent
    );


    const option =
      COMPONENT_OPTIONS.find(
        (item) =>
          item.value === newComponent
      );


    if (option) {
      setTemplateIcon(
        option.icon
      );


      /*
       * Start with a useful organisational
       * tag for the selected component.
       *
       * The teacher can remove or change it.
       */
      setTags([
        option.label,
      ]);
    }
  };


  /* ========================================
     TAGS
  ======================================== */

  const addTag = () => {
    const cleanTag =
      tagInput.trim();

    if (!cleanTag) {
      return;
    }


    const alreadyExists =
      tags.some(
        (tag) =>
          tag.toLowerCase() ===
          cleanTag.toLowerCase()
      );


    if (!alreadyExists) {
      setTags([
        ...tags,
        cleanTag,
      ]);
    }


    setTagInput("");
  };


  const handleTagKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" ||
      event.key === ","
    ) {
      event.preventDefault();

      addTag();
    }
  };


  const removeTag = (
    tagToRemove
  ) => {
    setTags(
      tags.filter(
        (tag) =>
          tag !== tagToRemove
      )
    );
  };


  /* ========================================
     CUSTOM FIELDS
  ======================================== */

  const addField = () => {
    setFields([
      ...fields,

      {
        id: makeFieldId(),

        name: "",

        label: "",

        type: "text",

        required: false,
      },
    ]);
  };


  const updateField = (
    id,
    property,
    value
  ) => {
    setFields(
      fields.map(
        (field) => {

          if (
            field.id !== id
          ) {
            return field;
          }


          return {
            ...field,

            [property]:
              value,
          };
        }
      )
    );
  };


  const removeField = (
    id
  ) => {
    const fieldToRemove =
      fields.find(
        (field) =>
          field.id === id
      );


    setFields(
      fields.filter(
        (field) =>
          field.id !== id
      )
    );


    if (
      fieldToRemove?.name
    ) {
      setExampleData(
        (current) => {

          const next = {
            ...current,
          };

          delete next[
            fieldToRemove.name
          ];

          return next;
        }
      );
    }
  };


  /* ========================================
     EXAMPLE DATA
  ======================================== */

  const updateExampleData = (
    fieldName,
    value
  ) => {
    setExampleData(
      (current) => ({
        ...current,

        [fieldName]:
          value,
      })
    );
  };


  /* ========================================
     VALIDATION
  ======================================== */

  const validateForm = () => {
    if (!name.trim()) {
      return (
        "Template name is required."
      );
    }


    const validFields =
      fields.filter(
        (field) =>
          field.name.trim()
      );


    const fieldNames =
      validFields.map(
        (field) =>
          field.name
            .trim()
            .toLowerCase()
      );


    const uniqueNames =
      new Set(
        fieldNames
      );


    if (
      fieldNames.length !==
      uniqueNames.size
    ) {
      return (
        "Each configurable field must have a unique field name."
      );
    }


    const reservedNames = [
      "title",
      "icon",
    ];


    const hasReservedName =
      fieldNames.some(
        (fieldName) =>
          reservedNames.includes(
            fieldName
          )
      );


    if (hasReservedName) {
      return (
        "Title and icon are standard MentorXn fields and cannot be added again."
      );
    }


    return "";
  };


  /* ========================================
     SUBMIT
  ======================================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();


    const validationError =
      validateForm();


    if (validationError) {
      setError(
        validationError
      );

      return;
    }


    setSaving(true);
    setError("");


    const schemaFields = [];


    if (includeIcon) {
      schemaFields.push({
        name: "icon",
        label: "Icon",
        type: "text",
        required: false,
        standard: true,
      });
    }


    if (includeTitle) {
      schemaFields.push({
        name: "title",
        label: "Title",
        type: "text",
        required: false,
        standard: true,
      });
    }


    fields.forEach(
      (field) => {

        if (
          !field.name.trim()
        ) {
          return;
        }


        schemaFields.push({
          name:
            field.name.trim(),

          label:
            field.label.trim() ||
            field.name.trim(),

          type:
            field.type,

          required:
            field.required,

          standard:
            false,
        });
      }
    );


    const cleanExampleData = {};


    schemaFields.forEach(
      (field) => {

        if (
          Object.prototype.hasOwnProperty.call(
            exampleData,
            field.name
          )
        ) {
          cleanExampleData[
            field.name
          ] =
            exampleData[
              field.name
            ];
        } else {
          cleanExampleData[
            field.name
          ] =
            field.type ===
            "boolean"
              ? false
              : "";
        }
      }
    );


    try {
      const response =
        await fetch(
          "http://127.0.0.1:8000/api/teacher/lblock-templates",
          {
            method:
              "POST",

            headers: {
              Accept:
                "application/json",

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                name:
                  name.trim(),

                icon:
                  templateIcon.trim() ||
                  null,

                description:
                  description.trim() ||
                  null,

                component,

                tags,

                configuration_schema: {
                  fields:
                    schemaFields,
                },

                example_data:
                  cleanExampleData,

                status:
                  "active",

                position:
                  Number(position) ||
                  0,
              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        if (data.errors) {
          const firstError =
            Object.values(
              data.errors
            )[0]?.[0];


          throw new Error(
            firstError ||
              data.message ||
              "Unable to create template."
          );
        }


        throw new Error(
          data.message ||
            "Unable to create template."
        );
      }


      navigate(
        "/teacher/lblock-templates"
      );

    } catch (
      requestError
    ) {

      console.error(
        "Create template error:",
        requestError
      );


      setError(
        requestError.message ||
          "Unable to create template."
      );

    } finally {

      setSaving(false);

    }
  };


  /* ========================================
     RENDER EXAMPLE FIELD
  ======================================== */

  const renderExampleField = (
    field
  ) => {
    const value =
      exampleData[
        field.name
      ] ?? "";


    if (
      field.type ===
      "textarea" ||
      field.type ===
      "code"
    ) {
      return (
        <textarea
          rows={
            field.type ===
            "code"
              ? 7
              : 4
          }
          value={value}
          onChange={(event) =>
            updateExampleData(
              field.name,
              event.target.value
            )
          }
        />
      );
    }


    if (
      field.type ===
      "boolean"
    ) {
      return (
        <label className="lblock-checkbox-row">

          <input
            type="checkbox"
            checked={
              Boolean(value)
            }
            onChange={(event) =>
              updateExampleData(
                field.name,
                event.target.checked
              )
            }
          />

          <span>
            Enabled
          </span>

        </label>
      );
    }


    return (
      <input
        type={
          field.type ===
          "number"
            ? "number"
            : "text"
        }
        value={value}
        onChange={(event) =>
          updateExampleData(
            field.name,
            event.target.value
          )
        }
      />
    );
  };


  /* ========================================
     ALL PREVIEW FIELDS
  ======================================== */

  const previewFields = [];


  if (includeIcon) {
    previewFields.push({
      name: "icon",
      label: "Icon",
      type: "text",
    });
  }


  if (includeTitle) {
    previewFields.push({
      name: "title",
      label: "Title",
      type: "text",
    });
  }


  fields.forEach(
    (field) => {

      if (
        field.name.trim()
      ) {
        previewFields.push({
          ...field,

          name:
            field.name.trim(),

          label:
            field.label.trim() ||
            field.name.trim(),
        });
      }
    }
  );


  return (
    <div className="lblock-page">

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <section className="lblock-header">

        <div>

          <span className="lblock-eyebrow">
            MENTORXN TEMPLATE BUILDER
          </span>

          <h1>
            Create Learning Block Template
          </h1>

          <p>
            Define a reusable learning
            block structure. Course
            teachers will later replace
            the example content with
            their own content.
          </p>

        </div>


        <Link
          to="/teacher/lblock-templates"
          className="lblock-edit-button"
        >
          ← Back to Templates
        </Link>

      </section>


      {error && (
        <div className="lblock-error">

          <strong>
            Could not create template
          </strong>

          <span>
            {error}
          </span>

        </div>
      )}


      <form
        className="lblock-create-form"
        onSubmit={handleSubmit}
      >

        {/* =====================================
            TEMPLATE INFORMATION
        ====================================== */}

        <section className="lblock-form-section">

          <div className="lblock-form-heading">

            <span className="lblock-form-step">
              1
            </span>

            <div>

              <h2>
                Template Information
              </h2>

              <p>
                Information used inside
                the MentorXn template
                library.
              </p>

            </div>

          </div>


          <div className="lblock-form-grid">

            <label className="lblock-field">

              <span>
                Template Name
              </span>

              <input
                type="text"
                value={name}
                placeholder="Mascot + Text + Code"
                maxLength={100}
                required
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
              />

            </label>


            <label className="lblock-field">

              <span>
                Library Icon
              </span>

              <input
                type="text"
                value={templateIcon}
                placeholder="📖"
                maxLength={20}
                onChange={(event) =>
                  setTemplateIcon(
                    event.target.value
                  )
                }
              />

            </label>


            <label className="lblock-field">

              <span>
                Trusted Component
              </span>

              <select
                value={component}
                onChange={
                  handleComponentChange
                }
              >

                {COMPONENT_OPTIONS.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.icon}
                      {" "}
                      {option.label}
                    </option>
                  )
                )}

              </select>

            </label>


            <label className="lblock-field">

              <span>
                Position
              </span>

              <input
                type="number"
                min="0"
                value={position}
                onChange={(event) =>
                  setPosition(
                    event.target.value
                  )
                }
              />

            </label>


            <label
              className="
                lblock-field
                lblock-field-full
              "
            >

              <span>
                Description
              </span>

              <textarea
                rows="3"
                value={description}
                placeholder="Explain when teachers should use this template."
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
              />

            </label>

          </div>


          {selectedComponent && (
            <div className="lblock-component-note">

              <span>
                {selectedComponent.icon}
              </span>

              <div>

                <strong>
                  {
                    selectedComponent.label
                  }
                </strong>

                <p>
                  {
                    selectedComponent.description
                  }
                </p>

              </div>

            </div>
          )}

        </section>


        {/* =====================================
            TAGS
        ====================================== */}

        <section className="lblock-form-section">

          <div className="lblock-form-heading">

            <span className="lblock-form-step">
              2
            </span>

            <div>

              <h2>
                Tags
              </h2>

              <p>
                Tags help teachers search
                and filter templates.
              </p>

            </div>

          </div>


          <div className="lblock-tags-editor">

            <div className="lblock-tags-list">

              {tags.map(
                (tag) => (
                  <span
                    key={tag}
                    className="lblock-tag"
                  >

                    {tag}

                    <button
                      type="button"
                      onClick={() =>
                        removeTag(
                          tag
                        )
                      }
                      aria-label={
                        `Remove ${tag}`
                      }
                    >
                      ×
                    </button>

                  </span>
                )
              )}

            </div>


            <div className="lblock-tag-input-row">

              <input
                type="text"
                value={tagInput}
                placeholder="Add tag..."
                onChange={(event) =>
                  setTagInput(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleTagKeyDown
                }
              />

              <button
                type="button"
                onClick={addTag}
              >
                + Add Tag
              </button>

            </div>

          </div>

        </section>


        {/* =====================================
            CONFIGURABLE CONTENT
        ====================================== */}

        <section className="lblock-form-section">

          <div className="lblock-form-heading">

            <span className="lblock-form-step">
              3
            </span>

            <div>

              <h2>
                Configurable Content
              </h2>

              <p>
                Define what course
                teachers can change when
                they use this template.
              </p>

            </div>

          </div>


          <div className="lblock-standard-fields">

            <h3>
              Standard Block Fields
            </h3>


            <label className="lblock-checkbox-row">

              <input
                type="checkbox"
                checked={includeIcon}
                onChange={(event) =>
                  setIncludeIcon(
                    event.target.checked
                  )
                }
              />

              <span>
                Icon
              </span>

            </label>


            <label className="lblock-checkbox-row">

              <input
                type="checkbox"
                checked={includeTitle}
                onChange={(event) =>
                  setIncludeTitle(
                    event.target.checked
                  )
                }
              />

              <span>
                Title
              </span>

            </label>

          </div>


          <div className="lblock-custom-fields-header">

            <div>

              <h3>
                Template Fields
              </h3>

              <p>
                Add fields required by
                this particular layout.
              </p>

            </div>


            <button
              type="button"
              className="lblock-add-field-button"
              onClick={addField}
            >
              + Add Field
            </button>

          </div>


          {fields.length === 0 ? (

            <div className="lblock-fields-empty">

              No custom fields yet.
              Add fields such as text,
              code, mascot or language.

            </div>

          ) : (

            <div className="lblock-fields-list">

              {fields.map(
                (field) => (
                  <div
                    key={field.id}
                    className="lblock-field-builder-row"
                  >

                    <label>

                      <span>
                        Field Name
                      </span>

                      <input
                        type="text"
                        value={
                          field.name
                        }
                        placeholder="text"
                        onChange={(event) =>
                          updateField(
                            field.id,
                            "name",
                            event.target.value
                          )
                        }
                      />

                    </label>


                    <label>

                      <span>
                        Label
                      </span>

                      <input
                        type="text"
                        value={
                          field.label
                        }
                        placeholder="Learning Text"
                        onChange={(event) =>
                          updateField(
                            field.id,
                            "label",
                            event.target.value
                          )
                        }
                      />

                    </label>


                    <label>

                      <span>
                        Field Type
                      </span>

                      <select
                        value={
                          field.type
                        }
                        onChange={(event) =>
                          updateField(
                            field.id,
                            "type",
                            event.target.value
                          )
                        }
                      >

                        {FIELD_TYPES.map(
                          (
                            fieldType
                          ) => (
                            <option
                              key={
                                fieldType.value
                              }
                              value={
                                fieldType.value
                              }
                            >
                              {
                                fieldType.label
                              }
                            </option>
                          )
                        )}

                      </select>

                    </label>


                    <label className="lblock-field-required">

                      <input
                        type="checkbox"
                        checked={
                          field.required
                        }
                        onChange={(event) =>
                          updateField(
                            field.id,
                            "required",
                            event.target.checked
                          )
                        }
                      />

                      <span>
                        Required
                      </span>

                    </label>


                    <button
                      type="button"
                      className="lblock-remove-field-button"
                      onClick={() =>
                        removeField(
                          field.id
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>
                )
              )}

            </div>
          )}

        </section>


        {/* =====================================
            EXAMPLE DATA
        ====================================== */}

        <section className="lblock-form-section">

          <div className="lblock-form-heading">

            <span className="lblock-form-step">
              4
            </span>

            <div>

              <h2>
                Example Data
              </h2>

              <p>
                Provide sample content so
                this template can be
                previewed and understood
                before it is used in a
                course.
              </p>

            </div>

          </div>


          {previewFields.length === 0 ? (

            <div className="lblock-fields-empty">
              Add configurable fields
              before entering example
              data.
            </div>

          ) : (

            <div className="lblock-example-grid">

              {previewFields.map(
                (field) => (
                  <label
                    key={
                      field.name
                    }
                    className="lblock-field"
                  >

                    <span>
                      {
                        field.label
                      }
                    </span>

                    {
                      renderExampleField(
                        field
                      )
                    }

                  </label>
                )
              )}

            </div>
          )}

        </section>


        {/* =====================================
            SAVE
        ====================================== */}

        <div className="lblock-form-actions">

          <Link
            to="/teacher/lblock-templates"
            className="lblock-cancel-button"
          >
            Cancel
          </Link>


          <button
            type="submit"
            className="lblock-create-button"
            disabled={saving}
          >
            {
              saving
                ? "Creating..."
                : "Create Template"
            }
          </button>

        </div>

      </form>

    </div>
  );
}


export default CreateLBlockTemplatePage;