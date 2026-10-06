import { useEffect } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";

import { EMPTY_DOC, isDoc, richTextExtensions } from "../../lib/richText";

import "../../styles/teachers/rich-text-editor.css";

/* Toolbar: [label, title, isActive(editor), run(editor)] — grouped. */
const TOOL_GROUPS = [
  [
    ["B", "Bold (Ctrl+B)", (e) => e.isActive("bold"), (e) => e.chain().focus().toggleBold().run(), "is-bold"],
    ["I", "Italic (Ctrl+I)", (e) => e.isActive("italic"), (e) => e.chain().focus().toggleItalic().run(), "is-italic"],
    ["U", "Underline (Ctrl+U)", (e) => e.isActive("underline"), (e) => e.chain().focus().toggleUnderline().run(), "is-underline"],
    ["S", "Strikethrough", (e) => e.isActive("strike"), (e) => e.chain().focus().toggleStrike().run(), "is-strike"],
    ["</>", "Inline code", (e) => e.isActive("code"), (e) => e.chain().focus().toggleCode().run(), "is-mono"],
  ],
  [
    ["H2", "Heading", (e) => e.isActive("heading", { level: 2 }), (e) => e.chain().focus().toggleHeading({ level: 2 }).run()],
    ["H3", "Subheading", (e) => e.isActive("heading", { level: 3 }), (e) => e.chain().focus().toggleHeading({ level: 3 }).run()],
  ],
  [
    ["• List", "Bulleted list", (e) => e.isActive("bulletList"), (e) => e.chain().focus().toggleBulletList().run()],
    ["1. List", "Numbered list", (e) => e.isActive("orderedList"), (e) => e.chain().focus().toggleOrderedList().run()],
    ["❝", "Quote", (e) => e.isActive("blockquote"), (e) => e.chain().focus().toggleBlockquote().run()],
    ["{ }", "Code block", (e) => e.isActive("codeBlock"), (e) => e.chain().focus().toggleCodeBlock().run(), "is-mono"],
  ],
];

// Where each group starts in the flattened tool list (for the active-state array).
const GROUP_OFFSETS = TOOL_GROUPS.map((_, groupIndex) =>
  TOOL_GROUPS.slice(0, groupIndex).reduce((count, group) => count + group.length, 0)
);

/* Ask for a link address for the selected text (empty = remove the link). */
function editLink(editor) {
  const current = editor.getAttributes("link").href || "";
  const url = window.prompt("Link address (https://… or mailto:…). Leave empty to remove the link.", current);

  if (url === null) return; // cancelled
  if (url.trim() === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
}

/*
 * Rich text editor for teacher-authored content.
 * `value` / `onChange` use TipTap's JSON document format.
 */
function RichTextEditor({ id, value, onChange, placeholder = "Start writing…", ariaLabel }) {
  const editor = useEditor({
    extensions: [...richTextExtensions, Placeholder.configure({ placeholder })],
    content: isDoc(value) ? value : EMPTY_DOC,
    editorProps: {
      attributes: {
        id,
        class: "mx-rte__content rich-text",
        "aria-label": ariaLabel || "Rich text",
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getJSON()),
  });

  // Re-render the toolbar when the selection or formatting changes.
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? {
            active: TOOL_GROUPS.flat().map(([, , isActive]) => isActive(current)),
            link: current.isActive("link"),
            canUndo: current.can().undo(),
            canRedo: current.can().redo(),
          }
        : null,
  });

  // Keep in sync when the value is replaced from outside (e.g. another block loads).
  useEffect(() => {
    if (!editor || !isDoc(value)) return;
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor || !state) return null;

  return (
    <div className="mx-rte">
      <div className="mx-rte__toolbar" role="toolbar" aria-label="Formatting">
        {TOOL_GROUPS.map((group, groupIndex) => (
          <div key={groupIndex} className="mx-rte__group">
            {group.map(([label, title, , run, modifier], toolIndex) => {
              const isOn = state.active[GROUP_OFFSETS[groupIndex] + toolIndex];

              return (
                <button
                  key={title}
                  type="button"
                  className={`mx-rte__tool${isOn ? " is-on" : ""}${modifier ? ` ${modifier}` : ""}`}
                  title={title}
                  aria-label={title}
                  aria-pressed={isOn}
                  onMouseDown={(event) => event.preventDefault()} // keep the selection
                  onClick={() => run(editor)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ))}

        <div className="mx-rte__group">
          <button
            type="button"
            className={`mx-rte__tool${state.link ? " is-on" : ""}`}
            title="Link"
            aria-label="Link"
            aria-pressed={state.link}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editLink(editor)}
          >
            🔗
          </button>
          <button
            type="button"
            className="mx-rte__tool"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            disabled={!state.canUndo}
            onClick={() => editor.chain().focus().undo().run()}
          >
            ↶
          </button>
          <button
            type="button"
            className="mx-rte__tool"
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            disabled={!state.canRedo}
            onClick={() => editor.chain().focus().redo().run()}
          >
            ↷
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;
