import { useEffect, useState } from "react";
import * as govApi from "../api/government";
import useDocumentTitle from "../utils/useDocumentTitle";

const POTHOLE_STATUSES = ["PENDING", "VERIFIED", "REPAIRED", "FALSE_ALARM"];
const ALERT_STATUSES = ["OPEN", "CLOSED"];

export default function GovernmentDashboard() {
  useDocumentTitle("Government Dashboard");
  const [data, setData] = useState({ potholes: [], alerts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await govApi.getAllIncidents();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePotholeStatus = async (id, status) => {
    setUpdatingId(id);
    setError("");
    try {
      const updated = await govApi.updatePotholeStatus(id, { status });
      setData((prev) => ({
        ...prev,
        potholes: prev.potholes.map((p) => (p.id === id ? { ...p, ...updated } : p)),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAlertStatus = async (id, status) => {
    setUpdatingId(id);
    setError("");
    try {
      const updated = await govApi.updateAlertStatus(id, { status });
      setData((prev) => ({
        ...prev,
        alerts: prev.alerts.map((a) => (a.id === id ? { ...a, ...updated } : a)),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page">
      <span className="eyebrow">Government / audit</span>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>All reported incidents</h1>
      <p style={{ marginBottom: 20 }}>
        Audit and overwrite pothole and railway-crossing statuses. Requires an authorized
        account — the backend returns 401 Unauthorized without one.
      </p>

      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-ghost" onClick={load} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="section-heading">
        <h2 style={{ fontSize: 18 }}>Potholes ({data.potholes.length})</h2>
      </div>
      {data.potholes.length === 0 && !loading && <div className="empty-state">No potholes on record.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {data.potholes.map((p) => (
          <div key={p.id} className="card card-tight" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <span className="hazard-pill pothole" style={{ marginRight: 8 }}>{p.severity}</span>
              <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.coordinate}</span>
            </div>
            <select
              value={p.aiStatus}
              disabled={updatingId === p.id}
              onChange={(e) => handlePotholeStatus(p.id, e.target.value)}
            >
              {POTHOLE_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="section-heading">
        <h2 style={{ fontSize: 18 }}>Alerts ({data.alerts.length})</h2>
      </div>
      {data.alerts.length === 0 && !loading && <div className="empty-state">No alerts on record.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.alerts.map((a) => (
          <div key={a.id} className="card card-tight" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <span className="hazard-pill gate" style={{ marginRight: 8 }}>{a.alertType}</span>
              <span style={{ fontSize: 13 }}>{a.description}</span>{" "}
              <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.coordinate}</span>
            </div>
            <select
              value={a.status}
              disabled={updatingId === a.id}
              onChange={(e) => handleAlertStatus(a.id, e.target.value)}
            >
              {ALERT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
