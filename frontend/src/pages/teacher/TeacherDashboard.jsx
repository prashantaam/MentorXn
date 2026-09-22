import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "../../styles/teacher-dashboard.css";

function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName =
    user?.name?.split(" ")[0] || "Teacher";

  const handleCreateCourse = () => {
    navigate("/teacher/courses");
  };

  return (
    <div className="teacher-dashboard-page">
      {/* =====================================
          Welcome
      ===================================== */}

      <section className="teacher-dashboard-welcome">
        <div>
          <div className="teacher-dashboard-eyebrow">
            👋 TEACHER PORTAL
          </div>

          <h1>
            Welcome back, <span>{firstName}!</span>
          </h1>

          <p>
            Manage your courses, create learning
            adventures and help students grow their
            skills.
          </p>
        </div>

        <div className="teacher-dashboard-badge">
          <div className="teacher-dashboard-badge-icon">
            🎓
          </div>

          <div>
            <strong>Teacher</strong>
            <span>MentorXn Educator</span>
          </div>
        </div>
      </section>

      {/* =====================================
          Overview
      ===================================== */}

      <section className="teacher-dashboard-section">
        <div className="teacher-section-heading">
          <div>
            <span>OVERVIEW</span>
            <h2>Your Teaching Space</h2>
          </div>
        </div>

        <div className="teacher-stats-grid">
          <article className="teacher-stat-card">
            <div className="teacher-stat-icon courses">
              📚
            </div>

            <div>
              <strong>0</strong>
              <span>Courses</span>
            </div>
          </article>

          <article className="teacher-stat-card">
            <div className="teacher-stat-icon students">
              👨‍🎓
            </div>

            <div>
              <strong>0</strong>
              <span>Students</span>
            </div>
          </article>

          <article className="teacher-stat-card">
            <div className="teacher-stat-icon lessons">
              📝
            </div>

            <div>
              <strong>0</strong>
              <span>Lessons</span>
            </div>
          </article>

          <article className="teacher-stat-card">
            <div className="teacher-stat-icon published">
              🚀
            </div>

            <div>
              <strong>0</strong>
              <span>Published</span>
            </div>
          </article>
        </div>
      </section>

      {/* =====================================
          Get Started
      ===================================== */}

      <section className="teacher-get-started">
        <div className="teacher-get-started-icon">
          🗺️
        </div>

        <div className="teacher-get-started-content">
          <span>GET STARTED</span>

          <h2>
            Create your first learning adventure
          </h2>

          <p>
            Start by creating a course. You will then be
            able to add worlds, lessons, learning steps
            and interactive activities.
          </p>
        </div>

        <button
          type="button"
          className="teacher-create-course-button"
          onClick={handleCreateCourse}
        >
          + Create Course
        </button>
      </section>
    </div>
  );
}

export default TeacherDashboard;