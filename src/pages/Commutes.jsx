import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserCommutes, deleteCommute } from "../api/commutes";
import { useAuth } from "../context/AuthContext";
import useDocumentTitle from "../utils/useDocumentTitle";

export default function Commutes() {
  useDocumentTitle("My Commutes");
  const { user } = useAuth();
  const [commutes, setCommutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getUserCommutes(user.id);
      setCommutes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError("");
    try {
      await deleteCommute(id);
      setCommutes((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page">
      <span className="eyebrow">Saved commutes</span>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Your frequent routes</h1>
      <p style={{ marginBottom: 20 }}>
        Save start/end pairs from the route planner to jump straight to them next time.{" "}
        <Link to="/plan" style={{ color: "var(--amber)" }}>Plan a new one →</Link>
      </p>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading your commutes…</div>
      ) : commutes.length === 0 ? (
        <div className="empty-state">
          No saved commutes yet. Plan a route and use "Save commute" to add one.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {commutes.map((c) => (
            <div key={c.id} className="card card-tight" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
                <div className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {c.startName || "Start"} ({c.startLatitude.toFixed(4)}, {c.startLongitude.toFixed(4)}) →{" "}
                  {c.endName || "End"} ({c.endLatitude.toFixed(4)}, {c.endLongitude.toFixed(4)})
                </div>
              </div>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(c.id)}
                disabled={deletingId === c.id}
              >
                {deletingId === c.id ? "Removing…" : "Remove"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
