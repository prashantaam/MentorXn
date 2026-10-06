import { Link } from "react-router-dom";

import StatusTag from "../courses/StatusTag";

/*
 * Left-hand outline of the course builder: each lesson is a coloured
 * section ("world") and its topics are the items you navigate between.
 * Purely presentational — every action is a callback from the page.
 */
function CourseOutline({
  course,
  lessons,
  lessonColor,
  selectedLesson,
  selectedTopic,
  onSelectLesson,
  onSelectTopic,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
}) {
  const topicCount = lessons.reduce((sum, lesson) => sum + (lesson.topics?.length || 0), 0);

  return (
    <div className="mx-outline">
      <Link className="mx-back-link" to="/teacher/courses">
        ← My courses
      </Link>

      <div className="mx-outline__course">
        <span className="mx-outline__course-icon" aria-hidden="true">
          {course.icon || "📘"}
        </span>
        <div className="mx-grow">
          <div className="mx-outline__course-title">
            <h2>{course.title}</h2>
            <Link
              className="mx-mini-btn"
              to={`/teacher/courses/${course.id}/edit`}
              aria-label="Edit course details"
              title="Edit course details (title, colour, icon…)"
            >
              ✏️
            </Link>
          </div>
          <div className="mx-outline__course-meta">
            <StatusTag status={course.status} />
            <span className="mx-hint">
              {lessons.length} lesson{lessons.length === 1 ? "" : "s"} · {topicCount} topic
              {topicCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      {lessons.length === 0 && (
        <p className="mx-hint mx-outline__empty">No lessons yet — add one to start building.</p>
      )}

      {lessons.map((lesson, index) => {
        const isLessonActive = selectedLesson?.id === lesson.id && !selectedTopic;

        return (
          <section key={lesson.id} className="mx-world" style={{ "--mx-wc": lessonColor(index) }}>
            <div className="mx-world__head">
              <button
                type="button"
                className={`mx-world__title${isLessonActive ? " is-active" : ""}`}
                onClick={() => onSelectLesson(lesson)}
                aria-current={isLessonActive ? "page" : undefined}
              >
                <span aria-hidden="true">{lesson.icon || "📖"}</span> {lesson.title}
              </button>

              <span className="mx-world__actions">
                <button
                  type="button"
                  className="mx-mini-btn"
                  onClick={() => onEditLesson(lesson)}
                  aria-label={`Edit lesson ${lesson.title}`}
                  title="Edit lesson"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="mx-mini-btn"
                  onClick={() => onDeleteLesson(lesson)}
                  aria-label={`Delete lesson ${lesson.title}`}
                  title="Delete lesson"
                >
                  🗑️
                </button>
              </span>
            </div>

            {(lesson.topics || []).map((topic) => {
              const isActive = selectedTopic?.id === topic.id;

              return (
                <div key={topic.id} className={`mx-navi${isActive ? " is-active" : ""}`}>
                  <button
                    type="button"
                    className="mx-navi__main"
                    onClick={() => onSelectTopic(lesson, topic)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="mx-navi__icon" aria-hidden="true">
                      {topic.icon || "📑"}
                    </span>
                    <span className="mx-navi__title">{topic.title}</span>
                  </button>

                  <span className="mx-navi__actions">
                    <button
                      type="button"
                      className="mx-mini-btn"
                      onClick={() => onEditTopic(lesson, topic)}
                      aria-label={`Edit topic ${topic.title}`}
                      title="Edit topic"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="mx-mini-btn"
                      onClick={() => onDeleteTopic(lesson, topic)}
                      aria-label={`Delete topic ${topic.title}`}
                      title="Delete topic"
                    >
                      🗑️
                    </button>
                  </span>
                </div>
              );
            })}

            <button type="button" className="mx-outline__add-topic" onClick={() => onAddTopic(lesson)}>
              ＋ Add topic
            </button>
          </section>
        );
      })}

      <button type="button" className="mx-btn mx-btn--sm mx-outline__add-lesson" onClick={onAddLesson}>
        ➕ Add lesson
      </button>
    </div>
  );
}

export default CourseOutline;
