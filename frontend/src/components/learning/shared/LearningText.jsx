import React from "react";

/**
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
 * Boolean labels receive an additional semantic class:
 *
 * [[true]]  -> learning-text-label--true
 * [[false]] -> learning-text-label--false
 *
 * Coloured labels (Word Quest's tags, e.g. "is a [Adjective]"):
 *
 * [[g:Adjective]]  [[r:Wrong]]  [[y:Careful]]  [[b:Noun]]
 * (or the full names: [[green:…]] [[red:…]] [[yellow:…]] [[black:…]])
 *
 * Example:
 *
 * An **algorithm** is a set of instructions.
 * A computer executes `code`.
 * Think of it as a [[recipe]].
 *
 * =========================================================
 */

/*
 * [[g:text]] -> ["g", "text"]. One letter is enough; the full
 * colour names still work too.
 */
const LABEL_COLOUR =
  /^\s*(green|red|yellow|black|g|r|y|b)\s*:\s*(.+?)\s*$/i;

const COLOUR_NAMES = {
  g: "green",
  r: "red",
  y: "yellow",
  b: "black",
};

function parseInlineText(
  text,
  keyPrefix
) {
  if (!text) {
    return null;
  }

  /**
   * Match:
   *
   * **bold**
   * `code`
   * [[label]]
   */
  const pattern =
    /(\*\*[^*]+\*\*|`[^`]+`|\[\[[^\]]+\]\])/g;

  const parts =
    String(text).split(pattern);

  return parts.map(
    (part, index) => {
      const key =
        `${keyPrefix}-${index}`;

      /**
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

      /**
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

      /**
       * Label / chip
       *
       * Normal labels keep the standard class.
       * Boolean labels additionally receive:
       *
       * true  -> learning-text-label--true
       * false -> learning-text-label--false
       */
      if (
        part.startsWith("[[") &&
        part.endsWith("]]")
      ) {
        const inner =
          part.slice(2, -2);

        /*
         * [[green:Adjective]] -> a coloured tag.
         */
        const coloured =
          inner.match(LABEL_COLOUR);

        if (coloured) {
          const colour =
            coloured[1].toLowerCase();

          return (
            <span
              key={key}
              className={`learning-text-label learning-text-label--tag learning-text-label--${COLOUR_NAMES[colour] || colour}`}
            >
              {coloured[2]}
            </span>
          );
        }

        const label = inner;

        const normalisedLabel =
          label
            .trim()
            .toLowerCase();

        const booleanClass =
          normalisedLabel === "true"
            ? "learning-text-label--true"
            : normalisedLabel ===
                "false"
              ? "learning-text-label--false"
              : "";

        const labelClasses = [
          "learning-text-label",
          booleanClass,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <span
            key={key}
            className={
              labelClasses
            }
          >
            {label}
          </span>
        );
      }

      return (
        <React.Fragment
          key={key}
        >
          {part}
        </React.Fragment>
      );
    }
  );
}

function LearningText({
  text = "",
  as: Component = "div",
  className = "",
}) {
  const lines =
    String(text).split("\n");

  const classes = [
    "learning-text",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      className={classes}
    >
      {lines.map(
        (line, index) => (
          <React.Fragment
            key={
              `learning-line-${index}`
            }
          >
            {parseInlineText(
              line,
              `learning-line-${index}`
            )}

            {index <
              lines.length - 1 && (
              <br />
            )}
          </React.Fragment>
        )
      )}
    </Component>
  );
}

export default LearningText;
