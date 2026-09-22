import "../App.css";

function HomePage() {
  return (
    <div className="site">
      {/* Header */}
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">🚀</span>

          <span className="brand-copy">
            <strong>Learning Adventure</strong>
            <small>Learn • Explore • Build</small>
          </span>
        </a>

        <nav className="top-actions" aria-label="Main navigation">
          <a className="nav-link" href="#courses">
            Courses
          </a>

          <a className="btn btn-outline" href="/login">
            Sign In
          </a>

          <a className="btn btn-primary" href="/register">
            Start Learning
          </a>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">
              <span>✨</span>
              Learning should feel like an adventure
            </div>

            <h1>
              Learn by doing.
              <span> Understand by exploring.</span>
            </h1>

            <p className="hero-description">
              Build real understanding with short explanations, interactive
              demonstrations, safe simulations and hands-on challenges.
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary btn-large" href="/register">
                Start your adventure
                <span aria-hidden="true">→</span>
              </a>

              <a className="btn btn-soft btn-large" href="#courses">
                Explore courses
              </a>
            </div>

            <div className="hero-points">
              <span>✓ Learn at your pace</span>
              <span>✓ Interactive lessons</span>
              <span>✓ Practical concepts</span>
            </div>
          </div>

          <div className="hero-playground" aria-label="Learning preview">
            <div className="floating-star star-one">⭐</div>
            <div className="floating-star star-two">✨</div>

            <div className="mascot-row">
              <div className="mascot" aria-hidden="true">
                🤖
              </div>

              <div className="speech-bubble">
                <strong>Hi, explorer!</strong>
                <span>
                  We&apos;ll learn one idea at a time. Ready for your first
                  adventure?
                </span>
              </div>
            </div>

            <div className="mini-lesson">
              <div className="mini-lesson-header">
                <span className="lesson-icon">💡</span>

                <div>
                  <small>LEARNING STEP</small>
                  <strong>Understand the idea</strong>
                </div>

                <span className="lesson-status">1 / 4</span>
              </div>

              <div className="learning-path">
                <div className="path-item active">
                  <span>📖</span>
                  <strong>Learn</strong>
                  <small>Simple explanation</small>
                </div>

                <div className="path-arrow">→</div>

                <div className="path-item">
                  <span>🎮</span>
                  <strong>Explore</strong>
                  <small>See it happen</small>
                </div>

                <div className="path-arrow">→</div>

                <div className="path-item">
                  <span>💻</span>
                  <strong>Try</strong>
                  <small>Practise safely</small>
                </div>

                <div className="path-arrow">→</div>

                <div className="path-item">
                  <span>🎯</span>
                  <strong>Check</strong>
                  <small>Test yourself</small>
                </div>
              </div>

              <div className="progress-label">
                <span>Your adventure</span>
                <strong>25%</strong>
              </div>

              <div className="progress-track">
                <div className="progress-fill" />
              </div>
            </div>
          </div>
        </section>

        {/* Learning Style */}
        <section className="learning-section">
          <div className="section-heading">
            <span className="section-kicker">HOW YOU&apos;LL LEARN</span>

            <h2>Small steps. Real understanding.</h2>

            <p>
              Every learning adventure combines explanation, exploration and
              practice so difficult concepts become easier to understand.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card feature-blue">
              <div className="feature-icon">📖</div>
              <span className="feature-number">01</span>
              <h3>Learn</h3>
              <p>
                Start with a clear, friendly explanation without unnecessary
                complexity.
              </p>
            </article>

            <article className="feature-card feature-purple">
              <div className="feature-icon">🎮</div>
              <span className="feature-number">02</span>
              <h3>Explore</h3>
              <p>
                Interact with visual demonstrations and see how concepts work
                step by step.
              </p>
            </article>

            <article className="feature-card feature-orange">
              <div className="feature-icon">💻</div>
              <span className="feature-number">03</span>
              <h3>Try</h3>
              <p>
                Use safe coding playgrounds and simulated terminals to practise
                what you learned.
              </p>
            </article>

            <article className="feature-card feature-green">
              <div className="feature-icon">🎯</div>
              <span className="feature-number">04</span>
              <h3>Check</h3>
              <p>
                Answer quick questions and challenges before moving to the next
                concept.
              </p>
            </article>
          </div>
        </section>

        {/* Courses */}
        <section className="courses-section" id="courses">
          <div className="section-heading">
            <span className="section-kicker">CHOOSE YOUR ADVENTURE</span>
            <h2>Start exploring</h2>
            <p>
              Learn technical concepts through interactive, practical
              adventures.
            </p>
          </div>

          <div className="course-grid">
            <article className="course-card course-featured">
              <div className="course-art">
                <div className="course-world">🌍</div>
                <span className="orbit orbit-one">⚙️</span>
                <span className="orbit orbit-two">💻</span>
                <span className="orbit orbit-three">🚀</span>
              </div>

              <div className="course-content">
                <div className="course-meta">
                  <span className="course-badge">FEATURED COURSE</span>
                  <span className="difficulty">Beginner friendly</span>
                </div>

                <h3>.NET Adventure Land</h3>

                <p>
                  Discover .NET and C# by exploring concepts, playing with
                  interactive demonstrations and trying practical simulations.
                </p>

                <div className="course-topics">
                  <span>🌍 Meet .NET</span>
                  <span>🧱 C# Basics</span>
                  <span>🌐 ASP.NET Core</span>
                  <span>⚙️ Behind the scenes</span>
                </div>

                <a className="btn btn-primary course-button" href="/register">
                  Start .NET Adventure
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>

            <article className="coming-card">
              <div className="coming-icon">🗺️</div>
              <span>MORE ADVENTURES</span>
              <h3>More courses are on the way</h3>
              <p>
                The same learning style will support programming, cloud,
                DevOps, data and much more.
              </p>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-mascot">🚀</div>

          <div>
            <span className="section-kicker">READY?</span>
            <h2>Your next skill starts with one small step.</h2>
            <p>Create your free learner account and begin exploring.</p>
          </div>

          <a className="btn btn-white btn-large" href="/register">
            Start Learning
            <span aria-hidden="true">→</span>
          </a>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <span>🚀</span>
          <div>
            <strong>Learning Adventure</strong>
            <small>Understand. Explore. Build.</small>
          </div>
        </div>

        <div className="footer-links">
          <a href="/login">Student Sign In</a>
          <a href="/register">Register</a>
          <a href="/teacher/login">Teacher Sign In</a>
        </div>

        <p>Built for curious minds.</p>
      </footer>
    </div>
  );
}

export default HomePage;