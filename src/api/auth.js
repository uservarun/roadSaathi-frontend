import { api } from "./client";

export async function signup({ username, email, password }) {
  const res = await api.post("/api/v1/auth/signup", { username, email, password });
  return res.data; // { user, token }
}

export async function login({ username, password }) {
  const res = await api.post("/api/v1/auth/login", { username, password });
  return res.data; // { user, token }
}

export async function verifyEmail({ email, code }) {
  const res = await api.post("/api/v1/auth/verify", null, {
    params: { email, code },
  });
  return res.data; // { message }
}

// --- Endpoints below are documented in the backend API spec but not yet
// implemented in the current backend build. They're wired up here so the
// frontend is ready the moment the backend ships them. ---

export async function resendCode({ email }) {
  const res = await api.post("/api/v1/auth/resend-code", null, {
    params: { email },
  });
  return res.data; // { message }
}

export async function forgotPassword({ email }) {
  const res = await api.post("/api/v1/auth/forgot-password", null, {
    params: { email },
  });
  return res.data; // { message }
}

export async function resetPassword({ email, code, newPassword }) {
  const res = await api.post("/api/v1/auth/reset-password", null, {
    params: { email, code, newPassword },
  });
  return res.data; // { message }
}
