import AuthCard from "../../../components/auth/AuthCard";
import AuthField from "../../../components/auth/AuthField";
import { useAuthForm, validateSignup } from "../../../hooks/useAuthForm";

import "../../../styles/pages/auth.css";

function RegisterPage() {
  const { values, errors, generalError, isSubmitting, handleChange, handleSubmit } =
    useAuthForm({
      endpoint: "/api/student/register",
      initialValues: {
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        terms: false,
      },
      validate: validateSignup,
      redirectTo: "/student/dashboard",
    });

  return (
    <AuthCard
      badge="🎓 Learner"
      title="Create your account"
      subtitle="Free to start — your progress saves as you learn."
      switchText="Already have an account?"
      switchLabel="Log in"
      switchTo="/login"
      otherPortal={{
        emoji: "🧑‍🏫",
        text: "Want to teach instead?",
        label: "Sign up as a teacher →",
        to: "/teacher/register",
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        {generalError && (
          <div className="mx-feedback mx-feedback--bad" role="alert">
            {generalError}
          </div>
        )}

        <AuthField
          id="name"
          name="name"
          label="Your name"
          placeholder="e.g. Sam Rivera"
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />

        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />

        <AuthField
          id="password"
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
          id="password_confirmation"
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
          {isSubmitting ? "Creating your account…" : "Create learner account"}
        </button>
      </form>
    </AuthCard>
  );
}

export default RegisterPage;
