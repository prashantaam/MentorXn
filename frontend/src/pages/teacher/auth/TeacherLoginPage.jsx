import AuthCard from "../../../components/auth/AuthCard";
import AuthField from "../../../components/auth/AuthField";
import { useAuthForm, validateLogin } from "../../../hooks/useAuthForm";

import "../../../styles/pages/auth.css";

function TeacherLoginPage() {
  const { values, errors, generalError, isSubmitting, handleChange, handleSubmit } =
    useAuthForm({
      endpoint: "/api/teacher/login",
      initialValues: { email: "", password: "", remember: false },
      validate: validateLogin,
      redirectTo: "/teacher/dashboard",
    });

  return (
    <AuthCard
      badge="🧑‍🏫 Teacher portal"
      title="Teacher log in"
      subtitle="Build, organise and publish your courses."
      switchText="Need a teacher account?"
      switchLabel="Sign up as a teacher"
      switchTo="/teacher/register"
      otherPortal={{
        emoji: "🎓",
        text: "Here to learn?",
        label: "Student log in →",
        to: "/login",
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        {generalError && (
          <div className="mx-feedback mx-feedback--bad" role="alert">
            {generalError}
          </div>
        )}

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
          {isSubmitting ? "Logging in…" : "Log in to teacher portal"}
        </button>
      </form>
    </AuthCard>
  );
}

export default TeacherLoginPage;
