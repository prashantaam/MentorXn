import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  useAuth,
} from "../../../context/AuthContext";

import "../../../styles/lblock-templates.css";

function LBlockTemplatesPage() {
  const { token } = useAuth();

  const [
    templates,
    setTemplates,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const loadTemplates =
      async () => {
        setLoading(true);
        setError("");

        try {
          const response =
            await fetch(
              "http://127.0.0.1:8000/api/teacher/lblock-templates",
              {
                headers: {
                  Accept:
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Unable to load learning block templates."
            );
          }

          setTemplates(
            data.lblock_templates ||
              []
          );
        } catch (
          requestError
        ) {
          console.error(
            "Load learning block templates error:",
            requestError
          );

          setError(
            requestError.message ||
              "Unable to load learning block templates."
          );

          setTemplates([]);
        } finally {
          setLoading(false);
        }
      };

    if (token) {
      loadTemplates();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="lblock-page">
        <div className="lblock-state">
          <div className="lblock-state-icon">
            🧩
          </div>

          <h2>
            Loading templates...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="lblock-page">
      <section className="lblock-header">
        <div>
          <span className="lblock-eyebrow">
            MENTORXN COMPONENT LIBRARY
          </span>

          <h1>
            Learning Block Templates
          </h1>

          <p>
            Create and manage reusable
            learning experiences that can
            be added to any MentorXn
            course.
          </p>
        </div>

        <Link
          to="/teacher/lblock-templates/create"
          className="lblock-create-button"
        >
          <span>＋</span>

          Create Template
        </Link>
      </section>

      {error && (
        <div className="lblock-error">
          <strong>
            Could not load templates
          </strong>

          <span>
            {error}
          </span>
        </div>
      )}

      {!error &&
        templates.length === 0 && (
          <section className="lblock-empty">
            <div className="lblock-empty-icon">
              🧩
            </div>

            <h2>
              No templates yet
            </h2>

            <p>
              Create your first reusable
              learning block template.
            </p>

            <Link
              to="/teacher/lblock-templates/create"
              className="lblock-create-button"
            >
              Create Template
            </Link>
          </section>
        )}

      {!error &&
        templates.length > 0 && (
          <section className="lblock-grid">
            {templates.map(
              (template) => (
                <article
                  key={
                    template.id
                  }
                  className="lblock-card"
                >
                  <div className="lblock-card-top">
                    <div className="lblock-icon">
                      {template.icon ||
                        "🧩"}
                    </div>

                    <span
                      className={
                        template.status ===
                        "active"
                          ? "lblock-status active"
                          : "lblock-status"
                      }
                    >
                      {template.status}
                    </span>
                  </div>

                  <div className="lblock-card-content">
                    <h2>
                      {template.name}
                    </h2>

                    <p>
                      {template.description ||
                        "Reusable MentorXn learning block."}
                    </p>
                  </div>

                  <div className="lblock-card-meta">
                    <div>
                      <span>
                        TYPE
                      </span>

                      <strong>
                        {template.type}
                      </strong>
                    </div>

                    <div>
                      <span>
                        COMPONENT
                      </span>

                      <strong>
                        {template.component}
                      </strong>
                    </div>
                  </div>

                  <div className="lblock-card-footer">
                    <Link
                      to={`/teacher/lblock-templates/${template.id}/edit`}
                      className="lblock-edit-button"
                    >
                      Edit Template

                      <span>
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              )
            )}
          </section>
        )}
    </div>
  );
}

export default LBlockTemplatesPage;