import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import CourseCard from "../../components/courses/CourseCard";
import { HOME_BY_ROLE } from "../../components/layout/navigation";
import { useAuth } from "../../context/AuthContext";
import { COURSES, TOTAL_LESSONS } from "../../data/courseCatalog";

import "../../styles/pages/landing.css";

const TEASER_COUNT = 6;

// Where a course card leads, depending on who's looking.
const COURSE_LINK_BY_ROLE = {
  student: "/student/dashboard",
  teacher: "/teacher/courses",
};

const WHY_POINTS = [
  {
    title: "Actually interactive",
    text: "Real terminals, live code, working queries — not just slides to click through.",
  },
  {
    title: "Self-paced",
    text: "Short lessons you can stop anytime and pick up right where you left off.",
  },
  {
    title: "Free to start",
    text: "No installs and no payment — open a course and start on lesson one.",
  },
];

function LandingPage() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [showAllCourses, setShowAllCourses] = useState(false);

  const role = isAuthenticated ? user?.role : null;
  const visibleCourses = showAllCourses
    ? COURSES
    : COURSES.slice(0, TEASER_COUNT);

  // React Router doesn't scroll to #hash targets on its own (e.g. the nav's "/#courses").
  useEffect(() => {
    if (!location.hash) return;
    document
      .getElementById(location.hash.slice(1))
      ?.scrollIntoView({ behavior: "smooth" });
  }, [location.hash]);

  return (
    <div className="mx-page mx-landing">
      <section className="mx-hero">
        <h1>
          Learn by <span className="mx-highlight">playing</span>, not by
          watching.
        </h1>

        <p>
          {COURSES.length} bite-sized, interactive courses — from HTML to
          Kubernetes to accounting — where you run real code, fix real bugs,
          and build real confidence, right in your browser.
        </p>

        <div className="mx-hero__ctas">
          {role ? (
            <Link className="mx-btn" to={HOME_BY_ROLE[role] || "/"}>
              Go to my dashboard
            </Link>
          ) : (
            <Link className="mx-btn" to="/register">
              Create a free account
            </Link>
          )}

          <a className="mx-btn mx-btn--ghost" href="#courses">
            Browse all courses
          </a>
        </div>

        <p className="mx-hero__stat">
          {TOTAL_LESSONS} hands-on lessons, across {COURSES.length} topics —
          no installs, no setup.
        </p>
      </section>

      {role === "teacher" && (
        <div className="mx-teacher-banner">
          <span className="mx-teacher-banner__emoji" aria-hidden="true">
            🧑‍🏫
          </span>

          <div className="mx-teacher-banner__text">
            <b>Ready to build your own course?</b>
            <div className="mx-hint">
              Sketch a title, description and lesson outline — it saves as a
              draft on your dashboard.
            </div>
          </div>

          <Link className="mx-btn mx-btn--sm" to="/teacher/courses/create">
            ➕ Create a course
          </Link>
        </div>
      )}

      <section id="courses" className="mx-courses">
        <div className="mx-courses__head">
          <h2>Pick your quest</h2>

          {COURSES.length > TEASER_COUNT && (
            <button
              type="button"
              className="mx-btn mx-btn--ghost mx-btn--sm"
              onClick={() => setShowAllCourses((shown) => !shown)}
              aria-expanded={showAllCourses}
            >
              {showAllCourses
                ? "Show fewer"
                : `See all ${COURSES.length} courses →`}
            </button>
          )}
        </div>

        <div className="mx-grid">
          {visibleCourses.map((course) => (
            <CourseCard
              key={course.slug}
              course={course}
              to={COURSE_LINK_BY_ROLE[role] || "/register"}
              actionLabel={role ? "View course" : "Start learning →"}
            />
          ))}
        </div>
      </section>

      <section className="mx-why" aria-label="Why MentorXn">
        <div className="mx-grid">
          {WHY_POINTS.map((point) => (
            <div key={point.title} className="mx-mini">
              <b>{point.title}</b>
              {point.text}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
