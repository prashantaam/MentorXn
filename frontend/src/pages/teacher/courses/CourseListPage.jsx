import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import "../../../styles/teachers/teacher-courses.css";

function CourseListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { token } = useAuth();

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] =
    useState("all");

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
   * Student enrolments are not connected yet.
   * Keep this at zero until the enrolment
   * system is implemented.
   */
  const totalStudents = 0;

  /* =========================================
     Course Filtering
  ========================================= */

  const filteredCourses = useMemo(() => {
    if (activeFilter === "all") {
      return courses;
    }

    return courses.filter(
      (course) =>
        course.status === activeFilter
    );
  }, [courses, activeFilter]);

  const hasCourses =
    courses.length > 0;

  const hasFilteredCourses =
    filteredCourses.length > 0;

  /* =========================================
     Render
  ========================================= */

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
            <strong>
              Unable to load courses
            </strong>

            <p>{error}</p>
          </div>
        </div>
      )}

      {/* =====================================
          Summary
      ===================================== */}

      <section className="teacher-course-summary">
        <article className="teacher-course-summary-card">
          <div className="summary-icon courses">
            📚
          </div>

          <div>
            <strong>{totalCourses}</strong>
            <span>Total Courses</span>
          </div>
        </article>

        <article className="teacher-course-summary-card">
          <div className="summary-icon drafts">
            📝
          </div>

          <div>
            <strong>{draftCourses}</strong>
            <span>Drafts</span>
          </div>
        </article>

        <article className="teacher-course-summary-card">
          <div className="summary-icon published">
            🚀
          </div>

          <div>
            <strong>
              {publishedCourses}
            </strong>

            <span>Published</span>
          </div>
        </article>

        <article className="teacher-course-summary-card">
          <div className="summary-icon students">
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
            <div className="teacher-courses-section-label">
              YOUR COURSES
            </div>

            <h2>
              Your Learning Adventures
            </h2>

            <p>
              Build, organise and publish courses
              for your students.
            </p>
          </div>

          {hasCourses && (
            <div
              className="teacher-course-filters"
              aria-label="Filter courses"
            >
              <button
                type="button"
                className={
                  activeFilter === "all"
                    ? "active"
                    : ""
                }
                aria-pressed={
                  activeFilter === "all"
                }
                onClick={() =>
                  setActiveFilter("all")
                }
              >
                All
                <span>{totalCourses}</span>
              </button>

              <button
                type="button"
                className={
                  activeFilter === "draft"
                    ? "active"
                    : ""
                }
                aria-pressed={
                  activeFilter === "draft"
                }
                onClick={() =>
                  setActiveFilter("draft")
                }
              >
                Draft
                <span>{draftCourses}</span>
              </button>

              <button
                type="button"
                className={
                  activeFilter === "published"
                    ? "active"
                    : ""
                }
                aria-pressed={
                  activeFilter === "published"
                }
                onClick={() =>
                  setActiveFilter("published")
                }
              >
                Published
                <span>{publishedCourses}</span>
              </button>
            </div>
          )}
        </div>

        {/* =================================
            Loading
        ================================= */}

        {isLoading && (
          <div className="teacher-courses-loading">
            <div
              className="teacher-course-loader"
              aria-hidden="true"
            />

            <strong>
              Loading your courses...
            </strong>

            <span>
              Preparing your learning
              adventures.
            </span>
          </div>
        )}

        {/* =================================
            Empty State
        ================================= */}

        {!isLoading &&
          !error &&
          !hasCourses && (
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
            No Filter Results
        ================================= */}

        {!isLoading &&
          !error &&
          hasCourses &&
          !hasFilteredCourses && (
            <div className="teacher-courses-filter-empty">
              <div className="teacher-filter-empty-icon">
                🔎
              </div>

              <h3>
                No {activeFilter} courses
              </h3>

              <p>
                You do not currently have any{" "}
                {activeFilter} courses.
              </p>

              <button
                type="button"
                onClick={() =>
                  setActiveFilter("all")
                }
              >
                View All Courses
              </button>
            </div>
          )}

        {/* =================================
            Course Grid
        ================================= */}

        {!isLoading &&
          !error &&
          hasFilteredCourses && (
            <div className="teacher-course-grid">
              {filteredCourses.map((course) => (
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
                        "#2f8f5b",
                    }}
                  >
                    <div className="teacher-course-card-icon">
                      {course.icon || "🚀"}
                    </div>

                    <span
                      className={`teacher-course-status ${course.status}`}
                    >
                      {course.status ===
                      "published"
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
                        <span>
                          Open Playground
                        </span>

                        <span
                          className="teacher-course-manage-arrow"
                          aria-hidden="true"
                        >
                          →
                        </span>
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

export default CourseListPage;