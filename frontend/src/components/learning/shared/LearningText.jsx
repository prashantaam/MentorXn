import React from "react";

/*
 * =========================================================
 * MentorXn - Global Learning Text Renderer
 * =========================================================
 *
 * Supported teacher-authored formatting:
 *
 * **bold**
 * `inline code`
 * [[label]]
 *
 * Example:
 *
 * An **algorithm** is a set of instructions.
 * A computer executes `code`.
 * Think of it as a [[recipe]].
 *
 * =========================================================
 */

function parseInlineText(text, keyPrefix) {
  if (!text) {
    return null;
  }

  /*
   * Match:
   *
   * **bold**
   * `code`
   * [[label]]
   */
  const pattern =
    /(\*\*[^*]+\*\*|`[^`]+`|\[\[[^\]]+\]\])/g;

  const parts = String(text).split(pattern);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    /*
     * Bold
     */
    if (
      part.startsWith("**") &&
      part.endsWith("**")
    ) {
      return (
        <strong
          key={key}
          className="learning-text-bold"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    /*
     * Inline code
     */
    if (
      part.startsWith("`") &&
      part.endsWith("`")
    ) {
      return (
        <code
          key={key}
          className="learning-text-code"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    /*
     * Label / chip
     */
    if (
      part.startsWith("[[") &&
      part.endsWith("]]")
    ) {
      return (
        <span
          key={key}
          className="learning-text-label"
        >
          {part.slice(2, -2)}
        </span>
      );
    }

    return (
      <React.Fragment key={key}>
        {part}
      </React.Fragment>
    );
  });
}

function LearningText({
  text = "",
  as: Component = "div",
  className = "",
}) {
  const lines = String(text).split("\n");

  const classes = [
    "learning-text",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes}>
      {lines.map((line, index) => (
        <React.Fragment
          key={`learning-line-${index}`}
        >
          {parseInlineText(
            line,
            `learning-line-${index}`
          )}

          {index < lines.length - 1 && (
            <br />
          )}
        </React.Fragment>
      ))}
    </Component>
  );
}

export default LearningText;