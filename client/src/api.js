const BASE = "";

function queryString(params) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("pql_token");
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = (data && data.message) || res.statusText || "Lỗi mạng";
    throw new Error(msg);
  }
  return data;
}

export const api = {
  getCategories: () => request("/api/categories"),
  getProducts: (params = {}) => request(`/api/products${queryString(params)}`),
  getProductBySlug: (slug) => request(`/api/products/slug/${slug}`),
  register: (body) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/api/auth/me"),
  updateMe: (body) =>
    request("/api/auth/me", { method: "PATCH", body: JSON.stringify(body) }),
  createOrder: (body) =>
    request("/api/orders", { method: "POST", body: JSON.stringify(body) }),
  myOrders: (status) =>
    request(`/api/orders/mine${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  getOrder: (id) => request(`/api/orders/${id}`),
  getPaymentConfig: () => request("/api/payment-config"),
  getContactConfig: () => request("/api/contact-config"),
};
