import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("hms_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      localStorage.setItem("hms_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("hms_user");
    }
  }, [user]);

  async function login(username, password) {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login/", { username, password });
      localStorage.setItem("hms_access", data.access);
      localStorage.setItem("hms_refresh", data.refresh);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.detail || "Invalid username or password.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("hms_access");
    localStorage.removeItem("hms_refresh");
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, logout, loading, error }), [user, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
