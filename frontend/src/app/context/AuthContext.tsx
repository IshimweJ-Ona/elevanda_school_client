import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchProfile, loginRequest } from "../lib/api";

const AUTH_STORAGE_KEY = "elevanda-school-auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    let initialToken = null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        initialToken = parsed.token ?? null;
        setToken(initialToken);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }

    const loadProfile = async () => {
      if (!initialToken) {
        setLoading(false);
        return;
      }

      try {
        const result = await fetchProfile();
        setUser(result.user);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const login = async ({ identifier, password }) => {
    const trimmed = String(identifier ?? "").trim();
    const looksLikePhone = trimmed.startsWith("+") || /^[0-9\s-]+$/.test(trimmed);

    const result = await loginRequest({
      ...(looksLikePhone ? { phone_number: trimmed } : { email: trimmed }),
      password
    });
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result));
    return result;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout, authenticated: Boolean(user && token) }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
