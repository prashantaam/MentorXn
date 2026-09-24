import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import LearningBlockRenderer from "../../../components/learning/LearningBlockRenderer";

import "../../../styles/teachers/course-playground.css";
import "../../../styles/adventure-land.css";

const LESSON_ACCENT_COLORS = [
  "#8fd9a8", // Mint Green
  "#ffd84d", // Sunny Yellow
  "#7cd4ff", // Sky Blue
  "#ff9a8b", // Coral
  "#6ee7b7", // Aqua Green
  "#ffb3e1", // Soft Pink
  "#c4b5fd", // Lavender
  "#fdba8c", // Peach
  "#fde68a", // Lemon
  "#a5f3fc", // Soft Cyan
  "#fda4af", // Light Rose
  "#bef264", // Light Lime
];

const getLessonAccentColor = (lessons, selectedLesson) => {
  if (!selectedLesson) {
    return LESSON_ACCENT_COLORS[0];
  }

  const lessonIndex = lessons.findIndex(
    (lesson) => lesson.id === selectedLesson.id
  );

  const safeIndex = lessonIndex >= 0 ? lessonIndex : 0;

  return LESSON_ACCENT_COLORS[
    safeIndex % LESSON_ACCENT_COLORS.length
  ];
};


function CoursePlaygroundPage() {
  const { courseId } =
    useParams();

  const navigate =
    useNavigate();

  const { token } =
    useAuth();

  const [
    course,
    setCourse,
  ] = useState(null);

  const [
    lessons,
    setLessons,
  ] = useState([]);

  const [
    selectedLesson,
    setSelectedLesson,
  ] = useState(null);

  const [
    selectedTopic,
    setSelectedTopic,
  ] = useState(null);

  const [
    learningBlocks,
    setLearningBlocks,
  ] = useState([]);

  const [
    blockTemplates,
    setBlockTemplates,
  ] = useState([]);

  const [
    selectedBlockTemplate,
    setSelectedBlockTemplate,
  ] = useState(null);

  const [
    templateForm,
    setTemplateForm,
  ] = useState({});

  const [
    isLoadingTemplates,
    setIsLoadingTemplates,
  ] = useState(false);

  const [
    editorMode,
    setEditorMode,
  ] = useState("course");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isLoadingBlocks,
    setIsLoadingBlocks,
  ] = useState(false);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    lessonForm,
    setLessonForm,
  ] = useState({
    title: "",
    icon: "📖",
    description: "",
  });

  const [
    topicForm,
    setTopicForm,
  ] = useState({
    title: "",
    icon: "📑",
    description: "",
  });

  /*
   * =========================================
   * API helper
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
      ] = "application/json";
    }

    return headers;
  };

  /*
   * =========================================
   * Load Learning Blocks
   * =========================================
   */

  const loadLearningBlocks =
    async (topicId) => {
      if (!topicId) {
        setLearningBlocks([]);
        return;
      }

      setIsLoadingBlocks(true);

      try {
        const response =
          await fetch(
            `http://127.0.0.1:8000/api/teacher/topics/${topicId}/learning-blocks`,
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
              "Unable to load learning blocks."
          );
        }

        setLearningBlocks(
          data.learning_blocks ||
            []
        );
      } catch (
        requestError
      ) {
        console.error(
          "Load learning blocks error:",
          requestError
        );

        setFormError(
          requestError.message ||
            "Unable to load learning blocks."
        );

        setLearningBlocks([]);
      } finally {
        setIsLoadingBlocks(
          false
        );
      }
    };

  /*
   * =========================================
   * Load Course Playground
   * =========================================
   */

  useEffect(() => {
    const loadPlayground =
      async () => {
        setIsLoading(true);
        setError("");

        try {
          const courseResponse =
            await fetch(
              `http://127.0.0.1:8000/api/teacher/courses/${courseId}`,
              {
                headers:
                  getHeaders(),
              }
            );

          const courseData =
            await courseResponse.json();

          if (
            !courseResponse.ok
          ) {
            throw new Error(
              courseData.message ||
                "Unable to load course."
            );
          }

          const lessonsResponse =
            await fetch(
              `http://127.0.0.1:8000/api/teacher/courses/${courseId}/lessons`,
              {
                headers:
                  getHeaders(),
              }
            );

          const lessonsData =
            await lessonsResponse.json();

          if (
            !lessonsResponse.ok
          ) {
            throw new Error(
              lessonsData.message ||
                "Unable to load lessons."
            );
          }

          const loadedLessons =
            lessonsData.lessons ||
            [];

          const lessonsWithTopics =
            await Promise.all(
              loadedLessons.map(
                async (
                  lesson
                ) => {
                  const topicsResponse =
                    await fetch(
                      `http://127.0.0.1:8000/api/teacher/lessons/${lesson.id}/topics`,
                      {
                        headers:
                          getHeaders(),
                      }
                    );

                  const topicsData =
                    await topicsResponse.json();

                  if (
                    !topicsResponse.ok
                  ) {
                    throw new Error(
                      topicsData.message ||
                        `Unable to load topics for ${lesson.title}.`
                    );
                  }

                  return {
                    ...lesson,

                    topics:
                      topicsData.topics ||
                      [],
                  };
                }
              )
            );

          setCourse(
            courseData.course
          );

          setLessons(
            lessonsWithTopics
          );

          const firstLesson =
            lessonsWithTopics[0] ||
            null;

          const firstTopic =
            lessonsWithTopics
              .flatMap(
                (lesson) =>
                  lesson.topics ||
                  []
              )
              .at(0);

          setSelectedLesson(
            firstLesson
          );

          setSelectedTopic(
            firstTopic || null
          );

          if (firstTopic) {
            setEditorMode(
              "topic"
            );

            await loadLearningBlocks(
              firstTopic.id
            );
          } else {
            setLearningBlocks(
              []
            );

            setEditorMode(
              firstLesson
                ? "lesson"
                : "course"
            );
          }
        } catch (
          requestError
        ) {
          console.error(
            "Course playground error:",
            requestError
          );

          setError(
            requestError.message ||
              "Unable to load the course playground."
          );
        } finally {
          setIsLoading(false);
        }
      };

    if (
      token &&
      courseId
    ) {
      loadPlayground();
    }
  }, [
    courseId,
    token,
  ]);

  /*
   * =========================================
   * Select Lesson
   * =========================================
   */

  const handleSelectLesson = (
    lesson
  ) => {
    setSelectedLesson(
      lesson
    );

    setSelectedTopic(null);

    setLearningBlocks([]);

    setEditorMode(
      "lesson"
    );

    setFormError("");
  };

  /*
   * =========================================
   * Select Topic
   * =========================================
   */

  const handleSelectTopic =
    async (
      lesson,
      topic
    ) => {
      setSelectedLesson(
        lesson
      );

      setSelectedTopic(
        topic
      );

      setEditorMode(
        "topic"
      );

      setFormError("");

      await loadLearningBlocks(
        topic.id
      );
    };

  /*
   * =========================================
   * Add Lesson
   * =========================================
   */

  const handleOpenAddLesson =
    () => {
      setLessonForm({
        title: "",
        icon: "📖",
        description: "",
      });

      setFormError("");

      setEditorMode(
        "add-lesson"
      );
    };

  const handleCreateLesson =
    async (event) => {
      event.preventDefault();

      const title =
        lessonForm.title.trim();

      if (!title) {
        setFormError(
          "Lesson title is required."
        );

        return;
      }

      setIsSaving(true);
      setFormError("");

      try {
        const response =
          await fetch(
            `http://127.0.0.1:8000/api/teacher/courses/${courseId}/lessons`,
            {
              method: "POST",

              headers:
                getHeaders(true),

              body:
                JSON.stringify({
                  title,

                  icon:
                    lessonForm.icon.trim() ||
                    "📖",

                  description:
                    lessonForm.description.trim() ||
                    null,

                  status:
                    "draft",
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to create lesson."
          );
        }

        const newLesson = {
          ...data.lesson,
          topics: [],
        };

        setLessons(
          (current) => [
            ...current,
            newLesson,
          ]
        );

        setSelectedLesson(
          newLesson
        );

        setSelectedTopic(null);

        setLearningBlocks([]);

        setEditorMode(
          "lesson"
        );
      } catch (
        requestError
      ) {
        console.error(
          "Create lesson error:",
          requestError
        );

        setFormError(
          requestError.message ||
            "Unable to create lesson."
        );
      } finally {
        setIsSaving(false);
      }
    };

  /*
   * =========================================
   * Add Topic
   * =========================================
   */

  const handleOpenAddTopic =
    () => {
      if (
        !selectedLesson
      ) {
        setFormError(
          "Select a lesson before adding a topic."
        );

        return;
      }

      setTopicForm({
        title: "",
        icon: "📑",
        description: "",
      });

      setFormError("");

      setEditorMode(
        "add-topic"
      );
    };

  const handleCreateTopic =
    async (event) => {
      event.preventDefault();

      if (
        !selectedLesson
      ) {
        setFormError(
          "Select a lesson before adding a topic."
        );

        return;
      }

      const title =
        topicForm.title.trim();

      if (!title) {
        setFormError(
          "Topic title is required."
        );

        return;
      }

      setIsSaving(true);
      setFormError("");

      try {
        const response =
          await fetch(
            `http://127.0.0.1:8000/api/teacher/lessons/${selectedLesson.id}/topics`,
            {
              method: "POST",

              headers:
                getHeaders(true),

              body:
                JSON.stringify({
                  title,

                  icon:
                    topicForm.icon.trim() ||
                    "📑",

                  description:
                    topicForm.description.trim() ||
                    null,

                  status:
                    "draft",
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to create topic."
          );
        }

        const newTopic =
          data.topic;

        setLessons(
          (current) =>
            current.map(
              (lesson) => {
                if (
                  lesson.id !==
                  selectedLesson.id
                ) {
                  return lesson;
                }

                return {
                  ...lesson,

                  topics: [
                    ...(lesson.topics ||
                      []),

                    newTopic,
                  ],
                };
              }
            )
        );

        setSelectedTopic(
          newTopic
        );

        setLearningBlocks([]);

        setEditorMode(
          "topic"
        );
      } catch (
        requestError
      ) {
        console.error(
          "Create topic error:",
          requestError
        );

        setFormError(
          requestError.message ||
            "Unable to create topic."
        );
      } finally {
        setIsSaving(false);
      }
    };

  /*
   * =========================================
   * Block Library
   * =========================================
   */

  const handleOpenBlockLibrary =
    async () => {
      if (!selectedTopic) {
        setFormError(
          "Select a topic first."
        );

        return;
      }

      setFormError("");
      setIsLoadingTemplates(true);

      setEditorMode(
        "block-library"
      );

      try {
        const response =
          await fetch(
            "http://127.0.0.1:8000/api/teacher/lblock-templates",
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

        setBlockTemplates(
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

        setFormError(
          requestError.message ||
            "Unable to load learning block templates."
        );

        setBlockTemplates([]);
      } finally {
        setIsLoadingTemplates(
          false
        );
      }
    };

  const handleSelectBlockTemplate =
    (template) => {
      const exampleData =
        template.example_data ||
        {};

      const fields =
        template
          .configuration_schema
          ?.fields ||
        [];

      const initialForm = {};

      fields.forEach(
        (field) => {
          const fieldName =
            field.name;

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

          switch (field.type) {
            case "boolean":
              initialForm[fieldName] =
                false;
              break;

            default:
              initialForm[fieldName] =
                "";
              break;
          }
        }
      );

      setSelectedBlockTemplate(
        template
      );

      setTemplateForm(
        initialForm
      );

      setFormError("");

      setEditorMode(
        "add-template-block"
      );
    };

  const handleTemplateFieldChange =
    (
      fieldName,
      value
    ) => {
      setTemplateForm(
        (current) => ({
          ...current,

          [fieldName]:
            value,
        })
      );
    };

  const handleTemplateRepeaterItemChange = (
    fieldName,
    itemIndex,
    itemFieldName,
    value
  ) => {
    setTemplateForm((current) => ({
      ...current,
      [fieldName]: (current[fieldName] || []).map(
        (item, index) =>
          index === itemIndex
            ? {
                ...item,
                [itemFieldName]: value,
              }
            : item
      ),
    }));
  };

  const handleAddTemplateRepeaterItem = (field) => {
    const newItem = {};

    (field.fields || []).forEach((itemField) => {
      newItem[itemField.name] =
        itemField.default ?? "";
    });

    setTemplateForm((current) => ({
      ...current,
      [field.name]: [
        ...(current[field.name] || []),
        newItem,
      ],
    }));
  };

  const handleRemoveTemplateRepeaterItem = (
    fieldName,
    itemIndex
  ) => {
    setTemplateForm((current) => ({
      ...current,
      [fieldName]: (current[fieldName] || []).filter(
        (_, index) => index !== itemIndex
      ),
    }));
  };

  const handleCreateTemplateBlock =
    async (event) => {
      event.preventDefault();

      if (!selectedTopic) {
        setFormError(
          "Select a topic first."
        );

        return;
      }

      if (!selectedBlockTemplate) {
        setFormError(
          "Select a learning block template."
        );

        return;
      }

      const fields =
        selectedBlockTemplate
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
          setFormError(
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
      setFormError("");

      try {
        const response =
          await fetch(
            `http://127.0.0.1:8000/api/teacher/topics/${selectedTopic.id}/learning-blocks`,
            {
              method:
                "POST",

              headers:
                getHeaders(true),

              body:
                JSON.stringify({
                  lblock_template_id:
                    selectedBlockTemplate.id,

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

        setLearningBlocks(
          (current) => [
            ...current,
            data.learning_block,
          ]
        );

        setSelectedBlockTemplate(
          null
        );

        setTemplateForm({});

        setEditorMode(
          "topic"
        );
      } catch (
        requestError
      ) {
        console.error(
          "Create template block error:",
          requestError
        );

        setFormError(
          requestError.message ||
            "Unable to create learning block."
        );
      } finally {
        setIsSaving(false);
      }
    };

  /*
   * =========================================
   * Learning Block Drawers
   * =========================================
   */

  const handleCloseBlockLibrary = () => {
    setSelectedBlockTemplate(null);
    setTemplateForm({});
    setFormError("");

    setEditorMode(
      selectedTopic
        ? "topic"
        : selectedLesson
        ? "lesson"
        : "course"
    );
  };

  const handleCloseTemplateDrawer = () => {
    setSelectedBlockTemplate(null);
    setTemplateForm({});
    setFormError("");
    setEditorMode("block-library");
  };

  /*
   * =========================================
   * Loading / Error
   * =========================================
   */

  if (isLoading) {
    return (
      <div className="course-playground-state">
        <strong>
          Loading Course
          Playground...
        </strong>

        <span>
          Preparing your course.
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-playground-state">
        <strong>
          Unable to open Course
          Playground
        </strong>

        <span>
          {error}
        </span>

        <button
          type="button"
          className="teacher-primary-button"
          onClick={() =>
            navigate(
              "/teacher/courses"
            )
          }
        >
          Back to Courses
        </button>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  /*
   * =========================================
   * Render
   * =========================================
   */

  return (
    <div className="course-playground">
      <div className="course-playground-grid">
        {/* ===========================
            LEFT - Course Index
        ============================ */}

        <aside className="course-playground-index">
          <div className="course-playground-panel-heading">
            <button
              type="button"
              className="course-playground-back"
              onClick={() => navigate("/teacher/courses")}
            >
              ← Back
            </button>
           <div className="course-playground-course-heading">
  <h1>{course?.title || "Course"}</h1>

  <span
    className={`course-playground-course-status ${
      course?.status === "published"
        ? "published"
        : "draft"
    }`}
  >
    {course?.status === "published"
      ? "Published"
      : "Draft"}
  </span>
</div>
           
          </div>

          {lessons.length ===
          0 ? (
            <div className="course-playground-empty">
              <div>
                🗺️
              </div>

              <strong>
                No lessons yet
              </strong>

              <p>
                Add your first
                lesson to start
                building this
                course.
              </p>
            </div>
          ) : (
            <div className="course-playground-lessons">
              {lessons.map(
                (lesson, lessonIndex) => (
                  <section
                    key={
                      lesson.id
                    }
                    className="course-playground-lesson"
                    style={{
                      "--lesson-color":
                        LESSON_ACCENT_COLORS[
                          lessonIndex %
                            LESSON_ACCENT_COLORS.length
                        ],
                      "--lesson-accent":
                        LESSON_ACCENT_COLORS[
                          lessonIndex %
                            LESSON_ACCENT_COLORS.length
                        ],
                      "--w":
                        LESSON_ACCENT_COLORS[
                          lessonIndex %
                            LESSON_ACCENT_COLORS.length
                        ],
                    }}
                  >
                    <button
                      type="button"
                      className={
                        selectedLesson
                          ?.id ===
                          lesson.id &&
                        !selectedTopic
                          ? "course-playground-lesson-title active"
                          : "course-playground-lesson-title"
                      }
                      onClick={() =>
                        handleSelectLesson(
                          lesson
                        )
                      }
                    >
                      <span>
                        {lesson.icon ||
                          "📖"}
                      </span>

                      <strong>
                        {
                          lesson.title
                        }
                      </strong>
                    </button>

                    <div className="course-playground-topics">
                      {(
                        lesson.topics ||
                        []
                      ).map(
                        (topic) => (
                          <button
                            key={
                              topic.id
                            }
                            type="button"
                            className={
                              selectedTopic
                                ?.id ===
                              topic.id
                                ? "course-playground-topic active"
                                : "course-playground-topic"
                            }
                            onClick={() =>
                              handleSelectTopic(
                                lesson,
                                topic
                              )
                            }
                          >
                            <span>
                              {topic.icon ||
                                "📑"}
                            </span>

                            <span>
                              {
                                topic.title
                              }
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  </section>
                )
              )}
            </div>
          )}

          <div className="course-playground-index-actions">
            <button
              type="button"
              className="course-playground-add-button"
              onClick={
                handleOpenAddLesson
              }
            >
              + Add Lesson
            </button>

            <button
              type="button"
              className="course-playground-add-button secondary"
              onClick={
                handleOpenAddTopic
              }
              disabled={
                !selectedLesson
              }
            >
              + Add Topic
            </button>
          </div>
        </aside>

        {/* ===========================
            CENTRE - Student Preview
        ============================ */}

        <main className="course-playground-preview">
          

          <div className="course-playground-student-canvas">
            {!selectedTopic ? (
              <div className="course-playground-preview-empty">
                <div>
                  {course.icon ||
                    "🚀"}
                </div>

                <h2>
                  {selectedLesson
                    ? selectedLesson.title
                    : course.title}
                </h2>

                <p>
                  {selectedLesson
                    ? "Add or select a topic to start building the student experience."
                    : "Add your first lesson to start building this course."}
                </p>
              </div>
            ) : (
              <article
                className="lesson"
                style={{
                  "--lesson-accent":
                    getLessonAccentColor(
                      lessons,
                      selectedLesson
                    ),
                  "--w":
                    getLessonAccentColor(
                      lessons,
                      selectedLesson
                    ),
                }}
              >
                <div className="crumb">
                  {course.title}

                  {selectedLesson && (
                    <>
                      {" · "}

                      {
                        selectedLesson.title
                      }
                    </>
                  )}
                </div>

                <h1>
                  <span className="t">
                    {selectedTopic.icon ||
                      "📑"}{" "}

                    {
                      selectedTopic.title
                    }
                  </span>
                </h1>

                {isLoadingBlocks ? (
                  <div className="course-playground-preview-placeholder">
                    <p>
                      Loading
                      learning
                      blocks...
                    </p>
                  </div>
                ) : learningBlocks.length >
                  0 ? (
                  <>
                    {learningBlocks.map(
                      (block) => (
                        <LearningBlockRenderer
                          key={
                            block.id
                          }
                          block={
                            block
                          }
                        />
                      )
                    )}

                    <button
                      type="button"
                      className="course-playground-inline-add-block"
                      onClick={
                        handleOpenBlockLibrary
                      }
                    >
                      + Add Learning
                      Block
                    </button>
                  </>
                ) : (
                  <div className="course-playground-preview-placeholder">
                    <div className="course-playground-placeholder-icon">
                      🧱
                    </div>

                    <h3>
                      No learning
                      blocks yet
                    </h3>

                    <p>
                      Add your first
                      reusable
                      learning
                      component to
                      this topic.
                    </p>

                    <button
                      type="button"
                      className="btn"
                      onClick={
                        handleOpenBlockLibrary
                      }
                    >
                      + Add First
                      Block
                    </button>
                  </div>
                )}
              </article>
            )}
          </div>
        </main>

        {/* ===========================
            RIGHT - Editor
        ============================ */}

        {/* ===========================
            SLIDE-OVER - Block Library
        ============================ */}

        <aside
          className={`course-playground-drawer course-playground-library-drawer ${
            editorMode === "block-library" ||
            editorMode === "add-template-block"
              ? "open"
              : ""
          }`}
        >
          <div className="course-playground-drawer-header">
            <div>
              <span>LEARNING BLOCKS</span>
              <h2>Add Learning Block</h2>
            </div>

            <button
              type="button"
              className="course-playground-drawer-close"
              aria-label="Close learning block library"
              onClick={handleCloseBlockLibrary}
            >
              ×
            </button>
          </div>

          <div className="course-playground-drawer-scroll">
            <div className="course-playground-block-library">
              <p className="course-playground-library-intro">
                Choose a developer-managed
                learning block to add to:
              </p>

              <strong className="course-playground-library-topic">
                {selectedTopic
                  ?.icon ||
                  "📑"}{" "}

                {
                  selectedTopic
                    ?.title
                }
              </strong>

              {isLoadingTemplates ? (
                <div className="course-playground-library-loading">
                  Loading learning blocks...
                </div>
              ) : blockTemplates.length > 0 ? (
                <>
                  <div className="course-playground-library-section-title">
                    Available Learning Blocks
                  </div>

                  {blockTemplates.map(
                    (template) => (
                      <button
                        key={
                          template.id
                        }
                        type="button"
                        className="course-playground-block-option"
                        onClick={() =>
                          handleSelectBlockTemplate(
                            template
                          )
                        }
                      >
                        <span className="course-playground-block-option-icon">
                          {template.icon ||
                            "🧩"}
                        </span>

                        <span>
                          <strong>
                            {
                              template.name
                            }
                          </strong>

                          <small>
                            {template.description ||
                              "Reusable MentorXn learning block."}
                          </small>

                          {Array.isArray(
                            template.tags
                          ) &&
                            template.tags
                              .length >
                              0 && (
                              <span className="course-playground-template-tags">
                                {template.tags.map(
                                  (
                                    tag
                                  ) => (
                                    <span
                                      key={
                                        tag
                                      }
                                      className="course-playground-template-tag"
                                    >
                                      {
                                        tag
                                      }
                                    </span>
                                  )
                                )}
                              </span>
                            )}
                        </span>
                      </button>
                    )
                  )}
                </>
              ) : (
                <div className="course-playground-library-loading">
                  No active learning block
                  templates found.
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ===========================
            SLIDE-OVER - Block Configuration
        ============================ */}

        <aside
          className={`course-playground-drawer course-playground-config-drawer ${
            editorMode === "add-template-block" &&
            selectedBlockTemplate
              ? "open"
              : ""
          }`}
        >
          {selectedBlockTemplate && (
            <>
              <div className="course-playground-drawer-header">
                <div>
                  <span>CONFIGURE BLOCK</span>
                  <h2>
                    {selectedBlockTemplate.icon || "🧩"}{" "}
                    {selectedBlockTemplate.name}
                  </h2>
                </div>

                <button
                  type="button"
                  className="course-playground-drawer-close"
                  aria-label="Close learning block configuration"
                  onClick={handleCloseTemplateDrawer}
                >
                  ×
                </button>
              </div>

              <form
              className="course-playground-form course-playground-drawer-form"
              onSubmit={
                handleCreateTemplateBlock
              }
            >
              <div className="course-playground-parent-info">
                <span>
                  Adding{" "}
                  {
                    selectedBlockTemplate.name
                  }{" "}
                  to
                </span>

                <strong>
                  {selectedTopic
                    ?.icon ||
                    "📑"}{" "}

                  {
                    selectedTopic
                      ?.title
                  }
                </strong>
              </div>

              {(
                selectedBlockTemplate
                  .configuration_schema
                  ?.fields || []
              ).map((field) => {
                const fieldValue =
                  templateForm[
                    field.name
                  ];

                return (
                  <div
                    key={
                      field.name
                    }
                    className="course-playground-template-field"
                  >
                    <label
                      htmlFor={`template-${field.name}`}
                    >
                      {field.label ||
                        field.name}

                      {field.required &&
                        " *"}
                    </label>

                    {field.type ===
                    "repeater" ? (
                      <div className="course-playground-repeater">
                        {(Array.isArray(fieldValue)
                          ? fieldValue
                          : []
                        ).map((item, itemIndex) => (
                          <section
                            key={itemIndex}
                            className="course-playground-question-editor"
                          >
                            <div className="course-playground-question-header">
                              <strong>
                                {field.item_label || "Item"}{" "}
                                {itemIndex + 1}
                              </strong>

                              {(fieldValue?.length || 0) >
                                (field.min_items || 1) && (
                                <button
                                  type="button"
                                  className="course-playground-question-remove"
                                  onClick={() =>
                                    handleRemoveTemplateRepeaterItem(
                                      field.name,
                                      itemIndex
                                    )
                                  }
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            {(field.fields || []).map(
                              (itemField) => (
                                <div
                                  key={itemField.name}
                                  className="course-playground-template-field"
                                >
                                  <label>
                                    {itemField.label ||
                                      itemField.name}
                                  </label>

                                  {itemField.type ===
                                  "textarea" ? (
                                    <textarea
                                      rows={itemField.rows || 4}
                                      value={
                                        item?.[itemField.name] ??
                                        ""
                                      }
                                      onChange={(event) =>
                                        handleTemplateRepeaterItemChange(
                                          field.name,
                                          itemIndex,
                                          itemField.name,
                                          event.target.value
                                        )
                                      }
                                    />
                                  ) : (
                                    <input
                                      type="text"
                                      value={
                                        item?.[itemField.name] ??
                                        ""
                                      }
                                      onChange={(event) =>
                                        handleTemplateRepeaterItemChange(
                                          field.name,
                                          itemIndex,
                                          itemField.name,
                                          event.target.value
                                        )
                                      }
                                    />
                                  )}
                                </div>
                              )
                            )}
                          </section>
                        ))}

                        <button
                          type="button"
                          className="course-playground-small-add-button"
                          onClick={() =>
                            handleAddTemplateRepeaterItem(field)
                          }
                        >
                          + Add {field.item_label || "Item"}
                        </button>
                      </div>
                    ) : field.type ===
                    "textarea" ? (
                      <textarea
                        id={`template-${field.name}`}
                        rows="6"
                        value={
                          fieldValue ??
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          handleTemplateFieldChange(
                            field.name,
                            event
                              .target
                              .value
                          )
                        }
                      />
                    ) : field.type ===
                      "code" ? (
                      <textarea
                        id={`template-${field.name}`}
                        className="course-playground-content-editor"
                        rows="10"
                        spellCheck="false"
                        value={
                          fieldValue ??
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          handleTemplateFieldChange(
                            field.name,
                            event
                              .target
                              .value
                          )
                        }
                      />
                    ) : field.type ===
                      "boolean" ? (
                      <label className="course-playground-checkbox">
                        <input
                          id={`template-${field.name}`}
                          type="checkbox"
                          checked={
                            Boolean(
                              fieldValue
                            )
                          }
                          onChange={(
                            event
                          ) =>
                            handleTemplateFieldChange(
                              field.name,
                              event
                                .target
                                .checked
                            )
                          }
                        />

                        <span>
                          Enabled
                        </span>
                      </label>
                    ) : (
                      <input
                        id={`template-${field.name}`}
                        type={
                          field.type ===
                          "number"
                            ? "number"
                            : "text"
                        }
                        value={
                          fieldValue ??
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          handleTemplateFieldChange(
                            field.name,
                            event
                              .target
                              .value
                          )
                        }
                      />
                    )}
                  </div>
                );
              })}

              <div className="course-playground-form-actions course-playground-drawer-footer">
                <button
                  type="button"
                  className="course-playground-cancel-button"
                  disabled={
                    isSaving
                  }
                  onClick={handleCloseTemplateDrawer}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="course-playground-save-button"
                  disabled={
                    isSaving
                  }
                >
                  {isSaving
                    ? "Saving..."
                    : "Add Learning Block"}
                </button>
              </div>
            </form>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default CoursePlaygroundPage;