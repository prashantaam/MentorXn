import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import LearningBlockRenderer from "../learning/block-component-settings/LearningBlockRenderer";

/*
 * One learning block in the builder: a small teacher toolbar (position,
 * drag handle, edit, delete) above the block exactly as students see it.
 */
function SortableBlock({ block, index, onEdit, onDelete, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(block.id),
    disabled,
  });

  const name = block.title || "learning block";

  return (
    <div
      ref={setNodeRef}
      className={`mx-block${isDragging ? " is-dragging" : ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="mx-block__toolbar">
        <span className="mx-block__num" aria-hidden="true">
          {index + 1}
        </span>

        <button
          type="button"
          className="mx-block__handle"
          disabled={disabled}
          title="Drag to reorder"
          aria-label={`Move ${name}`}
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>

        <span className="mx-block__name">{block.title || "Untitled block"}</span>

        <button
          type="button"
          className="mx-btn mx-btn--ghost mx-btn--sm"
          onClick={() => onEdit(block)}
          aria-label={`Edit ${name}`}
        >
          ✏️ Edit
        </button>
        <button
          type="button"
          className="mx-btn mx-btn--danger mx-btn--sm"
          onClick={() => onDelete(block)}
          aria-label={`Delete ${name}`}
        >
          🗑️
        </button>
      </div>

      <LearningBlockRenderer block={block} />
    </div>
  );
}

export default SortableBlock;
