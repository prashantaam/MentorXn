import { Link } from "react-router-dom";

function AuthLayout({
  children,
  title,
  subtitle,
  teacher = false,
  footerText,
  footerLinkText,
  footerLink,
}) {
  return (
    <div className={`auth-page ${teacher ? "teacher-auth" : ""}`}>
      <header className="auth-header">
        <Link to="/" className="brand">
          <span className="brand-mark">🚀</span>

          <span className="brand-copy">
            <strong>Learning Adventure</strong>
            <small>Learn • Explore • Build</small>
          </span>
        </Link>

        <Link to="/" className="auth-home-link">
          ← Back to home
        </Link>
      </header>

      <main className="auth-main">
        <section className="auth-welcome">
          <div className="auth-character">
            {teacher ? "🧑‍🏫" : "🧭"}
          </div>

          <span className="auth-eyebrow">
            {teacher ? "TEACHER PORTAL" : "LEARNER ADVENTURE"}
          </span>

          <h1>
            {teacher ? (
              <>
                Help learners
                <span> discover more.</span>
              </>
            ) : (
              <>
                Your learning
                <span> adventure awaits.</span>
              </>
            )}
          </h1>

          <p>
            {teacher
              ? "Create engaging lessons, organise learning adventures and help students build real understanding."
              : "Explore concepts, interact with demonstrations, practise safely and learn one small step at a time."}
          </p>

          <div className="auth-path">
            <div>
              <span>📖</span>
              <strong>Learn</strong>
            </div>

            <span className="auth-path-arrow">→</span>

            <div>
              <span>🎮</span>
              <strong>Explore</strong>
            </div>

            <span className="auth-path-arrow">→</span>

            <div>
              <span>💻</span>
              <strong>Try</strong>
            </div>

            <span className="auth-path-arrow">→</span>

            <div>
              <span>🎯</span>
              <strong>Check</strong>
            </div>
          </div>

          <div className="auth-message">
            <span>{teacher ? "💡" : "🤖"}</span>

            <div>
              <strong>
                {teacher ? "Build better learning." : "Ready when you are!"}
              </strong>

              <p>
                {teacher
                  ? "Turn complex topics into simple, interactive learning experiences."
                  : "Sign in or create your account and we'll continue from there."}
              </p>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-top">
            <div
              className={`auth-card-icon ${
                teacher ? "teacher-card-icon" : ""
              }`}
            >
              {teacher ? "🧑‍🏫" : "🌱"}
            </div>

            <div>
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
          </div>

          {children}

          <div className="auth-switch">
            <span>{footerText}</span>{" "}
            <Link to={footerLink}>{footerLinkText}</Link>
          </div>

          {teacher ? (
            <div className="portal-switch">
              <span>🎓</span>

              <div>
                <strong>Are you a student?</strong>
                <Link to="/login">Go to Student Sign In →</Link>
              </div>
            </div>
          ) : (
            <div className="portal-switch">
              <span>🧑‍🏫</span>

              <div>
                <strong>Are you a teacher?</strong>
                <Link to="/teacher/login">
                  Go to Teacher Portal →
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AuthLayout;