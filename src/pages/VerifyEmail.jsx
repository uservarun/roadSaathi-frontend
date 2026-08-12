import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import * as authApi from "../api/auth";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const cooldownRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(cooldownRef.current);
  }, []);

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await authApi.verifyEmail({ email, code });
      setSuccess(res.message || "Email verified! You can now log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    setResendMessage("");
    setError("");
    setResendLoading(true);
    try {
      const res = await authApi.resendCode({ email });
      setResendMessage(res.message || "Verification code resent successfully.");
      startCooldown();
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="card" style={{ width: 380 }}>
        <span className="eyebrow">RoadSaathi</span>
        <h1 style={{ marginBottom: 6, fontSize: 24 }}>Verify your email</h1>
        <p style={{ marginBottom: 24 }}>Enter the 6-digit code we sent you.</p>

        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}
        {resendMessage && !success && <div className="success-banner">{resendMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="code">Verification code</label>
            <input
              id="code"
              required
              maxLength={6}
              className="mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Verifying…" : "Verify email"}
          </button>
        </form>

        <button
          type="button"
          className="btn btn-ghost btn-block"
          style={{ marginTop: 12 }}
          onClick={handleResend}
          disabled={resendLoading || resendCooldown > 0 || !email}
        >
          {resendLoading
            ? "Resending…"
            : resendCooldown > 0
            ? `Resend code (${resendCooldown}s)`
            : "Resend code"}
        </button>

        <p style={{ marginTop: 18, fontSize: 13, textAlign: "center" }}>
          <Link to="/login" style={{ color: "var(--amber)" }}>Back to login</Link>
        </p>
      </div>
    </div>
  );
}
