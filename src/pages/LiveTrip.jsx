import { useEffect, useRef, useState } from "react";
import { sendTelemetry } from "../api/trips";
import { useAuth } from "../context/AuthContext";
import useDocumentTitle from "../utils/useDocumentTitle";

// Generates a stable trip id for the browser session.
function useTripId() {
  const ref = useRef(crypto.randomUUID());
  return ref.current;
}

export default function LiveTrip() {
  useDocumentTitle("Live Tracking");
  const { user } = useAuth();
  const tripId = useTripId();

  const [tracking, setTracking] = useState(false);
  const [lastPing, setLastPing] = useState(null);
  const [error, setError] = useState("");
  const watchIdRef = useRef(null);
  const lastPosRef = useRef(null);
  const lastTimeRef = useRef(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation isn't available in this browser.");
      return;
    }
    setError("");
    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const now = Date.now();

        // Derive a rough speed (km/h) from consecutive fixes since the browser's
        // reported speed is often null on desktop / short intervals.
        let speedKmh = pos.coords.speed != null ? pos.coords.speed * 3.6 : 0;
        if (lastPosRef.current && lastTimeRef.current) {
          const dtHours = (now - lastTimeRef.current) / 3600000;
          if (dtHours > 0) {
            const distanceKm = haversineKm(lastPosRef.current, [latitude, longitude]);
            speedKmh = distanceKm / dtHours;
          }
        }
        lastPosRef.current = [latitude, longitude];
        lastTimeRef.current = now;

        try {
          await sendTelemetry({
            userId: user.id,
            tripId,
            latitude,
            longitude,
            speedKmh,
          });
          setLastPing({ latitude, longitude, speedKmh, at: new Date(now) });
        } catch (err) {
          setError(err.message);
        }
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  };

  useEffect(() => () => stopTracking(), []);

  return (
    <div className="page">
      <span className="eyebrow">Trip telemetry</span>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Live trip tracking</h1>
      <p style={{ marginBottom: 20 }}>
        While tracking, your position streams to the backend every few seconds. If two or more
        tracked users are stopped near the same railway gate, it's auto-flagged as closed.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          {!tracking ? (
            <button className="btn btn-primary" onClick={startTracking}>
              Start tracking
            </button>
          ) : (
            <button className="btn btn-danger" onClick={stopTracking}>
              Stop tracking
            </button>
          )}
          <span className="mono" style={{ alignSelf: "center", fontSize: 12, color: "var(--text-muted)" }}>
            trip: {tripId.slice(0, 8)}
          </span>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {lastPing ? (
          <div className="mono" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            <div>lat/lng: {lastPing.latitude.toFixed(5)}, {lastPing.longitude.toFixed(5)}</div>
            <div>speed: {lastPing.speedKmh.toFixed(1)} km/h</div>
            <div>last update: {lastPing.at.toLocaleTimeString()}</div>
          </div>
        ) : (
          <div className="empty-state">No pings sent yet. Start tracking to begin.</div>
        )}
      </div>
    </div>
  );
}

function haversineKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
