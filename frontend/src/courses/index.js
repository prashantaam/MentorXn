import dotnetAdventureLand from "./dotnet-adventure-land/course";

const courses = [
  dotnetAdventureLand,
];

export const getAllCourses = () => {
  return courses;
};

export const getCourseBySlug = (courseSlug) => {
  return courses.find(
    (course) =>
      course.slug === courseSlug
  );
};

export const getLessonBySlug = (
  courseSlug,
  lessonSlug
) => {
  const course =
    getCourseBySlug(courseSlug);

  if (!course) {
    return null;
  }

  return (
    course.lessons.find(
      (lesson) =>
        lesson.slug === lessonSlug
    ) || null
  );
};

export const getTopicBySlug = (
  courseSlug,
  lessonSlug,
  topicSlug
) => {
  const lesson =
    getLessonBySlug(
      courseSlug,
      lessonSlug
    );

  if (!lesson) {
    return null;
  }

  return (
    lesson.topics.find(
      (topic) =>
        topic.slug === topicSlug
    ) || null
  );
};

export default courses;