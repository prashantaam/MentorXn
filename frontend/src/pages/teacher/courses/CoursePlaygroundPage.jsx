import {
  useEffect,
  useState,
} from "react";

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import BuilderModal from "../../../components/course-builder/BuilderModal";
import ConfirmDialog from "../../../components/course-builder/ConfirmDialog";
import CourseOutline from "../../../components/course-builder/CourseOutline";
import SortableBlock from "../../../components/course-builder/SortableBlock";
import FormField from "../../../components/forms/FormField";
import { useAuth } from "../../../context/AuthContext";

// The student-facing lesson look (crumb, highlighted title, block styles)
// comes from the course player's stylesheet, so the preview is exact.
import "../../../styles/adventure-land.css";
import "../../../styles/pages/course-builder.css";

import { lessonColor } from "../../../lib/lessonColors";
import MascotIntro from "../../../components/learning/shared/MascotIntro";

const STRUCTURE_MODES = ["add-lesson", "edit-lesson", "add-topic", "edit-topic"];

const STRUCTURE_TITLES = {
  "add-lesson": "📖 Add a lesson",
  "edit-lesson": "✏️ Edit lesson",
  "add-topic": "📑 Add a topic",
  "edit-topic": "✏️ Edit topic",
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
    isReorderingBlocks,
    setIsReorderingBlocks,
  ] = useState(false);

  // Mobile: the course outline slides in as a drawer.
  const [
    isOutlineOpen,
    setIsOutlineOpen,
  ] = useState(false);

  const blockSensors = useSensors(
    useSensor(
      PointerSensor,
      {
        activationConstraint: {
          distance: 5,
        },
      }
    ),
    useSensor(
      KeyboardSensor,
      {
        coordinateGetter:
          sortableKeyboardCoordinates,
      }
    )
  );

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
    (lesson = selectedLesson) => {
      if (
        !lesson
      ) {
        setFormError(
          "Select a lesson before adding a topic."
        );

        return;
      }

      /*
       * Adding to a different lesson than the one
       * on screen: switch to that lesson first.
       */
      if (lesson.id !== selectedLesson?.id) {
        setSelectedLesson(lesson);
        setSelectedTopic(null);
        setLearningBlocks([]);
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
  /*
   * =========================================
   * Reorder Learning Blocks
   * =========================================
   */

  const handleLearningBlockDragEnd =
    async ({
      active,
      over,
    }) => {
      if (
        !over ||
        active.id === over.id ||
        !selectedTopic ||
        isReorderingBlocks
      ) {
        return;
      }

      const oldIndex =
        learningBlocks.findIndex(
          (block) =>
            String(block.id) ===
            String(active.id)
        );

      const newIndex =
        learningBlocks.findIndex(
          (block) =>
            String(block.id) ===
            String(over.id)
        );

      if (
        oldIndex === -1 ||
        newIndex === -1
      ) {
        return;
      }

      const previousBlocks =
        learningBlocks.map(
          (block) => ({
            ...block,
          })
        );

      const reorderedBlocks =
        arrayMove(
          learningBlocks,
          oldIndex,
          newIndex
        ).map(
          (block, index) => ({
            ...block,
            position: index + 1,
          })
        );

      /*
       * Optimistic update:
       * move the block immediately.
       */
      setLearningBlocks(
        reorderedBlocks
      );

      setIsReorderingBlocks(true);
      setFormError("");

      try {
        const response =
          await fetch(
            `/api/teacher/topics/${selectedTopic.id}/learning-blocks/reorder`,
            {
              method: "PUT",

              headers:
                getHeaders(true),

              body: JSON.stringify({
                blocks:
                  reorderedBlocks.map(
                    (block) => ({
                      id: block.id,
                      position:
                        block.position,
                    })
                  ),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to reorder learning blocks."
          );
        }

        setLearningBlocks(
          data.learning_blocks ||
            reorderedBlocks
        );
      } catch (requestError) {
        console.error(
          "Reorder learning blocks error:",
          requestError
        );

        /*
         * Restore the previous order
         * when the API save fails.
         */
        setLearningBlocks(
          previousBlocks
        );

        setFormError(
          requestError.message ||
            "Unable to reorder learning blocks."
        );
      } finally {
        setIsReorderingBlocks(
          false
        );
      }
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
      <div className="mx-page mx-builder-state">
        <p className="mx-hint">Loading the course builder…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-page mx-builder-state">
        <div className="mx-empty">
          <span className="mx-empty__emoji" aria-hidden="true">
            🧭
          </span>
          <h2>Couldn't open this course</h2>
          <p>{error}</p>
          <button type="button" className="mx-btn" onClick={() => navigate("/teacher/courses")}>
            ← Back to my courses
          </button>
        </div>
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

  // `selectedLesson` can be a stale copy; read topics from the live list.
  const currentLesson =
    lessons.find((lesson) => lesson.id === selectedLesson?.id) || selectedLesson;
  const currentLessonIndex = lessons.findIndex((lesson) => lesson.id === currentLesson?.id);
  const accent = lessonColor(currentLessonIndex);

  // Every topic in course order, for "topic N of M" and previous/next.
  const allTopics = lessons.flatMap((lesson) =>
    (lesson.topics || []).map((topic) => ({ lesson, topic }))
  );
  const topicPosition = selectedTopic
    ? allTopics.findIndex((entry) => entry.topic.id === selectedTopic.id)
    : -1;
  const previousTopic = topicPosition > 0 ? allTopics[topicPosition - 1] : null;
  const nextTopic =
    topicPosition >= 0 && topicPosition < allTopics.length - 1 ? allTopics[topicPosition + 1] : null;

  const isStructureModalOpen = STRUCTURE_MODES.includes(editorMode);
  const isLessonForm = editorMode === "add-lesson" || editorMode === "edit-lesson";
  const isDialogOpen =
    isStructureModalOpen || deletingLesson || deletingTopic || learningBlockPendingDelete;

  // Outline actions close the mobile drawer before doing their thing.
  const closeOutline = () => setIsOutlineOpen(false);
  const goToLesson = (lesson) => {
    closeOutline();
    handleSelectLesson(lesson);
  };
  const goToTopic = (lesson, topic) => {
    closeOutline();
    handleSelectTopic(lesson, topic);
  };
  const editTopic = (lesson, topic) => {
    closeOutline();
    // Load the topic first, so its own blocks show once the dialog closes.
    if (selectedTopic?.id !== topic.id) handleSelectTopic(lesson, topic);
    handleOpenEditTopic(lesson, topic);
  };

  const updateLessonForm = (field) => (event) =>
    setLessonForm((current) => ({ ...current, [field]: event.target.value }));
  const updateTopicForm = (field) => (event) =>
    setTopicForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <div className="mx-page mx-builder">
      <div
        className={`mx-builder__scrim${isOutlineOpen ? " is-open" : ""}`}
        onClick={closeOutline}
        aria-hidden="true"
      />

      <aside
        id="course-outline"
        className={`mx-builder__nav${isOutlineOpen ? " is-open" : ""}`}
        aria-label="Course outline"
      >
        <CourseOutline
          course={course}
          lessons={lessons}
          lessonColor={lessonColor}
          selectedLesson={currentLesson}
          selectedTopic={selectedTopic}
          onSelectLesson={goToLesson}
          onSelectTopic={goToTopic}
          onAddLesson={() => {
            closeOutline();
            handleOpenAddLesson();
          }}
          onEditLesson={(lesson) => {
            closeOutline();
            handleOpenEditLesson(lesson);
          }}
          onDeleteLesson={(lesson) => {
            closeOutline();
            handleOpenDeleteLesson(lesson);
          }}
          onAddTopic={(lesson) => {
            closeOutline();
            handleOpenAddTopic(lesson);
          }}
          onEditTopic={editTopic}
          onDeleteTopic={(lesson, topic) => {
            closeOutline();
            handleOpenDeleteTopic(lesson, topic);
          }}
        />
      </aside>

      <div className="mx-builder__main">
        <button
          type="button"
          className="mx-btn mx-btn--ghost mx-btn--sm mx-builder__menu"
          aria-controls="course-outline"
          aria-expanded={isOutlineOpen}
          onClick={() => setIsOutlineOpen(true)}
        >
          ☰ Course outline
        </button>

        {formError && !isDialogOpen && (
          <div className="mx-feedback mx-feedback--bad" role="alert">
            {formError}
          </div>
        )}

        <article className="lesson mx-builder__lesson" style={{ "--w": accent, "--lesson-accent": accent }}>
          {selectedTopic ? (
            /* ---------- topic: what students see, plus teacher controls ---------- */
            <>
              <div className="crumb">
                {course.title}
                {currentLesson && ` · ${currentLesson.title}`}
                {topicPosition >= 0 && ` · topic ${topicPosition + 1} of ${allTopics.length}`}
              </div>

              <h1>
                <span className="t">
                  {selectedTopic.icon || "📑"} {selectedTopic.title}
                </span>
              </h1>

              <MascotIntro
                icon={course.icon || "🦊"}
                text={selectedTopic.introduction}
                onEdit={() => editTopic(currentLesson, selectedTopic)}
                editLabel="Edit topic"
              />

              {isLoadingBlocks ? (
                <p className="mx-hint mx-builder__loading">Loading learning blocks…</p>
              ) : learningBlocks.length > 0 ? (
                <DndContext
                  sensors={blockSensors}
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                  onDragEnd={handleLearningBlockDragEnd}
                >
                  <SortableContext
                    items={learningBlocks.map((block) => String(block.id))}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="mx-block-list">
                      {learningBlocks.map((block, index) => (
                        <SortableBlock
                          key={block.id}
                          block={block}
                          index={index}
                          disabled={isReorderingBlocks}
                          onEdit={handleEditLearningBlock}
                          onDelete={handleRequestDeleteLearningBlock}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="mx-empty">
                  <span className="mx-empty__emoji" aria-hidden="true">
                    🧱
                  </span>
                  <h2>No learning blocks yet</h2>
                  <p>
                    Add explanations, quizzes, code labs and more. Students work
                    through them in this order.
                  </p>
                </div>
              )}

              <button type="button" className="mx-add-tile" onClick={handleOpenBlockLibrary}>
                ＋ Add a learning block
              </button>

              <nav className="mx-builder__pager" aria-label="Topics">
                <button
                  type="button"
                  className="mx-btn mx-btn--ghost"
                  disabled={!previousTopic}
                  onClick={() => goToTopic(previousTopic.lesson, previousTopic.topic)}
                  title={previousTopic?.topic.title}
                >
                  ← Previous topic
                </button>
                {nextTopic ? (
                  <button
                    type="button"
                    className="mx-btn"
                    onClick={() => goToTopic(nextTopic.lesson, nextTopic.topic)}
                    title={nextTopic.topic.title}
                  >
                    Next topic →
                  </button>
                ) : (
                  <span />
                )}
              </nav>
            </>
          ) : currentLesson ? (
            /* ---------- lesson overview ---------- */
            <>
              <div className="crumb">
                {course.title} · lesson {currentLessonIndex + 1} of {lessons.length}
              </div>

              <h1>
                <span className="t">
                  {currentLesson.icon || "📖"} {currentLesson.title}
                </span>
              </h1>

              <MascotIntro
                icon={course.icon || "🦊"}
                text={currentLesson.description || "No description yet."}
                onEdit={() => handleOpenEditLesson(currentLesson)}
                editLabel="Edit lesson"
              />

              <h2 className="mx-builder__section-title">Topics</h2>
              {(currentLesson.topics || []).length > 0 ? (
                <ol className="mx-topic-list">
                  {currentLesson.topics.map((topic) => (
                    <li key={topic.id}>
                      <button
                        type="button"
                        className="mx-topic-card"
                        onClick={() => goToTopic(currentLesson, topic)}
                      >
                        <span className="mx-topic-card__icon" aria-hidden="true">
                          {topic.icon || "📑"}
                        </span>
                        <b>{topic.title}</b>
                        <span className="mx-hint">Open →</span>
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mx-hint">
                  No topics yet. Topics hold the learning blocks students work through.
                </p>
              )}

              <button
                type="button"
                className="mx-add-tile"
                onClick={() => handleOpenAddTopic(currentLesson)}
              >
                ＋ Add a topic to this lesson
              </button>
            </>
          ) : (
            /* ---------- empty course ---------- */
            <>
              <div className="crumb">{course.title}</div>

              <h1>
                <span className="t">
                  {course.icon || "📘"} {course.title}
                </span>
              </h1>

              {course.description && (
                <MascotIntro icon={course.icon || "🦊"} text={course.description} />
              )}

              <div className="mx-empty">
                <span className="mx-empty__emoji" aria-hidden="true">
                  🗺️
                </span>
                <h2>No lessons yet</h2>
                <p>
                  A course is made of lessons, each lesson has topics, and each
                  topic holds the learning blocks students work through.
                </p>
                <button type="button" className="mx-btn" onClick={handleOpenAddLesson}>
                  ➕ Add your first lesson
                </button>
              </div>
            </>
          )}
        </article>
      </div>

      {/* ---------- add / edit lesson or topic ---------- */}
      {isStructureModalOpen && (
        <BuilderModal
          kicker="Course structure"
          title={STRUCTURE_TITLES[editorMode]}
          onClose={handleCloseStructureDrawer}
          busy={isSaving}
        >
          {isLessonForm ? (
            <form
              onSubmit={editorMode === "edit-lesson" ? handleUpdateLesson : handleCreateLesson}
              noValidate
            >
              {formError && (
                <div className="mx-feedback mx-feedback--bad" role="alert">
                  {formError}
                </div>
              )}

              <FormField id="lesson-title" label="Lesson title">
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={updateLessonForm("title")}
                  placeholder="e.g. Introduction to Kubernetes"
                  autoFocus
                />
              </FormField>

              <FormField id="lesson-icon" label="Icon" hint="Any emoji.">
                <input
                  type="text"
                  className="mx-icon-input"
                  maxLength={8}
                  value={lessonForm.icon}
                  onChange={updateLessonForm("icon")}
                />
              </FormField>

              <FormField id="lesson-description" label="Description" hint="Optional — what students will learn.">
                <textarea
                  rows={4}
                  value={lessonForm.description}
                  onChange={updateLessonForm("description")}
                  placeholder="Describe what students will learn in this lesson."
                />
              </FormField>

              <div className="mx-modal__actions">
                <button
                  type="button"
                  className="mx-btn mx-btn--ghost"
                  disabled={isSaving}
                  onClick={handleCloseStructureDrawer}
                >
                  Cancel
                </button>
                <button type="submit" className="mx-btn" disabled={isSaving}>
                  {isSaving ? "Saving…" : editorMode === "edit-lesson" ? "Save changes" : "Add lesson"}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={editorMode === "edit-topic" ? handleUpdateTopic : handleCreateTopic}
              noValidate
            >
              <p className="mx-hint">
                {editorMode === "edit-topic" ? "In " : "Adding to "}
                <b>
                  {currentLesson?.icon || "📖"} {currentLesson?.title || "the selected lesson"}
                </b>
              </p>

              {formError && (
                <div className="mx-feedback mx-feedback--bad" role="alert">
                  {formError}
                </div>
              )}

              <FormField id="topic-title" label="Topic title">
                <input
                  type="text"
                  value={topicForm.title}
                  onChange={updateTopicForm("title")}
                  placeholder="e.g. Pods and Containers"
                  autoFocus
                />
              </FormField>

              <FormField id="topic-icon" label="Icon" hint="Any emoji.">
                <input
                  type="text"
                  className="mx-icon-input"
                  maxLength={8}
                  value={topicForm.icon}
                  onChange={updateTopicForm("icon")}
                />
              </FormField>

              <FormField
                id="topic-introduction"
                label="Introduction"
                hint={
                  <>
                    Shown at the top of the topic, before its blocks. Formatting:{" "}
                    <code>**bold**</code> <code>`code`</code> <code>[[label]]</code>
                  </>
                }
              >
                <textarea
                  rows={6}
                  value={topicForm.introduction}
                  onChange={updateTopicForm("introduction")}
                  placeholder="Introduce this topic to the student…"
                />
              </FormField>

              <div className="mx-modal__actions">
                <button
                  type="button"
                  className="mx-btn mx-btn--ghost"
                  disabled={isSaving}
                  onClick={handleCloseStructureDrawer}
                >
                  Cancel
                </button>
                <button type="submit" className="mx-btn" disabled={isSaving}>
                  {isSaving ? "Saving…" : editorMode === "edit-topic" ? "Save changes" : "Add topic"}
                </button>
              </div>
            </form>
          )}
        </BuilderModal>
      )}

      {/* ---------- delete confirmations ---------- */}
      {deletingLesson && (
        <ConfirmDialog
          title="🗑️ Delete lesson"
          subject={`${deletingLesson.icon || "📖"} ${deletingLesson.title}`}
          warning="This also removes the lesson's topics and their learning blocks. It can't be undone."
          error={formError}
          confirmLabel="Delete lesson"
          busy={isSaving}
          onConfirm={handleDeleteLesson}
          onCancel={handleCloseDeleteLesson}
        />
      )}

      {deletingTopic && (
        <ConfirmDialog
          title="🗑️ Delete topic"
          subject={`${deletingTopic.icon || "📑"} ${deletingTopic.title}`}
          warning="This also removes the topic's learning blocks. It can't be undone."
          error={formError}
          confirmLabel="Delete topic"
          busy={isSaving}
          onConfirm={handleDeleteTopic}
          onCancel={handleCloseDeleteTopic}
        />
      )}

      {learningBlockPendingDelete && (
        <ConfirmDialog
          title="🗑️ Delete learning block"
          subject={`${learningBlockPendingDelete.icon || "🧩"} ${
            learningBlockPendingDelete.title || "this learning block"
          }`}
          warning="It can't be undone."
          error={formError}
          confirmLabel="Delete block"
          busy={isSaving}
          onConfirm={handleDeleteLearningBlock}
          onCancel={handleCancelDeleteLearningBlock}
        />
      )}
    </div>
  );
}

export default CoursePlaygroundPage;
