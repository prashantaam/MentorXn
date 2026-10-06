let nextKey = 0;

/*
 * New row for LessonOutlineEditor. `key` keeps React state attached to
 * the right row when rows are reordered or removed.
 */
export function newLesson(title = "") {
  nextKey += 1;
  return { key: `lesson-${nextKey}`, title };
}
