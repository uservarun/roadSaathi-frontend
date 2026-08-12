import { createContext, useContext, useState, useCallback } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

function loadStoredUser() {
  try {
    const raw = localStorage.getItem("roadsaathi_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("roadsaathi_token"));

  const persist = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem("roadsaathi_user", JSON.stringify(nextUser));
    localStorage.setItem("roadsaathi_token", nextToken);
  };

  const login = useCallback(async (credentials) => {
    const { user: u, token: t } = await authApi.login(credentials);
    persist(u, t);
    return u;
  }, []);

  const signup = useCallback(async (details) => {
    const { user: u, token: t } = await authApi.signup(details);
    persist(u, t);
    return u;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("roadsaathi_user");
    localStorage.removeItem("roadsaathi_token");
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
