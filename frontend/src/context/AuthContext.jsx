import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

function getStoredAuth() {
  const localToken = localStorage.getItem("auth_token");
  const sessionToken = sessionStorage.getItem("auth_token");

  const token = localToken || sessionToken;

  const storage = localToken
    ? localStorage
    : sessionToken
      ? sessionStorage
      : null;

  if (!token || !storage) {
    return {
      token: null,
      user: null,
    };
  }

  try {
    const user = JSON.parse(storage.getItem("user"));

    return {
      token,
      user,
    };
  } catch {
    return {
      token,
      user: null,
    };
  }
}

export function AuthProvider({ children }) {
  const storedAuth = getStoredAuth();

  const [user, setUser] = useState(storedAuth.user);
  const [token, setToken] = useState(storedAuth.token);
  const [isLoading, setIsLoading] = useState(
    Boolean(storedAuth.token)
  );

  const clearAuth = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user");

    setUser(null);
    setToken(null);
  };

  const saveAuth = ({
    user: authenticatedUser,
    token: authenticatedToken,
    remember = false,
  }) => {
    clearAuth();

    const storage = remember
      ? localStorage
      : sessionStorage;

    storage.setItem(
      "auth_token",
      authenticatedToken
    );

    storage.setItem(
      "user",
      JSON.stringify(authenticatedUser)
    );

    setUser(authenticatedUser);
    setToken(authenticatedToken);
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(
          "http://127.0.0.1:8000/api/logout",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
    }
  };

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/user",
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          clearAuth();
          return;
        }

        const data = await response.json();

        setUser(data.user);

        const storage =
          localStorage.getItem("auth_token")
            ? localStorage
            : sessionStorage;

        storage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      } catch (error) {
        console.error(
          "Authentication verification error:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        saveAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}