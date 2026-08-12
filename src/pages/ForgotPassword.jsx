import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email });
      setSuccess(res.message || "Password reset code sent. Check your email.");
      setTimeout(() => navigate("/reset-password", { state: { email } }), 1200);
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
        <h1 style={{ marginBottom: 6, fontSize: 24 }}>Forgot your password?</h1>
        <p style={{ marginBottom: 24 }}>
          Enter your account email and we'll send a 6-digit reset code.
        </p>

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
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Sending…" : "Send reset code"}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 13, textAlign: "center" }}>
          Already have a code? <Link to="/reset-password" style={{ color: "var(--amber)" }}>Reset password</Link>
          {" · "}
          <Link to="/login" style={{ color: "var(--amber)" }}>Back to login</Link>
        </p>
      </div>
    </div>
  );
}
