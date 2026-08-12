import { api } from "./client";

export async function calculateSafeRoute({ startLocation, endLocation, safetyPreference }) {
  const res = await api.post("/api/v1/routing/calculate", {
    startLocation,
    endLocation,
    safetyPreference,
  });
  return res.data.routes; // array of scored route objects
}
