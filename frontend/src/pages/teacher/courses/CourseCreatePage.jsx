import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import "../../../styles/teachers/create-course.css";

function CreateCoursePage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Development",
    level: "Beginner",
    status: "draft",
    icon: "🚀",
    accentColor: "#ff9a8b",
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    /*
     * Remove the validation error for the field
     * once the teacher starts changing it.
     */
    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));

    setGeneralError("");
  };

  const handleCancel = () => {
    navigate("/teacher/courses");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrors({});
    setGeneralError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/teacher/courses",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            level: formData.level,
            status: formData.status,
            icon: formData.icon,
            accent_color: formData.accentColor,
          }),
        }
      );

      const data = await response.json();

      /*
       * Laravel validation errors.
       */
      if (response.status === 422) {
        setErrors(data.errors || {});

        setGeneralError(
          data.message ||
            "Please check the course details and try again."
        );

        return;
      }

      /*
       * Authentication problem.
       */
      if (response.status === 401) {
        setGeneralError(
          "Your login session is no longer valid. Please sign in again."
        );

        return;
      }

      /*
       * Teacher authorisation problem.
       */
      if (response.status === 403) {
        setGeneralError(
          data.message ||
            "You do not have permission to create courses."
        );

        return;
      }

      /*
       * Other server/API errors.
       */
      if (!response.ok) {
        setGeneralError(
          data.message ||
            "Unable to create the course. Please try again."
        );

        return;
      }

      /*
       * Course created successfully.
       */
      navigate("/teacher/courses", {
        replace: true,

        state: {
          successMessage:
            data.message || "Course created successfully.",
          createdCourse: data.course,
        },
      });
    } catch (error) {
      console.error("Create course error:", error);

      setGeneralError(
        "Unable to connect to the server. Please make sure the Laravel API is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field) => {
    if (!errors[field]) {
      return null;
    }

    return Array.isArray(errors[field])
      ? errors[field][0]
      : errors[field];
  };

  return (
    <div className="create-course-page">
      {/* =====================================
          Back
      ===================================== */}

      <div className="create-course-back-row">
        <button
          type="button"
          className="create-course-back"
          onClick={handleCancel}
        >
          <span>←</span>
          Back to Courses
        </button>
      </div>

      {/* =====================================
          Page Header
      ===================================== */}

      <section className="create-course-header">
        <div>
          <div className="create-course-eyebrow">
            ✨ NEW LEARNING ADVENTURE
          </div>

          <h1>Create a Course</h1>

          <p>
            Start with the basic details. You can add
            worlds, lessons and interactive learning
            activities after creating the course.
          </p>
        </div>

        <div className="create-course-header-icon">
          📚
        </div>
      </section>

      {/* =====================================
          General API Error
      ===================================== */}

      {generalError && (
        <div className="create-course-error-banner">
          <span>⚠️</span>

          <div>
            <strong>Unable to create course</strong>
            <p>{generalError}</p>
          </div>
        </div>
      )}

      {/* =====================================
          Form
      ===================================== */}

      <form
        className="create-course-form"
        onSubmit={handleSubmit}
      >
        <div className="create-course-layout">
          {/* =================================
              Main Form
          ================================= */}

          <div className="create-course-main">
            {/* Course Details */}

            <section className="course-form-card">
              <div className="course-form-card-heading">
                <div className="course-form-number">
                  1
                </div>

                <div>
                  <h2>Course details</h2>

                  <p>
                    Tell students what they are going
                    to learn.
                  </p>
                </div>
              </div>

              <div className="course-form-fields">
                <div className="course-field">
                  <label htmlFor="course-title">
                    Course title
                    <span>*</span>
                  </label>

                  <input
                    id="course-title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. .NET Adventure Land"
                    maxLength={120}
                    required
                    className={
                      getFieldError("title")
                        ? "field-error"
                        : ""
                    }
                  />

                  {getFieldError("title") ? (
                    <div className="course-validation-error">
                      {getFieldError("title")}
                    </div>
                  ) : (
                    <div className="course-field-help">
                      <span>
                        Give your course a clear,
                        memorable name.
                      </span>

                      <span>
                        {formData.title.length}/120
                      </span>
                    </div>
                  )}
                </div>

                <div className="course-field">
                  <label htmlFor="course-description">
                    Short description
                    <span>*</span>
                  </label>

                  <textarea
                    id="course-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="e.g. Learn .NET Core through interactive adventures, visual explanations and hands-on challenges."
                    rows="5"
                    maxLength={500}
                    required
                    className={
                      getFieldError("description")
                        ? "field-error"
                        : ""
                    }
                  />

                  {getFieldError("description") ? (
                    <div className="course-validation-error">
                      {getFieldError("description")}
                    </div>
                  ) : (
                    <div className="course-field-help">
                      <span>
                        This will appear on the course
                        card for students.
                      </span>

                      <span>
                        {formData.description.length}/500
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Course Classification */}

            <section className="course-form-card">
              <div className="course-form-card-heading">
                <div className="course-form-number">
                  2
                </div>

                <div>
                  <h2>Course classification</h2>

                  <p>
                    Help students understand the
                    subject and difficulty.
                  </p>
                </div>
              </div>

              <div className="course-form-fields">
                <div className="course-field-grid">
                  <div className="course-field">
                    <label htmlFor="course-category">
                      Category
                    </label>

                    <select
                      id="course-category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={
                        getFieldError("category")
                          ? "field-error"
                          : ""
                      }
                    >
                      <option value="Development">
                        Development
                      </option>

                      <option value="Data">
                        Data & Analytics
                      </option>

                      <option value="Cloud">
                        Cloud & DevOps
                      </option>

                      <option value="AI">
                        AI & Machine Learning
                      </option>

                      <option value="Language">
                        Language Learning
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>

                    {getFieldError("category") && (
                      <div className="course-validation-error">
                        {getFieldError("category")}
                      </div>
                    )}
                  </div>

                  <div className="course-field">
                    <label htmlFor="course-level">
                      Level
                    </label>

                    <select
                      id="course-level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className={
                        getFieldError("level")
                          ? "field-error"
                          : ""
                      }
                    >
                      <option value="Beginner">
                        Beginner
                      </option>

                      <option value="Intermediate">
                        Intermediate
                      </option>

                      <option value="Advanced">
                        Advanced
                      </option>
                    </select>

                    {getFieldError("level") && (
                      <div className="course-validation-error">
                        {getFieldError("level")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Course Appearance */}

            <section className="course-form-card">
              <div className="course-form-card-heading">
                <div className="course-form-number">
                  3
                </div>

                <div>
                  <h2>Course appearance</h2>

                  <p>
                    Give the learning adventure its
                    own personality.
                  </p>
                </div>
              </div>

              <div className="course-form-fields">
                <div className="course-field-grid">
                  <div className="course-field">
                    <label htmlFor="course-icon">
                      Course icon
                    </label>

                    <input
                      id="course-icon"
                      name="icon"
                      type="text"
                      value={formData.icon}
                      onChange={handleChange}
                      placeholder="🚀"
                      maxLength={10}
                      className={
                        getFieldError("icon")
                          ? "field-error"
                          : ""
                      }
                    />

                    {getFieldError("icon") ? (
                      <div className="course-validation-error">
                        {getFieldError("icon")}
                      </div>
                    ) : (
                      <div className="course-field-help">
                        <span>
                          You can use an emoji for now.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="course-field">
                    <label htmlFor="accent-color">
                      Accent colour
                    </label>

                    <div className="course-colour-control">
                      <input
                        id="accent-color"
                        name="accentColor"
                        type="color"
                        value={formData.accentColor}
                        onChange={handleChange}
                      />

                      <span>
                        {formData.accentColor}
                      </span>
                    </div>

                    {getFieldError("accent_color") && (
                      <div className="course-validation-error">
                        {getFieldError("accent_color")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* =================================
              Sidebar
          ================================= */}

          <aside className="create-course-sidebar">
            {/* Live Preview */}

            <section className="course-preview-card">
              <div className="course-preview-label">
                LIVE PREVIEW
              </div>

              <div
                className="course-preview-banner"
                style={{
                  background: formData.accentColor,
                }}
              >
                <span>
                  {formData.icon || "🚀"}
                </span>
              </div>

              <div className="course-preview-content">
                <div className="course-preview-meta">
                  <span>
                    {formData.category}
                  </span>

                  <span>
                    {formData.level}
                  </span>
                </div>

                <h3>
                  {formData.title ||
                    "Your Course Title"}
                </h3>

                <p>
                  {formData.description ||
                    "Your course description will appear here as you type."}
                </p>

                <div className="course-preview-footer">
                  <span>0 Worlds</span>
                  <span>0 Lessons</span>
                </div>
              </div>
            </section>

            {/* Course Status */}

            <section className="course-publish-card">
              <div>
                <h3>Course status</h3>

                <p>
                  Keep the course private while you
                  build the learning content.
                </p>
              </div>

              <label
                className={`course-status-option ${
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

                <div>
                  <strong>📝 Draft</strong>

                  <span>
                    Only you can see the course.
                  </span>
                </div>
              </label>

              <label
                className={`course-status-option ${
                  formData.status === "published"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={
                    formData.status === "published"
                  }
                  onChange={handleChange}
                />

                <div>
                  <strong>🚀 Published</strong>

                  <span>
                    Make the course available to
                    students.
                  </span>
                </div>
              </label>

              <div className="course-status-note">
                💡 For your first course, keeping it as
                a draft while building the lessons is
                recommended.
              </div>
            </section>
          </aside>
        </div>

        {/* =====================================
            Actions
        ===================================== */}

        <div className="create-course-actions">
          <button
            type="button"
            className="course-cancel-button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="course-create-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="course-button-spinner" />
                Creating...
              </>
            ) : (
              <>
                Create Course
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCoursePage;