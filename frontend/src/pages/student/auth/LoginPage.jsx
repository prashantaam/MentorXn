import AuthCard from "../../../components/auth/AuthCard";
import AuthField from "../../../components/auth/AuthField";
import { useAuthForm, validateLogin } from "../../../hooks/useAuthForm";

import "../../../styles/pages/auth.css";

function LoginPage() {
  const { values, errors, generalError, isSubmitting, handleChange, handleSubmit } =
    useAuthForm({
      endpoint: "/api/student/login",
      initialValues: { email: "", password: "", remember: false },
      validate: validateLogin,
      redirectTo: "/student/dashboard",
    });

  return (
    <AuthCard
      badge="🎓 Learner"
      title="Welcome back!"
      subtitle="Log in to pick up right where you left off."
      switchText="New to MentorXn?"
      switchLabel="Create an account"
      switchTo="/register"
      otherPortal={{
        emoji: "🧑‍🏫",
        text: "Are you a teacher?",
        label: "Teacher log in →",
        to: "/teacher/login",
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        {generalError && (
          <div className="mx-feedback mx-feedback--bad" role="alert">
            {generalError}
          </div>
        )}

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
          placeholder="Your password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        <label className="mx-check">
          <input
            type="checkbox"
            name="remember"
            checked={values.remember}
            onChange={handleChange}
          />
          <span>Keep me signed in</span>
        </label>

        <button
          className="mx-btn mx-auth-card__submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthCard>
  );
}

export default LoginPage;
