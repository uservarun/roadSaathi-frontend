import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: "⌁",
    title: "Safer routes",
    text: "Compare routes using road hazards, alerts and safety signals—not just distance.",
  },
  {
    icon: "◉",
    title: "Live road awareness",
    text: "See nearby potholes, railway gates, accidents and other reported hazards.",
  },
  {
    icon: "↗",
    title: "Smart trip planning",
    text: "Choose the balance you want between safety, speed and convenience.",
  },
  {
    icon: "✦",
    title: "Earn for helping",
    text: "Report road issues, contribute to your community and collect RoadPoints.",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="hero-kicker"><span /> SMART ROAD TRAVEL AGENT</div>
          <h1>Don't just find a route.<br /><em>Find a safer one.</em></h1>
          <p className="hero-subtitle">
            RoadSaathi combines route planning with real road-risk information
            so you can make smarter journeys before you hit the road.
          </p>

          <div className="hero-actions">
            <Link className="btn btn-primary btn-large" to={isAuthenticated ? "/plan" : "/signup"}>
              Plan a safe route <span>→</span>
            </Link>
            <Link className="btn btn-ghost btn-large" to={isAuthenticated ? "/hazards" : "/login"}>
              Explore road hazards
            </Link>
          </div>

          <div className="hero-trust">
            <span className="trust-dot" />
            <span>Built for everyday Indian roads</span>
            <span className="trust-divider" />
            <span className="mono">LIVE ROAD INTELLIGENCE</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="RoadSaathi route preview">
          <div className="map-card">
            <div className="map-topbar">
              <span className="map-live"><i /> LIVE</span>
              <span className="mono">ROAD VIEW · 13.0Z</span>
            </div>
            <div className="fake-map">
              <div className="map-grid" />
              <div className="road road-one" />
              <div className="road road-two" />
              <div className="road road-three" />
              <div className="route-line" />
              <span className="map-pin pin-a">A</span>
              <span className="map-pin pin-b">B</span>
              <span className="hazard-dot hazard-1">!</span>
              <span className="hazard-dot hazard-2">!</span>
              <span className="hazard-dot hazard-3">!</span>
              <div className="map-label label-safe">SAFER ROUTE</div>
              <div className="map-label label-risk">POTHOLE</div>
            </div>
            <div className="route-preview">
              <div>
                <span className="route-status">RECOMMENDED</span>
                <strong>Safest route</strong>
                <small>18.4 km · 34 min</small>
              </div>
              <div className="safety-score"><b>92</b><span>/100<br />SAFETY</span></div>
            </div>
          </div>
          <div className="floating-alert">
            <span>!</span>
            <div><b>Hazard detected</b><small>2 road issues ahead</small></div>
          </div>
        </div>
      </section>

      <section className="home-stats">
        <div><span className="mono">01</span><strong>Route intelligence</strong><p>Safety-first route choices</p></div>
        <div><span className="mono">02</span><strong>Community reports</strong><p>Road conditions from users</p></div>
        <div><span className="mono">03</span><strong>Live awareness</strong><p>Know what is ahead</p></div>
        <div><span className="mono">04</span><strong>One simple mission</strong><p>Get home safer</p></div>
      </section>

      <section className="home-section">
        <div className="section-intro">
          <span className="eyebrow">WHY ROADSAATHI</span>
          <h2>A road companion that thinks beyond distance.</h2>
          <p>Traditional navigation asks, “How fast can you get there?” RoadSaathi asks, “What is the better way to get there?”</p>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-number mono">0{index + 1}</div>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <span className="feature-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="home-safety">
        <div className="safety-copy">
          <span className="eyebrow">SAFETY-FIRST NAVIGATION</span>
          <h2>Every journey deserves a smarter decision.</h2>
          <p>Set your preference, choose your destination and let RoadSaathi compare the road ahead. You stay in control while the system surfaces the safest practical option.</p>
          <Link className="text-link" to={isAuthenticated ? "/plan" : "/signup"}>Start planning <span>→</span></Link>
        </div>
        <div className="safety-panel">
          <div className="panel-head"><span>ROUTE ANALYSIS</span><span className="mono">READY</span></div>
          <div className="analysis-row"><div><b>Safest</b><small>18.4 km · 34 min</small></div><div className="analysis-score high">92</div></div>
          <div className="analysis-bar"><span style={{width:"92%"}} /></div>
          <div className="analysis-row muted"><div><b>Fastest</b><small>15.7 km · 28 min</small></div><div className="analysis-score">76</div></div>
          <div className="analysis-bar"><span style={{width:"76%"}} /></div>
          <div className="analysis-row muted"><div><b>Balanced</b><small>17.2 km · 31 min</small></div><div className="analysis-score">84</div></div>
          <div className="analysis-bar"><span style={{width:"84%"}} /></div>
        </div>
      </section>

      <section className="home-cta">
        <div>
          <span className="eyebrow">READY WHEN YOU ARE</span>
          <h2>Make your next trip a RoadSaathi trip.</h2>
          <p>Plan smarter. Report hazards. Help make the roads around you safer.</p>
        </div>
        <Link className="btn btn-primary btn-large" to={isAuthenticated ? "/plan" : "/signup"}>
          Get started <span>→</span>
        </Link>
      </section>

      <footer className="home-footer">
        <span className="brand"><span className="brand-mark" /> RoadSaathi</span>
        <span className="mono">SMART ROAD TRAVEL AGENT · 2026</span>
      </footer>
    </main>
  );
}
