export function formatMoney(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN");
}
