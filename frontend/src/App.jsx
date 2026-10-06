import { Routes, Route } from "react-router-dom";

/* Layout + route protection */
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

/* Public */
import LandingPage from "./pages/public/LandingPage";

/* Account (students and teachers) */
import AccountSettingsPage from "./pages/account/AccountSettingsPage";

/* Student */
import StudentLoginPage from "./pages/student/auth/LoginPage";
import StudentRegisterPage from "./pages/student/auth/RegisterPage";
import StudentDashboard from "./pages/student/StudentDashboard";

/* Teacher */
import TeacherLoginPage from "./pages/teacher/auth/TeacherLoginPage";
import TeacherRegisterPage from "./pages/teacher/auth/TeacherRegisterPage";
import TeacherDashboard from "./pages/teacher/dashboard/TeacherDashboard";
import CourseListPage from "./pages/teacher/courses/CourseListPage";
import CourseFormPage from "./pages/teacher/courses/CourseFormPage";
import CoursePlaygroundPage from "./pages/teacher/courses/CoursePlaygroundPage";
import VisualBlockEditorPage from "./pages/teacher/courses/VisualBlockEditorPage";

function App() {
  return (
    <Routes>
      {/* ========================================
          Public (shared nav + footer)
      ======================================== */}
      <Route element={<AppLayout area="public" />}>
        <Route path="/" element={<LandingPage />} />

        {/* Separate student and teacher auth pages, same design */}
        <Route path="/login" element={<StudentLoginPage />} />
        <Route path="/register" element={<StudentRegisterPage />} />
        <Route path="/teacher/login" element={<TeacherLoginPage />} />
        <Route path="/teacher/register" element={<TeacherRegisterPage />} />
      </Route>

      {/* ========================================
          Any signed-in user
      ======================================== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout area="account" />}>
          <Route path="/account" element={<AccountSettingsPage />} />
        </Route>
      </Route>

      {/* ========================================
          Student Application
      ======================================== */}
      <Route element={<ProtectedRoute requiredRole="student" />}>
        <Route element={<AppLayout area="student" />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>
      </Route>

      {/* ========================================
          Teacher Application
      ======================================== */}
      <Route element={<ProtectedRoute requiredRole="teacher" />}>
        <Route element={<AppLayout area="teacher" />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/courses" element={<CourseListPage />} />
          <Route path="/teacher/courses/create" element={<CourseFormPage />} />
          <Route path="/teacher/courses/:courseId/edit" element={<CourseFormPage />} />
          <Route
            path="/teacher/courses/:courseId/playground"
            element={<CoursePlaygroundPage />}
          />
          <Route
            path="/teacher/courses/:courseId/topics/:topicId/blocks/create"
            element={<VisualBlockEditorPage />}
          />
          <Route
            path="/teacher/courses/:courseId/topics/:topicId/blocks/:blockId/edit"
            element={<VisualBlockEditorPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
