import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import AuthLayout from "../../../components/AuthLayout";
import { useAuth } from "../../../context/AuthContext";

import "../../../auth.css";

function TeacherLoginPage() {
  const navigate = useNavigate();

  const { saveAuth } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: null,
    }));

    setGeneralError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setErrors({});
    setGeneralError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/teacher/login",
        {
          method: "POST",

          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setGeneralError(
            data.message ||
              "Unable to sign in. Please try again."
          );
        }

        return;
      }

      saveAuth({
        user: data.user,
        token: data.token,
        remember: formData.remember,
      });

      navigate(
        "/teacher/dashboard",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Teacher login error:",
        error
      );

      setGeneralError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      teacher
      title="Teacher Sign In"
      subtitle="Access your teaching workspace and learning content."
      footerText="Need a teacher account?"
      footerLinkText="Register as a teacher"
      footerLink="/teacher/register"
    >
      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >
        {generalError && (
          <div className="auth-error-message">
            {generalError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="teacher-email">
            Email address
          </label>

          <div className="input-wrapper">
            <span className="input-icon">
              ✉️
            </span>

            <input
              id="teacher-email"
              name="email"
              type="email"
              placeholder="teacher@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {errors.email && (
            <div className="field-error">
              {errors.email[0]}
            </div>
          )}
        </div>

        <div className="form-group">
          <div className="label-row">
            <label htmlFor="teacher-password">
              Password
            </label>

            <Link
              to="/forgot-password"
              className="small-link"
            >
              Forgot password?
            </Link>
          </div>

          <div className="input-wrapper">
            <span className="input-icon">
              🔐
            </span>

            <input
              id="teacher-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {errors.password && (
            <div className="field-error">
              {errors.password[0]}
            </div>
          )}
        </div>

        <label className="remember-row">
          <input
            type="checkbox"
            name="remember"
            checked={formData.remember}
            onChange={handleChange}
          />

          <span>Keep me signed in</span>
        </label>

        <button
          className="auth-submit teacher-submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Signing in..."
            : "Enter Teacher Portal"}

          {!isSubmitting && <span>→</span>}
        </button>
      </form>
    </AuthLayout>
  );
}

export default TeacherLoginPage;