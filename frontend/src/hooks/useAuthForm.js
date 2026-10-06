import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { fieldErrors } from "../api/client";
import { useAuth } from "../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Form-only fields that are never sent to the API.
const CLIENT_ONLY_FIELDS = ["remember", "terms"];

export function validateLogin(values) {
  const errors = {};

  if (!EMAIL_RE.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!values.password) errors.password = "Enter your password.";

  return errors;
}

export function validateSignup(values) {
  const errors = {};

  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!EMAIL_RE.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (values.password.length < 8) errors.password = "Use at least 8 characters.";
  if (values.password_confirmation !== values.password) {
    errors.password_confirmation = "Passwords do not match.";
  }
  if (!values.terms) errors.terms = "Please accept the terms to continue.";

  return errors;
}

/*
 * Shared state + submit logic for the student and teacher log-in and
 * sign-up pages. Every auth endpoint answers with { user, token } on
 * success and Laravel's { message, errors } on failure.
 *
 * `remember` decides localStorage vs sessionStorage in AuthContext;
 * sign-ups always remember, log-ins follow the "Keep me signed in" box.
 */
export function useAuthForm({ endpoint, initialValues, validate, redirectTo }) {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear a field's error as soon as the user starts correcting it.
    setErrors((current) => ({ ...current, [name]: null }));
    setGeneralError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGeneralError("");

    const clientErrors = validate(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    const payload = { ...values, email: values.email.trim() };
    CLIENT_ONLY_FIELDS.forEach((field) => delete payload[field]);

    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(fieldErrors(data.errors));
        } else {
          setGeneralError(data.message || "Something went wrong. Please try again.");
        }
        return;
      }

      saveAuth({
        user: data.user,
        token: data.token,
        remember: values.remember ?? true,
      });

      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Auth request failed:", error);
      setGeneralError("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { values, errors, generalError, isSubmitting, handleChange, handleSubmit };
}
