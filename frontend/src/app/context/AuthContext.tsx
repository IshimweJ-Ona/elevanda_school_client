import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { fetchProfile, loginRequest } from "../lib/api";

const AUTH_STORAGE_KEY = "elevanda-school-auth";

type User = {
  id: string;
  name: string;
  firstName?: string;
  email: string;
  phone_number: string;
  role: string;
  isVerified: boolean;
};

type LoginPayload = {
  identifier: string;
  password: string;
};

type LoginResult = {
  user: User;
  token: string;
};

type AuthContextValue = {
  authenticated: boolean;
  loading: boolean;
  user: User | null;
  token: string | null;
  login: (payload: LoginPayload) => Promise<LoginResult>;
  logout: () => void;
  refreshProfile: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredAuth = (): LoginResult | null => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    if (!parsed?.token || !parsed?.user) return null;
    return parsed;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const writeStoredAuth = (auth: LoginResult) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = readStoredAuth();
    if (!stored) {
      setLoading(false);
      return;
    }

    setUser(stored.user);
    setToken(stored.token);

    fetchProfile()
      .then((result) => {
        const nextAuth = { token: stored.token, user: result.user };
        setUser(result.user);
        writeStoredAuth(nextAuth);
      })
      .catch(() => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async ({ identifier, password }: LoginPayload) => {
    const normalizedIdentifier = identifier.trim();
    const payload = normalizedIdentifier.includes("@")
      ? { email: normalizedIdentifier, password }
      : { phone_number: normalizedIdentifier, password };

    const result = await loginRequest(payload);
    writeStoredAuth(result);
    setUser(result.user);
    setToken(result.token);
    return result;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setToken(null);
  };

  const refreshProfile = async () => {
    if (!token) return null;

    const result = await fetchProfile();
    const nextAuth = { token, user: result.user };
    setUser(result.user);
    writeStoredAuth(nextAuth);
    return result.user;
  };

  const value = useMemo(
    () => ({
      authenticated: Boolean(token && user),
      loading,
      user,
      token,
      login,
      logout,
      refreshProfile
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
