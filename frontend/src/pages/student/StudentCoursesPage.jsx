import { useMemo, useState } from "react";

import CourseCard from "../../components/courses/CourseCard";
import { useStudentCourses } from "../../hooks/useStudentCourses";

import "../../styles/pages/student-courses.css";

// The API's course -> the shape CourseCard displays.
function toCard(course) {
  return {
    emoji: course.icon || "📘",
    title: course.title,
    description: course.description || "",
    lessons: course.lessons_count ?? 0,
    hue: course.accent_color,
  };
}

function matches(course, query) {
  return [course.title, course.description, course.category, course.teacher_name]
    .filter(Boolean)
    .some((text) => text.toLowerCase().includes(query));
}

/*
 * Every published course. A card opens the course player.
 */
function StudentCoursesPage() {
  const { courses, isLoading, error, reload } = useStudentCourses();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => [...new Set(courses.map((course) => course.category).filter(Boolean))].sort(),
    [courses]
  );

  const query = search.trim().toLowerCase();
  const visible = courses.filter(
    (course) =>
      (category === "all" || course.category === category) && (!query || matches(course, query))
  );

  return (
    <div className="mx-page mx-student-courses">
      <header className="mx-student-courses__head">
        <h1>🧭 Courses</h1>
        <p className="mx-hint">Pick a course and start learning — every lesson is hands-on.</p>
      </header>

      {isLoading ? (
        <p className="mx-hint">Loading courses…</p>
      ) : error ? (
        <div className="mx-empty">
          <span className="mx-empty__emoji" aria-hidden="true">
            🔌
          </span>
          <h2>Couldn&apos;t load the courses</h2>
          <p>{error}</p>
          <button type="button" className="mx-btn" onClick={reload}>
            Try again
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="mx-empty">
          <span className="mx-empty__emoji" aria-hidden="true">
            🌱
          </span>
          <h2>No courses yet</h2>
          <p>Teachers are still building them — check back soon.</p>
        </div>
      ) : (
        <>
          <div className="mx-student-courses__controls">
            <input
              type="search"
              className="mx-search"
              placeholder="Search courses…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search courses"
            />

            {categories.length > 1 && (
              <div className="mx-student-courses__chips" role="group" aria-label="Filter by category">
                {["all", ...categories].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`mx-chip${category === value ? " is-on" : ""}`}
                    aria-pressed={category === value}
                    onClick={() => setCategory(value)}
                  >
                    {value === "all" ? "All" : value}
                  </button>
                ))}
              </div>
            )}
          </div>

          {visible.length > 0 ? (
            <div className="mx-grid">
              {visible.map((course) => (
                <CourseCard
                  key={course.id}
                  course={toCard(course)}
                  to={`/student/courses/${course.id}`}
                  actionLabel="Start →"
                  eyebrow={[course.category, course.level].filter(Boolean).join(" · ")}
                />
              ))}
            </div>
          ) : (
            <div className="mx-empty">
              <span className="mx-empty__emoji" aria-hidden="true">
                🔍
              </span>
              <h2>No matching courses</h2>
              <p>Try a different search or category.</p>
              <button
                type="button"
                className="mx-btn mx-btn--ghost"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                }}
              >
                Show all courses
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StudentCoursesPage;
