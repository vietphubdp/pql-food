/** Production: set VITE_API_BASE_URL on Vercel (e.g. https://your-api.onrender.com). Dev: leave unset — Vite proxy handles /api and /uploads. */
const raw = import.meta.env.VITE_API_BASE_URL || "";
export const API_BASE = String(raw).replace(/\/$/, "");

export function apiUrl(path) {
  if (path == null || path === "") return "";
  const s = String(path);
  if (/^https?:\/\//i.test(s)) return s;
  const p = s.startsWith("/") ? s : `/${s}`;
  return API_BASE ? `${API_BASE}${p}` : p;
}
