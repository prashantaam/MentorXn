/*
 * The signed-in student's progress across courses.
 *
 * TODO: there is no enrolment/progress API in the backend yet, so this
 * returns no progress and the dashboard shows its "not started" state.
 * When the API exists, fetch it here and return entries shaped like:
 *
 *   {
 *     course: { slug, title, emoji, hue, lessons },  // hue = an --mx-c-* name or a hex colour
 *     completedLessons: 7,
 *     certified: false,
 *     to: "/student/courses/react-quest",           // where "Resume" goes (optional)
 *   }
 *
 * The dashboard needs nothing else changed.
 */
export function useStudentProgress() {
  return { progress: [], isLoading: false, error: "" };
}
