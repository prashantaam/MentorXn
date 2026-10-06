import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import CourseCard from "../../../components/courses/CourseCard";
import StatusTag from "../../../components/courses/StatusTag";
import { useTeacherCourses } from "../../../hooks/useTeacherCourses";

import "../../../styles/pages/course-list.css";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Published" },
];

function matchesSearch(course, query) {
  if (!query) return true;

  return [course.title, course.description, course.category]
    .filter(Boolean)
    .some((text) => text.toLowerCase().includes(query));
}

// The API's course -> the shape CourseCard displays.
function toCard(course) {
  return {
    emoji: course.icon || "📘",
    title: course.title,
    description: course.description || "No description yet.",
    lessons: course.lessons_count ?? 0,
    hue: course.accent_color,
  };
}

function CourseListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { courses, isLoading, error, reload } = useTeacherCourses();

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  // One-off message handed over by another page (e.g. after creating a course).
  const [flash, setFlash] = useState(() => location.state?.flash ?? null);

  // Clear it from history so a refresh or "back" doesn't show it again.
  useEffect(() => {
    if (location.state?.flash) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const query = search.trim().toLowerCase();
  const countFor = (value) =>
    value === "all" ? courses.length : courses.filter((course) => course.status === value).length;

  const visible = courses.filter(
    (course) => (status === "all" || course.status === status) && matchesSearch(course, query)
  );

  const isFiltered = status !== "all" || query;

  const clearFilters = () => {
    setStatus("all");
    setSearch("");
  };

  return (
    <div className="mx-page mx-course-list">
      <header className="mx-course-list__head">
        <div>
          <h1>My courses</h1>
          <p className="mx-hint">
            Everything you've built. Open a course to add lessons and
            interactive blocks in the builder.
          </p>
        </div>

        <Link className="mx-btn" to="/teacher/courses/create">
          ➕ Create a course
        </Link>
      </header>

      {flash && (
        <div className={`mx-feedback mx-feedback--${flash.tone || "good"} mx-flash`} role="status">
          <span>{flash.text}</span>
          <button
            type="button"
            className="mx-flash__close"
            onClick={() => setFlash(null)}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {isLoading && <p className="mx-hint">Loading your courses…</p>}

      {!isLoading && error && (
        <div className="mx-feedback mx-feedback--bad" role="alert">
          {error}{" "}
          <button type="button" className="mx-btn mx-btn--ghost mx-btn--sm" onClick={reload}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && courses.length === 0 && (
        <div className="mx-empty">
          <span className="mx-empty__emoji" aria-hidden="true">
            🚀
          </span>
          <h2>No courses yet</h2>
          <p>
            Create your first course — keep it as a draft while you build the
            lessons, then publish when it's ready.
          </p>
          <Link className="mx-btn" to="/teacher/courses/create">
            ➕ Create your first course
          </Link>
        </div>
      )}

      {!isLoading && !error && courses.length > 0 && (
        <>
          <div className="mx-course-list__controls">
            <input
              type="search"
              className="mx-search"
              placeholder="Search your courses…"
              aria-label="Search your courses"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <div className="mx-course-list__chips" role="group" aria-label="Filter by status">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={`mx-chip${status === filter.value ? " is-on" : ""}`}
                  aria-pressed={status === filter.value}
                  onClick={() => setStatus(filter.value)}
                >
                  {filter.label} <span className="mx-chip__count">{countFor(filter.value)}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mx-course-list__count" aria-live="polite">
            {isFiltered
              ? `${visible.length} of ${courses.length} courses`
              : `${courses.length} course${courses.length === 1 ? "" : "s"}`}
          </p>

          {visible.length > 0 ? (
            <div className="mx-grid">
              {visible.map((course) => (
                // The card opens the builder; "Edit details" sits on top of it as a
                // sibling, because a link can't contain another link.
                <div key={course.id} className="mx-course-tile">
                  <CourseCard
                    course={toCard(course)}
                    to={`/teacher/courses/${course.id}/playground`}
                    actionLabel=""
                    badge={<StatusTag status={course.status} />}
                    eyebrow={[course.category, course.level].filter(Boolean).join(" · ")}
                  />
                  <Link
                    className="mx-btn mx-btn--ghost mx-btn--sm mx-course-tile__edit"
                    to={`/teacher/courses/${course.id}/edit`}
                    aria-label={`Edit details of ${course.title}`}
                  >
                    ✏️ Edit details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-empty">
              <span className="mx-empty__emoji" aria-hidden="true">
                🔍
              </span>
              <h2>No matching courses</h2>
              <p>Try a different search or filter.</p>
              <button type="button" className="mx-btn mx-btn--ghost" onClick={clearFilters}>
                Show all courses
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CourseListPage;
