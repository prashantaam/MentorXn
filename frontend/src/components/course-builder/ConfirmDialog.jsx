import BuilderModal from "./BuilderModal";

/* "Are you sure?" dialog for destructive actions in the course builder. */
function ConfirmDialog({
  title,
  subject,
  warning,
  error,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}) {
  return (
    <BuilderModal kicker="Course structure" title={title} onClose={onCancel} busy={busy} role="alertdialog">
      <p>
        Are you sure you want to delete <b>{subject}</b>?
      </p>
      {warning && <p className="mx-hint">{warning}</p>}

      {error && (
        <div className="mx-feedback mx-feedback--bad" role="alert">
          {error}
        </div>
      )}

      <div className="mx-modal__actions">
        <button type="button" className="mx-btn mx-btn--ghost" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="mx-btn mx-btn--danger" disabled={busy} onClick={onConfirm}>
          {busy ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </BuilderModal>
  );
}

export default ConfirmDialog;
