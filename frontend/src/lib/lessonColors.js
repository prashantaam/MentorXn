/*
 * One colour per lesson, in order. Shared by the teacher's course
 * builder and the student's course player, so a lesson has the same
 * colour in both.
 */
export const LESSON_ACCENT_COLORS = [
  "#8fd9a8", // Mint Green
  "#ffd84d", // Sunny Yellow
  "#7cd4ff", // Sky Blue
  "#ff9a8b", // Coral
  "#6ee7b7", // Aqua Green
  "#ffb3e1", // Soft Pink
  "#c4b5fd", // Lavender
  "#fdba8c", // Peach
  "#fde68a", // Lemon
  "#a5f3fc", // Soft Cyan
  "#fda4af", // Light Rose
  "#bef264", // Light Lime
];

export const lessonColor = (index) =>
  LESSON_ACCENT_COLORS[Math.max(index, 0) % LESSON_ACCENT_COLORS.length];
