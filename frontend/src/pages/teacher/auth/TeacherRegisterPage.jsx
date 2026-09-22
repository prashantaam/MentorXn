import AuthLayout from "../../../components/AuthLayout";
import "../../../auth.css";

function TeacherRegisterPage() {
  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Teacher registration submitted");
  };

  return (
    <AuthLayout
      teacher
      title="Create Teacher Account"
      subtitle="Create your account and start building learning adventures."
      footerText="Already have a teacher account?"
      footerLinkText="Sign in"
      footerLink="/teacher/login"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="teacher-name">Your name</label>

          <div className="input-wrapper">
            <span className="input-icon">🧑‍🏫</span>

            <input
              id="teacher-name"
              name="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="teacher-register-email">
            Email address
          </label>

          <div className="input-wrapper">
            <span className="input-icon">✉️</span>

            <input
              id="teacher-register-email"
              name="email"
              type="email"
              placeholder="teacher@example.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="teacher-register-password">
            Password
          </label>

          <div className="input-wrapper">
            <span className="input-icon">🔐</span>

            <input
              id="teacher-register-password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              minLength="8"
              required
            />
          </div>

          <small className="field-hint">
            Use at least 8 characters.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="teacher-password-confirmation">
            Confirm password
          </label>

          <div className="input-wrapper">
            <span className="input-icon">🔐</span>

            <input
              id="teacher-password-confirmation"
              name="password_confirmation"
              type="password"
              placeholder="Enter your password again"
              autoComplete="new-password"
              minLength="8"
              required
            />
          </div>
        </div>

        <label className="terms-row">
          <input type="checkbox" required />

          <span>
            I agree to the Terms of Use and Privacy Policy.
          </span>
        </label>

        <button
          className="auth-submit teacher-submit"
          type="submit"
        >
          Create Teacher Account
          <span>✨</span>
        </button>
      </form>
    </AuthLayout>
  );
}

export default TeacherRegisterPage;