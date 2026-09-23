import {
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import "../../../styles/create-topic.css";

function CreateTopicPage() {
  const navigate = useNavigate();

  const {
    courseId,
    lessonId,
  } = useParams();

  const { token } = useAuth();

  const [formData, setFormData] =
    useState({
      title: "",
      icon: "📑",
      description: "",
      status: "draft",
    });

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [validationErrors, setValidationErrors] =
    useState({});

  /* =========================================
     Emoji Suggestions
  ========================================= */

  const iconSuggestions = [
    "📑",
    "🌐",
    "💡",
    "⚙️",
    "⌨️",
    "💻",
    "📦",
    "🔷",
    "🔀",
    "🔁",
  ];

  /* =========================================
     Input Change
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

    /*
     * Remove validation error as soon
     * as the teacher changes the field.
     */
    if (validationErrors[name]) {
      setValidationErrors(
        (current) => {
          const updated = {
            ...current,
          };

          delete updated[name];

          return updated;
        }
      );
    }
  };

  /* =========================================
     Select Icon
  ========================================= */

  const handleIconSelect = (icon) => {
    setFormData((current) => ({
      ...current,
      icon,
    }));
  };

  /* =========================================
     Cancel
  ========================================= */

  const handleCancel = () => {
    navigate(
      `/teacher/courses/${courseId}/lessons/${lessonId}`
    );
  };

  /* =========================================
     Submit
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError("");
    setValidationErrors({});

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/teacher/lessons/${lessonId}/topics`,
        {
          method: "POST",

          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            title:
              formData.title.trim(),

            icon:
              formData.icon.trim(),

            description:
              formData.description.trim(),

            status:
              formData.status,
          }),
        }
      );

      const data =
        await response.json();

      /* =====================================
         Validation Errors
      ===================================== */

      if (
        response.status === 422
      ) {
        setValidationErrors(
          data.errors || {}
        );

        setError(
          data.message ||
            "Please check the form and try again."
        );

        return;
      }

      /* =====================================
         Other API Errors
      ===================================== */

      if (!response.ok) {
        if (response.status === 401) {
          setError(
            "Your session has expired. Please sign in again."
          );
        } else if (
          response.status === 403
        ) {
          setError(
            "You do not have permission to create a topic."
          );
        } else if (
          response.status === 404
        ) {
          setError(
            "The lesson could not be found."
          );
        } else {
          setError(
            data.message ||
              "Unable to create the topic."
          );
        }

        return;
      }

      /* =====================================
         Success
      ===================================== */

      navigate(
        `/teacher/courses/${courseId}/lessons/${lessonId}`,
        {
          replace: true,

          state: {
            successMessage:
              data.message ||
              "Topic created successfully.",
          },
        }
      );
    } catch (requestError) {
      console.error(
        "Create topic error:",
        requestError
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================
     Page
  ========================================= */

  return (
    <div className="create-topic-page">
      {/* =====================================
          Back
      ===================================== */}

      <button
        type="button"
        className="create-topic-back"
        onClick={handleCancel}
      >
        ← Back to Lesson
      </button>

      {/* =====================================
          Heading
      ===================================== */}

      <section className="create-topic-heading">
        <div>
          <div className="create-topic-eyebrow">
            TOPIC BUILDER
          </div>

          <h1>
            Create a new topic
          </h1>

          <p>
            Add a focused learning topic to
            this lesson. Later you will add
            explanations, visualisations,
            interactive activities, quizzes
            and practice as learning blocks.
          </p>
        </div>
      </section>

      {/* =====================================
          Error
      ===================================== */}

      {error && (
        <div className="create-topic-error">
          <span>⚠️</span>

          <div>
            <strong>
              Unable to create topic
            </strong>

            <p>{error}</p>
          </div>
        </div>
      )}

      {/* =====================================
          Content
      ===================================== */}

      <div className="create-topic-layout">
        {/* =================================
            Form
        ================================= */}

        <form
          className="create-topic-form"
          onSubmit={handleSubmit}
        >
          {/* Title */}

          <div className="create-topic-field">
            <label htmlFor="title">
              Topic title
              <span>*</span>
            </label>

            <p>
              Give this topic a clear,
              focused learning objective.
            </p>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. What is .NET?"
              maxLength={150}
              autoFocus
            />

            {validationErrors.title && (
              <div className="create-topic-field-error">
                {
                  validationErrors
                    .title[0]
                }
              </div>
            )}
          </div>

          {/* Icon */}

          <div className="create-topic-field">
            <label htmlFor="icon">
              Topic icon
            </label>

            <p>
              Choose an icon that helps
              students recognise the topic.
            </p>

            <div className="create-topic-icon-row">
              <div className="create-topic-icon-preview">
                {formData.icon ||
                  "📑"}
              </div>

              <input
                id="icon"
                name="icon"
                type="text"
                value={formData.icon}
                onChange={handleChange}
                maxLength={20}
                placeholder="📑"
              />
            </div>

            <div className="create-topic-icon-suggestions">
              {iconSuggestions.map(
                (icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={
                      formData.icon ===
                      icon
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      handleIconSelect(
                        icon
                      )
                    }
                  >
                    {icon}
                  </button>
                )
              )}
            </div>

            {validationErrors.icon && (
              <div className="create-topic-field-error">
                {
                  validationErrors
                    .icon[0]
                }
              </div>
            )}
          </div>

          {/* Description */}

          <div className="create-topic-field">
            <label htmlFor="description">
              Description
            </label>

            <p>
              Briefly explain what the
              student will learn in this
              topic.
            </p>

            <textarea
              id="description"
              name="description"
              value={
                formData.description
              }
              onChange={handleChange}
              placeholder="e.g. Understand what .NET is, what problems it solves, and the main parts of the .NET platform."
              rows={5}
              maxLength={1000}
            />

            <div className="create-topic-character-count">
              {
                formData.description
                  .length
              }
              /1000
            </div>

            {validationErrors.description && (
              <div className="create-topic-field-error">
                {
                  validationErrors
                    .description[0]
                }
              </div>
            )}
          </div>

          {/* Status */}

          <div className="create-topic-field">
            <label htmlFor="status">
              Status
            </label>

            <p>
              Keep the topic as a draft
              while you are building its
              learning blocks.
            </p>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">
                Draft
              </option>

              <option value="published">
                Published
              </option>
            </select>

            {validationErrors.status && (
              <div className="create-topic-field-error">
                {
                  validationErrors
                    .status[0]
                }
              </div>
            )}
          </div>

          {/* Actions */}

          <div className="create-topic-actions">
            <button
              type="button"
              className="create-topic-cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-topic-submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating..."
                : "Create Topic"}
            </button>
          </div>
        </form>

        {/* =================================
            Preview
        ================================= */}

        <aside className="create-topic-preview">
          <div className="create-topic-preview-label">
            LIVE PREVIEW
          </div>

          <h2>
            Student topic card
          </h2>

          <p className="create-topic-preview-help">
            This gives you a quick idea of
            how the topic will appear in
            the learning structure.
          </p>

          <div className="create-topic-preview-card">
            <div className="create-topic-preview-icon">
              {formData.icon ||
                "📑"}
            </div>

            <div className="create-topic-preview-content">
              <div className="create-topic-preview-top">
                <span>
                  TOPIC
                </span>

                <span
                  className={`create-topic-preview-status ${formData.status}`}
                >
                  {formData.status}
                </span>
              </div>

              <h3>
                {formData.title ||
                  "Your topic title"}
              </h3>

              <p>
                {formData.description ||
                  "Your topic description will appear here."}
              </p>

              <div className="create-topic-preview-meta">
                <span>
                  ✨ 0 Learning Blocks
                </span>
              </div>
            </div>
          </div>

          <div className="create-topic-tip">
            <span>💡</span>

            <div>
              <strong>
                Keep topics focused
              </strong>

              <p>
                A topic should teach one
                clear concept. Use learning
                blocks inside the topic for
                explanation, demonstration,
                interaction and assessment.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CreateTopicPage;