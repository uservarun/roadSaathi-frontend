import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { calculateSafeRoute } from "../api/routing";
import { saveCommute, getUserCommutes } from "../api/commutes";
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

  const contactEmail = import.meta.env.VITE_USER_EMAIL;

  const [start, setStart] = useState(null); // { lat, lng }
  const [end, setEnd] = useState(null);     // { lat, lng }
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [preference, setPreference] = useState("SAFEST");
  const [routes, setRoutes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [commuteName, setCommuteName] = useState("");
  const [saveStatus, setSaveStatus] = useState({ loading: false, error: "", success: "" });
  const [savedCommutes, setSavedCommutes] = useState([]);

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [showStartDrop, setShowStartDrop] = useState(false);
  const [showEndDrop, setShowEndDrop] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  // Use current location function
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const point = { lat, lng };
          setStart(point);
          setStartQuery(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 14);
          }
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            if (data.display_name) {
              setStartQuery(data.display_name.split(",").slice(0, 3).join(","));
            }
          } catch (e) {
            console.error(e);
          }
        },
        (err) => {
          console.log("Geolocation permission denied.");
        }
      );
    }
  };

  // Auto-ask geolocation & load saved commutes on mount
  useEffect(() => {
    handleUseMyLocation();
    const fetchCommutes = async () => {
      if (user?.id) {
        try {
          const data = await getUserCommutes(user.id);
          setSavedCommutes(data);
        } catch (e) {
          console.error("Failed to load saved commutes for dropdown", e);
        }
      }
    };
    fetchCommutes();
  }, [user?.id]);

  // Debounce Autocomplete for Start Input
  useEffect(() => {
    if (!startQuery || startQuery.trim().length < 3 || start) {
      setStartSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(startQuery)}&format=json&limit=5&email=${contactEmail}`
        );
        const data = await res.json();
        setStartSuggestions(data || []);
        setShowStartDrop(true);
      } catch (e) {
        console.error("Autocomplete failed", e);
      }
    }, 600); // 600ms delay to accommodate slower connections

    return () => clearTimeout(timer);
  }, [startQuery]);

  // Debounce Autocomplete for End Input
  useEffect(() => {
    if (!endQuery || endQuery.trim().length < 3 || end) {
      setEndSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endQuery)}&format=json&limit=5&email=${contactEmail}`
        );
        const data = await res.json();
        setEndSuggestions(data || []);
        setShowEndDrop(true);
      } catch (e) {
        console.error("Autocomplete failed", e);
      }
    }, 600); // 600ms delay to accommodate slower connections

    return () => clearTimeout(timer);
  }, [endQuery]);

  // Geocoding Search
  const handleSearch = async (query, type) => {
    if (!query.trim()) return;
    setError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const point = { lat, lng };
        if (type === "START") {
          setStart(point);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 14);
          }
        } else {
          setEnd(point);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 14);
          }
        }
      } else {
        setError(`Location not found: "${query}". Try adding city or district name.`);
      }
    } catch (err) {
      setError("Failed to geocode address. Please check your internet connection.");
    }
  };

  // Keep click handler updated to avoid stale closures
  const clickHandlerRef = useRef(null);
  clickHandlerRef.current = async (e) => {
    const point = { lat: e.latlng.lat, lng: e.latlng.lng };
    if (!start || (start && end)) {
      setStart(point);
      setEnd(null);
      setStartQuery(`${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
      setEndQuery("");
      setRoutes([]);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${point.lat}&lon=${point.lng}&format=json`);
        const data = await res.json();
        if (data.display_name) {
          setStartQuery(data.display_name.split(",").slice(0, 3).join(","));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setEnd(point);
      setEndQuery(`${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${point.lat}&lon=${point.lng}&format=json`);
        const data = await res.json();
        if (data.display_name) {
          setEndQuery(data.display_name.split(",").slice(0, 3).join(","));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(DEFAULT_CENTER, 13);
      
      // Use standard OpenStreetMap tiles (100% free, no key required)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
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
        Type start and destination locations below, or click directly on the map.
      </p>

      {/* Address Geocoding Search Panel */}
      <div className="card card-tight" style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          
          {/* Start Location Input with Autocomplete */}
          <div className="field" style={{ flex: 1, minWidth: 280, marginBottom: 0, position: "relative" }}>
            <label htmlFor="startAddr">Start point</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="startAddr"
                placeholder="Type start street/landmark..."
                value={startQuery}
                onChange={(e) => {
                  setStartQuery(e.target.value);
                  setStart(null);
                  setRoutes([]);
                }}
                onFocus={() => setShowStartDrop(true)}
                onBlur={() => setTimeout(() => setShowStartDrop(false), 200)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(startQuery, "START")}
              />
              <button type="button" className="btn btn-ghost" style={{ padding: "0 14px" }} onClick={() => handleSearch(startQuery, "START")}>Search</button>
              <button type="button" className="btn btn-ghost" style={{ padding: "0 12px" }} title="Use current location" onClick={handleUseMyLocation}>📍</button>
            </div>
            {showStartDrop && startSuggestions.length > 0 && (
              <ul className="autocomplete-dropdown">
                {startSuggestions.map((item) => (
                  <li
                    key={item.place_id}
                    onClick={() => {
                      const lat = parseFloat(item.lat);
                      const lng = parseFloat(item.lon);
                      setStart({ lat, lng });
                      setStartQuery(item.display_name.split(",").slice(0, 3).join(","));
                      setShowStartDrop(false);
                      setStartSuggestions([]);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([lat, lng], 14);
                      }
                    }}
                  >
                    {item.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* End Location Input with Autocomplete */}
          <div className="field" style={{ flex: 1, minWidth: 280, marginBottom: 0, position: "relative" }}>
            <label htmlFor="endAddr">Destination point</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="endAddr"
                placeholder="Type destination street/landmark..."
                value={endQuery}
                onChange={(e) => {
                  setEndQuery(e.target.value);
                  setEnd(null);
                  setRoutes([]);
                }}
                onFocus={() => setShowEndDrop(true)}
                onBlur={() => setTimeout(() => setShowEndDrop(false), 200)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(endQuery, "END")}
              />
              <button type="button" className="btn btn-ghost" style={{ padding: "0 14px" }} onClick={() => handleSearch(endQuery, "END")}>Search</button>
            </div>
            {showEndDrop && endSuggestions.length > 0 && (
              <ul className="autocomplete-dropdown">
                {endSuggestions.map((item) => (
                  <li
                    key={item.place_id}
                    onClick={() => {
                      const lat = parseFloat(item.lat);
                      const lng = parseFloat(item.lon);
                      setEnd({ lat, lng });
                      setEndQuery(item.display_name.split(",").slice(0, 3).join(","));
                      setShowEndDrop(false);
                      setEndSuggestions([]);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([lat, lng], 14);
                      }
                    }}
                  >
                    {item.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>

      <div className="map-shell" style={{ marginBottom: 20, height: "400px", position: "relative" }}>
        <div ref={mapContainerRef} style={{ height: "100%", width: "100%", borderRadius: "8px" }} />
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleUseMyLocation}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1000,
            background: "var(--asphalt-800)",
            border: "1px solid var(--line-faint)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
            borderRadius: "6px"
          }}
        >
          🎯 Locate Me
        </button>
      </div>

      <div className="card card-tight" style={{ marginBottom: 20, display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
        {savedCommutes.length > 0 && (
          <div className="field" style={{ marginBottom: 0, minWidth: 200 }}>
            <label htmlFor="loadCommute">Load a saved commute</label>
            <select
              id="loadCommute"
              defaultValue=""
              onChange={(e) => {
                const selected = savedCommutes.find((c) => c.id === e.target.value);
                if (selected) {
                  const startPt = { lat: selected.startLatitude, lng: selected.startLongitude };
                  const endPt = { lat: selected.endLatitude, lng: selected.endLongitude };
                  setStart(startPt);
                  setEnd(endPt);
                  setStartQuery(selected.startName || "Start");
                  setEndQuery(selected.endName || "End");
                  setRoutes([]);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([startPt.lat, startPt.lng], 13);
                  }
                }
              }}
            >
              <option value="" disabled>-- Select a saved trip --</option>
              {savedCommutes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

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
