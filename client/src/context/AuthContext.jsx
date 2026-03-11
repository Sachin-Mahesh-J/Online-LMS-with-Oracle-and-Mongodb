import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe, login as loginRequest } from "../api/authApi";
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from "../utils/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const [loading, setLoading] = useState(true);

  const normalizeUser = useCallback((incoming) => {
    if (!incoming || !incoming.user_id || !incoming.role) return null;

    return {
      ...incoming,
      role: String(incoming.role).toUpperCase(),
    };
  }, []);

  const refresh = useCallback(async () => {
    const stored = getStoredUser();

    if (!stored) {
      clearStoredUser();
      setUser(null);
      setLoading(false);
      return null;
    }

    setLoading(true);

    try {
      const data = await getMe();
      const normalized = normalizeUser(data.user);

      if (!normalized) {
        clearStoredUser();
        setUser(null);
        return null;
      }

      setStoredUser(normalized);
      setUser(normalized);
      return normalized;
    } catch {
      clearStoredUser();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [normalizeUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async ({ email, password }) => {
      const data = await loginRequest({ email, password });

      const normalizedUser = normalizeUser(data.user);

      if (!normalizedUser) {
        clearStoredUser();
        setUser(null);
        throw new Error("Login failed");
      }

      setStoredUser(normalizedUser);
      setUser(normalizedUser);

      await refresh();

      return normalizedUser;
    },
    [normalizeUser, refresh],
  );

  const logout = useCallback(() => {
    clearStoredUser();
    setUser(null);
  }, []);

  const role = String(user?.role || "").toUpperCase();

  const ctxValue = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      role,
      isStudent: role === "STUDENT",
      isInstructor: role === "INSTRUCTOR",
      isAdmin: role === "ADMIN",
      hasRole: (roles = []) => {
        const allowed = roles.map((r) => String(r).toUpperCase());
        return allowed.includes(role);
      },
      login,
      logout,
      refresh,
    }),
    [user, loading, role, login, logout, refresh],
  );

  return (
    <AuthContext.Provider value={ctxValue}>{children}</AuthContext.Provider>
  );
}

export default AuthContext;
