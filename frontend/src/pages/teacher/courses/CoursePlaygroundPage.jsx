import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import LearningBlockRenderer from "../../../components/learning/block-component-settings/LearningBlockRenderer";

import LearningText from "../../../components/learning/shared/LearningText";

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

  const location =
    useLocation();

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
    learningBlockPendingDelete,
    setLearningBlockPendingDelete,
  ] = useState(null);

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
    editingLesson,
    setEditingLesson,
  ] = useState(null);

  const [
    deletingLesson,
    setDeletingLesson,
  ] = useState(null);

  const [
    editingTopic,
    setEditingTopic,
  ] = useState(null);

  const [
    deletingTopic,
    setDeletingTopic,
  ] = useState(null);

  const [
    topicForm,
    setTopicForm,
  ] = useState({
    title: "",
    icon: "📑",
    introduction: "",
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
            `/api/teacher/topics/${topicId}/learning-blocks`,
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
              `/api/teacher/courses/${courseId}`,
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
              `/api/teacher/courses/${courseId}/lessons`,
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

          const lessonsWithTopics =
            (lessonsData.lessons || []).map(
              (lesson) => ({
                ...lesson,
                topics:
                  Array.isArray(
                    lesson.topics
                  )
                    ? lesson.topics
                    : [],
              })
          );

          setCourse(
            courseData.course
          );

          setLessons(
            lessonsWithTopics
          );

          const requestedTopicId =
            location.state?.selectedTopicId;

          let initialLesson =
            lessonsWithTopics[0] || null;

          let initialTopic = null;

          if (requestedTopicId) {
            initialLesson =
              lessonsWithTopics.find(
                (lesson) =>
                  (lesson.topics || []).some(
                    (topic) =>
                      Number(topic.id) ===
                      Number(requestedTopicId)
                  )
              ) || initialLesson;

            initialTopic =
              initialLesson?.topics?.find(
                (topic) =>
                  Number(topic.id) ===
                  Number(requestedTopicId)
              ) || null;
          }

          if (!initialTopic) {
            for (const lesson of lessonsWithTopics) {
              if ((lesson.topics || []).length > 0) {
                initialLesson = lesson;
                initialTopic = lesson.topics[0];
                break;
              }
            }
          }

          setSelectedLesson(initialLesson);
          setSelectedTopic(initialTopic);

          if (initialTopic) {
            setEditorMode("topic");

            await loadLearningBlocks(
              initialTopic.id
            );
          } else {
            setLearningBlocks(
              []
            );

            setEditorMode(
              initialLesson
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
    location.state?.selectedTopicId,
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
            `/api/teacher/courses/${courseId}/lessons`,
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
   * Edit / Delete Lesson
   * =========================================
   */

  const handleOpenEditLesson = (
    lesson
  ) => {
    setEditingLesson(lesson);

    setLessonForm({
      title: lesson.title || "",
      icon: lesson.icon || "📖",
      description: lesson.description || "",
    });

    setFormError("");
    setEditorMode("edit-lesson");
  };

  const handleUpdateLesson =
    async (event) => {
      event.preventDefault();

      if (!editingLesson) {
        return;
      }

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
        const response = await fetch(
          `/api/teacher/lessons/${editingLesson.id}`,
          {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify({
              title,
              icon:
                lessonForm.icon.trim() ||
                "📖",
              description:
                lessonForm.description.trim() ||
                null,
              status:
                editingLesson.status ||
                "draft",
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to update lesson."
          );
        }

        const updatedLesson = {
          ...editingLesson,
          ...data.lesson,
          topics:
            editingLesson.topics || [],
        };

        setLessons((current) =>
          current.map((lesson) =>
            lesson.id ===
            updatedLesson.id
              ? updatedLesson
              : lesson
          )
        );

        setSelectedLesson((current) =>
          current?.id ===
          updatedLesson.id
            ? updatedLesson
            : current
        );

        setEditingLesson(null);
        setEditorMode(
          selectedTopic
            ? "topic"
            : "lesson"
        );
      } catch (requestError) {
        console.error(
          "Update lesson error:",
          requestError
        );

        setFormError(
          requestError.message ||
            "Unable to update lesson."
        );
      } finally {
        setIsSaving(false);
      }
    };

  const handleOpenDeleteLesson = (
    lesson
  ) => {
    setDeletingLesson(lesson);
    setFormError("");
  };

  const handleCloseDeleteLesson = () => {
    if (isSaving) {
      return;
    }

    setDeletingLesson(null);
    setFormError("");
  };

  const handleDeleteLesson =
    async () => {
      if (!deletingLesson) {
        return;
      }

      setIsSaving(true);
      setFormError("");

      try {
        const response = await fetch(
          `/api/teacher/lessons/${deletingLesson.id}`,
          {
            method: "DELETE",
            headers: getHeaders(),
          }
        );

        let data = {};

        if (response.status !== 204) {
          data = await response.json();
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to delete lesson."
          );
        }

        const remainingLessons =
          lessons.filter(
            (lesson) =>
              lesson.id !==
              deletingLesson.id
          );

        setLessons(remainingLessons);

        if (
          selectedLesson?.id ===
          deletingLesson.id
        ) {
          const nextLesson =
            remainingLessons[0] || null;

          setSelectedLesson(nextLesson);
          setSelectedTopic(null);
          setLearningBlocks([]);
          setEditorMode(
            nextLesson
              ? "lesson"
              : "course"
          );
        }

        setDeletingLesson(null);
      } catch (requestError) {
        console.error(
          "Delete lesson error:",
          requestError
        );

        setFormError(
          requestError.message ||
            "Unable to delete lesson."
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
        introduction: "",
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

      const introduction =
        topicForm.introduction.trim();

      if (!title) {
        setFormError(
          "Topic title is required."
        );

        return;
      }

      if (!introduction) {
        setFormError(
          "Topic introduction is required."
        );

        return;
      }

      setIsSaving(true);
      setFormError("");

      try {
        const response =
          await fetch(
            `/api/teacher/lessons/${selectedLesson.id}/topics`,
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

                  introduction,

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
   * Edit / Delete Topic
   * =========================================
   */

  const handleOpenEditTopic = (lesson, topic) => {
    setSelectedLesson(lesson);
    setSelectedTopic(topic);
    setEditingTopic(topic);

    setTopicForm({
      title: topic.title || "",
      icon: topic.icon || "📑",
      introduction: topic.introduction || "",
    });

    setFormError("");
    setEditorMode("edit-topic");
  };

  const handleUpdateTopic = async (event) => {
    event.preventDefault();

    if (!editingTopic) {
      return;
    }

    const title = topicForm.title.trim();
    const introduction = topicForm.introduction.trim();

    if (!title) {
      setFormError("Topic title is required.");
      return;
    }

    if (!introduction) {
      setFormError("Topic introduction is required.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const response = await fetch(
        `/api/teacher/topics/${editingTopic.id}`,
        {
          method: "PUT",
          headers: getHeaders(true),
          body: JSON.stringify({
            title,
            icon: topicForm.icon.trim() || "📑",
            introduction,
            status: editingTopic.status || "draft",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update topic."
        );
      }

      const updatedTopic = {
        ...editingTopic,
        ...data.topic,
      };

      setLessons((current) =>
        current.map((lesson) => ({
          ...lesson,
          topics: (lesson.topics || []).map((topic) =>
            topic.id === updatedTopic.id
              ? updatedTopic
              : topic
          ),
        }))
      );

      setSelectedTopic((current) =>
        current?.id === updatedTopic.id
          ? updatedTopic
          : current
      );

      setEditingTopic(null);
      setEditorMode("topic");
    } catch (requestError) {
      console.error("Update topic error:", requestError);

      setFormError(
        requestError.message || "Unable to update topic."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteTopic = (lesson, topic) => {
    setSelectedLesson(lesson);
    setDeletingTopic(topic);
    setFormError("");
  };

  const handleCloseDeleteTopic = () => {
    if (isSaving) {
      return;
    }

    setDeletingTopic(null);
    setFormError("");
  };

  const handleDeleteTopic = async () => {
    if (!deletingTopic) {
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const response = await fetch(
        `/api/teacher/topics/${deletingTopic.id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      let data = {};

      if (response.status !== 204) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete topic."
        );
      }

      const parentLesson =
        lessons.find((lesson) =>
          (lesson.topics || []).some(
            (topic) => topic.id === deletingTopic.id
          )
        ) || selectedLesson;

      const remainingTopics = (
        parentLesson?.topics || []
      ).filter(
        (topic) => topic.id !== deletingTopic.id
      );

      setLessons((current) =>
        current.map((lesson) =>
          lesson.id === parentLesson?.id
            ? {
                ...lesson,
                topics: remainingTopics,
              }
            : lesson
        )
      );

      if (selectedTopic?.id === deletingTopic.id) {
        const nextTopic = remainingTopics[0] || null;

        setSelectedTopic(nextTopic);
        setLearningBlocks([]);

        if (nextTopic) {
          setEditorMode("topic");
          await loadLearningBlocks(nextTopic.id);
        } else {
          setEditorMode("lesson");
        }
      }

      setDeletingTopic(null);
    } catch (requestError) {
      console.error("Delete topic error:", requestError);

      setFormError(
        requestError.message || "Unable to delete topic."
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


  const handleCloseStructureDrawer = () => {
    setEditingLesson(null);
    setEditingTopic(null);
    setFormError("");
    setEditorMode(
      selectedTopic ? "topic" : selectedLesson ? "lesson" : "course"
    );
  };

 const handleOpenBlockLibrary =
  () => {
    if (!selectedTopic) {
      setFormError(
        "Select a topic first."
      );

      return;
    }

    navigate(
      `/teacher/courses/${courseId}/topics/${selectedTopic.id}/blocks/create`
    );
  };

  const handleEditLearningBlock =
  (block) => {
    if (
      !selectedTopic ||
      !block?.id
    ) {
      return;
    }

    navigate(
      `/teacher/courses/${courseId}/topics/${selectedTopic.id}/blocks/${block.id}/edit`
    );
  };
  const handleRequestDeleteLearningBlock =
    (block) => {
      setLearningBlockPendingDelete(block);
      setFormError("");
    };

  const handleCancelDeleteLearningBlock = () => {
    if (isSaving) {
      return;
    }

    setLearningBlockPendingDelete(null);
  };

  const handleDeleteLearningBlock =
    async () => {
      if (!learningBlockPendingDelete) {
        return;
      }

      setIsSaving(true);
      setFormError("");

      try {
        const response =
          await fetch(
            `/api/teacher/learning-blocks/${learningBlockPendingDelete.id}`,
            {
              method: "DELETE",
              headers: getHeaders(),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to delete learning block."
          );
        }

        setLearningBlocks((current) =>
          current.filter(
            (block) =>
              Number(block.id) !==
              Number(
                learningBlockPendingDelete.id
              )
          )
        );

        setLearningBlockPendingDelete(null);
      } catch (requestError) {
        console.error(
          "Delete learning block error:",
          requestError
        );

        setFormError(
          requestError.message ||
            "Unable to delete learning block."
        );
      } finally {
        setIsSaving(false);
      }
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
                    <div className="course-playground-lesson-heading-row">
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
                          {lesson.title}
                        </strong>
                      </button>

                      <div className="course-playground-lesson-actions">
                        <button
                          type="button"
                          className="course-playground-lesson-action edit"
                          aria-label={`Edit ${lesson.title}`}
                          title="Edit lesson"
                          onClick={() =>
                            handleOpenEditLesson(lesson)
                          }
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="course-playground-lesson-action delete"
                          aria-label={`Delete ${lesson.title}`}
                          title="Delete lesson"
                          onClick={() =>
                            handleOpenDeleteLesson(lesson)
                          }
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="course-playground-topics">
                      {(
                        lesson.topics ||
                        []
                      ).map(
                        (topic) => (
                          <div
                            key={topic.id}
                            className="course-playground-topic-row"
                          >
                            <button
                              type="button"
                              className={
                                selectedTopic?.id === topic.id
                                  ? "course-playground-topic active"
                                  : "course-playground-topic"
                              }
                              onClick={() =>
                                handleSelectTopic(lesson, topic)
                              }
                            >
                              <span>
                                {topic.icon || "📑"}
                              </span>

                              <span>
                                {topic.title}
                              </span>
                            </button>

                            <div className="course-playground-topic-actions">
                              <button
                                type="button"
                                className="course-playground-topic-action edit"
                                aria-label={`Edit ${topic.title}`}
                                title="Edit topic"
                                onClick={() =>
                                  handleOpenEditTopic(lesson, topic)
                                }
                              >
                                ✏️
                              </button>

                              <button
                                type="button"
                                className="course-playground-topic-action delete"
                                aria-label={`Delete ${topic.title}`}
                                title="Delete topic"
                                onClick={() =>
                                  handleOpenDeleteTopic(lesson, topic)
                                }
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
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

                <div className="course-playground-topic-intro">
                  <div
                    className="course-playground-topic-intro-character"
                    aria-hidden="true"
                  >
                    {course.icon || "🚀"}
                  </div>

                  <div className="course-playground-topic-intro-content">
                    <LearningText
                      text={selectedTopic.introduction}
                      as="p"
                    />
                  </div>
                </div>

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
                        <div
                          key={block.id}
                          className="course-playground-learning-block"
                        >
                         
                        <div className="course-playground-learning-block-actions">
                            <button
                              type="button"
                              className="course-playground-block-action-button"
                              onClick={() =>
                                handleEditLearningBlock(
                                  block
                                )
                              }
                              aria-label={`Edit ${block.title || "learning block"}`}
                              title="Edit learning block"
                            >
                              ✏️ Edit
                            </button>

                            <button
                              type="button"
                              className="course-playground-block-action-button danger"
                              onClick={() =>
                                handleRequestDeleteLearningBlock(
                                  block
                                )
                              }
                              aria-label={`Delete ${block.title || "learning block"}`}
                              title="Delete learning block"
                            >
                              🗑️ Delete
                            </button>
                        </div>

                          <LearningBlockRenderer
                            block={block}
                          />
                        </div>
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
            MODAL - Add Lesson / Topic
        ============================ */}

        {(editorMode === "add-lesson" ||
          editorMode === "edit-lesson" ||
          editorMode === "add-topic" ||
          editorMode === "edit-topic") && (
          <div
            className="course-playground-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isSaving) {
                handleCloseStructureDrawer();
              }
            }}
          >
            <section
              className="course-playground-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="course-structure-modal-title"
            >
              <div className="course-playground-modal-header">
                <div>
                  <span>COURSE STRUCTURE</span>
                  <h2 id="course-structure-modal-title">
                    {editorMode === "add-lesson"
                      ? "📖 Add Lesson"
                      : editorMode === "edit-lesson"
                      ? "✏️ Edit Lesson"
                      : editorMode === "edit-topic"
                      ? "✏️ Edit Topic"
                      : "📑 Add Topic"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="course-playground-modal-close"
                  aria-label={
                    editorMode === "add-lesson"
                      ? "Close add lesson"
                      : editorMode === "edit-lesson"
                      ? "Close edit lesson"
                      : editorMode === "edit-topic"
                      ? "Close edit topic"
                      : "Close add topic"
                  }
                  disabled={isSaving}
                  onClick={handleCloseStructureDrawer}
                >
                  ×
                </button>
              </div>

              {editorMode === "add-lesson" || editorMode === "edit-lesson" ? (
                <form
                  className="course-playground-form course-playground-modal-form"
                  onSubmit={
                    editorMode === "edit-lesson"
                      ? handleUpdateLesson
                      : handleCreateLesson
                  }
                >
                  {formError && (
                    <div className="course-playground-form-error course-playground-modal-error">
                      {formError}
                    </div>
                  )}

                  <label htmlFor="lesson-title">Lesson title *</label>
                  <input
                    id="lesson-title"
                    type="text"
                    value={lessonForm.title}
                    onChange={(event) =>
                      setLessonForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="e.g. Introduction to Kubernetes"
                    autoFocus
                  />

                  <label htmlFor="lesson-icon">Icon</label>
                  <input
                    id="lesson-icon"
                    type="text"
                    value={lessonForm.icon}
                    onChange={(event) =>
                      setLessonForm((current) => ({
                        ...current,
                        icon: event.target.value,
                      }))
                    }
                    placeholder="📖"
                  />

                  <label htmlFor="lesson-description">Description</label>
                  <textarea
                    id="lesson-description"
                    rows="5"
                    value={lessonForm.description}
                    onChange={(event) =>
                      setLessonForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Describe what students will learn in this lesson."
                  />

                  <div className="course-playground-form-actions course-playground-modal-actions">
                    <button
                      type="button"
                      className="course-playground-cancel-button"
                      disabled={isSaving}
                      onClick={handleCloseStructureDrawer}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="course-playground-save-button"
                      disabled={isSaving}
                    >
                      {isSaving
                        ? "Saving..."
                        : editorMode === "edit-lesson"
                        ? "Save Changes"
                        : "Add Lesson"}
                    </button>
                  </div>
                </form>
              ) : (
                <form
                  className="course-playground-form course-playground-modal-form"
                  onSubmit={
                    editorMode === "edit-topic"
                      ? handleUpdateTopic
                      : handleCreateTopic
                  }
                >
                  <div className="course-playground-parent-info">
                    <span>
                      {editorMode === "edit-topic"
                        ? "Editing topic in"
                        : "Adding topic to"}
                    </span>
                    <strong>
                      {selectedLesson?.icon || "📖"}{" "}
                      {selectedLesson?.title || "Selected lesson"}
                    </strong>
                  </div>

                  {formError && (
                    <div className="course-playground-form-error course-playground-modal-error">
                      {formError}
                    </div>
                  )}

                  <label htmlFor="topic-title">Topic title *</label>
                  <input
                    id="topic-title"
                    type="text"
                    value={topicForm.title}
                    onChange={(event) =>
                      setTopicForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="e.g. Pods and Containers"
                    autoFocus
                  />

                  <label htmlFor="topic-icon">Icon</label>
                  <input
                    id="topic-icon"
                    type="text"
                    value={topicForm.icon}
                    onChange={(event) =>
                      setTopicForm((current) => ({
                        ...current,
                        icon: event.target.value,
                      }))
                    }
                    placeholder="📑"
                  />

                  <label htmlFor="topic-introduction">
                    Introduction *
                  </label>
                  <p className="course-playground-field-help">
                    This appears at the top of the topic before the learning blocks.
                  </p>

                  <div className="course-playground-formatting-help">
                    <span>Formatting:</span>
                    <code>**bold**</code>
                    <code>`code`</code>
                    <code>[[label]]</code>
                  </div>
                  <textarea
                    id="topic-introduction"
                    rows="6"
                    value={topicForm.introduction}
                    onChange={(event) =>
                      setTopicForm((current) => ({
                        ...current,
                        introduction: event.target.value,
                      }))
                    }
                    placeholder="Introduce this topic to the student..."
                    required
                  />

                  <div className="course-playground-form-actions course-playground-modal-actions">
                    <button
                      type="button"
                      className="course-playground-cancel-button"
                      disabled={isSaving}
                      onClick={handleCloseStructureDrawer}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="course-playground-save-button"
                      disabled={isSaving}
                    >
                      {isSaving
                        ? "Saving..."
                        : editorMode === "edit-topic"
                        ? "Save Changes"
                        : "Add Topic"}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        )}

        {deletingTopic && (
          <div
            className="course-playground-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !isSaving
              ) {
                handleCloseDeleteTopic();
              }
            }}
          >
            <section
              className="course-playground-modal course-playground-delete-modal"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-topic-modal-title"
              aria-describedby="delete-topic-modal-description"
            >
              <div className="course-playground-modal-header course-playground-delete-modal-header">
                <div>
                  <span>COURSE STRUCTURE</span>
                  <h2 id="delete-topic-modal-title">
                    🗑️ Delete Topic
                  </h2>
                </div>

                <button
                  type="button"
                  className="course-playground-modal-close"
                  aria-label="Close delete topic confirmation"
                  disabled={isSaving}
                  onClick={handleCloseDeleteTopic}
                >
                  ×
                </button>
              </div>

              <div className="course-playground-delete-modal-body">
                <p id="delete-topic-modal-description">
                  Are you sure you want to delete{" "}
                  <strong>
                    {deletingTopic.icon || "📑"}{" "}
                    {deletingTopic.title}
                  </strong>
                  ?
                </p>

                <p className="course-playground-delete-warning">
                  This will also remove the topic's learning blocks and content. This action cannot be undone.
                </p>

                {formError && (
                  <div className="course-playground-form-error course-playground-modal-error">
                    {formError}
                  </div>
                )}

                <div className="course-playground-form-actions course-playground-modal-actions">
                  <button
                    type="button"
                    className="course-playground-cancel-button"
                    disabled={isSaving}
                    onClick={handleCloseDeleteTopic}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="course-playground-delete-button"
                    disabled={isSaving}
                    onClick={handleDeleteTopic}
                  >
                    {isSaving
                      ? "Deleting..."
                      : "Delete Topic"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {deletingLesson && (
          <div
            className="course-playground-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !isSaving
              ) {
                handleCloseDeleteLesson();
              }
            }}
          >
            <section
              className="course-playground-modal course-playground-delete-modal"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-lesson-modal-title"
              aria-describedby="delete-lesson-modal-description"
            >
              <div className="course-playground-modal-header course-playground-delete-modal-header">
                <div>
                  <span>COURSE STRUCTURE</span>
                  <h2 id="delete-lesson-modal-title">
                    🗑️ Delete Lesson
                  </h2>
                </div>

                <button
                  type="button"
                  className="course-playground-modal-close"
                  aria-label="Close delete lesson confirmation"
                  disabled={isSaving}
                  onClick={handleCloseDeleteLesson}
                >
                  ×
                </button>
              </div>

              <div className="course-playground-delete-modal-body">
                <p id="delete-lesson-modal-description">
                  Are you sure you want to delete
                  {" "}
                  <strong>
                    {deletingLesson.icon || "📖"}{" "}
                    {deletingLesson.title}
                  </strong>
                  ?
                </p>

                <p className="course-playground-delete-warning">
                  This will also remove the lesson's topics and their learning content. This action cannot be undone.
                </p>

                {formError && (
                  <div className="course-playground-form-error course-playground-modal-error">
                    {formError}
                  </div>
                )}

                <div className="course-playground-form-actions course-playground-modal-actions">
                  <button
                    type="button"
                    className="course-playground-cancel-button"
                    disabled={isSaving}
                    onClick={handleCloseDeleteLesson}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="course-playground-delete-confirm-button"
                    disabled={isSaving}
                    onClick={handleDeleteLesson}
                  >
                    {isSaving ? "Deleting..." : "Delete Lesson"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {learningBlockPendingDelete && (
          <div
            className="course-playground-confirm-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                handleCancelDeleteLearningBlock();
              }
            }}
          >
            <div
              className="course-playground-confirm-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-learning-block-title"
            >
              <div className="course-playground-confirm-icon">
                🗑️
              </div>

              <h2 id="delete-learning-block-title">
                Delete Learning Block
              </h2>

              <p>
                Are you sure you want to delete{" "}
                <strong>
                  {learningBlockPendingDelete.icon ||
                    "🧩"}{" "}
                  {learningBlockPendingDelete.title ||
                    "this learning block"}
                </strong>
                ? This action cannot be undone.
              </p>

              <div className="course-playground-confirm-actions">
                <button
                  type="button"
                  className="course-playground-cancel-button"
                  disabled={isSaving}
                  onClick={
                    handleCancelDeleteLearningBlock
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="course-playground-delete-confirm-button"
                  disabled={isSaving}
                  onClick={
                    handleDeleteLearningBlock
                  }
                >
                  {isSaving
                    ? "Deleting..."
                    : "Delete Block"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursePlaygroundPage;