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

import "../../../styles/topic-builder.css";

function TopicBuilderPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    courseId,
    lessonId,
    topicId,
  } = useParams();

  const { token } = useAuth();

  const [topic, setTopic] =
    useState(null);

  const [
    learningBlocks,
    setLearningBlocks,
  ] = useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState(
      location.state?.successMessage || ""
    );

  /* =========================================
     Load Topic + Learning Blocks
  ========================================= */

  useEffect(() => {
    const loadTopicBuilder = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/teacher/topics/${topicId}/learning-blocks`,
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
              "Unable to load this topic."
          );

          return;
        }

        setTopic(data.topic);

        setLearningBlocks(
          Array.isArray(
            data.learning_blocks
          )
            ? data.learning_blocks
            : []
        );
      } catch (requestError) {
        console.error(
          "Load topic builder error:",
          requestError
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token && topicId) {
      loadTopicBuilder();
    }
  }, [token, topicId]);

  /* =========================================
     Clear navigation success state
  ========================================= */

  useEffect(() => {
    if (location.state?.successMessage) {
      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [
    location.pathname,
    location.state,
    navigate,
  ]);

  /* =========================================
     Navigation
  ========================================= */

  const handleBack = () => {
    navigate(
      `/teacher/courses/${courseId}/lessons/${lessonId}`
    );
  };

  const handleAddContent = () => {
    navigate(
      `/teacher/courses/${courseId}/lessons/${lessonId}/topics/${topicId}/blocks/content/create`
    );
  };

  const handleAddQuiz = () => {
    navigate(
      `/teacher/courses/${courseId}/lessons/${lessonId}/topics/${topicId}/blocks/quiz/create`
    );
  };

  const handleManageBlock = (block) => {
    console.log(
      "Manage learning block:",
      block
    );
  };

  /* =========================================
     Counts
  ========================================= */

  const blockCount =
    learningBlocks.length;

  const blockLabel =
    blockCount === 1
      ? "1 Learning Block"
      : `${blockCount} Learning Blocks`;

  const contentCount =
    learningBlocks.filter(
      (block) =>
        block.type === "content"
    ).length;

  const quizCount =
    learningBlocks.filter(
      (block) =>
        block.type === "quiz"
    ).length;

  /* =========================================
     Loading
  ========================================= */

  if (isLoading) {
    return (
      <div className="topic-builder-page">
        <div className="topic-builder-loading">
          <div className="topic-builder-spinner" />

          <strong>
            Loading topic...
          </strong>

          <span>
            Preparing your learning blocks.
          </span>
        </div>
      </div>
    );
  }

  /* =========================================
     Error
  ========================================= */

  if (error || !topic) {
    return (
      <div className="topic-builder-page">
        <button
          type="button"
          className="topic-builder-back"
          onClick={handleBack}
        >
          ← Back to Lesson
        </button>

        <div className="topic-builder-error">
          <span>⚠️</span>

          <div>
            <strong>
              Unable to open topic
            </strong>

            <p>
              {error ||
                "The topic could not be found."}
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
    <div className="topic-builder-page">
      <button
        type="button"
        className="topic-builder-back"
        onClick={handleBack}
      >
        ← Back to Lesson
      </button>

      {/* =====================================
          Success
      ===================================== */}

      {successMessage && (
        <div className="topic-builder-success">
          <span>✓</span>

          <div>
            <strong>
              Success
            </strong>

            <p>
              {successMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================
          Topic Hero
      ===================================== */}

      <section className="topic-builder-hero">
        <div className="topic-builder-main-icon">
          {topic.icon || "📑"}
        </div>

        <div className="topic-builder-heading">
          <div className="topic-builder-eyebrow">
            TOPIC BUILDER
          </div>

          <div className="topic-builder-title-row">
            <h1>
              {topic.title}
            </h1>

            <span
              className={`topic-builder-status ${topic.status}`}
            >
              {topic.status}
            </span>
          </div>

          <p>
            {topic.description ||
              "Build the learning experience for this topic."}
          </p>

          <div className="topic-builder-meta">
            <span>
              📦 {blockLabel}
            </span>

            <span>
              📖 {contentCount} Content
            </span>

            <span>
              🧠 {quizCount} Quiz
            </span>

            <span>
              ↕ Position{" "}
              {topic.position}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="topic-builder-edit-button"
        >
          ✏️ Edit Topic
        </button>
      </section>

      {/* =====================================
          Introduction
      ===================================== */}

      <section className="topic-builder-intro">
        <div>
          <div className="topic-builder-section-label">
            LEARNING EXPERIENCE
          </div>

          <h2>
            Build this topic
          </h2>

          <p>
            Add learning blocks in the
            order students should experience
            them. Start with content to
            explain the concept, then use
            quizzes to check understanding.
          </p>
        </div>
      </section>

      {/* =====================================
          Architecture
      ===================================== */}

      <section className="topic-builder-architecture">
        <div className="topic-architecture-item active">
          <div className="topic-architecture-icon">
            {topic.icon || "📑"}
          </div>

          <div>
            <span>
              TOPIC
            </span>

            <strong>
              {topic.title}
            </strong>
          </div>
        </div>

        <div className="topic-architecture-arrow">
          →
        </div>

        <div className="topic-architecture-item">
          <div className="topic-architecture-icon">
            📦
          </div>

          <div>
            <span>
              LEARNING BLOCKS
            </span>

            <strong>
              {blockLabel}
            </strong>
          </div>
        </div>

        <div className="topic-architecture-arrow">
          →
        </div>

        <div className="topic-architecture-item">
          <div className="topic-architecture-icon">
            🎓
          </div>

          <div>
            <span>
              STUDENT EXPERIENCE
            </span>

            <strong>
              Learn → Check
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================
          Add Block
      ===================================== */}

      <section className="topic-add-block-section">
        <div className="topic-add-block-heading">
          <div>
            <span>
              + ADD LEARNING BLOCK
            </span>

            <h2>
              What would you like to add?
            </h2>

            <p>
              Choose the next learning
              experience for this topic.
            </p>
          </div>
        </div>

        <div className="topic-block-type-grid">
          {/* Content */}

          <button
            type="button"
            className="topic-block-type-card content"
            onClick={handleAddContent}
          >
            <div className="topic-block-type-icon">
              📖
            </div>

            <div className="topic-block-type-content">
              <div className="topic-block-type-top">
                <h3>
                  Content
                </h3>

                <span>
                  EXPLAIN
                </span>
              </div>

              <p>
                Teach a concept using
                formatted text, examples,
                code and helpful callouts.
              </p>

              <div className="topic-block-type-action">
                Add Content
                <span>→</span>
              </div>
            </div>
          </button>

          {/* Quiz */}

          <button
            type="button"
            className="topic-block-type-card quiz"
            onClick={handleAddQuiz}
          >
            <div className="topic-block-type-icon">
              🧠
            </div>

            <div className="topic-block-type-content">
              <div className="topic-block-type-top">
                <h3>
                  Quiz
                </h3>

                <span>
                  CHECK
                </span>
              </div>

              <p>
                Add one or more questions
                with correct answers,
                feedback and explanations.
              </p>

              <div className="topic-block-type-action">
                Add Quiz
                <span>→</span>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* =====================================
          Learning Blocks
      ===================================== */}

      <section className="topic-learning-blocks-section">
        <div className="topic-learning-blocks-heading">
          <div>
            <span>
              📦 TOPIC STRUCTURE
            </span>

            <h2>
              Learning Blocks
            </h2>
          </div>

          <span className="topic-block-count">
            {blockLabel}
          </span>
        </div>

        {/* Empty */}

        {learningBlocks.length === 0 && (
          <div className="topic-block-empty">
            <div className="topic-block-empty-art">
              📖
            </div>

            <div className="topic-block-empty-label">
              START TEACHING
            </div>

            <h2>
              Add your first learning block
            </h2>

            <p>
              For most topics, start with a
              Content block to introduce and
              explain the concept.
            </p>

            <button
              type="button"
              className="topic-create-content-button"
              onClick={handleAddContent}
            >
              <span>+</span>
              Add First Content Block
            </button>

            <div className="topic-block-empty-tip">
              <span>💡</span>

              <p>
                The first Content block does
                not need its own title or
                icon because the Topic
                heading already introduces
                the lesson concept.
              </p>
            </div>
          </div>
        )}

        {/* Existing blocks */}

        {learningBlocks.length > 0 && (
          <div className="topic-block-list">
            {learningBlocks.map(
              (block, index) => {
                const isContent =
                  block.type ===
                  "content";

                const questionCount =
                  block.type === "quiz" &&
                  Array.isArray(
                    block.data
                      ?.questions
                  )
                    ? block.data
                        .questions
                        .length
                    : 0;

                return (
                  <article
                    key={block.id}
                    className={`topic-learning-block-card ${block.type}`}
                  >
                    <div className="topic-learning-block-position">
                      <span>
                        {index + 1}
                      </span>
                    </div>

                    <div className="topic-learning-block-icon">
                      {block.icon ||
                        (isContent
                          ? "📖"
                          : "🧠")}
                    </div>

                    <div className="topic-learning-block-content">
                      <div className="topic-learning-block-top">
                        <span className="topic-learning-block-type">
                          {isContent
                            ? "CONTENT"
                            : "QUIZ"}
                        </span>

                        <span
                          className={`topic-learning-block-status ${block.status}`}
                        >
                          {
                            block.status
                          }
                        </span>
                      </div>

                      <h3>
                        {block.title ||
                          (isContent
                            ? index ===
                              0
                              ? "Introductory Content"
                              : "Content Block"
                            : "Quiz")}
                      </h3>

                      <div className="topic-learning-block-meta">
                        {isContent ? (
                          <span>
                            📖 Learning
                            content
                          </span>
                        ) : (
                          <span>
                            ❓{" "}
                            {
                              questionCount
                            }{" "}
                            {questionCount ===
                            1
                              ? "Question"
                              : "Questions"}
                          </span>
                        )}

                        <span>
                          ↕ Position{" "}
                          {block.position}
                        </span>
                      </div>
                    </div>

                    <div className="topic-learning-block-action">
                      <button
                        type="button"
                        onClick={() =>
                          handleManageBlock(
                            block
                          )
                        }
                      >
                        Edit
                        <span>→</span>
                      </button>
                    </div>
                  </article>
                );
              }
            )}

            <div className="topic-block-list-add">
              <button
                type="button"
                onClick={
                  handleAddContent
                }
              >
                + Content
              </button>

              <button
                type="button"
                onClick={
                  handleAddQuiz
                }
              >
                + Quiz
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default TopicBuilderPage;