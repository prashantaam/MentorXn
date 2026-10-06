import StarterKit from "@tiptap/starter-kit";

/*
 * Rich text shared by the teacher's editor and the student view, so
 * both always support exactly the same formatting.
 *
 * Content is stored as TipTap's JSON document (never raw HTML), and the
 * student view renders that JSON straight to React elements.
 */

const SAFE_LINK = /^(https?:\/\/|mailto:)/i;

export const richTextExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      protocols: ["http", "https", "mailto"],
      isAllowedUri: (url) => SAFE_LINK.test(url),
      HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
    },
  }),
];

export const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

/* A TipTap document object (anything else is treated as empty). */
export function isDoc(value) {
  return Boolean(value && typeof value === "object" && value.type === "doc");
}

/* True when the document has no visible text. */
export function isEmptyDoc(doc) {
  if (!isDoc(doc)) return true;

  const hasText = (node) =>
    Boolean(node?.text?.trim()) || (Array.isArray(node?.content) && node.content.some(hasText));

  return !hasText(doc);
}

/*
 * Drop any link whose address isn't http(s) or mailto. The editor
 * already refuses them, but block data can also arrive via the API,
 * so the student view never trusts it.
 */
export function sanitizeDoc(node) {
  if (!node || typeof node !== "object") return node;

  const marks = Array.isArray(node.marks)
    ? node.marks.filter((mark) => mark.type !== "link" || SAFE_LINK.test(String(mark.attrs?.href ?? "")))
    : node.marks;

  return {
    ...node,
    ...(marks ? { marks } : {}),
    ...(Array.isArray(node.content) ? { content: node.content.map(sanitizeDoc) } : {}),
  };
}
