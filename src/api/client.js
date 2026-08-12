import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const api = axios.create({ baseURL });

// Attach the JWT (if we have one) to every outgoing request.
// Public endpoints simply ignore the header, so this is safe to always send.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("roadsaathi_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize backend errors: every error from GlobalExceptionHandler
// comes back as { error: "message" }.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);
