import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiRequest } from "../../api/client";
import LearningBlockRenderer from "../../components/learning/block-component-settings/LearningBlockRenderer";
import MascotIntro from "../../components/learning/shared/MascotIntro";
import { useAuth } from "../../context/AuthContext";
import { lessonColor } from "../../lib/lessonColors";

import "../../styles/adventure-land.css";
import "../../styles/pages/course-builder.css";
import "../../styles/pages/course-player.css";

/*
 * The course player: a published course as students learn it.
 *
 *   /student/courses/:courseId                  -> course overview
 *   /student/courses/:courseId/topics/:topicId  -> one topic
 *
 * Same look as the teacher's course builder (it shares its layout
 * classes and the lesson colours) without the editing tools.
 */

const friendlyError = (requestError, what) => {
  if (!requestError.status) return "Unable to connect to the server. Please try again.";
  if (requestError.status === 404) return `This ${what} isn't available.`;
  if (requestError.status >= 500) return `Couldn't load this ${what} right now. Please try again.`;
  return requestError.message;
};

const HIDE_KEY = "mentorxn-course-index-hidden";

const isPhone = () => window.matchMedia("(max-width: 860px)").matches;

/* Remembered per device; storage can be blocked, so never rely on it. */
function readIndexHidden() {
  try {
    return localStorage.getItem(HIDE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveIndexHidden(hidden) {
  try {
    localStorage.setItem(HIDE_KEY, hidden ? "1" : "0");
  } catch {
    // Fine: it just won't be remembered next time.
  }
}

/* Left-hand course index: lessons as coloured sections, topics as links. */
function PlayerOutline({ course, currentTopicId, onNavigate, onHide }) {
  return (
    <div className="mx-outline">
      <div className="mx-player__index-head">
        <Link className="mx-back-link" to="/student/courses">
          ← All courses
        </Link>
        <button
          type="button"
          className="mx-btn mx-btn--ghost mx-btn--sm"
          onClick={onHide}
          aria-controls="course-outline"
          title="Hide the course index"
        >
          « Hide
        </button>
      </div>

      <Link className="mx-outline__course mx-player__course-link" to={`/student/courses/${course.id}`} onClick={onNavigate}>
        <span className="mx-outline__course-icon" aria-hidden="true">
          {course.icon || "📘"}
        </span>
        <div className="mx-grow">
          <div className="mx-outline__course-title">
            <h2>{course.title}</h2>
          </div>
          <span className="mx-hint">
            {course.lessons_count} lesson{course.lessons_count === 1 ? "" : "s"} · {course.topics_count} topic
            {course.topics_count === 1 ? "" : "s"}
          </span>
        </div>
      </Link>

      {course.lessons.map((lesson, index) => (
        <section key={lesson.id} className="mx-world" style={{ "--mx-wc": lessonColor(index) }}>
          <div className="mx-world__head">
            <span className="mx-world__title mx-player__lesson-title">
              <span aria-hidden="true">{lesson.icon || "📖"}</span> {lesson.title}
            </span>
          </div>

          {lesson.topics.length === 0 && <p className="mx-hint mx-player__no-topics">Coming soon</p>}

          {lesson.topics.map((topic) => {
            const isActive = topic.id === currentTopicId;

            return (
              <div key={topic.id} className={`mx-navi${isActive ? " is-active" : ""}`}>
                <Link
                  className="mx-navi__main"
                  to={`/student/courses/${course.id}/topics/${topic.id}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={onNavigate}
                >
                  <span className="mx-navi__icon" aria-hidden="true">
                    {topic.icon || "📑"}
                  </span>
                  <span className="mx-navi__title">{topic.title}</span>
                </Link>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function CoursePlayerPage() {
  const { courseId, topicId } = useParams();
  const { token } = useAuth();

  const [course, setCourse] = useState(null);
  const [courseError, setCourseError] = useState("");

  // { id, topic, blocks } for the topic in the URL, or an error.
  const [topicState, setTopicState] = useState({ id: null, topic: null, blocks: [], error: "" });

  // Phones: the index is a drawer (closed until opened).
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  // Wider screens: the index is a column the student can hide.
  const [isIndexHidden, setIsIndexHidden] = useState(readIndexHidden);

  const showIndex = () => {
    if (isPhone()) {
      setIsOutlineOpen(true);
    } else {
      setIsIndexHidden(false);
      saveIndexHidden(false);
    }
  };

  const hideIndex = () => {
    if (isPhone()) {
      setIsOutlineOpen(false);
    } else {
      setIsIndexHidden(true);
      saveIndexHidden(true);
    }
  };

  /* ---------- load the course outline ---------- */
  useEffect(() => {
    let ignore = false;

    apiRequest(`/api/student/courses/${courseId}`, { token })
      .then((data) => {
        if (!ignore) {
          setCourse(data?.course ?? null);
          setCourseError("");
        }
      })
      .catch((requestError) => {
        if (!ignore) setCourseError(friendlyError(requestError, "course"));
      });

    return () => {
      ignore = true;
    };
  }, [courseId, token]);

  /* ---------- load the topic in the URL ---------- */
  useEffect(() => {
    if (!topicId) return undefined;
    let ignore = false;

    apiRequest(`/api/student/topics/${topicId}`, { token })
      .then((data) => {
        if (!ignore) {
          setTopicState({ id: topicId, topic: data?.topic ?? null, blocks: data?.learning_blocks ?? [], error: "" });
          window.scrollTo({ top: 0 });
        }
      })
      .catch((requestError) => {
        if (!ignore) setTopicState({ id: topicId, topic: null, blocks: [], error: friendlyError(requestError, "topic") });
      });

    return () => {
      ignore = true;
    };
  }, [topicId, token]);

  /* Every topic in order, with its lesson, for Previous / Next. */
  const allTopics = useMemo(
    () =>
      (course?.lessons ?? []).flatMap((lesson, lessonIndex) =>
        lesson.topics.map((topic) => ({ lesson, lessonIndex, topic }))
      ),
    [course]
  );

  /* ---------- loading / error ---------- */
  if (courseError) {
    return (
      <div className="mx-page mx-builder-state">
        <div className="mx-empty">
          <span className="mx-empty__emoji" aria-hidden="true">
            🧭
          </span>
          <h2>Course not available</h2>
          <p>{courseError}</p>
          <Link className="mx-btn" to="/student/courses">
            ← Back to courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-page mx-builder-state">
        <p className="mx-hint">Loading the course…</p>
      </div>
    );
  }

  const position = topicId ? allTopics.findIndex((entry) => String(entry.topic.id) === String(topicId)) : -1;
  const current = position >= 0 ? allTopics[position] : null;
  const previous = position > 0 ? allTopics[position - 1] : null;
  const next = position >= 0 && position < allTopics.length - 1 ? allTopics[position + 1] : null;
  const first = allTopics[0] ?? null;

  const accent = current ? lessonColor(current.lessonIndex) : course.accent_color || lessonColor(0);
  const topicLink = (entry) => `/student/courses/${course.id}/topics/${entry.topic.id}`;

  const isTopicLoading = topicId && String(topicState.id) !== String(topicId);
  const topic = topicState.topic;

  return (
    <div className={`mx-page mx-builder mx-player${isIndexHidden ? " is-index-hidden" : ""}`}>
      <div
        className={`mx-builder__scrim${isOutlineOpen ? " is-open" : ""}`}
        onClick={() => setIsOutlineOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="course-outline"
        className={`mx-builder__nav${isOutlineOpen ? " is-open" : ""}`}
        aria-label="Course outline"
      >
        <PlayerOutline
          course={course}
          currentTopicId={current?.topic.id}
          onNavigate={() => setIsOutlineOpen(false)}
          onHide={hideIndex}
        />
      </aside>

      <div className="mx-builder__main">
        <button
          type="button"
          className="mx-btn mx-btn--ghost mx-btn--sm mx-builder__menu"
          aria-controls="course-outline"
          aria-expanded={isOutlineOpen}
          onClick={showIndex}
        >
          ☰ Course index
        </button>

        <article className="lesson mx-builder__lesson" style={{ "--w": accent, "--lesson-accent": accent }}>
          {!topicId ? (
            /* ---------- course overview ---------- */
            <>
              <div className="crumb">
                {[course.category, course.level, course.teacher_name && `by ${course.teacher_name}`]
                  .filter(Boolean)
                  .join(" · ")}
              </div>

              <h1>
                <span className="t">
                  {course.icon || "📘"} {course.title}
                </span>
              </h1>

              {course.description && <MascotIntro icon={course.icon || "🦊"} text={course.description} />}

              <h2 className="mx-player__section-title">What you&apos;ll learn</h2>
              <ol className="mx-player__lessons">
                {course.lessons.map((lesson, index) => (
                  <li key={lesson.id} className="mx-player__lesson" style={{ "--mx-wc": lessonColor(index) }}>
                    <span className="mx-player__lesson-num">{index + 1}</span>
                    <div className="mx-grow">
                      <b>
                        {lesson.icon || "📖"} {lesson.title}
                      </b>
                      {lesson.description && <p className="mx-hint">{lesson.description}</p>}
                      <span className="mx-hint">
                        {lesson.topics.length
                          ? `${lesson.topics.length} topic${lesson.topics.length === 1 ? "" : "s"}`
                          : "Coming soon"}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>

              {first ? (
                <Link className="mx-btn mx-player__start" to={topicLink(first)}>
                  ▶ Start the course
                </Link>
              ) : (
                <p className="mx-hint">This course has no topics yet — check back soon.</p>
              )}
            </>
          ) : isTopicLoading ? (
            <p className="mx-hint mx-builder__loading">Loading the topic…</p>
          ) : topicState.error || !topic || !current ? (
            <div className="mx-empty">
              <span className="mx-empty__emoji" aria-hidden="true">
                🧭
              </span>
              <h2>Topic not available</h2>
              <p>{topicState.error || "This topic isn't part of the course."}</p>
              <Link className="mx-btn" to={`/student/courses/${course.id}`}>
                ← Course overview
              </Link>
            </div>
          ) : (
            /* ---------- a topic ---------- */
            <>
              <div className="crumb">
                {course.title} · {current.lesson.title} · topic {position + 1} of {allTopics.length}
              </div>

              <h1>
                <span className="t">
                  {topic.icon || "📑"} {topic.title}
                </span>
              </h1>

              {topic.introduction && <MascotIntro icon={course.icon || "🦊"} text={topic.introduction} />}

              {topicState.blocks.length > 0 ? (
                <div className="mx-player__blocks">
                  {topicState.blocks.map((block) => (
                    <LearningBlockRenderer key={block.id} block={block} />
                  ))}
                </div>
              ) : (
                <p className="mx-hint mx-player__empty">Nothing to do in this topic yet.</p>
              )}

              <nav className="mx-builder__pager" aria-label="Topics">
                {previous ? (
                  <Link className="mx-btn mx-btn--ghost" to={topicLink(previous)} title={previous.topic.title}>
                    ← Previous topic
                  </Link>
                ) : (
                  <Link className="mx-btn mx-btn--ghost" to={`/student/courses/${course.id}`}>
                    ← Course overview
                  </Link>
                )}

                {next ? (
                  <Link className="mx-btn" to={topicLink(next)} title={next.topic.title}>
                    Next topic →
                  </Link>
                ) : (
                  <Link className="mx-btn" to="/student/courses">
                    🏁 Finish course
                  </Link>
                )}
              </nav>
            </>
          )}
        </article>
      </div>
    </div>
  );
}

export default CoursePlayerPage;
