import FormField from "../forms/FormField";

/* Labelled text input for the log-in / sign-up forms. */
function AuthField({ id, label, error, hint, labelAside, ...inputProps }) {
  return (
    <FormField id={id} label={label} error={error} hint={hint} labelAside={labelAside}>
      <input {...inputProps} />
    </FormField>
  );
}

export default AuthField;
