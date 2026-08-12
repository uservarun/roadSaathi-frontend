// The backend returns route geometry as WKT, e.g. "LINESTRING(77.67 27.49, 77.68 27.50)"
// WKT order is (lng, lat) — Google Maps wants { lat, lng } literal objects.
export function wktLineStringToLatLng(wkt) {
  if (!wkt) return [];
  const inner = wkt.replace(/^LINESTRING\s*\(/i, "").replace(/\)$/, "");
  return inner
    .split(",")
    .map((pair) => pair.trim().split(/\s+/).map(Number))
    .filter(([lng, lat]) => !Number.isNaN(lng) && !Number.isNaN(lat))
    .map(([lng, lat]) => ({ lat, lng }));
}

// Alerts/potholes carry a `coordinate` field serialized by the backend's
// GeometrySerializer as a raw WKT string, e.g. "POINT (77.674 27.494)".
export function wktPointToLatLng(wkt) {
  if (!wkt) return null;
  const match = /POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i.exec(wkt);
  if (!match) return null;
  const [, lng, lat] = match;
  return { lat: Number(lat), lng: Number(lng) };
}
