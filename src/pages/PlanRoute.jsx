import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { calculateSafeRoute } from "../api/routing";
import { saveCommute } from "../api/commutes";
import { wktLineStringToLatLng } from "../utils/wkt";
import { useAuth } from "../context/AuthContext";
import RouteResultCard from "../components/RouteResultCard";
import useDocumentTitle from "../utils/useDocumentTitle";

// Prevent Leaflet default marker 404 errors during bundle loading
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'><path fill='%23e4572e' d='M12.5 0C5.6 0 0 5.6 0 12.5c0 7.8 12.5 28.5 12.5 28.5S25 20.3 25 12.5C25 5.6 19.4 0 12.5 0z'/></svg>",
  iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'><path fill='%23e4572e' d='M12.5 0C5.6 0 0 5.6 0 12.5c0 7.8 12.5 28.5 12.5 28.5S25 20.3 25 12.5C25 5.6 19.4 0 12.5 0z'/></svg>",
  shadowUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='41' height='41' viewBox='0 0 41 41'></svg>"
});

// Center on Mathura, India (matches the backend's seed data).
const DEFAULT_CENTER = [27.4924, 77.6737];

export default function PlanRoute() {
  useDocumentTitle("Plan Route");
  const { user } = useAuth();

  const [start, setStart] = useState(null); // { lat, lng }
  const [end, setEnd] = useState(null);     // { lat, lng }
  const [preference, setPreference] = useState("SAFEST");
  const [routes, setRoutes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [commuteName, setCommuteName] = useState("");
  const [saveStatus, setSaveStatus] = useState({ loading: false, error: "", success: "" });

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  // Keep click handler updated to avoid stale closures
  const clickHandlerRef = useRef(null);
  clickHandlerRef.current = (e) => {
    const point = { lat: e.latlng.lat, lng: e.latlng.lng };
    if (!start || (start && end)) {
      setStart(point);
      setEnd(null);
      setRoutes([]);
    } else {
      setEnd(point);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(DEFAULT_CENTER, 13);
      
      // Use clean street style CartoDB Voyager tiles (100% free, no key required)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20
      }).addTo(map);

      map.on("click", (e) => {
        if (clickHandlerRef.current) {
          clickHandlerRef.current(e);
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Paths dynamically when start, end, or selectedPath changes
  const selectedRoute = routes[selectedIndex];
  const selectedPath = selectedRoute ? wktLineStringToLatLng(selectedRoute.routeGeometry) : [];

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // 1. Update Start Marker
    if (start) {
      const iconA = L.divIcon({
        className: "custom-marker-a",
        html: `<div style="background-color: #2bb673; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid #0d1013; font-family: monospace;">A</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      if (startMarkerRef.current) {
        startMarkerRef.current.setLatLng([start.lat, start.lng]);
      } else {
        startMarkerRef.current = L.marker([start.lat, start.lng], { icon: iconA }).addTo(map);
      }
    } else {
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
        startMarkerRef.current = null;
      }
    }

    // 2. Update End Marker
    if (end) {
      const iconB = L.divIcon({
        className: "custom-marker-b",
        html: `<div style="background-color: #e4572e; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid #0d1013; font-family: monospace;">B</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      if (endMarkerRef.current) {
        endMarkerRef.current.setLatLng([end.lat, end.lng]);
      } else {
        endMarkerRef.current = L.marker([end.lat, end.lng], { icon: iconB }).addTo(map);
      }
    } else {
      if (endMarkerRef.current) {
        endMarkerRef.current.remove();
        endMarkerRef.current = null;
      }
    }

    // 3. Update Polyline path
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (selectedPath.length > 0) {
      const latlngs = selectedPath.map((p) => [p.lat, p.lng]);
      polylineRef.current = L.polyline(latlngs, {
        color: "#f2a93b",
        weight: 5,
        opacity: 0.9
      }).addTo(map);

      // Auto-zoom the map view to contain the calculated route bounds!
      map.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40] });
    }
  }, [start, end, selectedPath]);

  const handleCalculate = async () => {
    if (!start || !end) return;
    setLoading(true);
    setError("");
    try {
      const result = await calculateSafeRoute({
        startLocation: { latitude: start.lat, longitude: start.lng },
        endLocation: { latitude: end.lat, longitude: end.lng },
        safetyPreference: preference,
      });
      setRoutes(result);
      setSelectedIndex(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCommute = async (e) => {
    e.preventDefault();
    if (!start || !end) return;
    setSaveStatus({ loading: true, error: "", success: "" });
    try {
      if (!user?.id) throw new Error("Log in first — commutes are tied to your account.");
      await saveCommute({
        userId: user.id,
        name: commuteName || "Untitled commute",
        startLatitude: start.lat,
        startLongitude: start.lng,
        endLatitude: end.lat,
        endLongitude: end.lng,
        startName: "Start",
        endName: "End",
      });
      setSaveStatus({ loading: false, error: "", success: "Saved to your commutes." });
      setCommuteName("");
    } catch (err) {
      setSaveStatus({ loading: false, error: err.message, success: "" });
    }
  };

  return (
    <div className="page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Plan a trip</span>
          <h1 style={{ fontSize: 26 }}>Find the safer way there</h1>
        </div>
      </div>

      <p style={{ marginBottom: 16 }}>
        Click the map to set a start point, then click again to set your destination.
      </p>

      <div className="map-shell" style={{ marginBottom: 20, height: "400px" }}>
        <div ref={mapContainerRef} style={{ height: "100%", width: "100%", borderRadius: "8px" }} />
      </div>

      <div className="card card-tight" style={{ marginBottom: 20, display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="pref">Safety preference</label>
          <select id="pref" value={preference} onChange={(e) => setPreference(e.target.value)}>
            <option value="SAFEST">Safest</option>
            <option value="FASTEST">Fastest</option>
            <option value="BALANCED">Balanced</option>
          </select>
        </div>
        <button
          className="btn btn-primary"
          disabled={!start || !end || loading}
          onClick={handleCalculate}
        >
          {loading ? "Calculating…" : "Calculate route"}
        </button>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {start ? `Start: ${start.lat.toFixed(4)}, ${start.lng.toFixed(4)}` : "No start set"}
          {end ? ` · End: ${end.lat.toFixed(4)}, ${end.lng.toFixed(4)}` : ""}
        </span>
      </div>

      {start && end && (
        <form
          onSubmit={handleSaveCommute}
          className="card card-tight"
          style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}
        >
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 180 }}>
            <label htmlFor="commuteName">Save this trip as a commute</label>
            <input
              id="commuteName"
              placeholder="e.g. Home to Work"
              value={commuteName}
              onChange={(e) => setCommuteName(e.target.value)}
            />
          </div>
          <button className="btn btn-ghost" disabled={saveStatus.loading}>
            {saveStatus.loading ? "Saving…" : "Save commute"}
          </button>
          {saveStatus.error && <div className="error-banner" style={{ marginBottom: 0 }}>{saveStatus.error}</div>}
          {saveStatus.success && <div className="success-banner" style={{ marginBottom: 0 }}>{saveStatus.success}</div>}
        </form>
      )}

      {error && <div className="error-banner">{error}</div>}

      {routes.length > 0 && (
        <>
          <div className="section-heading">
            <h2 style={{ fontSize: 18 }}>{routes.length} route(s) found</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {routes.map((route, i) => (
              <RouteResultCard
                key={route.routeIndex}
                route={route}
                selected={i === selectedIndex}
                onSelect={() => setSelectedIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
