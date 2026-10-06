import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useLogout } from "../../hooks/useLogout";
import { ACCOUNT_PATH, HOME_BY_ROLE } from "./navigation";
import UserAvatar from "./UserAvatar";

/*
 * Avatar button in the site header that opens the account menu:
 * who's signed in, dashboard, account settings and — last — log out.
 * Closes on Escape, outside click, or choosing an item; arrow keys move
 * between items.
 */
function UserMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();
  const logout = useLogout();

  const items = () => Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') || []);

  useEffect(() => {
    if (!isOpen) return undefined;

    // Move focus into the menu so keyboard users land on the first item.
    menuRef.current?.querySelector('[role="menuitem"]')?.focus();

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const onMenuKeyDown = (event) => {
    const list = items();
    const index = list.indexOf(document.activeElement);
    const moves = {
      ArrowDown: (index + 1) % list.length,
      ArrowUp: (index - 1 + list.length) % list.length,
      Home: 0,
      End: list.length - 1,
    };

    if (event.key in moves) {
      event.preventDefault();
      list[moves[event.key]]?.focus();
    } else if (event.key === "Tab") {
      setIsOpen(false);
    }
  };

  const close = () => setIsOpen(false);

  return (
    <div className="mx-user-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="mx-user-menu__button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={`Account menu for ${user?.name || "your account"}`}
        onClick={() => setIsOpen((open) => !open)}
      >
        <UserAvatar name={user?.name} />
        <span className="mx-user-menu__caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          id={menuId}
          ref={menuRef}
          className="mx-user-menu__panel"
          role="menu"
          aria-label="Account"
          onKeyDown={onMenuKeyDown}
        >
          <div className="mx-user-menu__who">
            <UserAvatar name={user?.name} size="lg" />
            <div className="mx-grow">
              <b>{user?.name}</b>
              {user?.email && <span className="mx-user-menu__email">{user.email}</span>}
              <span className="mx-tag mx-user-menu__role">{user?.role}</span>
            </div>
          </div>

          <Link
            role="menuitem"
            className="mx-user-menu__item"
            to={HOME_BY_ROLE[user?.role] || "/"}
            onClick={close}
          >
            <span aria-hidden="true">🏠</span> My dashboard
          </Link>
          <Link role="menuitem" className="mx-user-menu__item" to={ACCOUNT_PATH} onClick={close}>
            <span aria-hidden="true">⚙️</span> Account settings
          </Link>

          <div className="mx-user-menu__divider" role="separator" />

          <button
            type="button"
            role="menuitem"
            className="mx-user-menu__item mx-user-menu__item--danger"
            onClick={() => {
              close();
              logout();
            }}
          >
            <span aria-hidden="true">↪</span> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
