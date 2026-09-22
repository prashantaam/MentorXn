import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import AuthLayout from "../../../components/AuthLayout";
import { useAuth } from "../../../context/AuthContext";

import "../../../auth.css";

function LoginPage() {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] =
    useState("");
  const [isLoading, setIsLoading] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

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
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/student/login",
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
            data.message ||
              "Sign in failed. Please try again."
          );
        }

        return;
      }

      saveAuth({
        user: data.user,
        token: data.token,
        remember,
      });

      navigate("/student/dashboard");
    } catch (error) {
      console.error(
        "Student login error:",
        error
      );

      setGeneralError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Sign in and continue your learning adventure."
      footerText="New to Learning Adventure?"
      footerLinkText="Create an account"
      footerLink="/register"
    >
      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >
        {generalError && (
          <div
            className="auth-error"
            role="alert"
          >
            {generalError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">
            Email address
          </label>

          <div className="input-wrapper">
            <span className="input-icon">
              ✉️
            </span>

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
          <div className="label-row">
            <label htmlFor="password">
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
              id="password"
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
            <small className="field-error">
              {errors.password[0]}
            </small>
          )}
        </div>

        <label className="remember-row">
          <input
            type="checkbox"
            name="remember"
            checked={remember}
            onChange={(event) =>
              setRemember(event.target.checked)
            }
          />

          <span>Keep me signed in</span>
        </label>

        <button
          className="auth-submit"
          type="submit"
          disabled={isLoading}
        >
          {isLoading
            ? "Signing in..."
            : "Sign In"}

          <span>
            {isLoading ? "⏳" : "→"}
          </span>
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;