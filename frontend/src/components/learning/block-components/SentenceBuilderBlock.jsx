import { useId, useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

/*
 * Live sentence builder: students fill in a few fields and watch
 * them drop into a sentence template in real time.
 *
 * data.template = "**As a** {{who}}, **I want** {{what}}."
 * data.fields   = [{ key, label, placeholder, default }]
 *
 * The template's fixed text supports **bold** and `code`.
 * What students type is always shown as plain text.
 */
const PLACEHOLDER = /\{\{\s*([\w-]+)\s*\}\}/g;

/* "a {{x}} b" -> [{ text: "a " }, { key: "x" }, { text: " b" }] */
function parseTemplate(template) {
  const parts = [];
  let lastIndex = 0;

  for (const match of String(template || "").matchAll(PLACEHOLDER)) {
    if (match.index > lastIndex) {
      parts.push({ text: template.slice(lastIndex, match.index) });
    }
    parts.push({ key: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < String(template || "").length) {
    parts.push({ text: template.slice(lastIndex) });
  }

  return parts;
}

function SentenceBuilderBlock({ block }) {
  const data = block?.data || {};
  const fields = (Array.isArray(data.fields) ? data.fields : []).filter((field) =>
    String(field?.key || "").trim()
  );

  // Only what the student typed; untouched fields fall back to their default.
  const [typed, setTyped] = useState({});
  const idPrefix = useId();

  const fieldsByKey = new Map(fields.map((field) => [String(field.key).trim(), field]));
  const valueOf = (key) => typed[key] ?? fieldsByKey.get(key)?.default ?? "";

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="sentence-builder-block"
    >
      {fields.length > 0 && (
        <div className="form sentence-builder-block__form">
          {fields.map((field, index) => {
            const key = String(field.key).trim();
            const inputId = `${idPrefix}-${index}`;

            return (
              <div key={index} className="sentence-builder-block__field" data-visual-index={index}>
                <label htmlFor={inputId}>{field.label || key}</label>
                <input
                  id={inputId}
                  type="text"
                  value={valueOf(key)}
                  placeholder={field.placeholder || ""}
                  onChange={(event) => setTyped((current) => ({ ...current, [key]: event.target.value }))}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="panel sentence-builder-block__output" aria-live="polite">
        {parseTemplate(data.template).map((part, index) => {
          if (part.text !== undefined) {
            return <LearningText key={index} as="span" text={part.text} />;
          }

          // A {{key}} with no matching field: make the mistake visible to the teacher.
          if (!fieldsByKey.has(part.key)) {
            return (
              <span key={index} className="sentence-builder-block__missing" title="No field uses this key">
                {`{{${part.key}}}`}
              </span>
            );
          }

          const value = String(valueOf(part.key)).trim();

          return (
            <span
              key={index}
              className={`sentence-builder-block__value${value ? "" : " is-empty"}`}
            >
              {value || "…"}
            </span>
          );
        })}
      </div>
    </LearningBlockShell>
  );
}

export default SentenceBuilderBlock;
