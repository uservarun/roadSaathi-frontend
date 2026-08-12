import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { getNearbyHazards } from "../api/issues";
import { wktPointToLatLng } from "../utils/wkt";
import useDocumentTitle from "../utils/useDocumentTitle";

// Prevent Leaflet default marker 404 errors during bundle loading
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'><path fill='%23e4572e' d='M12.5 0C5.6 0 0 5.6 0 12.5c0 7.8 12.5 28.5 12.5 28.5S25 20.3 25 12.5C25 5.6 19.4 0 12.5 0z'/></svg>",
  iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'><path fill='%23e4572e' d='M12.5 0C5.6 0 0 5.6 0 12.5c0 7.8 12.5 28.5 12.5 28.5S25 20.3 25 12.5C25 5.6 19.4 0 12.5 0z'/></svg>",
  shadowUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='41' height='41' viewBox='0 0 41 41'></svg>"
});

const DEFAULT_CENTER = { lat: 27.4924, lng: 77.6737 };

export default function Dashboard() {
  useDocumentTitle("Nearby Hazards");
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [radius, setRadius] = useState(5000);
  const [hazards, setHazards] = useState({ potholes: [], alerts: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 13);
      
      // Use clean street style CartoDB Voyager tiles (100% free, no key required)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center position and markers dynamically
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Pan map to center coordinates
    map.setView([center.lat, center.lng], 13);

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Render Potholes (Orange Diamond Markers)
    hazards.potholes.forEach((p) => {
      const pos = wktPointToLatLng(p.coordinate);
      if (!pos) return;

      const customIcon = L.divIcon({
        className: "custom-hazard-pothole",
        html: `<div style="background-color: #f2a93b; width: 14px; height: 14px; transform: rotate(45deg); border: 2px solid #0d1013;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const m = L.marker([pos.lat, pos.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0d1013; font-family: sans-serif; font-size: 13px; line-height: 1.4;">
            <strong>Pothole</strong> · <span style="font-weight: 600; color: #f2a93b;">${p.severity}</span>
            <br />
            Status: ${p.aiStatus}
          </div>
        `);
      markersRef.current.push(m);
    });

    // Render Crossing Alerts (Red Circular Markers)
    hazards.alerts.forEach((a) => {
      const pos = wktPointToLatLng(a.coordinate);
      if (!pos) return;

      const customIcon = L.divIcon({
        className: "custom-hazard-alert",
        html: `<div style="background-color: #e4572e; border-radius: 50%; width: 14px; height: 14px; border: 2px solid #0d1013;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const m = L.marker([pos.lat, pos.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0d1013; font-family: sans-serif; font-size: 13px; line-height: 1.4;">
            <strong>${a.alertType}</strong> · <span style="font-weight: 600; color: #e4572e;">${a.status}</span>
            <br />
            ${a.description || "No description provided."}
          </div>
        `);
      markersRef.current.push(m);
    });

  }, [center, hazards]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  };

  const fetchHazards = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getNearbyHazards({
        latitude: center.lat,
        longitude: center.lng,
        radius,
      });
      setHazards(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <span className="eyebrow">Live map</span>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Nearby hazards</h1>
      <p style={{ marginBottom: 20 }}>
        See reported potholes and active alerts (railway gates, accidents) around a point.
      </p>

      <div className="card card-tight" style={{ marginBottom: 20, display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={useMyLocation} type="button">
          Use my location
        </button>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="radius">Radius (meters)</label>
          <input
            id="radius"
            type="number"
            min={500}
            step={500}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          />
        </div>
        <button className="btn btn-primary" onClick={fetchHazards} disabled={loading}>
          {loading ? "Loading…" : "Refresh hazards"}
        </button>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
        </span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="map-shell" style={{ marginBottom: 20, height: "400px" }}>
        <div ref={mapContainerRef} style={{ height: "100%", width: "100%", borderRadius: "8px" }} />
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: 16, marginBottom: 10 }}>Potholes ({hazards.potholes.length})</h2>
          {hazards.potholes.length === 0 && <p>No potholes in range.</p>}
          {hazards.potholes.map((p) => (
            <div key={p.id} className="hazard-pill pothole" style={{ marginRight: 6, marginBottom: 6 }}>
              {p.severity} · {p.aiStatus}
            </div>
          ))}
        </div>
        <div className="card">
          <h2 style={{ fontSize: 16, marginBottom: 10 }}>Alerts ({hazards.alerts.length})</h2>
          {hazards.alerts.length === 0 && <p>No active alerts in range.</p>}
          {hazards.alerts.map((a) => (
            <div key={a.id} className="hazard-pill gate" style={{ marginRight: 6, marginBottom: 6 }}>
              {a.alertType} · {a.status}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
