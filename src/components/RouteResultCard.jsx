import SafetyGauge from "./SafetyGauge";

function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} hr ${mins % 60} min`;
}

function formatDistance(meters) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

export default function RouteResultCard({ route, selected, onSelect }) {
  return (
    <div
      className={`route-card${selected ? " selected" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
    >
      <div className="route-card-top">
        <span className="route-card-title">Route {route.routeIndex + 1}</span>
        <span className="mono" style={{ color: "var(--text-muted)", fontSize: 13 }}>
          {formatDistance(route.distanceMeters)} · {formatDuration(route.durationSeconds)}
        </span>
      </div>

      <SafetyGauge score={route.safetyScore} />

      <div className="route-card-meta">
        {route.potholesCount > 0 && (
          <span className="hazard-pill pothole">◆ {route.potholesCount} pothole(s)</span>
        )}
        {route.closedGatesCount > 0 && (
          <span className="hazard-pill gate">▲ {route.closedGatesCount} closed gate(s)</span>
        )}
        {route.accidentCount > 0 && (
          <span className="hazard-pill accident">● {route.accidentCount} accident report(s)</span>
        )}
        {route.potholesCount === 0 && route.closedGatesCount === 0 && route.accidentCount === 0 && (
          <span style={{ color: "var(--teal)", fontSize: 12 }}>No known hazards on this path</span>
        )}
      </div>
    </div>
  );
}
