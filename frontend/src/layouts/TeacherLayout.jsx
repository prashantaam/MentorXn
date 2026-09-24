import { Outlet } from "react-router-dom";

import TeacherTopNav from "../components/teacher/TeacherTopNav";
import TeacherFooter from "../components/teacher/TeacherFooter";

import "../styles/teachers/teacher-layout.css";

function TeacherLayout() {
  return (
    <div className="teacher-app">
      <TeacherTopNav />

      <main className="teacher-main">
        <Outlet />
      </main>

      <TeacherFooter />
    </div>
  );
}

export default TeacherLayout;