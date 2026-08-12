import { useState } from "react";
import { reportPothole, updateRailwayGate } from "../api/issues";
import { useAuth } from "../context/AuthContext";

import useDocumentTitle from "../utils/useDocumentTitle";

function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState("");

  const locate = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation isn't available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => setError(err.message)
    );
  };

  return { coords, error, locate };
}

export default function ReportIssue() {
  useDocumentTitle("Report Incident");
  const { user } = useAuth();
  const { coords, error: geoError, locate } = useGeolocation();

  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [gateStatus, setGateStatus] = useState("CLOSED");

  const [potholeStatus, setPotholeStatus] = useState({ loading: false, error: "", success: "" });
  const [gateStatusMsg, setGateStatusMsg] = useState({ loading: false, error: "", success: "" });

  const requireUser = () => {
    if (!user?.id) {
      throw new Error("Log in first — reports need to be tied to your account.");
    }
  };

  const submitPothole = async (e) => {
    e.preventDefault();
    setPotholeStatus({ loading: true, error: "", success: "" });
    try {
      requireUser();
      if (!coords) throw new Error("Set your location first.");
      const pothole = await reportPothole({
        userId: user.id,
        latitude: coords.latitude,
        longitude: coords.longitude,
        description,
        imageFile,
      });
      setPotholeStatus({
        loading: false,
        error: "",
        success: `Reported — status: ${pothole.aiStatus}, severity: ${pothole.severity}.`,
      });
      setDescription("");
      setImageFile(null);
    } catch (err) {
      setPotholeStatus({ loading: false, error: err.message, success: "" });
    }
  };

  const submitGate = async (e) => {
    e.preventDefault();
    setGateStatusMsg({ loading: true, error: "", success: "" });
    try {
      requireUser();
      if (!coords) throw new Error("Set your location first.");
      await updateRailwayGate({
        latitude: coords.latitude,
        longitude: coords.longitude,
        status: gateStatus,
        userId: user.id,
      });
      setGateStatusMsg({ loading: false, error: "", success: "Gate status updated." });
    } catch (err) {
      setGateStatusMsg({ loading: false, error: err.message, success: "" });
    }
  };

  return (
    <div className="page">
      <span className="eyebrow">Community reports</span>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Report a road issue</h1>
      <p style={{ marginBottom: 20 }}>
        Reports feed directly into route safety scoring for everyone else on the road.
        Limited to one report every 5 minutes per account.
      </p>

      <div className="card card-tight" style={{ marginBottom: 20 }}>
        <button className="btn btn-ghost" onClick={locate} type="button">
          Use my current location
        </button>
        {coords && (
          <span className="mono" style={{ marginLeft: 12, fontSize: 12, color: "var(--teal)" }}>
            {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
          </span>
        )}
        {geoError && <div className="error-banner" style={{ marginTop: 12 }}>{geoError}</div>}
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: 17, marginBottom: 12 }}>Pothole / road damage</h2>
          {potholeStatus.error && <div className="error-banner">{potholeStatus.error}</div>}
          {potholeStatus.success && <div className="success-banner">{potholeStatus.success}</div>}
          <form onSubmit={submitPothole}>
            <div className="field">
              <label htmlFor="desc">Description (optional)</label>
              <textarea
                id="desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="image">Photo (optional — enables AI verification)</label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={potholeStatus.loading}>
              {potholeStatus.loading ? "Submitting…" : "Submit report"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 17, marginBottom: 12 }}>Railway gate status</h2>
          <p style={{ marginBottom: 12, fontSize: 13 }}>
            You must be within 50 meters of the crossing for this to be accepted.
          </p>
          {gateStatusMsg.error && <div className="error-banner">{gateStatusMsg.error}</div>}
          {gateStatusMsg.success && <div className="success-banner">{gateStatusMsg.success}</div>}
          <form onSubmit={submitGate}>
            <div className="field">
              <label htmlFor="gateStatus">Current status</label>
              <select id="gateStatus" value={gateStatus} onChange={(e) => setGateStatus(e.target.value)}>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="CLOSING_SOON">Closing soon</option>
              </select>
            </div>
            <button className="btn btn-primary btn-block" disabled={gateStatusMsg.loading}>
              {gateStatusMsg.loading ? "Submitting…" : "Update gate status"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
