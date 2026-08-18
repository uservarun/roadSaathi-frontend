import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { api } from "../api/client";

const links = [
  { to: "/plan", label: "Plan route" },
  { to: "/hazards", label: "Nearby hazards" },
  { to: "/report", label: "Report issue" },
  { to: "/trip", label: "Live trip" },
  { to: "/commutes", label: "Commutes" },
  { to: "/rewards", label: "Rewards" },
  { to: "/government", label: "Government", adminOnly: true },
];

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchPoints = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const res = await api.get("/api/v1/rewards/balance");
          setPoints(res.data.points);
        } catch (e) {
          console.error("Failed to load points in navbar", e);
        }
      }
    };
    fetchPoints();
    const interval = setInterval(fetchPoints, 20000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated) {
    return (
      <header className="navbar public-navbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" /> RoadSaathi
        </NavLink>
        <div className="public-nav-actions">
          <NavLink to="/login" className="nav-link">Log in</NavLink>
          <NavLink to="/signup" className="btn btn-primary">Get started</NavLink>
        </div>
      </header>
    );
  }

  const visibleLinks = links.filter((l) => !l.adminOnly || user?.role === "ADMIN");

  return (
    <>
      <header className="navbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" /> RoadSaathi
        </NavLink>
        <nav className="nav-links">
          {visibleLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-user">
          <span className="mono" style={{ marginRight: 8, color: "var(--amber)", fontWeight: 700 }}>
            ⭐ {points} pts
          </span>
          <span className="mono" style={{ marginRight: 12 }}>{user?.username}</span>
          <button className="btn btn-ghost" onClick={() => { logout(); navigate("/"); }}>Log out</button>
        </div>
      </header>
      <nav className="mobile-bottom-nav">
        {visibleLinks.map((l) => {
          let shortLabel = l.label;
          if (l.to === "/plan") shortLabel = "Plan";
          if (l.to === "/hazards") shortLabel = "Hazards";
          if (l.to === "/report") shortLabel = "Report";
          if (l.to === "/trip") shortLabel = "Live";
          if (l.to === "/commutes") shortLabel = "Commutes";
          if (l.to === "/rewards") shortLabel = "Rewards";
          if (l.to === "/government") shortLabel = "Gov";
          return <NavLink key={l.to} to={l.to} className={({ isActive }) => `mobile-bottom-link${isActive ? " active" : ""}`}><span className="mobile-bottom-label">{shortLabel}</span></NavLink>;
        })}
      </nav>
    </>
  );
}
