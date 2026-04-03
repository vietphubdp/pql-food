import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pql_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => {
        localStorage.removeItem("pql_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    localStorage.removeItem("pql_token");
    setUser(null);
  }

  async function login(email, password) {
    const r = await api.login({ email, password });
    localStorage.setItem("pql_token", r.token);
    setUser(r.user);
    return r;
  }

  async function register(payload) {
    const r = await api.register(payload);
    localStorage.setItem("pql_token", r.token);
    setUser(r.user);
    return r;
  }

  async function refreshProfile() {
    const r = await api.me();
    setUser(r.user);
    return r.user;
  }

  async function saveProfile(patch) {
    const r = await api.updateMe(patch);
    setUser(r.user);
    return r.user;
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      saveProfile,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
