import { useGoogleMaps } from "../context/GoogleMapsProvider";

// Renders a friendly placeholder instead of the map when the Google Maps
// script hasn't loaded yet, failed to load, or no API key is configured.
// Returns null (render the real map) once everything is ready.
export default function MapStatus() {
  const { isLoaded, loadError, hasApiKey } = useGoogleMaps();

  if (!hasApiKey) {
    return (
      <div className="map-shell map-placeholder">
        <div>
          <strong>Google Maps API key missing.</strong>
          <p style={{ marginTop: 6 }}>
            Add <code className="mono">VITE_GOOGLE_MAPS_API_KEY</code> to your{" "}
            <code className="mono">.env</code> file (see README.md), then restart{" "}
            <code className="mono">npm run dev</code>.
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="map-shell map-placeholder">
        <div>
          <strong>Google Maps failed to load.</strong>
          <p style={{ marginTop: 6 }}>
            Check that your API key is valid, has the "Maps JavaScript API" enabled, and is
            allowed for this domain.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-shell map-placeholder">
        <span className="mono">Loading map…</span>
      </div>
    );
  }

  return null;
}
