import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const { login } = useAdminAuth();
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      nav("/quan-tri", { replace: true });
    } catch (ex) {
      setErr(ex.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-4">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">Về trang khách</span>
          </Link>
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-teal-300 text-3xl">admin_panel_settings</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">PQLFood Console</h1>
          <p className="text-slate-400 text-sm mt-1">Đăng nhập quản trị viên</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {err ? (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/15 text-rose-200 text-sm border border-rose-500/30">
              {err}
            </div>
          ) : null}
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-shadow"
                placeholder="admin@pqlfood.vn"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-shadow"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-colors shadow-lg shadow-teal-500/25"
            >
              Đăng nhập
            </button>
          </form>
        </div>
        <p className="text-center text-slate-500 text-xs mt-6">
          Chỉ tài khoản có quyền admin mới truy cập được.
        </p>
      </div>
    </div>
  );
}
