import { Link } from "react-router-dom";

import StatRow from "../../components/dashboard/StatRow";
import { useAuth } from "../../context/AuthContext";
import { useStudentCourses } from "../../hooks/useStudentCourses";
import { useStudentProgress } from "../../hooks/useStudentProgress";
import { hueStyle } from "../../lib/hue";

import "../../styles/pages/dashboard.css";

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function percentComplete(entry) {
  const total = entry.course.lessons || 0;
  return total ? Math.min(100, Math.round((entry.completedLessons / total) * 100)) : 0;
}

function ProgressCard({ entry }) {
  const { course } = entry;
  const pct = percentComplete(entry);
  const Tag = entry.to ? Link : "div";

  return (
    <Tag className="mx-progress-card" style={hueStyle(course.hue)} to={entry.to}>
      <span className="mx-card-emoji" aria-hidden="true">
        {course.emoji}
      </span>

      <div className="mx-grow">
        <h3>{course.title}</h3>
        <div
          className="mx-track"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${course.title} progress`}
        >
          <div className="mx-track__fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="mx-hint">
          {entry.completedLessons} / {course.lessons} lessons · {pct}% complete
        </span>
      </div>

      {entry.to && <span className="mx-tag">Resume →</span>}
    </Tag>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const { progress } = useStudentProgress();
  const { courses, isLoading: isLoadingCourses } = useStudentCourses();

  const firstName = user?.name?.split(" ")[0] || "there";

  const inProgress = progress.filter(
    (entry) => !entry.certified && percentComplete(entry) < 100
  );
  const certificates = progress.filter((entry) => entry.certified);
  const startedSlugs = new Set(progress.map((entry) => entry.course.slug));
  const notStarted = courses.filter((course) => !startedSlugs.has(course.slug));

  const lessonsDone = progress.reduce((sum, entry) => sum + entry.completedLessons, 0);

  const stats = [
    { label: progress.length === 1 ? "Course started" : "Courses started", value: progress.length },
    { label: lessonsDone === 1 ? "Lesson completed" : "Lessons completed", value: lessonsDone },
    { label: certificates.length === 1 ? "Certificate earned" : "Certificates earned", value: `🏅 ${certificates.length}` },
  ];

  return (
    <div className="mx-page mx-dashboard">
      <section className="mx-dash-hero">
        <h1>
          Welcome back, {firstName}
          <span className="mx-dash-hero__wave"> 👋</span>
        </h1>
        <p className="mx-hint">
          {progress.length
            ? "Here's where you left off."
            : courses.length
              ? "Pick a course below to start your first lesson."
              : "New courses will show up here as teachers publish them."}
        </p>
      </section>

      <StatRow stats={stats} />

      {inProgress.length > 0 && (
        <section className="mx-dash-section">
          <h2>▶️ Continue learning</h2>
          <div className="mx-progress-grid">
            {inProgress.map((entry) => (
              <ProgressCard key={entry.course.slug} entry={entry} />
            ))}
          </div>
        </section>
      )}

      {certificates.length > 0 && (
        <section className="mx-dash-section">
          <h2>🏅 Your certificates</h2>
          <div className="mx-cert-grid">
            {certificates.map((entry) => (
              <div key={entry.course.slug} className="mx-cert-card">
                <span className="mx-card-emoji" aria-hidden="true">
                  🏅
                </span>
                <div>
                  <b>{entry.course.title}</b>
                  <span className="mx-hint">Completed — congrats, {firstName}!</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {progress.length === 0 && (
        <div className="mx-empty">
          <span className="mx-empty__emoji" aria-hidden="true">
            🚀
          </span>
          <h2>You haven't started a course yet</h2>
          <p>
            {courses.length
              ? "Pick anything below — your progress will show up here as you go."
              : "No courses are published yet — check back soon."}
          </p>
        </div>
      )}

      {!isLoadingCourses && notStarted.length > 0 && (
        <section className="mx-dash-section">
          <h2>
            🧭 {progress.length ? "Explore more" : "Explore courses"}{" "}
            <Link className="mx-hint mx-dash-section__see-all" to="/student/courses">
              See all →
            </Link>
          </h2>
          <div className="mx-explore-grid">
            {notStarted.map((course) => (
              <Link
                key={course.id}
                className="mx-explore-card"
                style={hueStyle(course.accent_color)}
                to={`/student/courses/${course.id}`}
              >
                <span className="mx-card-emoji" aria-hidden="true">
                  {course.icon || "📘"}
                </span>
                <div>
                  <b>{course.title}</b>
                  <span className="mx-hint">{plural(course.lessons_count ?? 0, "lesson")}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default StudentDashboard;
