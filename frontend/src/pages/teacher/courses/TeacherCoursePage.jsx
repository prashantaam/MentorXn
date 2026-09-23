import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import "../../../styles/teacher-courses.css";

function TeacherCoursePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { token } = useAuth();

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const successMessage =
    location.state?.successMessage || "";

  /* =========================================
     Load Teacher Courses
  ========================================= */

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/teacher/courses",
          {
            method: "GET",

            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          setError(
            "Your login session is no longer valid. Please sign in again."
          );

          return;
        }

        if (response.status === 403) {
          setError(
            data.message ||
              "Teacher access is required."
          );

          return;
        }

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to load your courses."
          );

          return;
        }

        setCourses(data.courses || []);
      } catch (requestError) {
        console.error(
          "Load courses error:",
          requestError
        );

        setError(
          "Unable to connect to the server. Please make sure the Laravel API is running."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      loadCourses();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  /* =========================================
     Navigation
  ========================================= */

  const handleCreateCourse = () => {
    navigate("/teacher/courses/create");
  };

  /* =========================================
     Statistics
  ========================================= */

  const totalCourses = courses.length;

  const draftCourses = courses.filter(
    (course) => course.status === "draft"
  ).length;

  const publishedCourses = courses.filter(
    (course) => course.status === "published"
  ).length;

  /*
   * We do not have enrolments yet.
   * Keep this at zero until we build the
   * student enrolment system.
   */
  const totalStudents = 0;

  return (
    <div className="teacher-courses-page">
      {/* =====================================
          Page Header
      ===================================== */}

      <section className="teacher-courses-header">
        <div>
          <div className="teacher-courses-eyebrow">
            📚 COURSE MANAGEMENT
          </div>

          <h1>My Courses</h1>

          <p>
            Create and manage your learning
            adventures, lessons and interactive
            activities.
          </p>
        </div>

        <button
          type="button"
          className="teacher-primary-button"
          onClick={handleCreateCourse}
        >
          <span>+</span>
          Create Course
        </button>
      </section>

      {/* =====================================
          Success Message
      ===================================== */}

      {successMessage && (
        <div className="teacher-course-success">
          <span>✓</span>

          <div>
            <strong>Course created</strong>

            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {/* =====================================
          Error
      ===================================== */}

      {error && (
        <div className="teacher-course-error">
          <span>⚠️</span>

          <div>
            <strong>Unable to load courses</strong>

            <p>{error}</p>
          </div>
        </div>
      )}

      {/* =====================================
          Summary
      ===================================== */}

      <section className="teacher-course-summary">
        <article className="teacher-course-summary-card">
          <div className="summary-icon">
            📚
          </div>

          <div>
            <strong>{totalCourses}</strong>
            <span>Total Courses</span>
          </div>
        </article>

        <article className="teacher-course-summary-card">
          <div className="summary-icon">
            📝
          </div>

          <div>
            <strong>{draftCourses}</strong>
            <span>Drafts</span>
          </div>
        </article>

        <article className="teacher-course-summary-card">
          <div className="summary-icon">
            🚀
          </div>

          <div>
            <strong>{publishedCourses}</strong>
            <span>Published</span>
          </div>
        </article>

        <article className="teacher-course-summary-card">
          <div className="summary-icon">
            👨‍🎓
          </div>

          <div>
            <strong>{totalStudents}</strong>
            <span>Students</span>
          </div>
        </article>
      </section>

      {/* =====================================
          Main Content
      ===================================== */}

      <section className="teacher-courses-content">
        <div className="teacher-courses-toolbar">
          <div>
            <h2>Your Learning Adventures</h2>

            <p>
              Build, organise and publish courses
              for your students.
            </p>
          </div>

          <div className="teacher-course-filters">
            <button
              type="button"
              className="active"
            >
              All
            </button>

            <button type="button">
              Draft
            </button>

            <button type="button">
              Published
            </button>
          </div>
        </div>

        {/* =================================
            Loading
        ================================= */}

        {isLoading && (
          <div className="teacher-courses-loading">
            <div className="teacher-course-loader" />

            <strong>Loading your courses...</strong>

            <span>
              Preparing your learning adventures.
            </span>
          </div>
        )}

        {/* =================================
            Empty State
        ================================= */}

        {!isLoading &&
          !error &&
          courses.length === 0 && (
            <div className="teacher-courses-empty">
              <div className="teacher-empty-illustration">
                <div className="empty-decoration decoration-one">
                  ✦
                </div>

                <div className="empty-decoration decoration-two">
                  ●
                </div>

                <div className="teacher-empty-book">
                  📚
                </div>

                <div className="empty-decoration decoration-three">
                  ✦
                </div>
              </div>

              <div className="teacher-empty-label">
                START YOUR JOURNEY
              </div>

              <h2>No courses yet</h2>

              <p>
                Create your first course and start
                building an interactive learning
                adventure for your students.
              </p>

              <button
                type="button"
                className="teacher-empty-button"
                onClick={handleCreateCourse}
              >
                <span>+</span>
                Create Your First Course
              </button>

              <div className="teacher-empty-hint">
                💡 You can keep courses as drafts
                while you build the content.
              </div>
            </div>
          )}

        {/* =================================
            Course Grid
        ================================= */}

        {!isLoading &&
          !error &&
          courses.length > 0 && (
            <div className="teacher-course-grid">
              {courses.map((course) => (
                <article
                  className="teacher-course-card"
                  key={course.id}
                >
                  {/* Course Banner */}

                  <div
                    className="teacher-course-card-banner"
                    style={{
                      background:
                        course.accent_color ||
                        "#ff9a8b",
                    }}
                  >
                    <div className="teacher-course-card-icon">
                      {course.icon || "🚀"}
                    </div>

                    <span
                      className={`teacher-course-status ${course.status}`}
                    >
                      {course.status === "published"
                        ? "Published"
                        : "Draft"}
                    </span>
                  </div>

                  {/* Course Content */}

                  <div className="teacher-course-card-body">
                    <div className="teacher-course-card-meta">
                      <span>
                        {course.category ||
                          "General"}
                      </span>

                      <span>
                        {course.level ||
                          "Beginner"}
                      </span>
                    </div>

                    <h3>{course.title}</h3>

                    <p>
                      {course.description ||
                        "No course description yet."}
                    </p>

                    <div className="teacher-course-card-stats">
                      <span>
                        🗺️ 0 Worlds
                      </span>

                      <span>
                        📝 0 Lessons
                      </span>

                      <span>
                        👨‍🎓 0 Students
                      </span>
                    </div>

                    <div className="teacher-course-card-footer">
                      <Link
                        to={`/teacher/courses/${course.id}/playground`}
                        className="teacher-course-manage-button"
                      >
                        Open Playground
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}

export default TeacherCoursePage;