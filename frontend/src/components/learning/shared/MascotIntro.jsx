import LearningText from "./LearningText";

/*
 * An introduction the way students see it (Code Quest style): the
 * course icon bobbing beside a speech bubble. Used by the course
 * player and the teacher's course builder; teachers get a small ✏️
 * in the bubble's corner to edit it (onEdit).
 */
function MascotIntro({ icon, text, onEdit, editLabel }) {
  return (
    <div className="mascot mx-intro">
      <div className="mface" aria-hidden="true">
        {icon}
      </div>
      <div className="bubble mx-intro__bubble">
        <LearningText text={text} as="p" />
        {onEdit && (
          <button
            type="button"
            className="mx-mini-btn mx-intro__edit"
            onClick={onEdit}
            aria-label={editLabel}
            title={editLabel}
          >
            ✏️
          </button>
        )}
      </div>
    </div>
  );
}

export default MascotIntro;
