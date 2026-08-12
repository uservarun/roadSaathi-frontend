import { api } from "./client";

// Government / Dashboard module — documented in the backend API spec, not
// yet implemented in the current backend build. Wired up against the spec
// so this frontend is ready once the endpoints ship. The spec marks these
// 401 Unauthorized without a valid JWT, so they're sent through the same
// authenticated client as everything else.

export async function getAllIncidents() {
  const res = await api.get("/api/v1/issues/all");
  return res.data; // { potholes: [], alerts: [] }
}

export async function updatePotholeStatus(id, { status, severity }) {
  const res = await api.put(`/api/v1/issues/pothole/${id}/status`, null, {
    params: { status, ...(severity ? { severity } : {}) },
  });
  return res.data; // updated Pothole
}

export async function updateAlertStatus(id, { status, isActive }) {
  const res = await api.put(`/api/v1/issues/alert/${id}/status`, null, {
    params: { status, ...(isActive !== undefined ? { isActive } : {}) },
  });
  return res.data; // updated Alert
}
