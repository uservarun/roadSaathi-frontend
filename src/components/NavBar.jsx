import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/plan", label: "Plan route" },
  { to: "/hazards", label: "Nearby hazards" },
  { to: "/report", label: "Report issue" },
  { to: "/trip", label: "Live trip" },
  { to: "/commutes", label: "Commutes" },
  { to: "/government", label: "Government", adminOnly: true },
];

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleLinks = links.filter((l) => !l.adminOnly || user?.role === "ADMIN");

  return (
    <>
      <header className="navbar">
        <NavLink to="/plan" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          RoadSaathi
        </NavLink>

        <nav className="nav-links">
          {visibleLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-user">
          {isAuthenticated ? (
            <>
              <span className="mono">{user?.username}</span>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary">
              Log in
            </NavLink>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Visible on screens < 720px) */}
      <nav className="mobile-bottom-nav">
        {visibleLinks.map((l) => {
          let emoji = "🗺️";
          if (l.to === "/hazards") emoji = "⚠️";
          if (l.to === "/report") emoji = "📝";
          if (l.to === "/trip") emoji = "⚡";
          if (l.to === "/commutes") emoji = "🚗";
          if (l.to === "/government") emoji = "🛡️";

          // Shorten labels for mobile bottom tabs
          let shortLabel = l.label;
          if (l.to === "/plan") shortLabel = "Plan";
          if (l.to === "/hazards") shortLabel = "Hazards";
          if (l.to === "/report") shortLabel = "Report";
          if (l.to === "/trip") shortLabel = "Live";
          if (l.to === "/commutes") shortLabel = "Commutes";
          if (l.to === "/government") shortLabel = "Gov";

          return (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `mobile-bottom-link${isActive ? " active" : ""}`}
            >
              <span className="mobile-bottom-label">{shortLabel}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
