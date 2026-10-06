import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLogout } from "../../hooks/useLogout";
import { HOME_BY_ROLE } from "../layout/navigation";

/*
 * Card shell shared by the student and teacher log-in / sign-up pages.
 * Each page passes its own copy, form and links; the look is identical.
 * If someone is already signed in, the form is replaced with a short
 * "you're already signed in" panel.
 */
function AuthCard({
  badge,
  title,
  subtitle,
  switchText,
  switchLabel,
  switchTo,
  otherPortal,
  children,
}) {
  const { user, isAuthenticated } = useAuth();
  const handleLogout = useLogout();

  if (isAuthenticated) {
    return (
      <div className="mx-page mx-auth">
        <section className="mx-auth-card mx-auth-card--already">
          <span className="mx-auth-card__big-emoji" aria-hidden="true">
            👋
          </span>
          <h1>You're already signed in</h1>
          <p className="mx-auth-card__sub">
            Signed in as <b>{user?.name}</b> ({user?.role}).
          </p>

          <div className="mx-auth-card__actions">
            <Link className="mx-btn" to={HOME_BY_ROLE[user?.role] || "/"}>
              Go to my dashboard
            </Link>
            <button
              type="button"
              className="mx-btn mx-btn--ghost"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-page mx-auth">
      <section className="mx-auth-card">
        <span className="mx-tag mx-auth-card__badge">{badge}</span>
        <h1>{title}</h1>
        <p className="mx-auth-card__sub">{subtitle}</p>

        {children}

        <p className="mx-auth-card__switch">
          {switchText} <Link to={switchTo}>{switchLabel}</Link>
        </p>

        {otherPortal && (
          <div className="mx-auth-card__note">
            <span aria-hidden="true">{otherPortal.emoji}</span>
            <span>
              {otherPortal.text}{" "}
              <Link to={otherPortal.to}>{otherPortal.label}</Link>
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

export default AuthCard;
