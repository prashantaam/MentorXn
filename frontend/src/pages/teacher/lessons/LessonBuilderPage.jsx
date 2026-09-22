import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import "../../../styles/lesson-builder.css";

function LessonBuilderPage() {
  const navigate = useNavigate();

  const {
    courseId,
    lessonId,
  } = useParams();

  const { token } = useAuth();

  const [lesson, setLesson] =
    useState(null);

  const [topics, setTopics] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =========================================
     Load Lesson + Topics
  ========================================= */

  useEffect(() => {
    const loadLessonBuilder = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/teacher/lessons/${lessonId}/topics`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to load this lesson."
          );

          return;
        }

        setLesson(data.lesson);

        setTopics(
          Array.isArray(data.topics)
            ? data.topics
            : []
        );
      } catch (requestError) {
        console.error(
          "Load lesson builder error:",
          requestError
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token && lessonId) {
      loadLessonBuilder();
    }
  }, [token, lessonId]);

  /* =========================================
     Create Topic
  ========================================= */

  const handleCreateTopic = () => {
    /*
     * We will create this page next.
     */
    navigate(
      `/teacher/courses/${courseId}/lessons/${lessonId}/topics/create`
    );
  };

  /* =========================================
     Manage Topic
  ========================================= */

  const handleManageTopic = (topicId) => {
  navigate(
    `/teacher/courses/${courseId}/lessons/${lessonId}/topics/${topicId}`
  );
};

  /* =========================================
     Counts
  ========================================= */

  const topicCount = topics.length;

  const topicLabel =
    topicCount === 1
      ? "1 Topic"
      : `${topicCount} Topics`;

  /*
   * Learning Blocks do not exist yet.
   */
  const blockCount = 0;

  /* =========================================
     Loading
  ========================================= */

  if (isLoading) {
    return (
      <div className="lesson-builder-page">
        <div className="lesson-builder-loading">
          <div className="lesson-builder-spinner" />

          <strong>
            Loading lesson...
          </strong>

          <span>
            Preparing your lesson builder.
          </span>
        </div>
      </div>
    );
  }

  /* =========================================
     Error
  ========================================= */

  if (error || !lesson) {
    return (
      <div className="lesson-builder-page">
        <button
          type="button"
          className="lesson-builder-back"
          onClick={() =>
            navigate(
              `/teacher/courses/${courseId}`
            )
          }
        >
          ← Back to Course
        </button>

        <div className="lesson-builder-error">
          <span>⚠️</span>

          <div>
            <strong>
              Unable to open lesson
            </strong>

            <p>
              {error ||
                "The lesson could not be found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================
     Page
  ========================================= */

  return (
    <div className="lesson-builder-page">
      {/* Back */}

      <button
        type="button"
        className="lesson-builder-back"
        onClick={() =>
          navigate(
            `/teacher/courses/${courseId}`
          )
        }
      >
        ← Back to Course
      </button>

      {/* =====================================
          Lesson Header
      ===================================== */}

      <section className="lesson-builder-hero">
        <div className="lesson-builder-main-icon">
          {lesson.icon || "📖"}
        </div>

        <div className="lesson-builder-heading">
          <div className="lesson-builder-eyebrow">
            LESSON BUILDER
          </div>

          <div className="lesson-builder-title-row">
            <h1>
              {lesson.title}
            </h1>

            <span
              className={`lesson-builder-status ${lesson.status}`}
            >
              {lesson.status}
            </span>
          </div>

          <p>
            {lesson.description ||
              "Build the topics and learning experience for this lesson."}
          </p>

          <div className="lesson-builder-meta">
            <span>
              📑 {topicLabel}
            </span>

            <span>
              ✨ {blockCount} Blocks
            </span>

            <span>
              ↕ Position{" "}
              {lesson.position}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="lesson-builder-edit-button"
        >
          ✏️ Edit Lesson
        </button>
      </section>

      {/* =====================================
          Introduction
      ===================================== */}

      <section className="lesson-builder-intro">
        <div>
          <div className="lesson-builder-section-label">
            LESSON STRUCTURE
          </div>

          <h2>
            Build your lesson
          </h2>

          <p>
            Organise this lesson into topics.
            Each topic will contain ordered
            learning blocks such as
            explanations, visualisations,
            interactive demonstrations,
            quizzes and practice.
          </p>
        </div>

        <button
          type="button"
          className="lesson-builder-add-topic"
          onClick={handleCreateTopic}
        >
          <span>+</span>
          Add Topic
        </button>
      </section>

      {/* =====================================
          Architecture
      ===================================== */}

      <section className="lesson-builder-architecture">
        <div className="lesson-architecture-item active">
          <div className="lesson-architecture-icon">
            📖
          </div>

          <div>
            <span>
              LESSON
            </span>

            <strong>
              {lesson.title}
            </strong>
          </div>
        </div>

        <div className="lesson-architecture-arrow">
          →
        </div>

        <div className="lesson-architecture-item">
          <div className="lesson-architecture-icon">
            📑
          </div>

          <div>
            <span>
              TOPICS
            </span>

            <strong>
              {topicLabel}
            </strong>
          </div>
        </div>

        <div className="lesson-architecture-arrow">
          →
        </div>

        <div className="lesson-architecture-item">
          <div className="lesson-architecture-icon">
            ✨
          </div>

          <div>
            <span>
              LEARNING BLOCKS
            </span>

            <strong>
              {blockCount} Blocks
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================
          Topics
      ===================================== */}

      <section className="lesson-topics-section">
        <div className="lesson-topics-heading">
          <div>
            <span>
              📑 LESSON TOPICS
            </span>

            <h2>
              Your Topics
            </h2>
          </div>

          <span className="lesson-topic-count">
            {topicLabel}
          </span>
        </div>

        {/* =================================
            Empty State
        ================================= */}

        {topics.length === 0 && (
          <div className="lesson-topic-empty">
            <div className="lesson-topic-empty-art">
              <div className="lesson-topic-decoration decoration-one">
                ✦
              </div>

              <div className="lesson-topic-document">
                📑
              </div>

              <div className="lesson-topic-decoration decoration-two">
                ✦
              </div>

              <div className="lesson-topic-decoration decoration-three">
                ●
              </div>
            </div>

            <div className="lesson-topic-empty-label">
              START BUILDING THIS LESSON
            </div>

            <h2>
              Create your first topic
            </h2>

            <p>
              Topics break the lesson into
              focused learning experiences.
              Each topic can contain multiple
              interactive learning blocks.
            </p>

            <button
              type="button"
              className="lesson-create-topic-button"
              onClick={handleCreateTopic}
            >
              <span>+</span>
              Create First Topic
            </button>

            <div className="lesson-topic-example">
              <strong>
                For example:
              </strong>

              <span>
                <b>{lesson.title}</b>{" "}
                might start with
                <b>
                  {" "}
                  Topic 1: What is .NET?
                </b>
              </span>
            </div>
          </div>
        )}

        {/* =================================
            Topic List
        ================================= */}

        {topics.length > 0 && (
          <div className="lesson-topic-list">
            {topics.map(
              (topic, index) => (
                <article
                  key={topic.id}
                  className="lesson-topic-card"
                >
                  <div className="lesson-topic-card-icon">
                    {topic.icon ||
                      "📑"}
                  </div>

                  <div className="lesson-topic-card-content">
                    <div className="lesson-topic-card-top">
                      <span className="lesson-topic-number">
                        TOPIC{" "}
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <span
                        className={`lesson-topic-status ${topic.status}`}
                      >
                        {topic.status}
                      </span>
                    </div>

                    <h3>
                      {topic.title}
                    </h3>

                    <p>
                      {topic.description ||
                        "No description has been added yet."}
                    </p>

                    <div className="lesson-topic-card-meta">
                      <span>
                        ✨ 0 Blocks
                      </span>

                      <span>
                        ↕ Position{" "}
                        {topic.position}
                      </span>
                    </div>
                  </div>

                  <div className="lesson-topic-card-action">
                    <button
                      type="button"
                      onClick={() =>
                        handleManageTopic(
                          topic.id
                        )
                      }
                    >
                      Manage Topic
                      <span>→</span>
                    </button>
                  </div>
                </article>
              )
            )}

            <button
              type="button"
              className="lesson-add-another-topic"
              onClick={handleCreateTopic}
            >
              <span>+</span>

              <div>
                <strong>
                  Add another topic
                </strong>

                <small>
                  Continue building this
                  lesson
                </small>
              </div>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default LessonBuilderPage;