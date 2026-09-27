import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import VisualBlockCanvas from "../../../components/learning/visual-editor/VisualBlockCanvas";

import VisualPropertiesPanel from "../../../components/learning/visual-editor/VisualPropertiesPanel";

import "../../../styles/teachers/visual-block-editor.css";


function VisualBlockEditorPage() {
  const {
    courseId,
    topicId,
  } = useParams();

  const navigate =
    useNavigate();

  const { token } =
    useAuth();

  const [
    templates,
    setTemplates,
  ] = useState([]);

  const [
    selectedTemplate,
    setSelectedTemplate,
  ] = useState(null);

  const [
    templateForm,
    setTemplateForm,
  ] = useState({});

  const [
    visualSelection,
    setVisualSelection,
  ] = useState(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  /*
   * =========================================
   * API Headers
   * =========================================
   */

  const getHeaders = (
    includeContentType = false
  ) => {
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (includeContentType) {
      headers["Content-Type"] =
        "application/json";
    }

    return headers;
  };


  /*
   * =========================================
   * Load Block Templates
   * =========================================
   */

  useEffect(() => {
    const loadTemplates =
      async () => {
        setIsLoading(true);
        setError("");

        try {
          const response =
            await fetch(
              "/api/teacher/lblock-templates",
              {
                headers:
                  getHeaders(),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Unable to load learning block templates."
            );
          }

          setTemplates(
            data.lblock_templates ||
              []
          );
        } catch (
          requestError
        ) {
          console.error(
            "Load block templates error:",
            requestError
          );

          setError(
            requestError.message ||
              "Unable to load learning block templates."
          );
        } finally {
          setIsLoading(false);
        }
      };

    if (token) {
      loadTemplates();
    }
  }, [token]);


  /*
   * =========================================
   * Build Initial Form
   * =========================================
   */

  const buildInitialForm = (
    template
  ) => {
    const exampleData =
      template?.example_data ||
      {};

    const fields =
      template
        ?.configuration_schema
        ?.fields ||
      [];

    const initialForm = {};

    fields.forEach(
      (field) => {
        const fieldName =
          field?.name;

        if (!fieldName) {
          return;
        }

        if (
          Object.prototype.hasOwnProperty.call(
            exampleData,
            fieldName
          )
        ) {
          initialForm[fieldName] =
            exampleData[fieldName];

          return;
        }

        if (
          Object.prototype.hasOwnProperty.call(
            field,
            "default"
          )
        ) {
          initialForm[fieldName] =
            field.default;

          return;
        }

        switch (field.type) {
          case "boolean":
            initialForm[fieldName] =
              false;
            break;

          case "select": {
            const firstOption =
              field.options?.[0];

            initialForm[fieldName] =
              typeof firstOption ===
              "string"
                ? firstOption
                : firstOption
                    ?.value ?? "";

            break;
          }

          case "repeater":
          case "answer_builder":
            initialForm[fieldName] =
              [];
            break;

          default:
            initialForm[fieldName] =
              "";
            break;
        }
      }
    );

    return initialForm;
  };


  /*
   * =========================================
   * Select Template
   * =========================================
   */

  const handleSelectTemplate = (
    template
  ) => {
    setSelectedTemplate(
      template
    );

    setTemplateForm(
      buildInitialForm(
        template
      )
    );

    setVisualSelection(null);
    setError("");
  };


  /*
   * =========================================
   * Preview Block
   * =========================================
   */

  const previewBlock =
    useMemo(() => {
      if (!selectedTemplate) {
        return null;
      }

      const {
        title,
        icon,
        ...data
      } = templateForm;

      return {
        id: "visual-preview",

        title:
          typeof title ===
          "string"
            ? title
            : "",

        icon:
          typeof icon ===
          "string"
            ? icon
            : "",

        data,

        status: "draft",

        lblock_template:
          selectedTemplate,
      };
    }, [
      selectedTemplate,
      templateForm,
    ]);


  /*
   * =========================================
   * Save
   * =========================================
   */

  const handleSave = async () => {
    if (!selectedTemplate) {
      setError(
        "Select a learning block template first."
      );

      return;
    }

    const fields =
      selectedTemplate
        .configuration_schema
        ?.fields ||
      [];

    for (const field of fields) {
      if (!field.required) {
        continue;
      }

      const value =
        templateForm[
          field.name
        ];

      if (
        value === undefined ||
        value === null ||
        (
          typeof value ===
            "string" &&
          !value.trim()
        )
      ) {
        setError(
          `${field.label || field.name} is required.`
        );

        return;
      }
    }

    const blockData = {};

    fields.forEach(
      (field) => {
        if (
          field.name ===
            "title" ||
          field.name ===
            "icon"
        ) {
          return;
        }

        let value =
          templateForm[
            field.name
          ];

        if (
          typeof value ===
          "string"
        ) {
          value =
            value.trim();
        }

        blockData[
          field.name
        ] = value;
      }
    );

    setIsSaving(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/teacher/topics/${topicId}/learning-blocks`,
          {
            method: "POST",

            headers:
              getHeaders(true),

            body:
              JSON.stringify({
                lblock_template_id:
                  selectedTemplate.id,

                title:
                  typeof templateForm.title ===
                  "string"
                    ? templateForm.title.trim() ||
                      null
                    : null,

                icon:
                  typeof templateForm.icon ===
                  "string"
                    ? templateForm.icon.trim() ||
                      null
                    : null,

                data:
                  blockData,

                status:
                  "draft",
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        const firstError =
          data.errors
            ? Object.values(
                data.errors
              )?.[0]?.[0]
            : null;

        throw new Error(
          firstError ||
            data.message ||
            "Unable to create learning block."
        );
      }

      navigate(
  `/teacher/courses/${courseId}/playground`,
  {
    state: {
      selectedTopicId:
        topicId,
    },
  }
);
    } catch (
      requestError
    ) {
      console.error(
        "Create learning block error:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to create learning block."
      );
    } finally {
      setIsSaving(false);
    }
  };


  /*
   * =========================================
   * Cancel
   * =========================================
   */

  const handleCancel = () => {
    navigate(
      `/teacher/courses/${courseId}/playground`,
      {
        state: {
          selectedTopicId: topicId,
        },
      }
    );
  };


  /*
   * =========================================
   * Loading
   * =========================================
   */

  if (isLoading) {
    return (
      <div className="visual-block-editor-state">
        <strong>
          Loading Block Library...
        </strong>

        <span>
          Preparing your visual editor.
        </span>
      </div>
    );
  }


  /*
   * =========================================
   * Render
   * =========================================
   */

  return (
    <div className="visual-block-editor">
      <div className="visual-block-editor-workspace">
        {/* =================================
            Block Library
        ================================== */}

        <aside className="visual-block-editor-library">
          <div className="visual-block-editor-library-top">
            <button
              type="button"
              className="visual-block-editor-back"
              onClick={handleCancel}
            >
              ← Back to topic
            </button>
          </div>

          <div className="visual-block-editor-panel-heading">
            <span>
              BLOCK LIBRARY
            </span>

            <h2>
              Choose a template
            </h2>

            <p>
              Start with one of your
              existing learning blocks.
            </p>
          </div>

          <div className="visual-block-editor-template-list">
            {templates.length >
            0 ? (
              templates.map(
                (template) => {
                  const isActive =
                    Number(
                      selectedTemplate
                        ?.id
                    ) ===
                    Number(
                      template.id
                    );

                  return (
                    <button
                      key={
                        template.id
                      }
                      type="button"
                      className={
                        `visual-block-editor-template${
                          isActive
                            ? " active"
                            : ""
                        }`
                      }
                      onClick={() =>
                        handleSelectTemplate(
                          template
                        )
                      }
                    >
                      <span className="visual-block-editor-template-icon">
                        {template.icon ||
                          "🧱"}
                      </span>

                      <span className="visual-block-editor-template-content">
                        <strong>
                          {template.name}
                        </strong>

                        {template.description && (
                          <small>
                            {
                              template.description
                            }
                          </small>
                        )}
                      </span>

                      <span className="visual-block-editor-template-arrow">
                        →
                      </span>
                    </button>
                  );
                }
              )
            ) : (
              <div className="visual-block-editor-empty">
                No learning block
                templates are available.
              </div>
            )}
          </div>
        </aside>


        {/* =================================
            Live Canvas
        ================================== */}

        <main className="visual-block-editor-canvas">
          <div className="visual-block-editor-canvas-heading">
            <div>
              <span>
                LIVE PREVIEW
              </span>

              <h2>
                {selectedTemplate
                  ? selectedTemplate.name
                  : "Choose a block"}
              </h2>
            </div>

            {selectedTemplate && (
              <span className="visual-block-editor-live-badge">
                ● Live
              </span>
            )}
          </div>

          <div className="visual-block-editor-canvas-stage">
            {previewBlock ? (
              <article
                className="lesson visual-block-editor-preview-lesson"
                style={{
                  "--lesson-accent":
                    "#8fd9a8",

                  "--w":
                    "#8fd9a8",
                }}
              >
                <VisualBlockCanvas
                  block={
                    previewBlock
                  }
                  schema={
                    selectedTemplate
                      .configuration_schema
                  }
                  selection={
                    visualSelection
                  }
                  onSelect={
                    setVisualSelection
                  }
                />
              </article>
            ) : (
              <div className="visual-block-editor-canvas-empty">
                <div className="visual-block-editor-canvas-empty-icon">
                  🧱
                </div>

                <h3>
                  Choose a block
                  template
                </h3>

                <p>
                  Select a template
                  from the Block
                  Library to start
                  designing.
                </p>
              </div>
            )}
          </div>

          <div className="visual-block-editor-canvas-actions">
            {error && (
              <div className="visual-block-editor-canvas-error">
                {error}
              </div>
            )}

            <div className="visual-block-editor-canvas-action-buttons">
              <button
                type="button"
                className="visual-block-editor-cancel"
                disabled={isSaving}
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="button"
                className="visual-block-editor-save"
                disabled={isSaving || !selectedTemplate}
                onClick={handleSave}
              >
                {isSaving ? "Saving..." : "Add / Save Block"}
              </button>
            </div>
          </div>
        </main>


        {/* =================================
            Properties
        ================================== */}

        <aside className="visual-block-editor-properties">
          {!selectedTemplate ? (
            <div className="visual-block-editor-panel-heading">
              <span>
                EDIT
              </span>

              <h2>
                Nothing selected
              </h2>

              <p>
                Choose a block
                template to begin.
              </p>
            </div>
          ) : (
            <>
              <VisualPropertiesPanel
                schema={
                  selectedTemplate
                    .configuration_schema
                }
                form={
                  templateForm
                }
                selection={
                  visualSelection
                }
                onChange={
                  setTemplateForm
                }
                onClearSelection={() =>
                  setVisualSelection(
                    null
                  )
                }
              />
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default VisualBlockEditorPage;