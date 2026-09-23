import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import LearningBlockRenderer from "../../../components/learning/LearnngBlockRenderer";

import "../../../styles/course-playground.css";
import "../../../styles/adventure-land.css";

const createEmptyQuestion = () => ({
  question: "",
  type: "multiple_choice",

  options: [
    "",
    "",
    "",
    "",
  ],

  correct_answer: 0,

  correct_message:
    "Correct! 🎉",

  wrong_message:
    "Not quite right. Try again.",

  explanation: "",
});

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

  const [
    contentForm,
    setContentForm,
  ] = useState({
    title: "",
    icon: "📖",
    content: "",
  });

  const [
    quizForm,
    setQuizForm,
  ] = useState({
    title: "Quick Check",
    icon: "🧠",

    instructions:
      "Choose the best answer.",

    passing_score: 100,
    allow_retry: true,

    questions: [
      createEmptyQuestion(),
    ],
  });

  const [
    terminalForm,
    setTerminalForm,
  ] = useState({
    title: "Practice Terminal",
    icon: "🪄",
    welcome: "Welcome! Try a command.",
    tip: "",
    commandPrefix: "",
    commands: [
      {
        command: "",
        output: "",
      },
    ],
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
    () => {
      if (!selectedTopic) {
        setFormError(
          "Select a topic first."
        );

        return;
      }

      setFormError("");

      setEditorMode(
        "block-library"
      );
    };

  /*
   * =========================================
   * Content Block
   * =========================================
   */

  const handleOpenContentBlock =
    () => {
      setContentForm({
        title: "",
        icon: "📖",
        content: "",
      });

      setFormError("");

      setEditorMode(
        "add-content"
      );
    };

  const handleCreateContentBlock =
    async (event) => {
      event.preventDefault();

      if (!selectedTopic) {
        setFormError(
          "Select a topic first."
        );

        return;
      }

      const content =
        contentForm.content.trim();

      if (!content) {
        setFormError(
          "Content is required."
        );

        return;
      }

      setIsSaving(true);
      setFormError("");

      try {
        const response =
          await fetch(
            `http://127.0.0.1:8000/api/teacher/topics/${selectedTopic.id}/learning-blocks`,
            {
              method: "POST",

              headers:
                getHeaders(true),

              body:
                JSON.stringify({
                  type:
                    "content",

                  title:
                    contentForm.title.trim() ||
                    null,

                  icon:
                    contentForm.icon.trim() ||
                    null,

                  data: {
                    content,
                  },

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
              "Unable to create content block."
          );
        }

        setLearningBlocks(
          (current) => [
            ...current,
            data.learning_block,
          ]
        );

        setEditorMode(
          "topic"
        );
      } catch (
        requestError
      ) {
        console.error(
          "Create content block error:",
          requestError
        );

        setFormError(
          requestError.message ||
            "Unable to create content block."
        );
      } finally {
        setIsSaving(false);
      }
    };

  /*
   * =========================================
   * Quiz Block
   * =========================================
   */

  const handleOpenQuizBlock =
    () => {
      setQuizForm({
        title:
          "Quick Check",

        icon: "🧠",

        instructions:
          "Choose the best answer.",

        passing_score:
          100,

        allow_retry:
          true,

        questions: [
          createEmptyQuestion(),
        ],
      });

      setFormError("");

      setEditorMode(
        "add-quiz"
      );
    };

  const handleQuizFieldChange = (
    field,
    value
  ) => {
    setQuizForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  const handleQuestionChange = (
    questionIndex,
    field,
    value
  ) => {
    setQuizForm(
      (current) => ({
        ...current,

        questions:
          current.questions.map(
            (
              question,
              index
            ) =>
              index ===
              questionIndex
                ? {
                    ...question,
                    [field]:
                      value,
                  }
                : question
          ),
      })
    );
  };

  const handleOptionChange = (
    questionIndex,
    optionIndex,
    value
  ) => {
    setQuizForm(
      (current) => ({
        ...current,

        questions:
          current.questions.map(
            (
              question,
              index
            ) => {
              if (
                index !==
                questionIndex
              ) {
                return question;
              }

              return {
                ...question,

                options:
                  question.options.map(
                    (
                      option,
                      currentOptionIndex
                    ) =>
                      currentOptionIndex ===
                      optionIndex
                        ? value
                        : option
                  ),
              };
            }
          ),
      })
    );
  };

  const handleAddOption = (
    questionIndex
  ) => {
    setQuizForm(
      (current) => ({
        ...current,

        questions:
          current.questions.map(
            (
              question,
              index
            ) =>
              index ===
              questionIndex
                ? {
                    ...question,

                    options: [
                      ...question.options,
                      "",
                    ],
                  }
                : question
          ),
      })
    );
  };

  const handleRemoveOption = (
    questionIndex,
    optionIndex
  ) => {
    setQuizForm(
      (current) => ({
        ...current,

        questions:
          current.questions.map(
            (
              question,
              index
            ) => {
              if (
                index !==
                questionIndex
              ) {
                return question;
              }

              if (
                question.options
                  .length <= 2
              ) {
                return question;
              }

              const newOptions =
                question.options.filter(
                  (
                    _,
                    currentOptionIndex
                  ) =>
                    currentOptionIndex !==
                    optionIndex
                );

              let newCorrectAnswer =
                question.correct_answer;

              if (
                optionIndex ===
                question.correct_answer
              ) {
                newCorrectAnswer =
                  0;
              } else if (
                optionIndex <
                question.correct_answer
              ) {
                newCorrectAnswer =
                  question.correct_answer -
                  1;
              }

              return {
                ...question,

                options:
                  newOptions,

                correct_answer:
                  newCorrectAnswer,
              };
            }
          ),
      })
    );
  };

  const handleAddQuestion =
    () => {
      setQuizForm(
        (current) => ({
          ...current,

          questions: [
            ...current.questions,
            createEmptyQuestion(),
          ],
        })
      );
    };

  const handleRemoveQuestion = (
    questionIndex
  ) => {
    setQuizForm(
      (current) => {
        if (
          current.questions
            .length <= 1
        ) {
          return current;
        }

        return {
          ...current,

          questions:
            current.questions.filter(
              (
                _,
                index
              ) =>
                index !==
                questionIndex
            ),
        };
      }
    );
  };

  const validateQuizForm =
    () => {
      if (
        !quizForm.questions.length
      ) {
        return "Add at least one question.";
      }

      for (
        let questionIndex = 0;
        questionIndex <
        quizForm.questions.length;
        questionIndex += 1
      ) {
        const question =
          quizForm.questions[
            questionIndex
          ];

        if (
          !question.question.trim()
        ) {
          return `Question ${
            questionIndex + 1
          } is required.`;
        }

        if (
          question.options.length <
          2
        ) {
          return `Question ${
            questionIndex + 1
          } needs at least two options.`;
        }

        for (
          let optionIndex = 0;
          optionIndex <
          question.options.length;
          optionIndex += 1
        ) {
          if (
            !question.options[
              optionIndex
            ].trim()
          ) {
            return `Option ${
              optionIndex + 1
            } in question ${
              questionIndex + 1
            } is required.`;
          }
        }

        if (
          question.correct_answer <
            0 ||
          question.correct_answer >=
            question.options.length
        ) {
          return `Choose a valid correct answer for question ${
            questionIndex + 1
          }.`;
        }
      }

      return null;
    };

  const handleCreateQuizBlock =
    async (event) => {
      event.preventDefault();

      if (!selectedTopic) {
        setFormError(
          "Select a topic first."
        );

        return;
      }

      const validationError =
        validateQuizForm();

      if (validationError) {
        setFormError(
          validationError
        );

        return;
      }

      setIsSaving(true);
      setFormError("");

      const questions =
        quizForm.questions.map(
          (question) => ({
            question:
              question.question.trim(),

            type:
              "multiple_choice",

            options:
              question.options.map(
                (option) =>
                  option.trim()
              ),

            correct_answer:
              Number(
                question.correct_answer
              ),

            correct_message:
              question.correct_message.trim() ||
              "Correct! 🎉",

            wrong_message:
              question.wrong_message.trim() ||
              "Not quite right. Try again.",

            explanation:
              question.explanation.trim() ||
              null,
          })
        );

      try {
        const response =
          await fetch(
            `http://127.0.0.1:8000/api/teacher/topics/${selectedTopic.id}/learning-blocks`,
            {
              method: "POST",

              headers:
                getHeaders(true),

              body:
                JSON.stringify({
                  type: "quiz",

                  title:
                    quizForm.title.trim() ||
                    null,

                  icon:
                    quizForm.icon.trim() ||
                    "🧠",

                  data: {
                    instructions:
                      quizForm.instructions.trim() ||
                      null,

                    passing_score:
                      Number(
                        quizForm.passing_score
                      ),

                    allow_retry:
                      Boolean(
                        quizForm.allow_retry
                      ),

                    questions,
                  },

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
              "Unable to create quiz."
          );
        }

        setLearningBlocks(
          (current) => [
            ...current,
            data.learning_block,
          ]
        );

        setEditorMode(
          "topic"
        );
      } catch (
        requestError
      ) {
        console.error(
          "Create quiz error:",
          requestError
        );

        setFormError(
          requestError.message ||
            "Unable to create quiz."
        );
      } finally {
        setIsSaving(false);
      }
    };

  /*
   * =========================================
   * Practice Terminal Block
   * =========================================
   */

  const handleOpenTerminalBlock =
    () => {
      setTerminalForm({
        title: "Practice Terminal",
        icon: "🪄",
        welcome:
          "Welcome! Try a command.",
        tip: "",
        commandPrefix: "",
        commands: [
          {
            command: "",
            output: "",
          },
        ],
      });

      setFormError("");

      setEditorMode(
        "add-terminal"
      );
    };

  const handleTerminalFieldChange = (
    field,
    value
  ) => {
    setTerminalForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  const handleTerminalCommandChange = (
    commandIndex,
    field,
    value
  ) => {
    setTerminalForm(
      (current) => ({
        ...current,
        commands:
          current.commands.map(
            (command, index) =>
              index === commandIndex
                ? {
                    ...command,
                    [field]: value,
                  }
                : command
          ),
      })
    );
  };

  const handleAddTerminalCommand =
    () => {
      setTerminalForm(
        (current) => ({
          ...current,
          commands: [
            ...current.commands,
            {
              command: "",
              output: "",
            },
          ],
        })
      );
    };

  const handleRemoveTerminalCommand = (
    commandIndex
  ) => {
    setTerminalForm(
      (current) => {
        if (
          current.commands.length <= 1
        ) {
          return current;
        }

        return {
          ...current,
          commands:
            current.commands.filter(
              (_, index) =>
                index !== commandIndex
            ),
        };
      }
    );
  };

  const validateTerminalForm =
    () => {
      if (
        !terminalForm.commands.length
      ) {
        return "Add at least one command.";
      }

      for (
        let commandIndex = 0;
        commandIndex <
        terminalForm.commands.length;
        commandIndex += 1
      ) {
        const command =
          terminalForm.commands[
            commandIndex
          ];

        if (!command.command.trim()) {
          return `Command ${
            commandIndex + 1
          } is required.`;
        }

        if (!command.output.trim()) {
          return `Output for command ${
            commandIndex + 1
          } is required.`;
        }
      }

      return null;
    };

  const handleCreateTerminalBlock =
    async (event) => {
      event.preventDefault();

      if (!selectedTopic) {
        setFormError(
          "Select a topic first."
        );

        return;
      }

      const validationError =
        validateTerminalForm();

      if (validationError) {
        setFormError(
          validationError
        );

        return;
      }

      setIsSaving(true);
      setFormError("");

      const commands =
        terminalForm.commands.map(
          (command) => ({
            command:
              command.command.trim(),
            output:
              command.output.trim(),
          })
        );

      try {
        const response =
          await fetch(
            `http://127.0.0.1:8000/api/teacher/topics/${selectedTopic.id}/learning-blocks`,
            {
              method: "POST",

              headers:
                getHeaders(true),

              body:
                JSON.stringify({
                  type:
                    "practice_terminal",

                  title:
                    terminalForm.title.trim() ||
                    null,

                  icon:
                    terminalForm.icon.trim() ||
                    "🪄",

                  data: {
                    welcome:
                      terminalForm.welcome.trim() ||
                      null,

                    tip:
                      terminalForm.tip.trim() ||
                      null,

                    command_prefix:
                      terminalForm.commandPrefix.trim() ||
                      null,

                    commands,
                  },

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
              "Unable to create Practice Terminal."
          );
        }

        setLearningBlocks(
          (current) => [
            ...current,
            data.learning_block,
          ]
        );

        setEditorMode(
          "topic"
        );
      } catch (
        requestError
      ) {
        console.error(
          "Create Practice Terminal error:",
          requestError
        );

        setFormError(
          requestError.message ||
            "Unable to create Practice Terminal."
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
      {/* Header */}

      <header className="course-playground-header">
        <div className="course-playground-heading">
          <button
            type="button"
            className="course-playground-back"
            onClick={() =>
              navigate(
                "/teacher/courses"
              )
            }
          >
            ←
          </button>

          <div className="course-playground-course-icon">
            {course.icon ||
              "🚀"}
          </div>

          <div>
            <span className="course-playground-label">
              COURSE PLAYGROUND
            </span>

            <h1>
              {course.title}
            </h1>
          </div>
        </div>

        <div className="course-playground-actions">
          <span
            className={`course-playground-status ${course.status}`}
          >
            {course.status ===
            "published"
              ? "Published"
              : "Draft"}
          </span>

          <button
            type="button"
            className="course-playground-preview-button"
          >
            Preview Course
          </button>
        </div>
      </header>

      <div className="course-playground-grid">
        {/* ===========================
            LEFT - Course Index
        ============================ */}

        <aside className="course-playground-index">
          <div className="course-playground-panel-heading course-playground-index-toolbar">
            <button
              type="button"
              className="course-playground-add-button compact"
              onClick={
                handleOpenAddLesson
              }
            >
              + Add Lesson
            </button>

            <button
              type="button"
              className="course-playground-add-button secondary compact"
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
                (lesson) => (
                  <section
                    key={
                      lesson.id
                    }
                    className="course-playground-lesson"
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
              <article className="lesson">
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

        <aside className="course-playground-editor">
          <div className="course-playground-panel-heading">
            <div>
              <span>
                EDIT
              </span>

              <h2>
                {editorMode ===
                "add-lesson"
                  ? "Add Lesson"
                  : editorMode ===
                    "add-topic"
                  ? "Add Topic"
                  : editorMode ===
                    "block-library"
                  ? "Add Block"
                  : editorMode ===
                    "add-content"
                  ? "Content Block"
                  : editorMode ===
                    "add-quiz"
                  ? "Quiz Block"
                  : editorMode ===
                    "add-terminal"
                  ? "Practice Terminal"
                  : editorMode ===
                    "lesson"
                  ? "Lesson"
                  : editorMode ===
                    "topic"
                  ? "Topic"
                  : "Course"}
              </h2>
            </div>
          </div>

          {formError && (
            <div className="course-playground-form-error">
              ⚠️{" "}
              {formError}
            </div>
          )}

          {/* Add Lesson */}

          {editorMode ===
            "add-lesson" && (
            <form
              className="course-playground-form"
              onSubmit={
                handleCreateLesson
              }
            >
              <label htmlFor="lesson-title">
                Lesson title
              </label>

              <input
                id="lesson-title"
                type="text"
                value={
                  lessonForm.title
                }
                placeholder="e.g. Meet PHP"
                onChange={(
                  event
                ) =>
                  setLessonForm(
                    (current) => ({
                      ...current,

                      title:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />

              <label htmlFor="lesson-icon">
                Icon
              </label>

              <input
                id="lesson-icon"
                type="text"
                value={
                  lessonForm.icon
                }
                onChange={(
                  event
                ) =>
                  setLessonForm(
                    (current) => ({
                      ...current,

                      icon:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />

              <label htmlFor="lesson-description">
                Description
              </label>

              <textarea
                id="lesson-description"
                rows="4"
                value={
                  lessonForm.description
                }
                onChange={(
                  event
                ) =>
                  setLessonForm(
                    (current) => ({
                      ...current,

                      description:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />

              <div className="course-playground-form-actions">
                <button
                  type="button"
                  className="course-playground-cancel-button"
                  onClick={() =>
                    setEditorMode(
                      selectedTopic
                        ? "topic"
                        : selectedLesson
                        ? "lesson"
                        : "course"
                    )
                  }
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
                    ? "Creating..."
                    : "Create Lesson"}
                </button>
              </div>
            </form>
          )}

          {/* Add Topic */}

          {editorMode ===
            "add-topic" && (
            <form
              className="course-playground-form"
              onSubmit={
                handleCreateTopic
              }
            >
              <div className="course-playground-parent-info">
                <span>
                  Adding topic to
                </span>

                <strong>
                  {selectedLesson
                    ?.icon ||
                    "📖"}{" "}

                  {
                    selectedLesson
                      ?.title
                  }
                </strong>
              </div>

              <label htmlFor="topic-title">
                Topic title
              </label>

              <input
                id="topic-title"
                type="text"
                value={
                  topicForm.title
                }
                placeholder="e.g. What is PHP?"
                onChange={(
                  event
                ) =>
                  setTopicForm(
                    (current) => ({
                      ...current,

                      title:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />

              <label htmlFor="topic-icon">
                Icon
              </label>

              <input
                id="topic-icon"
                type="text"
                value={
                  topicForm.icon
                }
                onChange={(
                  event
                ) =>
                  setTopicForm(
                    (current) => ({
                      ...current,

                      icon:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />

              <label htmlFor="topic-description">
                Description
              </label>

              <textarea
                id="topic-description"
                rows="4"
                value={
                  topicForm.description
                }
                onChange={(
                  event
                ) =>
                  setTopicForm(
                    (current) => ({
                      ...current,

                      description:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />

              <div className="course-playground-form-actions">
                <button
                  type="button"
                  className="course-playground-cancel-button"
                  onClick={() =>
                    setEditorMode(
                      selectedTopic
                        ? "topic"
                        : "lesson"
                    )
                  }
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
                    ? "Creating..."
                    : "Create Topic"}
                </button>
              </div>
            </form>
          )}

          {/* Block Library */}

          {editorMode ===
            "block-library" && (
            <div className="course-playground-block-library">
              <p className="course-playground-library-intro">
                Choose a learning
                component to add
                to:
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

              <button
                type="button"
                className="course-playground-block-option"
                onClick={
                  handleOpenContentBlock
                }
              >
                <span className="course-playground-block-option-icon">
                  📖
                </span>

                <span>
                  <strong>
                    Content
                  </strong>

                  <small>
                    Text,
                    explanations
                    and learning
                    material.
                  </small>
                </span>
              </button>

              <button
                type="button"
                className="course-playground-block-option"
                onClick={
                  handleOpenQuizBlock
                }
              >
                <span className="course-playground-block-option-icon">
                  🧠
                </span>

                <span>
                  <strong>
                    Quiz
                  </strong>

                  <small>
                    Multiple-choice
                    questions with
                    feedback and
                    explanations.
                  </small>
                </span>
              </button>

              <button
                type="button"
                className="course-playground-block-option"
                onClick={
                  handleOpenTerminalBlock
                }
              >
                <span className="course-playground-block-option-icon">
                  🪄
                </span>

                <span>
                  <strong>
                    Practice
                    Terminal
                  </strong>

                  <small>
                    Simulated command-line
                    practice with teacher-defined
                    commands and outputs.
                  </small>
                </span>
              </button>

              <button
                type="button"
                className="course-playground-cancel-button full-width"
                onClick={() =>
                  setEditorMode(
                    "topic"
                  )
                }
              >
                Cancel
              </button>
            </div>
          )}

          {/* Add Content */}

          {editorMode ===
            "add-content" && (
            <form
              className="course-playground-form"
              onSubmit={
                handleCreateContentBlock
              }
            >
              <div className="course-playground-parent-info">
                <span>
                  Adding Content
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

              <label htmlFor="content-title">
                Block title
              </label>

              <input
                id="content-title"
                type="text"
                value={
                  contentForm.title
                }
                placeholder="e.g. What is PHP?"
                onChange={(
                  event
                ) =>
                  setContentForm(
                    (current) => ({
                      ...current,

                      title:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />

              <label htmlFor="content-icon">
                Icon
              </label>

              <input
                id="content-icon"
                type="text"
                value={
                  contentForm.icon
                }
                onChange={(
                  event
                ) =>
                  setContentForm(
                    (current) => ({
                      ...current,

                      icon:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />

              <label htmlFor="content-body">
                Content
              </label>

              <textarea
                id="content-body"
                className="course-playground-content-editor"
                rows="12"
                value={
                  contentForm.content
                }
                placeholder={`PHP is a server-side programming language.

It is commonly used to build dynamic websites and APIs.

Your first useful command is:

php -v`}
                onChange={(
                  event
                ) =>
                  setContentForm(
                    (current) => ({
                      ...current,

                      content:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />

              <div className="course-playground-form-actions">
                <button
                  type="button"
                  className="course-playground-cancel-button"
                  disabled={
                    isSaving
                  }
                  onClick={() =>
                    setEditorMode(
                      "block-library"
                    )
                  }
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
                    : "Add Content"}
                </button>
              </div>
            </form>
          )}

          {/* ===========================
              Add Quiz
          ============================ */}

          {editorMode ===
            "add-quiz" && (
            <form
              className="course-playground-form course-playground-quiz-form"
              onSubmit={
                handleCreateQuizBlock
              }
            >
              <div className="course-playground-parent-info">
                <span>
                  Adding Quiz to
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

              <label htmlFor="quiz-title">
                Block title
              </label>

              <input
                id="quiz-title"
                type="text"
                value={
                  quizForm.title
                }
                placeholder="Quick Check"
                onChange={(
                  event
                ) =>
                  handleQuizFieldChange(
                    "title",
                    event.target
                      .value
                  )
                }
              />

              <label htmlFor="quiz-icon">
                Icon
              </label>

              <input
                id="quiz-icon"
                type="text"
                value={
                  quizForm.icon
                }
                onChange={(
                  event
                ) =>
                  handleQuizFieldChange(
                    "icon",
                    event.target
                      .value
                  )
                }
              />

              <label htmlFor="quiz-instructions">
                Instructions
              </label>

              <textarea
                id="quiz-instructions"
                rows="3"
                value={
                  quizForm.instructions
                }
                onChange={(
                  event
                ) =>
                  handleQuizFieldChange(
                    "instructions",
                    event.target
                      .value
                  )
                }
              />

              <div className="course-playground-quiz-settings">
                <div>
                  <label htmlFor="quiz-passing-score">
                    Passing score
                  </label>

                  <div className="course-playground-score-input">
                    <input
                      id="quiz-passing-score"
                      type="number"
                      min="0"
                      max="100"
                      value={
                        quizForm.passing_score
                      }
                      onChange={(
                        event
                      ) =>
                        handleQuizFieldChange(
                          "passing_score",
                          event
                            .target
                            .value
                        )
                      }
                    />

                    <span>
                      %
                    </span>
                  </div>
                </div>

                <label className="course-playground-checkbox">
                  <input
                    type="checkbox"
                    checked={
                      quizForm.allow_retry
                    }
                    onChange={(
                      event
                    ) =>
                      handleQuizFieldChange(
                        "allow_retry",
                        event
                          .target
                          .checked
                      )
                    }
                  />

                  <span>
                    Allow retry
                  </span>
                </label>
              </div>

              <div className="course-playground-quiz-divider">
                Questions
              </div>

              {quizForm.questions.map(
                (
                  question,
                  questionIndex
                ) => (
                  <section
                    key={
                      questionIndex
                    }
                    className="course-playground-question-editor"
                  >
                    <div className="course-playground-question-header">
                      <strong>
                        Question{" "}
                        {questionIndex +
                          1}
                      </strong>

                      {quizForm
                        .questions
                        .length >
                        1 && (
                        <button
                          type="button"
                          className="course-playground-question-remove"
                          onClick={() =>
                            handleRemoveQuestion(
                              questionIndex
                            )
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <label>
                      Question
                    </label>

                    <textarea
                      rows="3"
                      value={
                        question.question
                      }
                      placeholder="e.g. What is PHP?"
                      onChange={(
                        event
                      ) =>
                        handleQuestionChange(
                          questionIndex,
                          "question",
                          event
                            .target
                            .value
                        )
                      }
                    />

                    <label>
                      Answer
                      options
                    </label>

                    <div className="course-playground-option-editor-list">
                      {question.options.map(
                        (
                          option,
                          optionIndex
                        ) => (
                          <div
                            key={
                              optionIndex
                            }
                            className="course-playground-option-editor"
                          >
                            <span className="course-playground-option-number">
                              {optionIndex +
                                1}
                            </span>

                            <input
                              type="text"
                              value={
                                option
                              }
                              placeholder={`Option ${
                                optionIndex +
                                1
                              }`}
                              onChange={(
                                event
                              ) =>
                                handleOptionChange(
                                  questionIndex,
                                  optionIndex,
                                  event
                                    .target
                                    .value
                                )
                              }
                            />

                            {question
                              .options
                              .length >
                              2 && (
                              <button
                                type="button"
                                className="course-playground-option-remove"
                                title="Remove option"
                                onClick={() =>
                                  handleRemoveOption(
                                    questionIndex,
                                    optionIndex
                                  )
                                }
                              >
                                ×
                              </button>
                            )}
                          </div>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      className="course-playground-small-add-button"
                      onClick={() =>
                        handleAddOption(
                          questionIndex
                        )
                      }
                    >
                      + Add Option
                    </button>

                    <label>
                      Correct answer
                    </label>

                    <select
                      value={
                        question.correct_answer
                      }
                      onChange={(
                        event
                      ) =>
                        handleQuestionChange(
                          questionIndex,
                          "correct_answer",
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      }
                    >
                      {question.options.map(
                        (
                          option,
                          optionIndex
                        ) => (
                          <option
                            key={
                              optionIndex
                            }
                            value={
                              optionIndex
                            }
                          >
                            {optionIndex +
                              1}
                            .{" "}
                            {option.trim() ||
                              `Option ${
                                optionIndex +
                                1
                              }`}
                          </option>
                        )
                      )}
                    </select>

                    <label>
                      Correct
                      message
                    </label>

                    <input
                      type="text"
                      value={
                        question.correct_message
                      }
                      onChange={(
                        event
                      ) =>
                        handleQuestionChange(
                          questionIndex,
                          "correct_message",
                          event
                            .target
                            .value
                        )
                      }
                    />

                    <label>
                      Wrong
                      message
                    </label>

                    <input
                      type="text"
                      value={
                        question.wrong_message
                      }
                      onChange={(
                        event
                      ) =>
                        handleQuestionChange(
                          questionIndex,
                          "wrong_message",
                          event
                            .target
                            .value
                        )
                      }
                    />

                    <label>
                      Explanation
                    </label>

                    <textarea
                      rows="4"
                      value={
                        question.explanation
                      }
                      placeholder="Explain why the correct answer is right."
                      onChange={(
                        event
                      ) =>
                        handleQuestionChange(
                          questionIndex,
                          "explanation",
                          event
                            .target
                            .value
                        )
                      }
                    />
                  </section>
                )
              )}

              <button
                type="button"
                className="course-playground-add-question-button"
                onClick={
                  handleAddQuestion
                }
              >
                + Add Question
              </button>

              <div className="course-playground-form-actions">
                <button
                  type="button"
                  className="course-playground-cancel-button"
                  disabled={
                    isSaving
                  }
                  onClick={() =>
                    setEditorMode(
                      "block-library"
                    )
                  }
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
                    ? "Saving Quiz..."
                    : "Save Quiz"}
                </button>
              </div>
            </form>
          )}

          {/* ===========================
              Add Practice Terminal
          ============================ */}

          {editorMode ===
            "add-terminal" && (
            <form
              className="course-playground-form course-playground-terminal-form"
              onSubmit={
                handleCreateTerminalBlock
              }
            >
              <div className="course-playground-parent-info">
                <span>
                  Adding Practice Terminal to
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

              <label htmlFor="terminal-title">
                Block title
              </label>

              <input
                id="terminal-title"
                type="text"
                value={
                  terminalForm.title
                }
                placeholder="Practice Terminal"
                onChange={(
                  event
                ) =>
                  handleTerminalFieldChange(
                    "title",
                    event.target.value
                  )
                }
              />

              <label htmlFor="terminal-icon">
                Icon
              </label>

              <input
                id="terminal-icon"
                type="text"
                value={
                  terminalForm.icon
                }
                onChange={(
                  event
                ) =>
                  handleTerminalFieldChange(
                    "icon",
                    event.target.value
                  )
                }
              />

              <label htmlFor="terminal-welcome">
                Welcome message
              </label>

              <textarea
                id="terminal-welcome"
                rows="3"
                value={
                  terminalForm.welcome
                }
                placeholder="Welcome! Try a PHP command."
                onChange={(
                  event
                ) =>
                  handleTerminalFieldChange(
                    "welcome",
                    event.target.value
                  )
                }
              />

              <label htmlFor="terminal-tip">
                Tip
              </label>

              <input
                id="terminal-tip"
                type="text"
                value={
                  terminalForm.tip
                }
                placeholder="e.g. Start with php -v"
                onChange={(
                  event
                ) =>
                  handleTerminalFieldChange(
                    "tip",
                    event.target.value
                  )
                }
              />

              <label htmlFor="terminal-prefix">
                Command prefix
              </label>

              <input
                id="terminal-prefix"
                type="text"
                value={
                  terminalForm.commandPrefix
                }
                placeholder="e.g. php"
                onChange={(
                  event
                ) =>
                  handleTerminalFieldChange(
                    "commandPrefix",
                    event.target.value
                  )
                }
              />

              <div className="course-playground-quiz-divider">
                Commands
              </div>

              {terminalForm.commands.map(
                (
                  command,
                  commandIndex
                ) => (
                  <section
                    key={commandIndex}
                    className="course-playground-question-editor"
                  >
                    <div className="course-playground-question-header">
                      <strong>
                        Command {commandIndex + 1}
                      </strong>

                      {terminalForm
                        .commands
                        .length > 1 && (
                        <button
                          type="button"
                          className="course-playground-question-remove"
                          onClick={() =>
                            handleRemoveTerminalCommand(
                              commandIndex
                            )
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <label>
                      Command
                    </label>

                    <input
                      type="text"
                      value={
                        command.command
                      }
                      placeholder="e.g. php -v"
                      onChange={(
                        event
                      ) =>
                        handleTerminalCommandChange(
                          commandIndex,
                          "command",
                          event.target.value
                        )
                      }
                    />

                    <label>
                      Output
                    </label>

                    <textarea
                      rows="5"
                      value={
                        command.output
                      }
                      placeholder={`e.g. PHP 8.4.x (cli)
Copyright (c) The PHP Group`}
                      onChange={(
                        event
                      ) =>
                        handleTerminalCommandChange(
                          commandIndex,
                          "output",
                          event.target.value
                        )
                      }
                    />
                  </section>
                )
              )}

              <button
                type="button"
                className="course-playground-add-question-button"
                onClick={
                  handleAddTerminalCommand
                }
              >
                + Add Command
              </button>

              <div className="course-playground-editor-note">
                <strong>
                  Safe simulation
                </strong>

                <p>
                  Students can only run the
                  commands you configure here.
                  MentorXn displays the saved
                  output and does not execute a
                  real operating-system command.
                </p>
              </div>

              <div className="course-playground-form-actions">
                <button
                  type="button"
                  className="course-playground-cancel-button"
                  disabled={
                    isSaving
                  }
                  onClick={() =>
                    setEditorMode(
                      "block-library"
                    )
                  }
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
                    ? "Saving Terminal..."
                    : "Save Terminal"}
                </button>
              </div>
            </form>
          )}

          {/* Lesson */}

          {editorMode ===
            "lesson" &&
            selectedLesson && (
              <div className="course-playground-editor-content">
                <label>
                  Lesson
                </label>

                <div className="course-playground-readonly-field">
                  {selectedLesson
                    .icon ||
                    "📖"}{" "}

                  {
                    selectedLesson
                      .title
                  }
                </div>

                <button
                  type="button"
                  className="course-playground-save-button full-width"
                  onClick={
                    handleOpenAddTopic
                  }
                >
                  + Add Topic
                </button>
              </div>
            )}

          {/* Topic */}

          {editorMode ===
            "topic" &&
            selectedTopic && (
              <div className="course-playground-editor-content">
                <label>
                  Topic title
                </label>

                <div className="course-playground-readonly-field">
                  {
                    selectedTopic.title
                  }
                </div>

                <label>
                  Learning
                  blocks
                </label>

                <div className="course-playground-readonly-field">
                  {
                    learningBlocks.length
                  }{" "}
                  block
                  {learningBlocks.length ===
                  1
                    ? ""
                    : "s"}
                </div>

                <button
                  type="button"
                  className="course-playground-save-button full-width"
                  onClick={
                    handleOpenBlockLibrary
                  }
                >
                  + Add Learning
                  Block
                </button>

                <div className="course-playground-editor-note">
                  <strong>
                    Topic content
                  </strong>

                  <p>
                    Learning
                    blocks are
                    rendered in
                    order using
                    the same
                    components
                    students
                    will see.
                  </p>
                </div>
              </div>
            )}

          {/* Course */}

          {editorMode ===
            "course" && (
              <div className="course-playground-editor-content">
                <div className="course-playground-editor-note">
                  <strong>
                    Build your
                    course
                  </strong>

                  <p>
                    Start by
                    creating a
                    lesson, then
                    add topics
                    and learning
                    blocks.
                  </p>
                </div>
              </div>
            )}
        </aside>
      </div>
    </div>
  );
}

export default CoursePlaygroundPage;