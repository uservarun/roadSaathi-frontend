// The signature visual element: a horizontal instrument-panel style gauge
// rather than a generic circular progress ring, matching the road-safety theme.
export default function SafetyGauge({ score }) {
  const clamped = Math.max(0, Math.min(100, score));
  const color =
    clamped >= 70 ? "var(--teal)" : clamped >= 40 ? "var(--amber)" : "var(--coral)";

  return (
    <div className="safety-gauge">
      <div className="safety-gauge-track">
        <div
          className="safety-gauge-fill"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
      <div className="safety-gauge-label">
        <span>Safety score</span>
        <span className="mono" style={{ color }}>
          {clamped.toFixed(0)}/100
        </span>
      </div>
    </div>
  );
}
