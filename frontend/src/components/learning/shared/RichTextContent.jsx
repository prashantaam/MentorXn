import { renderToReactElement } from "@tiptap/static-renderer/pm/react";

import { isDoc, isEmptyDoc, richTextExtensions, sanitizeDoc } from "../../../lib/richText";

/*
 * Student-facing rich text: renders a stored TipTap document straight
 * to React elements (no HTML strings, no editor instance).
 */
function RichTextContent({ doc, className = "", emptyText = null }) {
  if (!isDoc(doc) || isEmptyDoc(doc)) {
    return emptyText ? <p className={`${className} rich-text--empty`.trim()}>{emptyText}</p> : null;
  }

  return (
    <div className={`rich-text ${className}`.trim()}>
      {renderToReactElement({
        content: sanitizeDoc(doc),
        extensions: richTextExtensions,
      })}
    </div>
  );
}

export default RichTextContent;
