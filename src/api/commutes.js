import { api } from "./client";

// Daily Commutes module — documented in the backend API spec, not yet
// implemented in the current backend build. Wired up against the spec so
// this frontend is ready once the endpoints ship.

export async function saveCommute({
  userId,
  name,
  startLatitude,
  startLongitude,
  endLatitude,
  endLongitude,
  startName,
  endName,
}) {
  const res = await api.post("/api/v1/commutes", {
    userId,
    name,
    startLatitude,
    startLongitude,
    endLatitude,
    endLongitude,
    startName,
    endName,
  });
  return res.data;
}

export async function getUserCommutes(userId) {
  const res = await api.get(`/api/v1/commutes/user/${userId}`);
  return res.data; // array of commute profiles
}

export async function deleteCommute(id) {
  await api.delete(`/api/v1/commutes/${id}`);
}
