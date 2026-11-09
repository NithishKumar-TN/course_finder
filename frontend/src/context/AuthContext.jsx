import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [latestSession, setLatestSession] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking auth on mount

  // Restore auth state from server cookie on page load / refresh
  useEffect(() => {
    authAPI
      .me()
      .then(({ data }) => {
        setUser(data.user);
        setProfile(data.profile);
        setLatestSession(data.latestSession);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    setUser(data.user);
    setProfile(data.profile);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    setUser(data.user);
    setProfile(null);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await authAPI.logout();
    setUser(null);
    setProfile(null);
    setLatestSession(null);
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const { data } = await authAPI.me();
      setUser(data.user);
      setProfile(data.profile);
      setLatestSession(data.latestSession);
    } catch (_) {}
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, latestSession, loading, login, register, logout, refreshMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
