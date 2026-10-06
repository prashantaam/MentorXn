import AuthCard from "../../../components/auth/AuthCard";
import AuthField from "../../../components/auth/AuthField";
import { useAuthForm, validateSignup } from "../../../hooks/useAuthForm";

import "../../../styles/pages/auth.css";

function TeacherRegisterPage() {
  const { values, errors, generalError, isSubmitting, handleChange, handleSubmit } =
    useAuthForm({
      endpoint: "/api/teacher/register",
      initialValues: {
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        terms: false,
      },
      validate: validateSignup,
      redirectTo: "/teacher/dashboard",
    });

  return (
    <AuthCard
      badge="🧑‍🏫 Teacher portal"
      title="Create a teacher account"
      subtitle="Turn what you know into interactive, hands-on courses."
      switchText="Already have a teacher account?"
      switchLabel="Log in"
      switchTo="/teacher/login"
      otherPortal={{
        emoji: "🎓",
        text: "Here to learn?",
        label: "Create a learner account →",
        to: "/register",
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        {generalError && (
          <div className="mx-feedback mx-feedback--bad" role="alert">
            {generalError}
          </div>
        )}

        <AuthField
          id="teacher-name"
          name="name"
          label="Your name"
          placeholder="e.g. Alex Chen"
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />

        <AuthField
          id="teacher-email"
          name="email"
          type="email"
          label="Email"
          placeholder="teacher@example.com"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />

        <AuthField
          id="teacher-password"
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          hint="Use at least 8 characters."
        />

        <AuthField
          id="teacher-password-confirmation"
          name="password_confirmation"
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          value={values.password_confirmation}
          onChange={handleChange}
          error={errors.password_confirmation}
        />

        <label className="mx-check">
          <input
            type="checkbox"
            name="terms"
            checked={values.terms}
            onChange={handleChange}
          />
          <span>I agree to the Terms of Use and Privacy Policy.</span>
        </label>
        {errors.terms && <div className="mx-field__error">{errors.terms}</div>}

        <button
          className="mx-btn mx-auth-card__submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating your account…" : "Create teacher account"}
        </button>
      </form>
    </AuthCard>
  );
}

export default TeacherRegisterPage;
