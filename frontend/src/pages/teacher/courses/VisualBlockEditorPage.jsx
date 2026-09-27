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

import {
  withSharedBlockFields,
} from "../../../components/learning/block-component-settings/SharedBlockConfig";

import "../../../styles/teachers/visual-block-editor.css";


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


  /*
   * =========================================
   * Active Configuration Schema
   * =========================================
   *
   * The selected block template provides its
   * own configuration schema.
   *
   * Shared block fields are added here so
   * individual block seeders do not need to
   * duplicate common configuration.
   *
   * Example:
   *
   * Template fields
   *       +
   * Shared Messages
   *       =
   * Active schema
   */

  const activeSchema =
    useMemo(
      () =>
        withSharedBlockFields(
          selectedTemplate
            ?.configuration_schema ||
            {}
        ),
      [selectedTemplate]
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
      Accept:
        "application/json",

      Authorization:
        `Bearer ${token}`,
    };

    if (includeContentType) {
      headers[
        "Content-Type"
      ] =
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


    /*
     * Use the combined schema.
     *
     * This gives every block access to
     * shared fields such as messages.
     */

    const schema =
      withSharedBlockFields(
        template
          ?.configuration_schema ||
          {}
      );


    const fields =
      schema?.fields ||
      [];


    const initialForm = {};


    fields.forEach(
      (field) => {
        const fieldName =
          field?.name;


        if (!fieldName) {
          return;
        }


        /*
         * Prefer example data supplied by
         * the individual block template.
         */

        if (
          Object.prototype.hasOwnProperty.call(
            exampleData,
            fieldName
          )
        ) {
          initialForm[
            fieldName
          ] =
            exampleData[
              fieldName
            ];

          return;
        }


        /*
         * Then use an explicit schema
         * default if one exists.
         */

        if (
          Object.prototype.hasOwnProperty.call(
            field,
            "default"
          )
        ) {
          initialForm[
            fieldName
          ] =
            field.default;

          return;
        }


        /*
         * Otherwise create an appropriate
         * empty value for the field type.
         */

        switch (
          field.type
        ) {
          case "boolean":
            initialForm[
              fieldName
            ] =
              false;

            break;


          case "select": {
            const firstOption =
              field
                .options?.[0];


            initialForm[
              fieldName
            ] =
              typeof firstOption ===
              "string"
                ? firstOption
                : firstOption
                    ?.value ??
                  "";

            break;
          }


          case "repeater":

          case "answer_builder":
            initialForm[
              fieldName
            ] =
              [];

            break;


          default:
            initialForm[
              fieldName
            ] =
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
    /*
     * buildInitialForm already includes
     * template fields and shared fields.
     */

    const initialForm =
      buildInitialForm(
        template
      );


    const blockData =
      learningBlock?.data &&
      typeof learningBlock.data ===
        "object"
        ? learningBlock.data
        : {};


    /*
     * Use the combined schema here too.
     *
     * This is important in edit mode because
     * shared data such as messages must be
     * restored from learningBlock.data.
     */

    const schema =
      withSharedBlockFields(
        template
          ?.configuration_schema ||
          {}
      );


    const fields =
      schema?.fields ||
      [];


    fields.forEach(
      (field) => {
        const fieldName =
          field?.name;


        if (!fieldName) {
          return;
        }


        /*
         * Title is stored as a top-level
         * LearningBlock column.
         */

        if (
          fieldName ===
          "title"
        ) {
          initialForm.title =
            learningBlock
              ?.title ??
            initialForm
              .title ??
            "";

          return;
        }


        /*
         * Icon is stored as a top-level
         * LearningBlock column.
         */

        if (
          fieldName ===
          "icon"
        ) {
          initialForm.icon =
            learningBlock
              ?.icon ??
            initialForm
              .icon ??
            "";

          return;
        }


        /*
         * Other fields are stored inside
         * learningBlock.data.
         *
         * This includes global messages.
         */

        if (
          Object.prototype.hasOwnProperty.call(
            blockData,
            fieldName
          )
        ) {
          initialForm[
            fieldName
          ] =
            blockData[
              fieldName
            ];
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
              "/api/teacher/lblock-templates",
              {
                headers:
                  getHeaders(),
              }
            );


          const templatesData =
            await templatesResponse
              .json();


          if (
            !templatesResponse.ok
          ) {
            throw new Error(
              templatesData
                .message ||
                "Unable to load learning block templates."
            );
          }


          const loadedTemplates =
            templatesData
              .lblock_templates ||
            [];


          setTemplates(
            loadedTemplates
          );


          /*
           * -----------------------------------------
           * Create Mode
           * -----------------------------------------
           */

          if (
            !isEditMode
          ) {
            setExistingBlock(
              null
            );

            setSelectedTemplate(
              null
            );

            setTemplateForm(
              {}
            );

            setVisualSelection(
              null
            );

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
            await blockResponse
              .json();


          if (
            !blockResponse.ok
          ) {
            throw new Error(
              blockData
                .message ||
                "Unable to load learning block."
            );
          }


          const learningBlock =
            blockData
              .learning_block;


          if (
            !learningBlock
          ) {
            throw new Error(
              "Learning block not found."
            );
          }


          /*
           * Extra safety:
           *
           * Make sure this learning block
           * belongs to the topic in the URL.
           */

          if (
            learningBlock
              .topic_id &&
            Number(
              learningBlock
                .topic_id
            ) !==
              Number(
                topicId
              )
          ) {
            throw new Error(
              "This learning block does not belong to the selected topic."
            );
          }


          /*
           * Find the existing block's template.
           *
           * Prefer template ID because component
           * names may change later.
           */

          const templateId =
            learningBlock
              .lblock_template_id ??
            learningBlock
              .lblock_template
              ?.id;


          const matchingTemplate =
            loadedTemplates
              .find(
                (
                  template
                ) =>
                  Number(
                    template.id
                  ) ===
                  Number(
                    templateId
                  )
              );


          if (
            !matchingTemplate
          ) {
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


          setVisualSelection(
            null
          );
        } catch (
          requestError
        ) {
          console.error(
            "Load visual block editor error:",
            requestError
          );


          setError(
            requestError
              .message ||
              "Unable to load the visual block editor."
          );
        } finally {
          setIsLoading(
            false
          );
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
     * template.
     *
     * This prevents incompatible data from
     * being moved between different block
     * types.
     */

    if (
      isEditMode
    ) {
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


    setVisualSelection(
      null
    );


    setError("");
  };


  /*
   * =========================================
   * Preview Block
   * =========================================
   */

  const previewBlock =
    useMemo(
      () => {
        if (
          !selectedTemplate
        ) {
          return null;
        }


        const {
          title,
          icon,
          ...data
        } =
          templateForm;


        return {
          id:
            existingBlock
              ?.id ??
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
            existingBlock
              ?.status ||
            "draft",

          lblock_template:
            selectedTemplate,
        };
      },
      [
        selectedTemplate,
        templateForm,
        existingBlock,
      ]
    );


  /*
   * =========================================
   * Save
   * =========================================
   */

  const handleSave =
    async () => {
      if (
        !selectedTemplate
      ) {
        setError(
          "Select a learning block template first."
        );

        return;
      }


      /*
       * Use the combined schema.
       *
       * This is important because shared
       * fields must be validated and saved
       * alongside template-specific fields.
       */

      const fields =
        activeSchema
          ?.fields ||
        [];


      /*
       * Validate required fields before
       * sending data to Laravel.
       */

      for (
        const field of
        fields
      ) {
        if (
          !field.required
        ) {
          continue;
        }


        const value =
          templateForm[
            field.name
          ];


        if (
          value ===
            undefined ||
          value ===
            null ||
          (
            typeof value ===
              "string" &&
            !value.trim()
          ) ||
          (
            Array.isArray(
              value
            ) &&
            value.length ===
              0
          )
        ) {
          setError(
            `${
              field.label ||
              field.name
            } is required.`
          );

          return;
        }
      }


      /*
       * Build the block's JSON data.
       *
       * title + icon remain top-level
       * LearningBlock columns.
       *
       * Everything else goes into data.
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
          ] =
            value;
        }
      );


      const requestBody = {
        title:
          typeof templateForm
            .title ===
          "string"
            ? templateForm
                .title
                .trim() ||
              null
            : null,

        icon:
          typeof templateForm
            .icon ===
          "string"
            ? templateForm
                .icon
                .trim() ||
              null
            : null,

        data:
          blockData,

        status:
          existingBlock
            ?.status ||
          "draft",
      };


      /*
       * lblock_template_id is required only
       * when creating.
       *
       * The backend intentionally does not
       * allow changing the template while
       * editing.
       */

      if (
        !isEditMode
      ) {
        requestBody
          .lblock_template_id =
          selectedTemplate.id;
      }


      setIsSaving(
        true
      );

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
                getHeaders(
                  true
                ),

              body:
                JSON.stringify(
                  requestBody
                ),
            }
          );


        const data =
          await response
            .json();


        if (
          !response.ok
        ) {
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
          requestError
            .message ||
            (
              isEditMode
                ? "Unable to update learning block."
                : "Unable to create learning block."
            )
        );
      } finally {
        setIsSaving(
          false
        );
      }
    };


  /*
   * =========================================
   * Cancel
   * =========================================
   */

  const handleCancel =
    () => {
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

  if (
    isLoading
  ) {
    return (
      <div className="visual-block-editor-state">
        <strong>
          {isEditMode
            ? "Loading Learning Block..."
            : "Loading Block Library..."}
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
              onClick={
                handleCancel
              }
            >
              ← Back to topic
            </button>
          </div>


          <div className="visual-block-editor-panel-heading">
            <span>
              {isEditMode
                ? "BLOCK TYPE"
                : "BLOCK LIBRARY"}
            </span>

            <h2>
              {isEditMode
                ? "Editing block"
                : "Choose a template"}
            </h2>

            <p>
              {isEditMode
                ? "Edit the content and settings of this learning block."
                : "Start with one of your existing learning blocks."}
            </p>
          </div>


          <div className="visual-block-editor-template-list">
            {isEditMode ? (
              selectedTemplate ? (
                <button
                  type="button"
                  className="visual-block-editor-template active"
                  disabled
                >
                  <span className="visual-block-editor-template-icon">
                    {selectedTemplate
                      .icon ||
                      "🧱"}
                  </span>

                  <span className="visual-block-editor-template-content">
                    <strong>
                      {
                        selectedTemplate
                          .name
                      }
                    </strong>

                    {selectedTemplate
                      .description && (
                      <small>
                        {
                          selectedTemplate
                            .description
                        }
                      </small>
                    )}

                    <small>
                      Block type cannot be
                      changed while editing.
                    </small>
                  </span>

                  <span className="visual-block-editor-template-arrow">
                    ✓
                  </span>
                </button>
              ) : (
                <div className="visual-block-editor-empty">
                  Unable to determine
                  the block template.
                </div>
              )
            ) : templates.length >
              0 ? (
              templates.map(
                (
                  template
                ) => {
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
                        {template
                          .icon ||
                          "🧱"}
                      </span>

                      <span className="visual-block-editor-template-content">
                        <strong>
                          {
                            template.name
                          }
                        </strong>

                        {template
                          .description && (
                          <small>
                            {
                              template
                                .description
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
                  ? selectedTemplate
                      .name
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
                    activeSchema
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
                  {isEditMode
                    ? "Unable to load block"
                    : "Choose a block template"}
                </h3>

                <p>
                  {isEditMode
                    ? "The existing learning block could not be prepared for editing."
                    : "Select a template from the Block Library to start designing."}
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
                disabled={
                  isSaving
                }
                onClick={
                  handleCancel
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="visual-block-editor-save"
                disabled={
                  isSaving ||
                  !selectedTemplate
                }
                onClick={
                  handleSave
                }
              >
                {isSaving
                  ? "Saving..."
                  : isEditMode
                  ? "Save Changes"
                  : "Add Block"}
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
                {isEditMode
                  ? "Unable to load the block configuration."
                  : "Choose a block template to begin."}
              </p>
            </div>
          ) : (
            <VisualPropertiesPanel
              schema={
                activeSchema
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
          )}
        </aside>
      </div>
    </div>
  );
}


export default VisualBlockEditorPage;