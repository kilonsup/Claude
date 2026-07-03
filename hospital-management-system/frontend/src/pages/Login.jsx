import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login, loading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  if (user) {
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch {
      // error surfaced via context
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <h1>MediCore HMS</h1>
        <p className="sub">Hospital Management System — sign in to continue</p>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="demo-creds">
          <strong>Demo accounts</strong> (password: <code>Passw0rd!</code>)<br />
          admin · dr.okafor · dr.bello · nurse.johnson · patient.chinedu
        </div>
      </div>
    </div>
  );
}
