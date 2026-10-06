import AuthCard from "../../components/auth/AuthCard";
import AuthField from "../../components/auth/AuthField";
import { useAuthForm, validateLogin } from "../../hooks/useAuthForm";

import "../../styles/pages/auth.css";

/*
 * Developer log-in. There is deliberately no sign-up: developer
 * accounts are created with `php artisan app:make-developer`.
 */
function DevLoginPage() {
  const { values, errors, generalError, isSubmitting, handleChange, handleSubmit } =
    useAuthForm({
      endpoint: "/api/dev/login",
      initialValues: { email: "", password: "", remember: false },
      validate: validateLogin,
      redirectTo: "/dev/block-templates",
    });

  return (
    <AuthCard
      badge="🛠️ Developer"
      title="Developer log in"
      subtitle="Manage the block templates teachers build courses with."
      otherPortal={{
        emoji: "🧑‍🏫",
        text: "Not a developer?",
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
          id="dev-email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />

        <AuthField
          id="dev-password"
          name="password"
          type="password"
          label="Password"
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

        <button className="mx-btn mx-auth-card__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthCard>
  );
}

export default DevLoginPage;
