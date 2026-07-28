import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("epp_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      localStorage.setItem("epp_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("epp_user");
    }
  }, [user]);

  async function login(username, password) {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login/", { username, password });
      localStorage.setItem("epp_access", data.access);
      localStorage.setItem("epp_refresh", data.refresh);
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

  async function register(payload) {
    setLoading(true);
    setError("");
    try {
      await api.post("/accounts/register/", payload);
      return login(payload.username, payload.password);
    } catch (err) {
      const data = err.response?.data;
      const message =
        typeof data === "object" && data
          ? Object.entries(data).map(([k, v]) => `${k}: ${[].concat(v).join(" ")}`).join(" · ")
          : "Registration failed.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("epp_access");
    localStorage.removeItem("epp_refresh");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, login, register, logout, loading, error }),
    [user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
