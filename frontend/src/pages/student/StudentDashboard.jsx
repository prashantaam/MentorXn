import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "../../styles/dashboard.css";


function StudentDashboard() {
  
   const { user } = useAuth();

  const firstName =
    user?.name?.split(" ")[0] || "Learner";

  return (
    <div className="student-dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <div className="dashboard-eyebrow">
            🌟 YOUR LEARNING SPACE
          </div>

          <h1>
            Welcome back,{" "}
            <span>{firstName}!</span> 👋
          </h1>

          <p>
            Ready for your next learning adventure?
            Pick up where you left off and keep building
            your skills.
          </p>
        </div>

        <div className="dashboard-streak">
          <div className="dashboard-streak-icon">
            🔥
          </div>

          <div>
            <strong>3 day streak</strong>
            <span>Keep it going!</span>
          </div>
        </div>
      </section>

      <section className="continue-learning-card">
        <div className="continue-learning-content">
          <div className="dashboard-section-label">
            🚀 CONTINUE LEARNING
          </div>

          <div className="continue-course-heading">
            <div className="dotnet-logo">
              .NET
            </div>

            <div>
              <h2>.NET Adventure Land</h2>

              <p>
                Learn .NET Core by exploring,
                experimenting and solving challenges.
              </p>
            </div>
          </div>

          <div className="current-learning-step">
            <span>World 1</span>
            What is .NET?
          </div>

          <div className="dashboard-progress">
            <div className="dashboard-progress-heading">
              <span>Your progress</span>
              <strong>20%</strong>
            </div>

            <div className="dashboard-progress-track">
              <div
                className="dashboard-progress-fill"
                style={{ width: "20%" }}
              />
            </div>
          </div>

          <Link
            to="/student/learn/dotnet"
            className="dashboard-primary-button"
          >
            Continue Adventure
            <span>→</span>
          </Link>
        </div>

        <div className="dashboard-mascot">
          <div className="dashboard-mascot-message">
            Let&apos;s keep learning!
          </div>

          <div className="dashboard-mascot-character">
            🤖
          </div>
        </div>
      </section>

      <section className="dashboard-content-section">
        <div className="dashboard-section-heading">
          <div>
            <span>YOUR JOURNEY</span>
            <h2>Your Progress</h2>
          </div>

          <span className="dashboard-heading-icon">
            ✨
          </span>
        </div>

        <div className="dashboard-stats-grid">
          <article className="dashboard-stat-card">
            <div className="dashboard-stat-icon stars">
              ⭐
            </div>

            <div>
              <strong>120</strong>
              <span>Stars earned</span>
            </div>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-icon lessons">
              🏆
            </div>

            <div>
              <strong>3</strong>
              <span>Lessons completed</span>
            </div>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-icon streak">
              🔥
            </div>

            <div>
              <strong>3</strong>
              <span>Day streak</span>
            </div>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-icon time">
              ⏱️
            </div>

            <div>
              <strong>45m</strong>
              <span>Learning time</span>
            </div>
          </article>
        </div>
      </section>

      <section
        className="dashboard-content-section"
        id="my-courses"
      >
        <div className="dashboard-section-heading">
          <div>
            <span>KEEP EXPLORING</span>
            <h2>My Learning Adventures</h2>
          </div>

          <Link
            to="/student/courses"
            className="dashboard-browse-link"
          >
            Browse courses →
          </Link>
        </div>

        <div className="dashboard-courses-grid">
          <article className="dashboard-course-card">
            <div className="course-card-banner dotnet-banner">
              <div className="course-card-logo dotnet">
                .NET
              </div>

              <span className="course-progress-status">
                In Progress
              </span>
            </div>

            <div className="course-card-body">
              <span className="course-card-category">
                DEVELOPMENT
              </span>

              <h3>.NET Adventure Land</h3>

              <p>
                Explore the .NET ecosystem through visual
                lessons, simulations and challenges.
              </p>

              <div className="course-mini-progress">
                <div>
                  <span>Progress</span>
                  <strong>20%</strong>
                </div>

                <div className="course-mini-track">
                  <div
                    className="course-mini-fill"
                    style={{ width: "20%" }}
                  />
                </div>
              </div>

              <Link
                to="/student/learn/dotnet"
                className="course-continue-button"
              >
                Continue learning
                <span>→</span>
              </Link>
            </div>
          </article>

          <article className="dashboard-course-card">
            <div className="course-card-banner">
              <div className="course-card-logo">
                🐍
              </div>

              <span className="course-coming-status">
                Coming Soon
              </span>
            </div>

            <div className="course-card-body">
              <span className="course-card-category">
                DEVELOPMENT
              </span>

              <h3>Python Adventure</h3>

              <p>
                Learn Python fundamentals through
                practical examples and interactive
                challenges.
              </p>

              <button
                type="button"
                className="course-coming-button"
                disabled
              >
                Coming soon
              </button>
            </div>
          </article>

          <article className="dashboard-course-card">
            <div className="course-card-banner">
              <div className="course-card-logo">
                ⚛️
              </div>

              <span className="course-coming-status">
                Coming Soon
              </span>
            </div>

            <div className="course-card-body">
              <span className="course-card-category">
                FRONTEND
              </span>

              <h3>React Explorer</h3>

              <p>
                Build modern interfaces while learning
                React step by step.
              </p>

              <button
                type="button"
                className="course-coming-button"
                disabled
              >
                Coming soon
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className="dashboard-daily-challenge">
        <div className="daily-challenge-icon">
          🎯
        </div>

        <div className="daily-challenge-content">
          <span>DAILY CHALLENGE</span>

          <h2>Ready for a quick challenge?</h2>

          <p>
            Complete a short activity and earn{" "}
            <strong>10 bonus stars.</strong>
          </p>
        </div>

        <button
          type="button"
          className="daily-challenge-button"
        >
          Start Challenge
          <span>⭐</span>
        </button>
      </section>
    </div>
  );
}

export default StudentDashboard;