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

import "../../../styles/course-builder.css";

function CourseBuilderPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { courseId } = useParams();
  const { token } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState(
      location.state?.successMessage || ""
    );

  /* =========================================
     Load Course + Lessons
  ========================================= */

  useEffect(() => {
    const loadCourseBuilder = async () => {
      setIsLoading(true);
      setError("");

      try {
        /*
        ========================================
        Load Course
        ========================================
        */

        const courseResponse = await fetch(
          `http://127.0.0.1:8000/api/teacher/courses/${courseId}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const courseData =
          await courseResponse.json();

        if (!courseResponse.ok) {
          setError(
            courseData.message ||
              "Unable to load this course."
          );

          return;
        }

        /*
        ========================================
        Load Lessons
        ========================================
        */

        const lessonResponse = await fetch(
          `http://127.0.0.1:8000/api/teacher/courses/${courseId}/lessons`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const lessonData =
          await lessonResponse.json();

        if (!lessonResponse.ok) {
          setError(
            lessonData.message ||
              "Unable to load course lessons."
          );

          return;
        }

        setCourse(courseData.course);

        setLessons(
          Array.isArray(lessonData.lessons)
            ? lessonData.lessons
            : []
        );
      } catch (requestError) {
        console.error(
          "Load course builder error:",
          requestError
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token && courseId) {
      loadCourseBuilder();
    }
  }, [token, courseId]);

  /* =========================================
     Clear Navigation State
  ========================================= */

  useEffect(() => {
    if (location.state?.successMessage) {
      window.history.replaceState(
        {},
        document.title
      );
    }
  }, [location.state]);

  /* =========================================
     Create Lesson
  ========================================= */

  const handleCreateLesson = () => {
    navigate(
      `/teacher/courses/${courseId}/lessons/create`
    );
  };

  /* =========================================
     Manage Lesson
  ========================================= */

    const handleManageLesson = (lessonId) => {
    navigate(
        `/teacher/courses/${courseId}/lessons/${lessonId}`
    );
    };
  /* =========================================
     Helpers
  ========================================= */

  const lessonCount = lessons.length;

  const lessonLabel =
    lessonCount === 1
      ? "1 Lesson"
      : `${lessonCount} Lessons`;

  /*
   * Topic API does not exist yet.
   * This will become dynamic when Topics
   * are implemented.
   */
  const topicCount = 0;

  /* =========================================
     Loading
  ========================================= */

  if (isLoading) {
    return (
      <div className="course-builder-page">
        <div className="course-builder-loading">
          <div className="course-builder-spinner" />

          <strong>
            Loading course...
          </strong>

          <span>
            Preparing your course builder.
          </span>
        </div>
      </div>
    );
  }

  /* =========================================
     Error
  ========================================= */

  if (error || !course) {
    return (
      <div className="course-builder-page">
        <button
          type="button"
          className="builder-back-button"
          onClick={() =>
            navigate("/teacher/courses")
          }
        >
          ← Back to Courses
        </button>

        <div className="course-builder-error">
          <span>⚠️</span>

          <div>
            <strong>
              Unable to open course
            </strong>

            <p>
              {error ||
                "The course could not be found."}
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
    <div className="course-builder-page">
      {/* =====================================
          Back
      ===================================== */}

      <button
        type="button"
        className="builder-back-button"
        onClick={() =>
          navigate("/teacher/courses")
        }
      >
        ← Back to Courses
      </button>

      {/* =====================================
          Success Message
      ===================================== */}

      {successMessage && (
        <div className="builder-success-message">
          <div className="builder-success-icon">
            ✓
          </div>

          <div>
            <strong>
              Lesson created
            </strong>

            <p>{successMessage}</p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================
          Course Header
      ===================================== */}

      <section className="course-builder-hero">
        <div
          className="course-builder-icon"
          style={{
            background:
              course.accent_color ||
              "#ff9a8b",
          }}
        >
          <span>
            {course.icon || "🚀"}
          </span>
        </div>

        <div className="course-builder-heading">
          <div className="course-builder-eyebrow">
            COURSE BUILDER
          </div>

          <div className="course-builder-title-row">
            <h1>{course.title}</h1>

            <span
              className={`builder-status ${course.status}`}
            >
              {course.status}
            </span>
          </div>

          <p>
            {course.description ||
              "Build and organise your course."}
          </p>

          <div className="course-builder-meta">
            <span>
              📁{" "}
              {course.category ||
                "General"}
            </span>

            <span>
              📊 {course.level}
            </span>

            <span>
              📖 {lessonLabel}
            </span>

            <span>
              📑 {topicCount} Topics
            </span>
          </div>
        </div>

        <button
          type="button"
          className="builder-edit-course-button"
        >
          ✏️ Edit Course
        </button>
      </section>

      {/* =====================================
          Builder Introduction
      ===================================== */}

      <section className="builder-intro">
        <div>
          <div className="builder-section-label">
            COURSE STRUCTURE
          </div>

          <h2>
            Build your learning journey
          </h2>

          <p>
            Organise your course into
            lessons. Each lesson contains
            topics, and each topic can
            contain explanations,
            visualisations, interactive
            activities, quizzes and
            practice.
          </p>
        </div>

        <button
          type="button"
          className="builder-add-lesson-button"
          onClick={handleCreateLesson}
        >
          <span>+</span>
          Add Lesson
        </button>
      </section>

      {/* =====================================
          Architecture
      ===================================== */}

      <section className="builder-architecture">
        {/* Course */}

        <div className="builder-architecture-item active">
          <div className="builder-architecture-icon">
            📚
          </div>

          <div>
            <span>COURSE</span>

            <strong>
              {course.title}
            </strong>
          </div>
        </div>

        <div className="builder-architecture-arrow">
          →
        </div>

        {/* Lessons */}

        <div className="builder-architecture-item">
          <div className="builder-architecture-icon">
            📖
          </div>

          <div>
            <span>LESSONS</span>

            <strong>
              {lessonLabel}
            </strong>
          </div>
        </div>

        <div className="builder-architecture-arrow">
          →
        </div>

        {/* Topics */}

        <div className="builder-architecture-item">
          <div className="builder-architecture-icon">
            📑
          </div>

          <div>
            <span>TOPICS</span>

            <strong>
              {topicCount} Topics
            </strong>
          </div>
        </div>

        <div className="builder-architecture-arrow">
          →
        </div>

        {/* Learning Blocks */}

        <div className="builder-architecture-item">
          <div className="builder-architecture-icon">
            ✨
          </div>

          <div>
            <span>
              LEARNING BLOCKS
            </span>

            <strong>
              0 Blocks
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================
          Lessons
      ===================================== */}

      <section className="builder-lessons-section">
        <div className="builder-lessons-heading">
          <div>
            <span>
              📖 COURSE LESSONS
            </span>

            <h2>
              Your Lessons
            </h2>
          </div>

          <span className="builder-lesson-count">
            {lessonLabel}
          </span>
        </div>

        {/* =================================
            Empty State
        ================================= */}

        {lessons.length === 0 && (
          <div className="builder-lesson-empty">
            <div className="builder-lesson-empty-art">
              <div className="builder-lesson-decoration decoration-one">
                ✦
              </div>

              <div className="builder-lesson-book">
                📖
              </div>

              <div className="builder-lesson-decoration decoration-two">
                ✦
              </div>

              <div className="builder-lesson-decoration decoration-three">
                ●
              </div>
            </div>

            <div className="builder-empty-label">
              YOUR LEARNING JOURNEY
              STARTS HERE
            </div>

            <h2>
              Create your first lesson
            </h2>

            <p>
              Lessons organise related
              topics into meaningful stages
              of the course.
            </p>

            <button
              type="button"
              className="builder-create-lesson-button"
              onClick={
                handleCreateLesson
              }
            >
              <span>+</span>
              Create First Lesson
            </button>

            <div className="builder-lesson-example">
              <strong>
                For example:
              </strong>

              <span>
                <b>{course.title}</b>{" "}
                might start with
                <b>
                  {" "}
                  Lesson 1: Meet .NET
                </b>
                .
              </span>
            </div>
          </div>
        )}

        {/* =================================
            Real Lesson List
        ================================= */}

        {lessons.length > 0 && (
          <div className="builder-lesson-list">
            {lessons.map(
              (lesson, index) => (
                <article
                  key={lesson.id}
                  className="builder-lesson-card"
                >
                  {/* Icon */}

                  <div className="builder-lesson-card-icon">
                    {lesson.icon ||
                      "📖"}
                  </div>

                  {/* Content */}

                  <div className="builder-lesson-card-content">
                    <div className="builder-lesson-card-top">
                      <span className="builder-lesson-number">
                        LESSON{" "}
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <span
                        className={`builder-lesson-status ${lesson.status}`}
                      >
                        {lesson.status}
                      </span>
                    </div>

                    <h3>
                      {lesson.title}
                    </h3>

                    <p>
                      {lesson.description ||
                        "No description has been added yet."}
                    </p>

                    <div className="builder-lesson-card-meta">
                      <span>
                        📑 0 Topics
                      </span>

                      <span>
                        ↕ Position{" "}
                        {lesson.position}
                      </span>
                    </div>
                  </div>

                  {/* Action */}

                  <div className="builder-lesson-card-action">
                    <button
                      type="button"
                      onClick={() =>
                        handleManageLesson(
                          lesson.id
                        )
                      }
                    >
                      Manage Lesson
                      <span>→</span>
                    </button>
                  </div>
                </article>
              )
            )}

            {/* Add another lesson */}

            <button
              type="button"
              className="builder-add-another-lesson"
              onClick={
                handleCreateLesson
              }
            >
              <span>+</span>

              <div>
                <strong>
                  Add another lesson
                </strong>

                <small>
                  Continue building the
                  learning journey
                </small>
              </div>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default CourseBuilderPage;