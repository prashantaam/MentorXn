/* Choices offered when a teacher creates or edits a course. */

export const COURSE_CATEGORIES = [
  "Web Development",
  "Programming & CS",
  "Data & Databases",
  "Infrastructure & DevOps",
  "Math & Science",
  "Language Arts",
  "Business & Professional",
  "Other",
];

// Must match the `level` enum in the courses table.
export const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"];

// The design system's course hues, as the hex values the API stores.
export const ACCENT_COLORS = [
  { name: "Green", value: "#8fd9a8" },
  { name: "Yellow", value: "#ffd84d" },
  { name: "Blue", value: "#7cd4ff" },
  { name: "Coral", value: "#ff9a8b" },
  { name: "Mint", value: "#6ee7b7" },
  { name: "Pink", value: "#ffb3e1" },
  { name: "Orange", value: "#ffb870" },
];

export const QUICK_ICONS = ["📘", "🚀", "🧪", "🧠", "🌍", "💻", "🎨", "📊"];

export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 500;
export const LESSON_TITLE_MAX = 150;
