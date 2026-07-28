import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, register, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    username: "", password: "", email: "", first_name: "", last_name: "", role: "PLANNER",
  });

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login(form.username, form.password);
      } else {
        await register(form);
      }
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch {
      /* error is surfaced via context */
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-hero">
          <h1><span className="brand-mark">✦</span> Festiva</h1>
          <p>Plan events end-to-end: discover, book vendors, surprise someone, manage guests, and share the memories after.</p>
          <ul className="auth-points">
            <li>🎉 Discover public events near you</li>
            <li>🤝 Book and message trusted vendors</li>
            <li>🎁 Registries, gifts and surprise mode</li>
            <li>📸 A memory wall when it's all over</li>
          </ul>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="tab-switch">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Sign in</button>
            <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Create account</button>
          </div>

          {mode === "register" && (
            <>
              <div className="grid-2">
                <label>First name<input value={form.first_name} onChange={set("first_name")} /></label>
                <label>Last name<input value={form.last_name} onChange={set("last_name")} /></label>
              </div>
              <label>Email<input type="email" value={form.email} onChange={set("email")} required /></label>
              <label>I am a…
                <select value={form.role} onChange={set("role")}>
                  <option value="PLANNER">Host / Event planner</option>
                  <option value="VENDOR">Vendor</option>
                </select>
              </label>
            </>
          )}

          <label>Username<input value={form.username} onChange={set("username")} required autoFocus /></label>
          <label>Password<input type="password" value={form.password} onChange={set("password")} required /></label>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
          <p className="auth-alt">
            Just browsing? <Link to="/discover">Explore public events</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
