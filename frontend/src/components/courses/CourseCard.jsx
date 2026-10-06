import { Link } from "react-router-dom";

import { hueStyle } from "../../lib/hue";

/*
 * Course tile from the design system: emoji, title, blurb, lesson count,
 * coloured tab. Without `to` it renders as a plain card (e.g. a preview).
 * Optional: `badge` (top-right, e.g. a status tag) and `eyebrow`
 * (small line above the title, e.g. "Web Development · Beginner").
 */
function CourseCard({ course, to, actionLabel = "View course", badge, eyebrow }) {
  const Tag = to ? Link : "div";

  return (
    <Tag className="mx-course-card" to={to} style={hueStyle(course.hue)}>
      <div className="mx-course-card__top">
        <span className="mx-course-card__emoji" aria-hidden="true">
          {course.emoji}
        </span>
        {badge}
      </div>

      {eyebrow && <span className="mx-course-card__eyebrow">{eyebrow}</span>}
      <h3>{course.title}</h3>
      <p>{course.description}</p>

      <div className="mx-course-card__meta">
        <span className="mx-tag">
          {course.lessons} lesson{course.lessons === 1 ? "" : "s"}
        </span>
        <span className="mx-hint">{actionLabel}</span>
      </div>
    </Tag>
  );
}

export default CourseCard;
