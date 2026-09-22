import { Link } from "react-router-dom";

import "../../styles/courses.css";

function MyCoursesPage() {
  return (
    <div className="my-courses-page">
      {/* Page heading */}
      <section className="courses-page-header">
        <div>
          <div className="courses-page-eyebrow">
            🗺️ YOUR LEARNING ADVENTURES
          </div>

          <h1>My Courses</h1>

          <p>
            Continue your current adventure or discover
            something new to learn.
          </p>
        </div>

        <div className="courses-summary">
          <div>
            <strong>1</strong>
            <span>In progress</span>
          </div>

          <div>
            <strong>20%</strong>
            <span>Overall progress</span>
          </div>
        </div>
      </section>

      {/* Continue Learning */}
      <section className="courses-section">
        <div className="courses-section-heading">
          <div>
            <span>KEEP GOING</span>
            <h2>Continue Learning</h2>
          </div>

          <span className="courses-heading-icon">
            🚀
          </span>
        </div>

        <article className="featured-course-card">
          <div className="featured-course-art">
            <div className="featured-course-decoration decoration-one">
              ⭐
            </div>

            <div className="featured-course-decoration decoration-two">
              ⚙️
            </div>

            <div className="featured-course-decoration decoration-three">
              💻
            </div>

            <div className="featured-dotnet-logo">
              .NET
            </div>
          </div>

          <div className="featured-course-content">
            <div className="featured-course-meta">
              <span className="course-status active">
                IN PROGRESS
              </span>

              <span className="course-level">
                BEGINNER
              </span>
            </div>

            <h2>.NET Adventure Land</h2>

            <p>
              Explore the .NET ecosystem through visual
              explanations, interactive simulations,
              challenges and practical learning.
            </p>

            <div className="featured-course-topics">
              <span>.NET Core</span>
              <span>C#</span>
              <span>CLI</span>
              <span>Projects</span>
            </div>

            <div className="featured-progress">
              <div className="featured-progress-heading">
                <div>
                  <span>Current adventure</span>
                  <strong>
                    World 1 · What is .NET?
                  </strong>
                </div>

                <strong className="progress-percentage">
                  20%
                </strong>
              </div>

              <div className="featured-progress-track">
                <div
                  className="featured-progress-fill"
                  style={{ width: "20%" }}
                />
              </div>
            </div>

            <div className="featured-course-actions">
              <Link
                to="/student/learn/dotnet"
                className="continue-course-button"
              >
                Continue Adventure
                <span>→</span>
              </Link>

              <span className="course-stars-earned">
                ⭐ 120 stars earned
              </span>
            </div>
          </div>
        </article>
      </section>

      {/* Available Courses */}
      <section className="courses-section">
        <div className="courses-section-heading">
          <div>
            <span>EXPLORE</span>
            <h2>Learning Adventures</h2>
          </div>

          <span className="courses-heading-icon">
            ✨
          </span>
        </div>

        <div className="learning-adventures-grid">
          {/* .NET */}
          <article className="learning-course-card">
            <div className="learning-course-banner dotnet-course-banner">
              <div className="learning-course-logo dotnet">
                .NET
              </div>

              <span className="learning-course-status active">
                In Progress
              </span>
            </div>

            <div className="learning-course-body">
              <span className="learning-course-category">
                DEVELOPMENT
              </span>

              <h3>.NET Adventure Land</h3>

              <p>
                Learn the .NET ecosystem through worlds,
                visual lessons and interactive challenges.
              </p>

              <div className="learning-course-info">
                <span>🌍 5 Worlds</span>
                <span>⭐ Beginner</span>
              </div>

              <div className="learning-course-progress">
                <div>
                  <span>Progress</span>
                  <strong>20%</strong>
                </div>

                <div className="learning-course-progress-track">
                  <div
                    className="learning-course-progress-fill"
                    style={{ width: "20%" }}
                  />
                </div>
              </div>

              <Link
                to="/student/learn/dotnet"
                className="learning-course-button"
              >
                Continue learning
                <span>→</span>
              </Link>
            </div>
          </article>

          {/* Python */}
          <article className="learning-course-card">
            <div className="learning-course-banner python-course-banner">
              <div className="learning-course-logo">
                🐍
              </div>

              <span className="learning-course-status coming">
                Coming Soon
              </span>
            </div>

            <div className="learning-course-body">
              <span className="learning-course-category">
                DEVELOPMENT
              </span>

              <h3>Python Adventure</h3>

              <p>
                Learn Python fundamentals through
                practical examples, visual explanations
                and coding challenges.
              </p>

              <div className="learning-course-info">
                <span>🌍 6 Worlds</span>
                <span>⭐ Beginner</span>
              </div>

              <button
                type="button"
                className="learning-course-button disabled"
                disabled
              >
                Coming soon
              </button>
            </div>
          </article>

          {/* React */}
          <article className="learning-course-card">
            <div className="learning-course-banner react-course-banner">
              <div className="learning-course-logo">
                ⚛️
              </div>

              <span className="learning-course-status coming">
                Coming Soon
              </span>
            </div>

            <div className="learning-course-body">
              <span className="learning-course-category">
                FRONTEND
              </span>

              <h3>React Explorer</h3>

              <p>
                Build modern interfaces while learning
                components, state, hooks and React
                fundamentals.
              </p>

              <div className="learning-course-info">
                <span>🌍 5 Worlds</span>
                <span>⭐ Beginner</span>
              </div>

              <button
                type="button"
                className="learning-course-button disabled"
                disabled
              >
                Coming soon
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* Encouragement */}
      <section className="courses-encouragement">
        <div className="encouragement-character">
          🤖
        </div>

        <div>
          <span>KEEP EXPLORING</span>

          <h2>
            Every lesson moves you forward.
          </h2>

          <p>
            Continue your adventure, collect stars and
            turn what you learn into practical skills.
          </p>
        </div>

        <Link
          to="/student/learn/dotnet"
          className="encouragement-button"
        >
          Continue Learning
          <span>→</span>
        </Link>
      </section>
    </div>
  );
}

export default MyCoursesPage;