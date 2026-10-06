import { Link } from "react-router-dom";

import StatusTag from "../../../components/courses/StatusTag";
import StatRow from "../../../components/dashboard/StatRow";
import { useAuth } from "../../../context/AuthContext";
import { useTeacherCourses } from "../../../hooks/useTeacherCourses";
import { hueStyle } from "../../../lib/hue";

import "../../../styles/pages/dashboard.css";

// How many courses to show here before linking to the full course list
// (6 fills a 2- or 3-column grid evenly).
const RECENT_COUNT = 6;

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/* Compact course card (same style as the student dashboard's); opens the builder. */
function CourseTile({ course }) {
  const lessons = course.lessons_count ?? 0;
  const details = [plural(lessons, "lesson"), course.level].filter(Boolean).join(" · ");

  return (
    <Link
      className="mx-explore-card mx-teacher-tile"
      style={hueStyle(course.accent_color)}
      to={`/teacher/courses/${course.id}/playground`}
      title={`Open ${course.title} in the course builder`}
    >
      <span className="mx-card-emoji" aria-hidden="true">
        {course.icon || "📘"}
      </span>

      <div className="mx-grow">
        <b>{course.title}</b>
        <span className="mx-hint">{details}</span>
      </div>

      <StatusTag status={course.status} />
    </Link>
  );
}

function TeacherDashboard() {
  const { user } = useAuth();
  const { courses, isLoading, error, reload } = useTeacherCourses();

  const firstName = user?.name?.split(" ")[0] || "there";
  const published = courses.filter((course) => course.status === "published").length;
  const totalLessons = courses.reduce(
    (sum, course) => sum + (course.lessons_count ?? 0),
    0
  );
  const pending = isLoading || error ? "–" : null;

  const stats = [
    { label: courses.length === 1 ? "Course" : "Courses", value: pending ?? courses.length },
    { label: "Published", value: pending ?? published },
    { label: courses.length - published === 1 ? "Draft" : "Drafts", value: pending ?? courses.length - published },
    { label: totalLessons === 1 ? "Lesson" : "Lessons", value: pending ?? totalLessons },
  ];

  return (
    <div className="mx-page mx-dashboard">
      <section className="mx-dash-hero">
        <h1>
          Welcome back, {firstName}
          <span className="mx-dash-hero__wave"> 👋</span>
        </h1>
        <p className="mx-hint">
          Build, organise and publish your courses.
        </p>
      </section>

      <StatRow stats={stats} />

      <section className="mx-dash-section">
        <div className="mx-dash-section__head">
          <h2>🧑‍🏫 My courses</h2>
          {courses.length > 0 && (
            <Link className="mx-btn mx-btn--sm" to="/teacher/courses/create">
              ➕ Create a course
            </Link>
          )}
        </div>

        {isLoading && <p className="mx-hint">Loading your courses…</p>}

        {!isLoading && error && (
          <div className="mx-feedback mx-feedback--bad" role="alert">
            {error}{" "}
            <button
              type="button"
              className="mx-btn mx-btn--ghost mx-btn--sm"
              onClick={reload}
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && courses.length === 0 && (
          <div className="mx-empty">
            <span className="mx-empty__emoji" aria-hidden="true">
              🚀
            </span>
            <h2>You haven't created a course yet</h2>
            <p>
              Start with a title and description, then add lessons and
              interactive blocks in the course builder.
            </p>
            <Link className="mx-btn" to="/teacher/courses/create">
              ➕ Create your first course
            </Link>
          </div>
        )}

        {!isLoading && !error && courses.length > 0 && (
          <>
            <div className="mx-explore-grid mx-teacher-grid">
              {courses.slice(0, RECENT_COUNT).map((course) => (
                <CourseTile key={course.id} course={course} />
              ))}
            </div>

            {courses.length > RECENT_COUNT && (
              <div className="mx-dash-section__more">
                <Link className="mx-btn mx-btn--ghost mx-btn--sm" to="/teacher/courses">
                  See all {courses.length} courses →
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default TeacherDashboard;
