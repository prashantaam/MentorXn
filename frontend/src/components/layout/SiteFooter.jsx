import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

/* The one footer for the whole site — landing, student and teacher. */
function SiteFooter() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="mx-footer">
      <div>
        MentorX<sup>n</sup> — made for curious people who learn by doing.
        {" "}© {new Date().getFullYear()}
      </div>

      {!isAuthenticated && (
        <nav className="mx-footer__links" aria-label="Footer">
          <Link to="/login">Student sign in</Link>
          <Link to="/register">Create an account</Link>
          <Link to="/teacher/login">Teacher portal</Link>
        </nav>
      )}
    </footer>
  );
}

export default SiteFooter;
