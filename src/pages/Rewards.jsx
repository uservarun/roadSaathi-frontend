import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import useDocumentTitle from "../utils/useDocumentTitle";

export default function Rewards() {
  useDocumentTitle("Rewards Store");
  const { user } = useAuth();

  const [points, setPoints] = useState(0);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [redeemStatus, setRedeemStatus] = useState({ success: "", error: "" });

  const fetchRewardsData = async () => {
    if (!user?.id) return;
    try {
      const [balanceRes, historyRes] = await Promise.all([
        api.get(`/api/v1/rewards/balance?userId=${user.id}`),
        api.get(`/api/v1/rewards/history?userId=${user.id}`)
      ]);
      setPoints(balanceRes.data.points);
      setVouchers(historyRes.data);
    } catch (e) {
      console.error("Failed to load rewards data", e);
    }
  };

  useEffect(() => {
    fetchRewardsData();
  }, [user?.id]);

  const handleRedeem = async (voucherType, amount) => {
    setLoading(true);
    setRedeemStatus({ success: "", error: "" });
    try {
      const res = await api.post(
        `/api/v1/rewards/redeem?userId=${user.id}&voucherType=${voucherType}`
      );
      setRedeemStatus({
        success: `Successfully redeemed Rs. ${amount} FASTag Voucher! Your code is: ${res.data.code}`,
        error: ""
      });
      fetchRewardsData(); // Refresh points balance & history
    } catch (err) {
      setRedeemStatus({
        success: "",
        error: err.response?.data?.error || "Redemption failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Voucher code copied to clipboard!");
  };

  return (
    <div className="page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Citizen Benefits</span>
          <h1 style={{ fontSize: 26 }}>Toll & FASTag Rewards</h1>
        </div>
      </div>

      <p style={{ marginBottom: 24 }}>
        Earn points automatically by reporting road hazards (potholes, closed crossing gates) and help make travel safer.
      </p>

      {/* Points Summary Card */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, var(--asphalt-800) 0%, var(--asphalt-900) 100%)",
          border: "1px solid var(--amber-dim)",
          padding: "24px 30px",
          marginBottom: 30,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
            Your Balance
          </h3>
          <span style={{ fontSize: 36, fontWeight: 800, color: "var(--amber)", display: "flex", alignItems: "center", gap: 8 }}>
            ⭐ {points} <span style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>Points</span>
          </span>
        </div>
        <div style={{ maxWidth: 300, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
          NHAI toll tag discounts are automatically generated upon point redemption. Redemptions are active instantly.
        </div>
      </div>

      {redeemStatus.success && <div className="success-banner">{redeemStatus.success}</div>}
      {redeemStatus.error && <div className="error-banner">{redeemStatus.error}</div>}

      {/* Available Rewards Cards */}
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Available Redeems</h2>
      <div className="grid-2" style={{ marginBottom: 40 }}>
        {/* Rs 50 FASTag Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span className="hazard-pill pothole" style={{ fontSize: 10 }}>500 POINTS</span>
              <span style={{ fontSize: 20, fontWeight: 700 }}>Rs. 50</span>
            </div>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 16 }}>FASTag Discount Voucher</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              Get a Rs. 50 flat discount voucher on your next FASTag toll recharge.
            </p>
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 20 }}
            disabled={loading || points < 500}
            onClick={() => handleRedeem("FASTAG_50", 50)}
          >
            {loading ? "Redeeming..." : points < 500 ? "Need 500 pts" : "Redeem Voucher"}
          </button>
        </div>

        {/* Rs 100 FASTag Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span className="hazard-pill pothole" style={{ fontSize: 10 }}>1000 POINTS</span>
              <span style={{ fontSize: 20, fontWeight: 700 }}>Rs. 100</span>
            </div>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 16 }}>FASTag Premium Voucher</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              Get a Rs. 100 flat discount voucher on your next FASTag toll recharge.
            </p>
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 20 }}
            disabled={loading || points < 1000}
            onClick={() => handleRedeem("FASTAG_100", 100)}
          >
            {loading ? "Redeeming..." : points < 1000 ? "Need 1000 pts" : "Redeem Voucher"}
          </button>
        </div>
      </div>

      {/* Redeemed History Table */}
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Active Vouchers History</h2>
      {vouchers.length === 0 ? (
        <div className="empty-state">
          No vouchers redeemed yet. Earn points by reporting road issues!
        </div>
      ) : (
        <div className="card card-tight" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line-faint)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Code</th>
                <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Discount</th>
                <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Status</th>
                <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Generated</th>
                <th style={{ padding: "12px 16px", color: "var(--text-muted)", textAlignment: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid var(--line-faint)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--amber)" }}>
                    {v.code}
                  </td>
                  <td style={{ padding: "12px 16px" }}>Rs. {v.amount}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={`hazard-pill ${v.status === "ACTIVE" ? "pothole" : "accident"}`}>
                      {v.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 12 }}>
                    {new Date(v.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => copyToClipboard(v.code)}>
                      Copy Code
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}