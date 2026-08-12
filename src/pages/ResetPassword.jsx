import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await authApi.resetPassword({ email, code, newPassword });
      setSuccess(res.message || "Password has been reset successfully.");
      setTimeout(() => navigate("/login"), 1500);
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
        <h1 style={{ marginBottom: 6, fontSize: 24 }}>Reset your password</h1>
        <p style={{ marginBottom: 24 }}>Enter the code we emailed you along with a new password.</p>

        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="code">Reset code</label>
            <input
              id="code"
              required
              maxLength={6}
              className="mono"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 13, textAlign: "center" }}>
          <Link to="/forgot-password" style={{ color: "var(--amber)" }}>Need a new code?</Link>
          {" · "}
          <Link to="/login" style={{ color: "var(--amber)" }}>Back to login</Link>
        </p>
      </div>
    </div>
  );
}
