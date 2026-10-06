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

import "../../../styles/adventure-land.css";
import "../../../styles/pages/block-editor.css";

import {
  withSharedBlockFields,
} from "../../../components/learning/block-component-settings/SharedBlockConfig";


function VisualBlockEditorPage() {
  const {
    courseId,
    topicId,
    blockId,
  } = useParams();

  const navigate =
    useNavigate();

  const { token } =
    useAuth();

  const isEditMode =
    Boolean(blockId);

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
    existingBlock,
    setExistingBlock,
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

  // Block library: search text, and the drawer on small screens.
  const [
    librarySearch,
    setLibrarySearch,
  ] = useState("");

  const [
    isLibraryOpen,
    setIsLibraryOpen,
  ] = useState(false);


  const BLOCK_CATEGORIES = [
    { id: "content", label: "📝 Content blocks", color: "var(--mx-c-net)" },
    { id: "assessment", label: "❓ Assessment blocks", color: "var(--mx-c-blocks)" },
    { id: "manipulation", label: "🧩 Manipulation blocks", color: "var(--mx-c-web)" },
    { id: "process", label: "🔄 Process & structure blocks", color: "var(--mx-c-back)" },
    { id: "code", label: "💻 Code blocks", color: "var(--mx-c-pro)" },
  ];

  const getTemplateCategory = (template) => {
    const explicit = String(
      template?.category ||
      template?.group ||
      template?.configuration_schema?.category ||
      ""
    ).toLowerCase();

    if (explicit.includes("assessment") || explicit.includes("quiz")) return "assessment";
    if (explicit.includes("manipulation") || explicit.includes("interactive")) return "manipulation";
    if (explicit.includes("process") || explicit.includes("structure")) return "process";
    if (explicit.includes("code") || explicit.includes("programming")) return "code";
    if (explicit.includes("content")) return "content";

    const haystack = [template?.name, template?.slug, template?.key, template?.description]
      .filter(Boolean).join(" ").toLowerCase();

    if (/quiz|question|multiple choice|true.false|fill.blank|reflection|assessment/.test(haystack)) return "assessment";
    if (/flip|match|drag|drop|sort|reorder|bucket|manipulat|pattern tester/.test(haystack)) return "manipulation";
    if (/pipeline|stepper|timeline|flow|process|worked example|structure/.test(haystack)) return "process";
    if (/code|terminal|program|debug|error|variable|array|function|syntax/.test(haystack)) return "code";
    return "content";
  };

  const groupedTemplates = useMemo(() =>
    BLOCK_CATEGORIES.map((category) => ({
      ...category,
      templates: templates.filter((template) => getTemplateCategory(template) === category.id),
    })).filter((category) => category.templates.length > 0),
    [templates]
  );

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
   * Build Existing Block Form
   * =========================================
   */

  const buildExistingBlockForm = (
    template,
    learningBlock
  ) => {
    const initialForm =
      buildInitialForm(template);

    const blockData =
      learningBlock?.data &&
      typeof learningBlock.data ===
        "object"
        ? learningBlock.data
        : {};

    const fields =
      template
        ?.configuration_schema
        ?.fields ||
      [];

    fields.forEach(
      (field) => {
        const fieldName =
          field?.name;

        if (!fieldName) {
          return;
        }

        if (
          fieldName === "title"
        ) {
          initialForm.title =
            learningBlock?.title ??
            initialForm.title ??
            "";

          return;
        }

        if (
          fieldName === "icon"
        ) {
          initialForm.icon =
            learningBlock?.icon ??
            initialForm.icon ??
            "";

          return;
        }

        if (
          Object.prototype.hasOwnProperty.call(
            blockData,
            fieldName
          )
        ) {
          initialForm[fieldName] =
            blockData[fieldName];
        }
      }
    );

    return initialForm;
  };


  /*
   * =========================================
   * Load Templates + Existing Block
   * =========================================
   */

  useEffect(() => {
    const loadEditor =
      async () => {
        setIsLoading(true);
        setError("");

        try {
          /*
           * -----------------------------------------
           * Load active block templates
           * -----------------------------------------
           */

          const templatesResponse =
            await fetch(
              "/api/teacher/block-templates",
              {
                headers:
                  getHeaders(),
              }
            );

          const templatesData =
            await templatesResponse.json();

          if (
            !templatesResponse.ok
          ) {
            throw new Error(
              templatesData.message ||
                "Unable to load learning block templates."
            );
          }

          const loadedTemplates =
            templatesData.block_templates ||
            [];

          setTemplates(
            loadedTemplates
          );

          /*
           * -----------------------------------------
           * Create Mode
           * -----------------------------------------
           */

          if (!isEditMode) {
            setExistingBlock(null);
            setSelectedTemplate(null);
            setTemplateForm({});
            setVisualSelection(null);

            return;
          }

          /*
           * -----------------------------------------
           * Edit Mode
           * -----------------------------------------
           */

          const blockResponse =
            await fetch(
              `/api/teacher/learning-blocks/${blockId}`,
              {
                headers:
                  getHeaders(),
              }
            );

          const blockData =
            await blockResponse.json();

          if (!blockResponse.ok) {
            throw new Error(
              blockData.message ||
                "Unable to load learning block."
            );
          }

          const learningBlock =
            blockData.learning_block;

          if (!learningBlock) {
            throw new Error(
              "Learning block not found."
            );
          }

          /*
           * Extra safety:
           * make sure this block belongs
           * to the topic in the URL.
           */

          if (
            learningBlock.topic_id &&
            Number(
              learningBlock.topic_id
            ) !==
              Number(topicId)
          ) {
            throw new Error(
              "This learning block does not belong to the selected topic."
            );
          }

          /*
           * Find the existing block's template.
           *
           * Prefer the template ID because
           * component names can change over time.
           */

          const templateId =
            learningBlock
              .block_template_id ??
            learningBlock
              .block_template
              ?.id;

          const matchingTemplate =
            loadedTemplates.find(
              (template) =>
                Number(
                  template.id
                ) ===
                Number(
                  templateId
                )
            );

          if (!matchingTemplate) {
            throw new Error(
              "The learning block template is no longer available."
            );
          }

          setExistingBlock(
            learningBlock
          );

          setSelectedTemplate(
            matchingTemplate
          );

          setTemplateForm(
            buildExistingBlockForm(
              matchingTemplate,
              learningBlock
            )
          );

          setVisualSelection(null);
        } catch (
          requestError
        ) {
          console.error(
            "Load visual block editor error:",
            requestError
          );

          setError(
            requestError.message ||
              "Unable to load the visual block editor."
          );
        } finally {
          setIsLoading(false);
        }
      };

    if (
      token &&
      courseId &&
      topicId
    ) {
      loadEditor();
    }
  }, [
    token,
    courseId,
    topicId,
    blockId,
    isEditMode,
  ]);


  /*
   * =========================================
   * Select Template
   * =========================================
   */

  const handleSelectTemplate = (
    template
  ) => {
    /*
     * Existing blocks keep their original
     * template. This prevents incompatible
     * data from being moved between block
     * types.
     */

    if (isEditMode) {
      return;
    }

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
        id:
          existingBlock?.id ??
          "visual-preview",

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

        status:
          existingBlock?.status ||
          "draft",

        block_template:
          selectedTemplate,
      };
    }, [
      selectedTemplate,
      templateForm,
      existingBlock,
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

    /*
     * Validate required fields before
     * sending data to Laravel.
     */

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
        ) ||
        (
          Array.isArray(value) &&
          value.length === 0
        )
      ) {
        setError(
          `${field.label || field.name} is required.`
        );

        return;
      }
    }

    /*
     * Build the block's JSON data.
     *
     * title + icon remain top-level
     * LearningBlock columns.
     */

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

    const requestBody = {
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
        existingBlock?.status ||
        "draft",
    };

    /*
     * block_template_id is required only
     * when creating.
     *
     * The backend intentionally does not
     * allow changing template while editing.
     */

    if (!isEditMode) {
      requestBody.block_template_id =
        selectedTemplate.id;
    }

    setIsSaving(true);
    setError("");

    try {
      const requestUrl =
        isEditMode
          ? `/api/teacher/learning-blocks/${blockId}`
          : `/api/teacher/topics/${topicId}/learning-blocks`;

      const requestMethod =
        isEditMode
          ? "PUT"
          : "POST";

      const response =
        await fetch(
          requestUrl,
          {
            method:
              requestMethod,

            headers:
              getHeaders(true),

            body:
              JSON.stringify(
                requestBody
              ),
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
            (
              isEditMode
                ? "Unable to update learning block."
                : "Unable to create learning block."
            )
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
        isEditMode
          ? "Update learning block error:"
          : "Create learning block error:",
        requestError
      );

      setError(
        requestError.message ||
          (
            isEditMode
              ? "Unable to update learning block."
              : "Unable to create learning block."
          )
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
          selectedTopicId:
            topicId,
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
      <div className="mx-page mx-editor-state">
        <p className="mx-hint">
          {isEditMode ? "Loading the learning block…" : "Loading the block library…"}
        </p>
      </div>
    );
  }


  /*
   * =========================================
   * Render
   * =========================================
   */

  const pageTitle = isEditMode ? "Edit learning block" : "Add a learning block";
  const selectedCategory = selectedTemplate
    ? BLOCK_CATEGORIES.find((category) => category.id === getTemplateCategory(selectedTemplate))
    : null;

  // Library search: name or description.
  const query = librarySearch.trim().toLowerCase();
  const visibleGroups = groupedTemplates
    .map((category) => ({
      ...category,
      templates: category.templates.filter(
        (template) =>
          !query ||
          [template.name, template.description]
            .filter(Boolean)
            .some((text) => String(text).toLowerCase().includes(query))
      ),
    }))
    .filter((category) => category.templates.length > 0);

  const chooseTemplate = (template) => {
    setIsLibraryOpen(false);
    handleSelectTemplate(template);
  };

  return (
    <div className="mx-page mx-editor">
      <div
        className={`mx-editor__scrim${isLibraryOpen ? " is-open" : ""}`}
        onClick={() => setIsLibraryOpen(false)}
        aria-hidden="true"
      />

      <div className="mx-editor__shell">
        {/* ---------- block library (left) ---------- */}
        <nav
          id="block-library"
          className={`mx-editor__library${isLibraryOpen ? " is-open" : ""}`}
          aria-label="Block types"
        >
          <button type="button" className="mx-back-link mx-editor__back" onClick={handleCancel}>
            ← Back to course builder
          </button>

          {isEditMode ? (
            selectedTemplate && (
              <section className="mx-world" style={{ "--mx-wc": selectedCategory?.color }}>
                <span className="mx-world__label">This block</span>
                <div className="mx-navi is-active">
                  <span className="mx-navi__main">
                    <span className="mx-navi__icon" aria-hidden="true">
                      {selectedTemplate.icon || "🧱"}
                    </span>
                    <span className="mx-navi__title">{selectedTemplate.name}</span>
                  </span>
                </div>
                <p className="mx-hint mx-editor__library-note">
                  A block's type can't be changed once it's created. To use a
                  different type, add a new block.
                </p>
              </section>
            )
          ) : (
            <>
              <input
                type="search"
                className="mx-editor__search"
                placeholder="Search block types…"
                aria-label="Search block types"
                value={librarySearch}
                onChange={(event) => setLibrarySearch(event.target.value)}
              />

              {visibleGroups.map((category) => (
                <section key={category.id} className="mx-world" style={{ "--mx-wc": category.color }}>
                  <span className="mx-world__label">{category.label}</span>

                  {category.templates.map((template) => {
                    const active = Number(selectedTemplate?.id) === Number(template.id);

                    return (
                      <div key={template.id} className={`mx-navi${active ? " is-active" : ""}`}>
                        <button
                          type="button"
                          className="mx-navi__main"
                          aria-current={active ? "true" : undefined}
                          onClick={() => chooseTemplate(template)}
                        >
                          <span className="mx-navi__icon" aria-hidden="true">
                            {template.icon || "🧱"}
                          </span>
                          <span className="mx-navi__title">{template.name}</span>
                        </button>
                      </div>
                    );
                  })}
                </section>
              ))}

              {templates.length > 0 && visibleGroups.length === 0 && (
                <p className="mx-hint mx-editor__library-note">No block types match "{librarySearch}".</p>
              )}
            </>
          )}
        </nav>

        {/* ---------- preview (centre) ---------- */}
        <div className="mx-editor__main">
          <button
            type="button"
            className="mx-btn mx-btn--ghost mx-btn--sm mx-editor__library-toggle mx-editor__menu"
            aria-controls="block-library"
            aria-expanded={isLibraryOpen}
            onClick={() => setIsLibraryOpen(true)}
          >
            ☰ Block types
          </button>

          {error && (
            <div className="mx-feedback mx-feedback--bad" role="alert">
              {error}
            </div>
          )}

          {selectedTemplate ? (
            <article className="lesson mx-editor__lesson" style={{ "--w": selectedCategory?.color }}>
              <div className="crumb">
                {pageTitle} · {selectedCategory?.label}
              </div>

              <h1>
                <span className="t">
                  {selectedTemplate.icon || "🧱"} {selectedTemplate.name}
                </span>
              </h1>

              {(selectedTemplate.description || selectedTemplate.configuration_schema?.description) && (
                <div className="mx-blurb">
                  <b>Use it for:</b>
                  {selectedTemplate.description || selectedTemplate.configuration_schema?.description}
                </div>
              )}

              <section className="mx-editor__preview" aria-label="Live preview">
                <div className="mx-editor__preview-label">
                  👀 What students will see — click highlighted parts to edit them
                </div>
                {previewBlock && (
                  <VisualBlockCanvas
                    block={previewBlock}
                    schema={selectedTemplate.configuration_schema}
                    selection={visualSelection}
                    onSelect={setVisualSelection}
                  />
                )}
              </section>
            </article>
          ) : templates.length > 0 ? (
            <div className="mx-empty">
              <span className="mx-empty__emoji" aria-hidden="true">
                ▦
              </span>
              <h2>Pick a block type</h2>
              <p>
                {templates.length} block types in {groupedTemplates.length} groups.
                Choose one from the library to preview it and fill in its content.
              </p>
              <button
                type="button"
                className="mx-btn mx-btn--ghost mx-editor__library-toggle"
                onClick={() => setIsLibraryOpen(true)}
              >
                ☰ Browse block types
              </button>
            </div>
          ) : (
            !error && (
              <div className="mx-empty">
                <span className="mx-empty__emoji" aria-hidden="true">
                  🧱
                </span>
                <h2>No block types available</h2>
                <p>There are no active block templates to choose from yet.</p>
              </div>
            )
          )}
        </div>

        {/* ---------- settings (right) ---------- */}
        <aside className="mx-editor__props" aria-label="Block settings">
          <div className="mx-editor__props-scroll">
            {selectedTemplate ? (
              <VisualPropertiesPanel
                schema={selectedTemplate.configuration_schema}
                form={templateForm}
                selection={visualSelection}
                onChange={setTemplateForm}
                onClearSelection={() => setVisualSelection(null)}
              />
            ) : (
              <div className="mx-editor__props-empty">
                <span className="mx-modal__kicker">Block settings</span>
                <h2>Nothing selected yet</h2>
                <p className="mx-hint">
                  Pick a block type and its settings will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Save / cancel live with the settings they apply to. */}
          <div className="mx-editor__actions">
            <button type="button" className="mx-btn mx-btn--ghost" disabled={isSaving} onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="mx-btn mx-editor__save"
              disabled={isSaving || !selectedTemplate}
              onClick={handleSave}
            >
              {isSaving ? "Saving…" : isEditMode ? "💾 Save changes" : "➕ Add block"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default VisualBlockEditorPage;
