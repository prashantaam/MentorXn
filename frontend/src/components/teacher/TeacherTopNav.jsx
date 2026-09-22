import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function TeacherTopNav() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const firstName =
    user?.name?.split(" ")[0] || "Teacher";

  const firstInitial =
    firstName.charAt(0).toUpperCase() || "T";

  const handleLogout = async () => {
    await logout();

    navigate("/teacher/login", {
      replace: true,
    });
  };

  return (
    <header className="teacher-top-nav">
      <div className="teacher-top-nav-inner">
        <Link
          to="/teacher/dashboard"
          className="teacher-brand"
        >
          <span className="teacher-brand-icon">
            🎓
          </span>

          <div className="teacher-brand-text">
            <span className="teacher-brand-name">
              Mentor<span>Xn</span>
            </span>

            <span className="teacher-brand-portal">
              Teacher Portal
            </span>
          </div>
        </Link>

        <nav
          className="teacher-navigation"
          aria-label="Teacher navigation"
        >
          <NavLink
            to="/teacher/dashboard"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/teacher/courses"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Courses
          </NavLink>

          <NavLink
            to="/teacher/students"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Students
          </NavLink>
        </nav>

        <div className="teacher-nav-actions">
          <div className="teacher-profile">
            <div className="teacher-avatar">
              {firstInitial}
            </div>

            <div className="teacher-profile-info">
              <span className="teacher-profile-name">
                {firstName}
              </span>

              <span className="teacher-profile-role">
                Teacher
              </span>
            </div>
          </div>

          <button
            type="button"
            className="teacher-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default TeacherTopNav;