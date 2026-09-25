import {
  Routes,
  Route,
} from "react-router-dom";

import HomePage from "./pages/HomePage";

/* Student */

import StudentLoginPage from "./pages/student/auth/LoginPage";
import StudentRegisterPage from "./pages/student/auth/RegisterPage";
import StudentDashboard from "./pages/student/StudentDashboard";

/* Teacher */

import TeacherLoginPage from "./pages/teacher/auth/TeacherLoginPage";
import TeacherRegisterPage from "./pages/teacher/auth/TeacherRegisterPage";
import TeacherDashboard from "./pages/teacher/dashboard/TeacherDashboard";

import CourseListPage from "./pages/teacher/courses/CourseListPage";
import CourseCreatePage from "./pages/teacher/courses/CourseCreatePage";
import CoursePlaygroundPage from "./pages/teacher/courses/CoursePlaygroundPage";

/* Layouts */

import StudentLayout from "./layouts/StudentLayout";
import TeacherLayout from "./layouts/TeacherLayout";

/* Route Protection */

import ProtectedRoute from "./components/common/ProtectedRoute";


function App() {
  return (
    <Routes>

      {/* ========================================
          Public
      ======================================== */}

      <Route
        path="/"
        element={<HomePage />}
      />


      {/* ========================================
          Student Authentication
      ======================================== */}

      <Route
        path="/login"
        element={<StudentLoginPage />}
      />

      <Route
        path="/register"
        element={<StudentRegisterPage />}
      />


      {/* ========================================
          Student Application
      ======================================== */}

      <Route
        element={
          <ProtectedRoute
            requiredRole="student"
          />
        }
      >

        <Route
          element={<StudentLayout />}
        >

          <Route
            path="/student/dashboard"
            element={
              <StudentDashboard />
            }
          />

        </Route>

      </Route>


      {/* ========================================
          Teacher Authentication
      ======================================== */}

      <Route
        path="/teacher/login"
        element={<TeacherLoginPage />}
      />

      <Route
        path="/teacher/register"
        element={
          <TeacherRegisterPage />
        }
      />


      {/* ========================================
          Teacher Application
      ======================================== */}

      <Route
        element={
          <ProtectedRoute
            requiredRole="teacher"
          />
        }
      >

        <Route
          element={<TeacherLayout />}
        >

          <Route
            path="/teacher/dashboard"
            element={
              <TeacherDashboard />
            }
          />


          <Route
            path="/teacher/courses"
            element={
              <CourseListPage />
            }
          />


          <Route
            path="/teacher/courses/create"
            element={
              <CourseCreatePage />
            }
          />


          <Route
            path="/teacher/courses/:courseId/playground"
            element={
              <CoursePlaygroundPage />
            }
          />


        
        </Route>

      </Route>

    </Routes>
  );
}


export default App;