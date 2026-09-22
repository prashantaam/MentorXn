import { useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import "../../../styles/create-lesson.css";

function CreateLessonPage() {
  const navigate = useNavigate();

  const { courseId } = useParams();

  const { token } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    icon: "📖",
    description: "",
    status: "draft",
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* =========================================
     Form Change
  ========================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  };

  /* =========================================
     Submit
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrors({});
    setGeneralError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/teacher/courses/${courseId}/lessons`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: formData.title,
            icon: formData.icon,
            description: formData.description,
            status: formData.status,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 422) {
        setErrors(data.errors || {});

        return;
      }

      if (response.status === 401) {
        setGeneralError(
          "Your login session is no longer valid. Please sign in again."
        );

        return;
      }

      if (response.status === 403) {
        setGeneralError(
          data.message ||
            "You do not have permission to create lessons."
        );

        return;
      }

      if (response.status === 404) {
        setGeneralError(
          data.message ||
            "The course could not be found."
        );

        return;
      }

      if (!response.ok) {
        setGeneralError(
          data.message ||
            "Unable to create the lesson."
        );

        return;
      }

      navigate(
        `/teacher/courses/${courseId}`,
        {
          replace: true,

          state: {
            successMessage:
              data.message ||
              "Lesson created successfully.",
          },
        }
      );
    } catch (requestError) {
      console.error(
        "Create lesson error:",
        requestError
      );

      setGeneralError(
        "Unable to connect to the server. Please make sure the Laravel API is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field) => {
    return errors[field]?.[0] || "";
  };

  return (
    <div className="create-lesson-page">
      {/* Back */}

      <button
        type="button"
        className="create-lesson-back"
        onClick={() =>
          navigate(
            `/teacher/courses/${courseId}`
          )
        }
      >
        ← Back to Course
      </button>

      {/* Header */}

      <section className="create-lesson-header">
        <div>
          <span>COURSE BUILDER</span>

          <h1>Create a Lesson</h1>

          <p>
            Create a stage in the learning journey.
            After creating the lesson, you will be
            able to add topics underneath it.
          </p>
        </div>

        <div className="create-lesson-header-icon">
          📖
        </div>
      </section>

      {generalError && (
        <div className="create-lesson-error-banner">
          <span>⚠️</span>

          <div>
            <strong>
              Unable to create lesson
            </strong>

            <p>{generalError}</p>
          </div>
        </div>
      )}

      <form
        className="create-lesson-layout"
        onSubmit={handleSubmit}
      >
        {/* Main Form */}

        <div className="create-lesson-form-card">
          <div className="lesson-form-section">
            <div className="lesson-form-heading">
              <span>01</span>

              <div>
                <h2>Lesson details</h2>

                <p>
                  Give the lesson a clear name and
                  explain what students will learn.
                </p>
              </div>
            </div>

            <div className="lesson-field">
              <label htmlFor="title">
                Lesson title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                maxLength="150"
                placeholder="e.g. Meet .NET"
                value={formData.title}
                onChange={handleChange}
                className={
                  getFieldError("title")
                    ? "field-error"
                    : ""
                }
              />

              <div className="lesson-field-footer">
                <span>
                  {getFieldError("title")}
                </span>

                <small>
                  {formData.title.length}/150
                </small>
              </div>
            </div>

            <div className="lesson-field">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="5"
                maxLength="1000"
                placeholder="e.g. Discover what .NET is, what it contains and how your code runs."
                value={formData.description}
                onChange={handleChange}
                className={
                  getFieldError("description")
                    ? "field-error"
                    : ""
                }
              />

              <div className="lesson-field-footer">
                <span>
                  {getFieldError(
                    "description"
                  )}
                </span>

                <small>
                  {
                    formData.description
                      .length
                  }
                  /1000
                </small>
              </div>
            </div>
          </div>

          {/* Appearance */}

          <div className="lesson-form-section">
            <div className="lesson-form-heading">
              <span>02</span>

              <div>
                <h2>Appearance</h2>

                <p>
                  Choose an icon that helps students
                  recognise the lesson.
                </p>
              </div>
            </div>

            <div className="lesson-field">
              <label htmlFor="icon">
                Lesson icon
              </label>

              <div className="lesson-icon-row">
                <input
                  id="icon"
                  name="icon"
                  type="text"
                  maxLength="20"
                  value={formData.icon}
                  onChange={handleChange}
                />

                <div className="lesson-icon-preview">
                  {formData.icon || "📖"}
                </div>
              </div>

              {getFieldError("icon") && (
                <span className="lesson-validation-error">
                  {getFieldError("icon")}
                </span>
              )}

              <div className="lesson-icon-suggestions">
                {[
                  "📖",
                  "💡",
                  "⚙️",
                  "⌨️",
                  "💻",
                  "📦",
                  "🔀",
                  "🔁",
                ].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={
                      formData.icon === icon
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setFormData(
                        (current) => ({
                          ...current,
                          icon,
                        })
                      )
                    }
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status */}

          <div className="lesson-form-section">
            <div className="lesson-form-heading">
              <span>03</span>

              <div>
                <h2>Lesson status</h2>

                <p>
                  Keep the lesson as a draft while
                  you add its topics and content.
                </p>
              </div>
            </div>

            <div className="lesson-status-options">
              <label
                className={`lesson-status-option ${
                  formData.status === "draft"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={
                    formData.status === "draft"
                  }
                  onChange={handleChange}
                />

                <span className="status-icon">
                  📝
                </span>

                <div>
                  <strong>Draft</strong>

                  <p>
                    Continue building before making
                    the lesson available.
                  </p>
                </div>
              </label>

              <label
                className={`lesson-status-option ${
                  formData.status ===
                  "published"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={
                    formData.status ===
                    "published"
                  }
                  onChange={handleChange}
                />

                <span className="status-icon">
                  🚀
                </span>

                <div>
                  <strong>Published</strong>

                  <p>
                    Mark this lesson as ready for
                    students.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}

          <div className="create-lesson-actions">
            <button
              type="button"
              className="lesson-cancel-button"
              disabled={isSubmitting}
              onClick={() =>
                navigate(
                  `/teacher/courses/${courseId}`
                )
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="lesson-create-button"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span className="lesson-button-spinner" />
              )}

              {isSubmitting
                ? "Creating..."
                : "Create Lesson"}
            </button>
          </div>
        </div>

        {/* Preview */}

        <aside className="lesson-preview-column">
          <div className="lesson-preview-card">
            <div className="lesson-preview-label">
              LIVE PREVIEW
            </div>

            <div className="lesson-preview-icon">
              {formData.icon || "📖"}
            </div>

            <div className="lesson-preview-number">
              LESSON
            </div>

            <h3>
              {formData.title ||
                "Your Lesson Title"}
            </h3>

            <p>
              {formData.description ||
                "Your lesson description will appear here."}
            </p>

            <div className="lesson-preview-bottom">
              <span>
                📑 0 Topics
              </span>

              <span
                className={`lesson-preview-status ${formData.status}`}
              >
                {formData.status}
              </span>
            </div>
          </div>

          <div className="lesson-preview-tip">
            <span>💡</span>

            <div>
              <strong>Next step</strong>

              <p>
                After creating this lesson, we'll
                add topics such as "What is .NET?"
                and "How Your Code Runs".
              </p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

export default CreateLessonPage;