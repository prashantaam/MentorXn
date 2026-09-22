import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function StudentTopNav() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const firstName =
    user?.name?.split(" ")[0] || "Learner";

  const firstInitial =
    firstName.charAt(0).toUpperCase() || "L";

  const handleLogout = async () => {
    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="student-top-nav">
      <div className="student-top-nav-inner">
        <Link
          to="/student/dashboard"
          className="student-brand"
        >
          <span className="student-brand-icon">
            🌱
          </span>

          <span className="student-brand-name">
            Mentor<span>Xn</span>
          </span>
        </Link>

        <nav
          className="student-navigation"
          aria-label="Student navigation"
        >
          <NavLink
            to="/student/dashboard"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/student/courses"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            My Courses
          </NavLink>
        </nav>

        <div className="student-nav-actions">
          <div className="student-stars">
            <span>⭐</span>
            <strong>120</strong>
          </div>

          <div className="student-profile">
            <div className="student-avatar">
              {firstInitial}
            </div>

            <div className="student-profile-info">
              <span className="student-profile-name">
                {firstName}
              </span>

              <span className="student-profile-role">
                Learner
              </span>
            </div>
          </div>

          <button
            type="button"
            className="student-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default StudentTopNav;