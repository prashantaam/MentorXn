import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";

/* Student */
import StudentLoginPage from "./pages/student/auth/LoginPage";
import StudentRegisterPage from "./pages/student/auth/RegisterPage";
import StudentDashboard from "./pages/student/StudentDashboard";

/* Teacher */
import TeacherLoginPage from "./pages/teacher/auth/TeacherLoginPage";
import TeacherRegisterPage from "./pages/teacher/auth/TeacherRegisterPage";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import CourseBuilderPage from "./pages/teacher/courses/CourseBuilderPage";
import TeacherCoursePage from "./pages/teacher/courses/TeacherCoursePage";
import CreateCoursePage from "./pages/teacher/courses/CreateCoursePage";
import CreateLessonPage from "./pages/teacher/lessons/CreateLessonPage";
import LessonBuilderPage from "./pages/teacher/lessons/LessonBuilderPage";
import CreateTopicPage from "./pages/teacher/topics/CreateTopicPage";
import TopicBuilderPage from "./pages/teacher/topics/TopicBuilderPage";
/* Layouts */
import StudentLayout from "./layouts/StudentLayout";
import TeacherLayout from "./layouts/TeacherLayout";

/* Route Protection */
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public */}

      <Route
        path="/"
        element={<HomePage />}
      />

      {/* Student Authentication */}

      <Route
        path="/login"
        element={<StudentLoginPage />}
      />

      <Route
        path="/register"
        element={<StudentRegisterPage />}
      />

      {/* Student Application */}

      <Route
        element={
          <ProtectedRoute requiredRole="student" />
        }
      >
        <Route element={<StudentLayout />}>
          <Route
            path="/student/dashboard"
            element={<StudentDashboard />}
          />
        </Route>
      </Route>

      {/* Teacher Authentication */}

      <Route
        path="/teacher/login"
        element={<TeacherLoginPage />}
      />

      <Route
        path="/teacher/register"
        element={<TeacherRegisterPage />}
      />

      {/* Teacher Application */}

      <Route
        element={
          <ProtectedRoute requiredRole="teacher" />
        }
      >
        <Route element={<TeacherLayout />}>
          <Route
            path="/teacher/dashboard"
            element={<TeacherDashboard />}
          />

          <Route
            path="/teacher/courses"
            element={<TeacherCoursePage />}
          />

          <Route
            path="/teacher/courses/create"
            element={<CreateCoursePage />}
          />
          <Route
            path="/teacher/courses/:courseId"
            element={<CourseBuilderPage />}
          />
          <Route
            path="/teacher/courses/:courseId/lessons/create"
            element={<CreateLessonPage />}
          />

          <Route
            path="/teacher/courses/:courseId/lessons/:lessonId"
            element={<LessonBuilderPage />}
          />
          <Route
            path="/teacher/courses/:courseId/lessons/:lessonId/topics/create"
            element={<CreateTopicPage />}
          />
          <Route
            path="/teacher/courses/:courseId/lessons/:lessonId/topics/:topicId"
            element={<TopicBuilderPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;