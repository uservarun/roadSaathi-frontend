import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isExpired = location.search.includes("expired=true");

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/plan");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="card" style={{ width: 380 }}>
        <span className="eyebrow">RoadSaathi</span>
        <h1 style={{ marginBottom: 6, fontSize: 24 }}>Welcome back</h1>
        <p style={{ marginBottom: 24 }}>Log in to plan routes and report road hazards.</p>

        {isExpired && (
          <div className="info-banner" style={{ background: "rgba(242, 169, 59, 0.1)", color: "var(--amber)", border: "1px solid var(--amber)", padding: "10px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" }}>
            Your session has expired. Please log in again.
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              required
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p style={{ marginTop: 14, fontSize: 13, textAlign: "center" }}>
          <Link to="/forgot-password" style={{ color: "var(--amber)" }}>Forgot password?</Link>
        </p>
        <p style={{ marginTop: 6, fontSize: 13, textAlign: "center" }}>
          New here? <Link to="/signup" style={{ color: "var(--amber)" }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
