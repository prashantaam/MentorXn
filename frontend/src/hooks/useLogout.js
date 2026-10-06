import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { LOGIN_BY_ROLE } from "../components/layout/navigation";
import { useAuth } from "../context/AuthContext";

/* Log out, then go to the log-in page for the user's role. */
export function useLogout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return useCallback(async () => {
    const loginPath = LOGIN_BY_ROLE[user?.role] || "/login";

    await logout();
    navigate(loginPath, { replace: true });
  }, [logout, navigate, user?.role]);
}
