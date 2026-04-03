import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { adminApi, setAdminToken } from "../admin/adminApi.js";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pql_admin_token");
    if (!token) {
      setLoading(false);
      return;
    }
    adminApi
      .me()
      .then((r) => {
        if (r.user?.role === "admin") setAdmin(r.user);
        else {
          setAdminToken(null);
          setAdmin(null);
        }
      })
      .catch(() => {
        setAdminToken(null);
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    setAdminToken(null);
    setAdmin(null);
  }

  async function login(email, password) {
    const r = await adminApi.adminLogin({ email, password });
    setAdminToken(r.token);
    setAdmin(r.user);
    return r;
  }

  const value = useMemo(
    () => ({ admin, loading, login, logout }),
    [admin, loading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth outside AdminAuthProvider");
  return ctx;
}
