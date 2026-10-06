import { Children, cloneElement, isValidElement } from "react";

/*
 * Label + one form control + an inline error (or hint) underneath.
 * Wraps whatever control you pass (input, textarea, select) and wires
 * its id / aria attributes. `counter` shows e.g. "12/120" on the right.
 */
function FormField({ id, label, error, hint, counter, labelAside, children }) {
  const messageId = `${id}-message`;
  const hasMessage = Boolean(error || hint || counter);

  const control = Children.only(children);
  const wiredControl = isValidElement(control)
    ? cloneElement(control, {
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": hasMessage ? messageId : undefined,
      })
    : control;

  return (
    <div className={`mx-field${error ? " has-error" : ""}`}>
      <div className="mx-field__label-row">
        <label htmlFor={id}>{label}</label>
        {labelAside}
      </div>

      {wiredControl}

      {hasMessage && (
        <div id={messageId} className="mx-field__message">
          <span className={error ? "mx-field__error" : "mx-field__hint"}>
            {error || hint}
          </span>
          {counter && <span className="mx-field__hint">{counter}</span>}
        </div>
      )}
    </div>
  );
}

export default FormField;
