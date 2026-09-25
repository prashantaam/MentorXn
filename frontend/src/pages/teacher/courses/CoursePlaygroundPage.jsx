import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import LearningBlockRenderer from "../../../components/learning/block-component-settings/LearningBlockRenderer";

import LearningText from "../../../components/learning/shared/LearningText";

import "../../../styles/teachers/course-playground.css";
import "../../../styles/adventure-land.css";
import BlockConfigField from "./BlockConfigField";

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
    editingLearningBlock,
    setEditingLearningBlock,
  ] = useState(null);

  const [
    learningBlockPendingDelete,
    setLearningBlockPendingDelete,
  ] = useState(null);

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
          `http://127.0.0.1:8000/api/teacher/lessons/${editingLesson.id}`,
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
          `http://127.0.0.1:8000/api/teacher/lessons/${deletingLesson.id}`,
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
        `http://127.0.0.1:8000/api/teacher/topics/${editingTopic.id}`,
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
        `http://127.0.0.1:8000/api/teacher/topics/${deletingTopic.id}`,
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
                  field.default ?? false;
                break;

              case "select":
                initialForm[fieldName] =
                  field.default ??
                  field.options?.[0]?.value ??
                  "";
                break;

              case "repeater":
                initialForm[fieldName] = [];
                break;

              default:
                initialForm[fieldName] =
                  field.default ?? "";
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
   * Edit / Delete Learning Blocks
   * =========================================
   */

  const handleEditLearningBlock = (block) => {
    const template =
      block?.lblock_template ||
      block?.lblockTemplate ||
      blockTemplates.find(
        (item) =>
          Number(item.id) ===
          Number(block?.lblock_template_id)
      );

    if (!template) {
      setFormError(
        "Unable to find the learning block template."
      );
      return;
    }

    const fields =
      template.configuration_schema?.fields ||
      [];

    const initialForm = {};

    fields.forEach((field) => {
      if (!field?.name) {
        return;
      }

      if (field.name === "title") {
        initialForm.title =
          block?.title ?? "";
        return;
      }

      if (field.name === "icon") {
        initialForm.icon =
          block?.icon ?? "";
        return;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          block?.data || {},
          field.name
        )
      ) {
        initialForm[field.name] =
          block.data[field.name];
        return;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          field,
          "default"
        )
      ) {
        initialForm[field.name] =
          field.default;
        return;
      }

      if (field.type === "boolean") {
        initialForm[field.name] = false;
      } else if (field.type === "repeater") {
        initialForm[field.name] = [];
      } else if (field.type === "select") {
        const firstOption =
          field.options?.[0];

        initialForm[field.name] =
          typeof firstOption === "string"
            ? firstOption
            : firstOption?.value ?? "";
      } else {
        initialForm[field.name] = "";
      }
    });

    setEditingLearningBlock(block);
    setSelectedBlockTemplate(template);
    setTemplateForm(initialForm);
    setFormError("");
    setEditorMode("edit-template-block");
  };

  const handleSaveTemplateBlock =
    async (event) => {
      event.preventDefault();

      if (!editingLearningBlock) {
        setFormError(
          "No learning block is selected for editing."
        );
        return;
      }

      if (!selectedBlockTemplate) {
        setFormError(
          "Unable to find the learning block template."
        );
        return;
      }

      const fields =
        selectedBlockTemplate
          .configuration_schema
          ?.fields || [];

      for (const field of fields) {
        if (!field.required) {
          continue;
        }

        const value =
          templateForm[field.name];

        if (
          value === undefined ||
          value === null ||
          (
            typeof value === "string" &&
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

      fields.forEach((field) => {
        if (
          field.name === "title" ||
          field.name === "icon"
        ) {
          return;
        }

        let value =
          templateForm[field.name];

        if (typeof value === "string") {
          value = value.trim();
        }

        blockData[field.name] = value;
      });

      setIsSaving(true);
      setFormError("");

      try {
        const response =
          await fetch(
            `http://127.0.0.1:8000/api/teacher/learning-blocks/${editingLearningBlock.id}`,
            {
              method: "PUT",
              headers: getHeaders(true),
              body: JSON.stringify({
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
                data: blockData,
                status:
                  editingLearningBlock.status ||
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
              "Unable to update learning block."
          );
        }

        setLearningBlocks((current) =>
          current.map((block) =>
            Number(block.id) ===
            Number(data.learning_block.id)
              ? data.learning_block
              : block
          )
        );

        setEditingLearningBlock(null);
        setSelectedBlockTemplate(null);
        setTemplateForm({});
        setEditorMode("topic");
      } catch (requestError) {
        console.error(
          "Update learning block error:",
          requestError
        );

        setFormError(
          requestError.message ||
            "Unable to update learning block."
        );
      } finally {
        setIsSaving(false);
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
            `http://127.0.0.1:8000/api/teacher/learning-blocks/${learningBlockPendingDelete.id}`,
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

        if (
          Number(editingLearningBlock?.id) ===
          Number(
            learningBlockPendingDelete.id
          )
        ) {
          setEditingLearningBlock(null);
          setSelectedBlockTemplate(null);
          setTemplateForm({});
          setEditorMode("topic");
        }

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
    const wasEditing =
      editorMode === "edit-template-block";

    setEditingLearningBlock(null);
    setSelectedBlockTemplate(null);
    setTemplateForm({});
    setFormError("");

    setEditorMode(
      wasEditing
        ? "topic"
        : "block-library"
    );
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
            RIGHT - Editor
        ============================ */}

        {/* ===========================
            SLIDE-OVER - Block Library
        ============================ */}

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
            (
              editorMode === "add-template-block" ||
              editorMode === "edit-template-block"
            ) &&
            selectedBlockTemplate
              ? "open"
              : ""
          }`}
        >
          {selectedBlockTemplate && (
            <>
              <div className="course-playground-drawer-header">
                <div>
                  <span>
                    {editorMode === "edit-template-block"
                      ? "EDIT BLOCK"
                      : "CONFIGURE BLOCK"}
                  </span>
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
                editorMode === "edit-template-block"
                  ? handleSaveTemplateBlock
                  : handleCreateTemplateBlock
              }
            >
              <div className="course-playground-parent-info">
                <span>
                  {editorMode === "edit-template-block"
                    ? "Editing "
                    : "Adding "}
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
).map((field) => (
  <BlockConfigField
    key={field.name}
    field={field}
    value={
      templateForm[
        field.name
      ]
    }
    onChange={(value) =>
      handleTemplateFieldChange(
        field.name,
        value
      )
    }
  />
))}

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
                    : editorMode === "edit-template-block"
                    ? "Save Changes"
                    : "Add Learning Block"}
                </button>
              </div>
            </form>
            </>
          )}
        </aside>

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