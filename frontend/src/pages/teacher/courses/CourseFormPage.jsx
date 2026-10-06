import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { apiRequest, fieldErrors } from "../../../api/client";
import CourseCard from "../../../components/courses/CourseCard";
import LessonOutlineEditor from "../../../components/courses/LessonOutlineEditor";
import FormField from "../../../components/forms/FormField";
import { useAuth } from "../../../context/AuthContext";
import { newLesson } from "../../../lib/lessonOutline";
import {
  ACCENT_COLORS,
  COURSE_CATEGORIES,
  COURSE_LEVELS,
  DESCRIPTION_MAX,
  QUICK_ICONS,
  TITLE_MAX,
} from "../../../data/courseOptions";

import "../../../styles/pages/create-course.css";

// Where the back link, Cancel and (when editing) Save all return to.
const LIST_PATH = "/teacher/courses";

const STATUS_OPTIONS = [
  { value: "draft", label: "📝 Draft", hint: "Only you can see it while you build." },
  { value: "published", label: "🚀 Published", hint: "Students can find and start it." },
];

function validate(values) {
  const errors = {};

  if (!values.title.trim()) errors.title = "Give your course a title.";
  if (!values.description.trim()) errors.description = "Add a short description.";

  return errors;
}

/*
 * Create a course (/teacher/courses/create) or edit one
 * (/teacher/courses/:courseId/edit). Same form either way; creating also
 * takes a lesson outline, while editing leaves lessons to the builder.
 */
function CourseFormPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { courseId } = useParams();
  const isEdit = Boolean(courseId);
  const builderPath = `/teacher/courses/${courseId}/playground`;

  const [values, setValues] = useState({
    title: "",
    description: "",
    icon: "📘",
    category: COURSE_CATEGORIES[0],
    level: COURSE_LEVELS[0],
    accent_color: ACCENT_COLORS[0].value,
    status: "draft",
  });
  const [lessons, setLessons] = useState([newLesson(), newLesson()]);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [progress, setProgress] = useState(""); // what's being saved right now

  // Edit mode: the course is loaded first.
  const [isLoadingCourse, setIsLoadingCourse] = useState(isEdit);
  const [loadError, setLoadError] = useState("");
  const [existingLessonCount, setExistingLessonCount] = useState(0);

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;

    apiRequest(`/api/teacher/courses/${courseId}`, { token })
      .then(({ course }) => {
        if (cancelled) return;
        setValues({
          title: course.title || "",
          description: course.description || "",
          icon: course.icon || "📘",
          category: course.category || COURSE_CATEGORIES[0],
          level: course.level || COURSE_LEVELS[0],
          accent_color: course.accent_color || ACCENT_COLORS[0].value,
          status: course.status || "draft",
        });
        setExistingLessonCount(course.lessons_count ?? 0);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(
          error.status ? error.message : "Unable to connect to the server. Please try again."
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCourse(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isEdit, courseId, token]);

  const isSubmitting = Boolean(progress);
  const lessonTitles = lessons.map((lesson) => lesson.title.trim()).filter(Boolean);
  const isCustomColour = !ACCENT_COLORS.some((colour) => colour.value === values.accent_color);

  // Keep a course's existing category selectable even if it's not in today's list.
  const categoryOptions = COURSE_CATEGORIES.includes(values.category)
    ? COURSE_CATEGORIES
    : [values.category, ...COURSE_CATEGORIES];

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: null }));
    setGeneralError("");
  };

  const handleChange = (event) => setField(event.target.name, event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setGeneralError("");
    const clientErrors = validate(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    const body = {
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      icon: values.icon.trim() || "📘",
    };

    const showRequestError = (error) => {
      if (error.data?.errors) {
        setErrors(fieldErrors(error.data.errors));
      } else {
        setGeneralError(
          error.status
            ? error.message
            : "Unable to connect to the server. Please try again."
        );
      }
      setProgress("");
    };

    // Editing: save, then go back to the builder.
    if (isEdit) {
      try {
        setProgress("Saving changes…");
        await apiRequest(`/api/teacher/courses/${courseId}`, { token, method: "PUT", body });
        navigate(LIST_PATH, {
          replace: true,
          state: { flash: { tone: "good", text: `"${body.title}" saved.` } },
        });
      } catch (error) {
        showRequestError(error);
      }
      return;
    }

    // 1. Create the course.
    let course;
    try {
      setProgress("Creating course…");
      const data = await apiRequest("/api/teacher/courses", { token, method: "POST", body });
      course = data.course;
    } catch (error) {
      showRequestError(error);
      return;
    }

    // 2. Add the outlined lessons, one at a time so they keep their order.
    const failed = [];
    for (const [index, title] of lessonTitles.entries()) {
      setProgress(`Adding lesson ${index + 1} of ${lessonTitles.length}…`);
      try {
        await apiRequest(`/api/teacher/courses/${course.id}/lessons`, {
          token,
          method: "POST",
          body: { title, status: "draft" },
        });
      } catch {
        failed.push(title);
      }
    }

    // The course exists either way, so never send the teacher back to this
    // form (resubmitting would create a duplicate course).
    if (failed.length) {
      navigate(LIST_PATH, {
        replace: true,
        state: {
          flash: {
            tone: "warn",
            text: `"${course.title}" was created, but ${failed.length} lesson${
              failed.length === 1 ? "" : "s"
            } couldn't be added (${failed.join(", ")}). Add ${
              failed.length === 1 ? "it" : "them"
            } in the course builder.`,
          },
        },
      });
      return;
    }

    navigate(`/teacher/courses/${course.id}/playground`, { replace: true });
  };

  const previewCourse = {
    emoji: values.icon.trim() || "📘",
    title: values.title.trim() || "Your course title",
    description:
      values.description.trim() || "A short description will appear here as you type it.",
    lessons: isEdit ? existingLessonCount : lessonTitles.length,
    hue: values.accent_color,
  };

  if (isLoadingCourse) {
    return (
      <div className="mx-page mx-create">
        <p className="mx-hint">Loading the course…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-page mx-create">
        <div className="mx-empty">
          <span className="mx-empty__emoji" aria-hidden="true">
            🧭
          </span>
          <h2>Couldn't open this course</h2>
          <p>{loadError}</p>
          <Link className="mx-btn" to={LIST_PATH}>
            ← Back to my courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-page mx-create">
      <Link className="mx-back-link" to={LIST_PATH}>
        ← Back to my courses
      </Link>

      <header className="mx-create__head">
        <h1>{isEdit ? "Edit course" : "Create a course"}</h1>
        <p className="mx-hint">
          {isEdit
            ? "Change the title, description, look or visibility. Lessons and their content are edited in the course builder."
            : "Start with the basics and a lesson outline. You'll build each lesson's interactive content next, in the course builder."}
        </p>
      </header>

      <form className="mx-create__split" onSubmit={handleSubmit} noValidate>
        <div className="mx-form-card">
          {generalError && (
            <div className="mx-feedback mx-feedback--bad" role="alert">
              {generalError}
            </div>
          )}

          {/* ---------- details ---------- */}
          <h2>📋 Course details</h2>

          <FormField
            id="course-title"
            label="Course title"
            error={errors.title}
            counter={`${values.title.length}/${TITLE_MAX}`}
          >
            <input
              name="title"
              type="text"
              placeholder="e.g. Rust Quest"
              maxLength={TITLE_MAX}
              value={values.title}
              onChange={handleChange}
            />
          </FormField>

          <FormField
            id="course-description"
            label="Short description"
            error={errors.description}
            hint="Shown to students on the course card."
            counter={`${values.description.length}/${DESCRIPTION_MAX}`}
          >
            <textarea
              name="description"
              placeholder="One or two sentences a learner would see in the catalog."
              maxLength={DESCRIPTION_MAX}
              value={values.description}
              onChange={handleChange}
            />
          </FormField>

          <div className="mx-inline-fields">
            <FormField id="course-category" label="Category" error={errors.category}>
              <select name="category" value={values.category} onChange={handleChange}>
                {categoryOptions.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </FormField>

            <FormField id="course-level" label="Level" error={errors.level}>
              <select name="level" value={values.level} onChange={handleChange}>
                {COURSE_LEVELS.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </FormField>
          </div>

          {/* ---------- look ---------- */}
          <h2>🎨 Look &amp; feel</h2>

          <FormField
            id="course-icon"
            label="Icon"
            error={errors.icon}
            hint="Any emoji — type one or pick a quick one below."
          >
            <input
              name="icon"
              type="text"
              className="mx-icon-input"
              maxLength={8}
              value={values.icon}
              onChange={handleChange}
            />
          </FormField>
          <div className="mx-quick-icons" role="group" aria-label="Quick icon picks">
            {QUICK_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                className={`mx-quick-icon${values.icon === icon ? " is-on" : ""}`}
                aria-pressed={values.icon === icon}
                aria-label={`Use ${icon} as the icon`}
                onClick={() => setField("icon", icon)}
              >
                {icon}
              </button>
            ))}
          </div>

          <div className="mx-field">
            <span className="mx-field__label" id="accent-label">
              Accent colour
            </span>
            <div className="mx-swatches" role="group" aria-labelledby="accent-label">
              {ACCENT_COLORS.map((colour) => (
                <button
                  key={colour.value}
                  type="button"
                  className={`mx-swatch${values.accent_color === colour.value ? " is-on" : ""}`}
                  style={{ background: colour.value }}
                  title={colour.name}
                  aria-label={colour.name}
                  aria-pressed={values.accent_color === colour.value}
                  onClick={() => setField("accent_color", colour.value)}
                />
              ))}

              <label
                className={`mx-swatch mx-swatch--custom${isCustomColour ? " is-on" : ""}`}
                style={isCustomColour ? { background: values.accent_color } : undefined}
                title="Custom colour"
              >
                <span aria-hidden="true">{isCustomColour ? "" : "＋"}</span>
                <input
                  type="color"
                  className="mx-visually-hidden"
                  aria-label="Pick a custom colour"
                  value={values.accent_color}
                  onChange={(event) => setField("accent_color", event.target.value)}
                />
              </label>
            </div>
            {errors.accent_color && (
              <div className="mx-field__error">{errors.accent_color}</div>
            )}
          </div>

          {/* ---------- outline (create only; edit lessons in the builder) ---------- */}
          <h2>🪜 {isEdit ? "Lessons" : "Lesson outline"}</h2>
          {isEdit ? (
            <p className="mx-hint mx-create__section-hint">
              This course has {existingLessonCount} lesson
              {existingLessonCount === 1 ? "" : "s"}. Add, rename or reorder them in
              the <Link to={builderPath}>course builder</Link>.
            </p>
          ) : (
            <>
              <p className="mx-hint mx-create__section-hint">
                Optional — just titles for now. They're created as draft lessons you
                can fill in, reorder or rename in the builder. Empty rows are skipped.
              </p>
              <LessonOutlineEditor lessons={lessons} onChange={setLessons} />
            </>
          )}

          {/* ---------- visibility ---------- */}
          <h2>🚦 Visibility</h2>
          <div className="mx-status-options" role="radiogroup" aria-label="Course visibility">
            {STATUS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`mx-status-option${values.status === option.value ? " is-on" : ""}`}
              >
                <input
                  type="radio"
                  name="status"
                  className="mx-visually-hidden"
                  value={option.value}
                  checked={values.status === option.value}
                  onChange={handleChange}
                />
                <b>{option.label}</b>
                <span className="mx-hint">{option.hint}</span>
              </label>
            ))}
          </div>
          {errors.status && <div className="mx-field__error">{errors.status}</div>}

          <div className="mx-create__actions">
            <button className="mx-btn" type="submit" disabled={isSubmitting}>
              {progress || (isEdit ? "💾 Save changes" : "🚀 Create course")}
            </button>
            <Link className="mx-btn mx-btn--ghost" to={LIST_PATH}>
              Cancel
            </Link>
          </div>
        </div>

        {/* ---------- live preview ---------- */}
        <aside className="mx-create__preview" aria-label="Live preview">
          <div className="mx-create__preview-label">Live preview</div>
          <CourseCard course={previewCourse} actionLabel={values.level} />

          {!isEdit && (
            <div className="mx-outline-preview">
              <h3>Syllabus so far</h3>
              {lessonTitles.length ? (
                <ol>
                  {lessonTitles.map((title, index) => (
                    <li key={`${index}-${title}`}>{title}</li>
                  ))}
                </ol>
              ) : (
                <p className="mx-hint">Add a lesson title to see it listed here.</p>
              )}
            </div>
          )}
        </aside>
      </form>
    </div>
  );
}

export default CourseFormPage;
