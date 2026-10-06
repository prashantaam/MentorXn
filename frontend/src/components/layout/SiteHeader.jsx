import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import { HOME_BY_ROLE, NAV_LINKS } from "./navigation";
import UserMenu from "./UserMenu";

/*
 * The one top nav for the whole site — landing page, student area
 * and teacher area. What it shows depends on who is signed in.
 */
function SiteHeader() {
  const { pathname } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toggleTheme } = useTheme();

  // Signed-out visitors on teacher pages get the teacher log-in / sign-up;
  // on developer pages, the developer log-in (developers have no sign-up).
  const isDevArea = pathname.startsWith("/dev");
  const guestAuthBase = pathname.startsWith("/teacher") ? "/teacher" : isDevArea ? "/dev" : "";

  const role = isAuthenticated ? user?.role : null;
  const links = NAV_LINKS[role] || NAV_LINKS.guest;

  const themeButton = (
    <button
      type="button"
      className="mx-icon-btn"
      onClick={toggleTheme}
      aria-label="Switch light or dark theme"
    >
      🌗
    </button>
  );

  return (
    <header className="mx-header">
      <Link className="mx-brand" to={HOME_BY_ROLE[role] || "/"}>
        <span className="mx-brand__logo" aria-hidden="true">
          M
        </span>
        <span>
          MentorX<sup>n</sup>
        </span>
      </Link>

      <nav className="mx-navlinks" aria-label="Main navigation">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            // Hash links point at a section of "/", so they'd always look active there.
            className={({ isActive }) =>
              isActive && !link.to.includes("#") ? "active" : undefined
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="mx-nav-right">
        {role ? (
          <>
            {themeButton}
            <UserMenu user={user} />
          </>
        ) : (
          <>
            <Link
              className="mx-btn mx-btn--ghost mx-btn--sm"
              to={`${guestAuthBase}/login`}
            >
              Log in
            </Link>
            {!isDevArea && (
              <Link className="mx-btn mx-btn--sm" to={`${guestAuthBase}/register`}>
                Sign up
              </Link>
            )}
            {themeButton}
          </>
        )}
      </div>
    </header>
  );
}

export default SiteHeader;
