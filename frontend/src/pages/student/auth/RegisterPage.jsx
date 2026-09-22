import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../../../components/AuthLayout";
import "../../../auth.css";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear the field error when the user starts correcting it.
    setErrors((previous) => ({
      ...previous,
      [name]: null,
    }));

    setGeneralError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrors({});
    setGeneralError("");

    // Quick frontend check before sending the request.
    if (formData.password !== formData.password_confirmation) {
      setErrors({
        password_confirmation: ["Passwords do not match."],
      });

      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/student/register",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setGeneralError(
            data.message || "Registration failed. Please try again."
          );
        }

        return;
      }

      // Save authentication details.
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Temporary destination until we build the student dashboard.
      navigate("/");
    } catch (error) {
      console.error("Student registration error:", error);

      setGeneralError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Start your adventure"
      subtitle="Create your learner account. It only takes a moment."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLink="/login"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {generalError && (
          <div className="auth-error" role="alert">
            {generalError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name">Your name</label>

          <div className="input-wrapper">
            <span className="input-icon">🙂</span>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {errors.name && (
            <small className="field-error">
              {errors.name[0]}
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email address</label>

          <div className="input-wrapper">
            <span className="input-icon">✉️</span>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {errors.email && (
            <small className="field-error">
              {errors.email[0]}
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>

          <div className="input-wrapper">
            <span className="input-icon">🔐</span>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              minLength="8"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {errors.password ? (
            <small className="field-error">
              {errors.password[0]}
            </small>
          ) : (
            <small className="field-hint">
              Use at least 8 characters.
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password_confirmation">
            Confirm password
          </label>

          <div className="input-wrapper">
            <span className="input-icon">🔐</span>

            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              placeholder="Enter your password again"
              autoComplete="new-password"
              minLength="8"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
            />
          </div>

          {errors.password_confirmation && (
            <small className="field-error">
              {errors.password_confirmation[0]}
            </small>
          )}
        </div>

        <label className="terms-row">
          <input type="checkbox" required />

          <span>
            I agree to the Terms of Use and Privacy Policy.
          </span>
        </label>

        <button
          className="auth-submit"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create Learner Account"}

          <span>{isLoading ? "⏳" : "🚀"}</span>
        </button>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;