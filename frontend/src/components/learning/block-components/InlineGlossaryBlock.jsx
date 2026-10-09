import { useId, useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import InfoPanel from "../shared/InfoPanel";
import LearningText from "../shared/LearningText";

/*
 * Inline glossary: jargon terms inside normal flowing prose are
 * tappable in place, and their definition appears below.
 *
 * data.text   = "Check for {{latency}} and {{race conditions|race condition}}."
 *               {{word}}            -> the term "word"
 *               {{shown text|term}} -> shows "shown text", defines "term"
 * data.terms  = [{ term, definition }]
 * data.prompt = text shown before a term is tapped
 * data.dark_text  = show the paragraph in a dark box, like Word
 *                   Quest's "Tap each word" (default off)
 * data.show_term  = start the description with "term:" (default on)
 * data.term_style = "highlighted" (bold, dotted underline — default)
 *                   | "plain" (looks like the rest of the text until
 *                   hovered or tapped, so students have to explore)
 *
 * The prose supports **bold** and `code`.
 */
const MARKER = /\{\{([^{}|]+?)(?:\|([^{}]+?))?\}\}/g;

const normalise = (value) => String(value || "").trim().toLowerCase();

const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

const DEFAULT_PROMPT = "👆 Tap an underlined word.";

/* "a {{x}} b" -> [{ text: "a " }, { shown: "x", term: "x" }, { text: " b" }] */
function parseText(text) {
  const source = String(text || "");
  const parts = [];
  let lastIndex = 0;

  for (const match of source.matchAll(MARKER)) {
    if (match.index > lastIndex) {
      parts.push({ text: source.slice(lastIndex, match.index) });
    }
    parts.push({ shown: match[1].trim(), term: (match[2] ?? match[1]).trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    parts.push({ text: source.slice(lastIndex) });
  }

  return parts;
}

function InlineGlossaryBlock({ block }) {
  const data = block?.data || {};
  const terms = Array.isArray(data.terms) ? data.terms : [];
  const darkText = isOn(data.dark_text, false);
  const plainTerms = data.term_style === "plain";
  const showTerm = isOn(data.show_term, true);

  // Plain words aren't underlined, so the default prompt shouldn't say so.
  const prompt =
    !data.prompt || (plainTerms && data.prompt === DEFAULT_PROMPT)
      ? plainTerms
        ? "👆 Tap a word."
        : DEFAULT_PROMPT
      : data.prompt;

  const [selected, setSelected] = useState(null); // index into terms
  const panelId = useId();

  // term (lower case) -> its index in data.terms
  const termIndex = new Map();
  terms.forEach((item, index) => {
    const key = normalise(item?.term);
    if (key && !termIndex.has(key)) termIndex.set(key, index);
  });

  const activeTerm = selected !== null ? terms[selected] : null;

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className={`inline-glossary-block${plainTerms ? " inline-glossary-block--plain" : ""}`}
    >
      <p className={`inline-glossary-block__text${darkText ? " code inline-glossary-block__text--dark" : ""}`}>
        {parseText(data.text).map((part, index) => {
          if (part.text !== undefined) {
            return <LearningText key={index} as="span" text={part.text} />;
          }

          const definitionIndex = termIndex.get(normalise(part.term));

          // A {{term}} with no description yet: make it visible to the teacher.
          if (definitionIndex === undefined || !String(terms[definitionIndex]?.definition ?? "").trim()) {
            return (
              <span
                key={index}
                className="inline-glossary-block__missing"
                title="Add a description for this term"
                data-visual-index={definitionIndex}
              >
                {part.shown}
              </span>
            );
          }

          return (
            <button
              key={index}
              type="button"
              className={`glossTerm${selected === definitionIndex ? " on" : ""}`}
              aria-pressed={selected === definitionIndex}
              aria-controls={panelId}
              data-visual-index={definitionIndex}
              onClick={() => setSelected(definitionIndex)}
            >
              {part.shown}
            </button>
          );
        })}
      </p>

      <InfoPanel id={panelId} className="inline-glossary-block__panel" aria-live="polite">
        {activeTerm ? (
          <>
            {showTerm && (
              <>
                <strong>{activeTerm.term}:</strong>{" "}
              </>
            )}
            <LearningText as="span" text={activeTerm.definition || ""} />
          </>
        ) : (
          <span className="hint">{prompt}</span>
        )}
      </InfoPanel>
    </LearningBlockShell>
  );
}

export default InlineGlossaryBlock;
