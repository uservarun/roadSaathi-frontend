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
  );
}
