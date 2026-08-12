import { api } from "./client";

export async function sendTelemetry({ userId, tripId, latitude, longitude, speedKmh }) {
  await api.post("/api/v1/trips/telemetry", {
    userId,
    tripId,
    latitude,
    longitude,
    speedKmh,
  });
}
