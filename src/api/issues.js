import { api } from "./client";

export async function reportPothole({ userId, latitude, longitude, description, imageFile }) {
  const form = new FormData();
  form.append("userId", userId);
  form.append("latitude", latitude);
  form.append("longitude", longitude);
  if (description) form.append("description", description);
  if (imageFile) form.append("image", imageFile);

  const res = await api.post("/api/v1/issues/report", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateRailwayGate({ latitude, longitude, status, userId }) {
  const res = await api.post("/api/v1/issues/gate", null, {
    params: { latitude, longitude, status, userId },
  });
  return res.data;
}

export async function getNearbyHazards({ latitude, longitude, radius = 5000 }) {
  const res = await api.get("/api/v1/issues/nearby", {
    params: { latitude, longitude, radius },
  });
  return res.data; // { potholes: [], alerts: [] }
}
