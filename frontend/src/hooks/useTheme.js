import { useCallback } from "react";

// Keep in sync with the pre-paint script in frontend/index.html.
const STORAGE_KEY = "mentorxn-theme";

function systemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function currentTheme() {
  return document.documentElement.dataset.theme || systemTheme();
}

/* "light", "dark", or "system" when the user hasn't chosen one. */
export function getThemePreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "system";
  } catch {
    return document.documentElement.dataset.theme || "system";
  }
}

/*
 * Light/dark switch for the MentorXn design system.
 * The theme lives on <html data-theme>, which the --mx-* tokens read;
 * no attribute means "follow the operating system".
 */
export function setThemePreference(preference) {
  const root = document.documentElement;

  if (preference === "system") {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = preference;
  }

  try {
    if (preference === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this visit.
  }
}

export function useTheme() {
  const toggleTheme = useCallback(() => {
    setThemePreference(currentTheme() === "dark" ? "light" : "dark");
  }, []);

  return { toggleTheme };
}
