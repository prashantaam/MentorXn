import { Outlet } from "react-router-dom";

import StudentTopNav from "../components/student/StudentTopNav";
import StudentFooter from "../components/student/StudentFooter";


import "../styles/students/student-layout.css";

function StudentLayout() {
  return (
    <div className="student-app">
      <StudentTopNav />

      <main className="student-main">
        <Outlet />
      </main>

      <StudentFooter />
    </div>
  );
}

export default StudentLayout;