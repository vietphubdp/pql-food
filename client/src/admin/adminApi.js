import { apiUrl } from "../config/apiBase.js";

const TOKEN_KEY = "pql_admin_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** Bỏ qua undefined / null / "" — tránh `status=undefined` làm API lọc sai */
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
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(
    apiUrl(`/api${path.startsWith("/") ? path : `/${path}`}`),
    {
      ...options,
      headers,
    }
  );
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = (data && data.message) || res.statusText || "Lỗi";
    throw new Error(msg);
  }
  return data;
}

async function requestForm(path, formData) {
  const headers = {};
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(apiUrl(`/api${path.startsWith("/") ? path : `/${path}`}`), {
    method: "POST",
    headers,
    body: formData,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = (data && data.message) || res.statusText || "Lỗi";
    throw new Error(msg);
  }
  return data;
}

export const adminApi = {
  adminLogin: (body) => request("/auth/admin-login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  dashboard: () => request("/admin/dashboard"),
  categories: () => request("/admin/categories"),
  createCategory: (body) =>
    request("/admin/categories", { method: "POST", body: JSON.stringify(body) }),
  updateCategory: (id, body) =>
    request(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteCategory: (id) => request(`/admin/categories/${id}`, { method: "DELETE" }),
  products: (params = {}) => request(`/admin/products${queryString(params)}`),
  createProduct: (body) =>
    request("/admin/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id, body) =>
    request(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: "DELETE" }),
  orders: (params = {}) => request(`/admin/orders${queryString(params)}`),
  order: (id) => request(`/admin/orders/${id}`),
  patchOrder: (id, body) =>
    request(`/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteOrder: (id) => request(`/admin/orders/${id}`, { method: "DELETE" }),
  uploadProductImage: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return requestForm("/admin/upload/product-image", fd);
  },
  getPaymentConfig: () => request("/admin/payment-config"),
  updatePaymentConfig: (body) =>
    request("/admin/payment-config", { method: "PATCH", body: JSON.stringify(body) }),
  getContactConfig: () => request("/admin/contact-config"),
  updateContactConfig: (body) =>
    request("/admin/contact-config", { method: "PATCH", body: JSON.stringify(body) }),
};
