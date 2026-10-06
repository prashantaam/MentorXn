import { useEffect, useId } from "react";

/*
 * Centered dialog used by the course builder (add/edit lesson or topic,
 * delete confirmations). Clicking the backdrop or pressing Escape calls
 * onClose — unless `busy`, so a save in flight can't be abandoned.
 */
function BuilderModal({ kicker, title, onClose, busy = false, role = "dialog", children }) {
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  return (
    <div
      className="mx-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section className="mx-modal" role={role} aria-modal="true" aria-labelledby={titleId}>
        <div className="mx-modal__head">
          <div>
            {kicker && <div className="mx-modal__kicker">{kicker}</div>}
            <h2 id={titleId}>{title}</h2>
          </div>
          <button
            type="button"
            className="mx-icon-btn"
            aria-label="Close"
            disabled={busy}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}

export default BuilderModal;
