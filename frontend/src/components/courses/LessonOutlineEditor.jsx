import { LESSON_TITLE_MAX } from "../../data/courseOptions";
import { newLesson } from "../../lib/lessonOutline";

/*
 * Editable list of lesson titles: type, reorder (↑ ↓), remove (✕), add.
 * Controlled — the parent owns `lessons` (rows from newLesson()) and
 * receives every change.
 */
function LessonOutlineEditor({ lessons, onChange }) {
  const update = (index, title) =>
    onChange(lessons.map((lesson, i) => (i === index ? { ...lesson, title } : lesson)));

  const move = (index, offset) => {
    const next = [...lessons];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  };

  const remove = (index) => onChange(lessons.filter((_, i) => i !== index));

  return (
    <div className="mx-outline-editor">
      <ol className="mx-outline-editor__list">
        {lessons.map((lesson, index) => {
          const number = index + 1;

          return (
            <li key={lesson.key} className="mx-outline-editor__row">
              <span className="mx-outline-editor__num" aria-hidden="true">
                {number}.
              </span>

              <input
                type="text"
                value={lesson.title}
                maxLength={LESSON_TITLE_MAX}
                placeholder={`Lesson ${number} title`}
                aria-label={`Lesson ${number} title`}
                onChange={(event) => update(index, event.target.value)}
              />

              <button
                type="button"
                className="mx-btn mx-btn--ghost mx-btn--sm"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move lesson ${number} up`}
              >
                ↑
              </button>
              <button
                type="button"
                className="mx-btn mx-btn--ghost mx-btn--sm"
                onClick={() => move(index, 1)}
                disabled={index === lessons.length - 1}
                aria-label={`Move lesson ${number} down`}
              >
                ↓
              </button>
              <button
                type="button"
                className="mx-btn mx-btn--ghost mx-btn--sm"
                onClick={() => remove(index)}
                aria-label={`Remove lesson ${number}`}
              >
                ✕
              </button>
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        className="mx-btn mx-btn--ghost mx-btn--sm"
        onClick={() => onChange([...lessons, newLesson()])}
      >
        ➕ Add lesson
      </button>
    </div>
  );
}

export default LessonOutlineEditor;
