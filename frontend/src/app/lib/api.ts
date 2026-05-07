const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const AUTH_STORAGE_KEY = "elevanda-school-auth";

export class ApiError extends Error {
  code?: string;
  status?: number;
  role?: string;
  constructor(message: string, options?: { code?: string; status?: number; role?: string }) {
    super(message);
    this.name = "ApiError";
    this.code = options?.code;
    this.status = options?.status;
    this.role = options?.role;
  }
}

const getAuthToken = () => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored).token;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const apiFetch = async (path, options = {}) => {
  const token = options.token || getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || response.statusText || "API request failed", {
      code: data.code,
      role: data.role,
      status: response.status
    });
  }

  return data;
};

export const loginRequest = async (payload) => {
  return await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const registerParentRequest = async (payload) => {
  return await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const fetchProfile = async () => {
  return await apiFetch("/api/user/profile");
};

export const updateProfile = async (payload) => {
  return await apiFetch("/api/user/profile", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
};

export const getParentDashboard = async () => {
  return await apiFetch("/api/parent/dashboard");
};
