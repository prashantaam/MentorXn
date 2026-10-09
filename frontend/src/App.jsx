import { Routes, Route } from "react-router-dom";

/* Layout + route protection */
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

/* Public */
import LandingPage from "./pages/public/LandingPage";

/* Account (students and teachers) */
import AccountSettingsPage from "./pages/account/AccountSettingsPage";

/* Developer */
import DevLoginPage from "./pages/dev/DevLoginPage";
import BlockTemplateListPage from "./pages/dev/BlockTemplateListPage";
import BlockTemplateFormPage from "./pages/dev/BlockTemplateFormPage";
import BlockCategoryListPage from "./pages/dev/BlockCategoryListPage";

/* Student */
import StudentLoginPage from "./pages/student/auth/LoginPage";
import StudentRegisterPage from "./pages/student/auth/RegisterPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCoursesPage from "./pages/student/StudentCoursesPage";
import CoursePlayerPage from "./pages/student/CoursePlayerPage";

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
        <Route path="/dev/login" element={<DevLoginPage />} />
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
          <Route path="/student/courses" element={<StudentCoursesPage />} />
          <Route path="/student/courses/:courseId" element={<CoursePlayerPage />} />
          <Route path="/student/courses/:courseId/topics/:topicId" element={<CoursePlayerPage />} />
        </Route>
      </Route>

      {/* ========================================
          Developer: block templates
      ======================================== */}
      <Route element={<ProtectedRoute requiredRole="developer" />}>
        <Route element={<AppLayout area="dev" />}>
          <Route path="/dev/block-templates" element={<BlockTemplateListPage />} />
          <Route path="/dev/block-templates/new" element={<BlockTemplateFormPage />} />
          <Route path="/dev/block-templates/:templateId/edit" element={<BlockTemplateFormPage />} />
          <Route path="/dev/block-categories" element={<BlockCategoryListPage />} />
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
