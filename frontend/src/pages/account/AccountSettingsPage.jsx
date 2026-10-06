import { useState } from "react";

import UserAvatar from "../../components/layout/UserAvatar";
import { useAuth } from "../../context/AuthContext";
import { useLogout } from "../../hooks/useLogout";
import { getThemePreference, setThemePreference } from "../../hooks/useTheme";

import "../../styles/pages/account.css";

const THEME_OPTIONS = [
  { value: "system", label: "🖥️ System", hint: "Match your device" },
  { value: "light", label: "☀️ Light", hint: "Always light" },
  { value: "dark", label: "🌙 Dark", hint: "Always dark" },
];

function formatDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

/*
 * Account settings for students and teachers.
 * The API has no profile-update endpoints yet, so profile details are
 * read-only; appearance is stored in this browser.
 */
function AccountSettingsPage() {
  const { user } = useAuth();
  const logout = useLogout();
  const [theme, setTheme] = useState(getThemePreference);

  const memberSince = formatDate(user?.created_at);

  const chooseTheme = (value) => {
    setTheme(value);
    setThemePreference(value);
  };

  return (
    <div className="mx-page mx-account">
      <header className="mx-account__head">
        <h1>Account settings</h1>
        <p className="mx-hint">Your profile and preferences.</p>
      </header>

      {/* ---------- profile ---------- */}
      <section className="mx-account__card" aria-labelledby="account-profile">
        <h2 id="account-profile">👤 Profile</h2>

        <div className="mx-account__identity">
          <UserAvatar name={user?.name} size="xl" />
          <div className="mx-grow">
            <b className="mx-account__name">{user?.name}</b>
            <span className="mx-hint">{user?.email}</span>
          </div>
        </div>

        <dl className="mx-account__details">
          <div>
            <dt>Name</dt>
            <dd>{user?.name || "—"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user?.email || "—"}</dd>
          </div>
          <div>
            <dt>Account type</dt>
            <dd className="mx-account__role">{user?.role || "—"}</dd>
          </div>
          {memberSince && (
            <div>
              <dt>Member since</dt>
              <dd>{memberSince}</dd>
            </div>
          )}
        </dl>

        <p className="mx-hint mx-account__note">
          Changing your name, email or password isn't available yet.
        </p>
      </section>

      {/* ---------- appearance ---------- */}
      <section className="mx-account__card" aria-labelledby="account-appearance">
        <h2 id="account-appearance">🎨 Appearance</h2>
        <p className="mx-hint">Saved in this browser.</p>

        <div className="mx-account__themes" role="radiogroup" aria-label="Theme">
          {THEME_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`mx-account__theme${theme === option.value ? " is-on" : ""}`}
            >
              <input
                type="radio"
                name="theme"
                className="mx-visually-hidden"
                value={option.value}
                checked={theme === option.value}
                onChange={() => chooseTheme(option.value)}
              />
              <b>{option.label}</b>
              <span className="mx-hint">{option.hint}</span>
            </label>
          ))}
        </div>
      </section>

      {/* ---------- session ---------- */}
      <section className="mx-account__card" aria-labelledby="account-session">
        <h2 id="account-session">🚪 Session</h2>
        <p className="mx-hint">Log out of MentorXn on this device.</p>
        <button type="button" className="mx-btn mx-btn--danger" onClick={logout}>
          ↪ Log out
        </button>
      </section>
    </div>
  );
}

export default AccountSettingsPage;
