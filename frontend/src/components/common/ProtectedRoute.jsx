import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ requiredRole }) {
  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-checking">
        <div className="auth-checking-card">
          <span>🌱</span>

          <strong>Loading your adventure...</strong>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    requiredRole &&
    user?.role !== requiredRole
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;