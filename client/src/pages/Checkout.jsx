import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";

const PAY_LABEL = {
  momo: "Momo / ví",
  bank_transfer: "Chuyển khoản ngân hàng",
  cod: "Thu tiền khi giao (COD)",
};

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [payment, setPayment] = useState("momo");
  const [email, setEmail] = useState(user?.email || "");
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentCfg, setPaymentCfg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getPaymentConfig()
      .then((cfg) => {
        if (!cancelled) setPaymentCfg(cfg);
      })
      .catch(() => {
        if (!cancelled) setPaymentCfg({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const freeShip = subtotal >= 500000;
  const shipping = useMemo(() => {
    if (freeShip) return 0;
    return shippingMethod === "express" ? 50000 : 30000;
  }, [freeShip, shippingMethod]);

  const standardFeeDisplay = freeShip ? 0 : 30000;
  const expressFeeDisplay = freeShip ? 0 : 50000;

  const total = subtotal + shipping;

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!user) {
      nav(`/dang-nhap?redirect=${encodeURIComponent("/thanh-toan")}`);
      return;
    }
    if (items.length === 0) {
      setErr("Giỏ hàng trống.");
      return;
    }
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingMethod,
        shippingAddress: {
          fullName,
          phone,
          address: [address, ward, district, city].filter(Boolean).join(", "),
          note: [
            note,
            newsletter ? "Đăng ký nhận tin." : "",
            `Thanh toán: ${PAY_LABEL[payment] || payment}`,
          ]
            .filter(Boolean)
            .join(" | "),
        },
      });
      clear();
      nav(`/don-hang/${order._id}`);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-on-surface-variant mb-4">Giỏ hàng trống.</p>
        <Link to="/" className="text-primary-container font-bold underline">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface-container-low/80 border-b border-surface-container-high">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between text-xs uppercase tracking-widest text-outline font-semibold">
          <span className="flex items-center gap-2 text-primary-container">
            <span className="material-symbols-outlined text-lg">lock</span>
            Kết nối an toàn
          </span>
          <span>Thanh toán</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-8rem)]">
        <section className="w-full lg:w-1/2 p-6 lg:p-10 xl:p-12 bg-surface">
          <nav className="mb-8">
            <Link
              to="/gio-hang"
              className="group inline-flex items-center text-sm font-medium text-primary hover:opacity-80"
            >
              <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
              Quay lại giỏ hàng
            </Link>
          </nav>

          <form onSubmit={onSubmit} className="space-y-10 max-w-xl">
            {err ? <p className="text-error text-sm">{err}</p> : null}

            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-headline font-bold text-primary-container">Giao hàng</h2>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container px-2 py-1 rounded">
                  Bước 1 / 3
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-on-surface">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-highest/40 border-none rounded-lg focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest transition-all"
                    placeholder="email@example.com"
                  />
                  <label className="mt-3 flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                      className="rounded border-outline-variant text-primary-container"
                    />
                    Nhận ưu đãi qua email
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Họ tên</label>
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-highest/40 border-none rounded-lg focus:ring-2 focus:ring-primary-container outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Điện thoại</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-highest/40 border-none rounded-lg focus:ring-2 focus:ring-primary-container outline-none"
                      placeholder="090 123 4567"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Địa chỉ</label>
                  <input
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-highest/40 border-none rounded-lg focus:ring-2 focus:ring-primary-container outline-none"
                    placeholder="Số nhà, đường"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <input
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-highest/40 border-none rounded-lg focus:ring-2 focus:ring-primary-container outline-none"
                    placeholder="Phường/xã"
                  />
                  <input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-highest/40 border-none rounded-lg focus:ring-2 focus:ring-primary-container outline-none"
                    placeholder="Quận/huyện"
                  />
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-highest/40 border-none rounded-lg focus:ring-2 focus:ring-primary-container outline-none md:col-span-1 col-span-2"
                    placeholder="TP / Tỉnh"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Ghi chú giao hàng</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-surface-container-highest/40 border-none rounded-lg focus:ring-2 focus:ring-primary-container outline-none resize-none"
                    placeholder="Ví dụ: Giao sau 17h"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-surface-container">
              <h2 className="text-xl font-headline font-bold text-primary-container mb-4">Phương thức giao</h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="ship"
                      checked={shippingMethod === "standard"}
                      onChange={() => setShippingMethod("standard")}
                      className="w-5 h-5 text-primary-container border-outline-variant"
                    />
                    <div className="ml-4">
                      <p className="font-semibold text-on-surface">Giao tiêu chuẩn</p>
                      <p className="text-xs text-on-surface-variant">3–5 ngày làm việc</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary-container tabular-nums">
                    {standardFeeDisplay === 0 ? "Miễn phí" : formatPrice(standardFeeDisplay)}
                  </span>
                </label>
                <label className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="ship"
                      checked={shippingMethod === "express"}
                      onChange={() => setShippingMethod("express")}
                      className="w-5 h-5 text-primary-container border-outline-variant"
                    />
                    <div className="ml-4">
                      <p className="font-semibold text-on-surface">Giao nhanh 2h</p>
                      <p className="text-xs text-on-surface-variant">Nội thành</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary-container tabular-nums">
                    {expressFeeDisplay === 0 ? "Miễn phí" : formatPrice(expressFeeDisplay)}
                  </span>
                </label>
              </div>
              {freeShip ? (
                <p className="text-sm text-teal-700 font-medium mt-2">Đơn từ 500k — miễn phí ship (mọi hình thức giao).</p>
              ) : (
                <p className="text-xs text-on-surface-variant mt-2">
                  Tổng thanh toán bên phải cập nhật theo phương thức giao bạn chọn.
                </p>
              )}
            </div>

            <div className="pt-8 border-t border-surface-container">
              <h2 className="text-xl font-headline font-bold text-primary-container mb-4">Thanh toán</h2>
              <div className="space-y-3">
                {[
                  { id: "momo", label: "Momo / ví điện tử", icon: "account_balance_wallet" },
                  { id: "bank_transfer", label: "Chuyển khoản ngân hàng", icon: "account_balance" },
                  { id: "cod", label: "Thu tiền khi giao (COD)", icon: "payments" },
                ].map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center p-4 bg-surface-container-lowest rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors"
                  >
                    <input
                      type="radio"
                      name="pay"
                      checked={payment === p.id}
                      onChange={() => setPayment(p.id)}
                      className="w-5 h-5 text-primary-container border-outline-variant"
                    />
                    <span className="material-symbols-outlined ml-4 mr-2 text-secondary">{p.icon}</span>
                    <span className="font-semibold text-on-surface flex-1">{p.label}</span>
                  </label>
                ))}
              </div>

              {payment === "momo" && paymentCfg ? (
                <div className="mt-6 p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
                  <p className="text-sm font-bold text-primary-container mb-3">Quét QR Momo</p>
                  {paymentCfg.momoQrImageUrl ? (
                    <img
                      src={paymentCfg.momoQrImageUrl}
                      alt="QR Momo"
                      className="w-48 h-48 object-contain rounded-lg bg-white p-2 mx-auto border border-surface-container-high"
                    />
                  ) : (
                    <p className="text-sm text-on-surface-variant">
                      Chưa có ảnh QR. Vào <strong>Quản trị → Thanh toán</strong> để cấu hình.
                    </p>
                  )}
                </div>
              ) : null}

              {payment === "bank_transfer" && paymentCfg ? (
                <div className="mt-6 p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-3">
                  <p className="text-sm font-bold text-primary-container">Chuyển khoản ngân hàng</p>
                  <ul className="text-sm text-on-surface space-y-1">
                    {paymentCfg.bankName ? (
                      <li>
                        <span className="text-on-surface-variant">Ngân hàng: </span>
                        {paymentCfg.bankName}
                      </li>
                    ) : null}
                    {paymentCfg.bankAccountNumber ? (
                      <li>
                        <span className="text-on-surface-variant">Số TK: </span>
                        <span className="font-mono font-semibold">{paymentCfg.bankAccountNumber}</span>
                      </li>
                    ) : null}
                    {paymentCfg.bankAccountName ? (
                      <li>
                        <span className="text-on-surface-variant">Chủ TK: </span>
                        {paymentCfg.bankAccountName}
                      </li>
                    ) : null}
                    {paymentCfg.transferNote ? (
                      <li>
                        <span className="text-on-surface-variant">Nội dung CK: </span>
                        {paymentCfg.transferNote}
                      </li>
                    ) : null}
                  </ul>
                  {!paymentCfg.bankName && !paymentCfg.bankAccountNumber ? (
                    <p className="text-sm text-on-surface-variant">
                      Chưa cấu hình STK. Vào <strong>Quản trị → Thanh toán</strong> để nhập thông tin.
                    </p>
                  ) : null}
                  {paymentCfg.bankQrImageUrl ? (
                    <div className="pt-2">
                      <p className="text-xs font-semibold text-on-surface-variant mb-2">QR ngân hàng</p>
                      <img
                        src={paymentCfg.bankQrImageUrl}
                        alt="QR ngân hàng"
                        className="w-48 h-48 object-contain rounded-lg bg-white p-2 border border-surface-container-high"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-br from-primary-container to-primary text-on-primary font-headline font-bold rounded-lg shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              Hoàn tất đơn hàng
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <div className="text-center">
              <Link
                to="/"
                className="text-sm font-medium text-on-surface-variant hover:text-primary inline-flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">shopping_basket</span>
                Tiếp tục mua sắm
              </Link>
            </div>
          </form>
        </section>

        <aside className="w-full lg:w-1/2 p-6 lg:p-10 xl:p-12 bg-surface-container-low">
          <div className="lg:sticky lg:top-28">
            <h2 className="text-xl font-headline font-bold text-primary-container mb-6">Đơn hàng</h2>
            <div className="space-y-4 mb-8">
              {items.map((line) => (
                <div
                  key={line.productId}
                  className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-xl"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-container-low rounded-lg overflow-hidden shrink-0">
                    <img
                      src={line.image || ""}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-on-surface truncate">{line.name}</h3>
                    <p className="text-sm text-on-surface-variant">SL: {line.quantity}</p>
                  </div>
                  <span className="font-bold text-primary-container shrink-0 tabular-nums text-sm sm:text-base">
                    {formatPrice(line.price * line.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-6 border-t border-surface-container-high text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Tạm tính</span>
                <span className="font-medium text-on-surface">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>
                  Phí giao (
                  {shippingMethod === "express" ? "nhanh 2h" : "tiêu chuẩn"})
                </span>
                <span className="font-medium text-on-surface">
                  {shipping === 0 ? "Miễn phí" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-surface-container-high">
                <span className="text-lg font-headline font-bold text-primary-container">Tổng</span>
                <span className="text-2xl font-headline font-extrabold text-primary-container tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {paymentCfg && (payment === "momo" || payment === "bank_transfer") ? (
              <div className="mt-6 p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3">
                  {payment === "momo" ? "QR thanh toán" : "QR / CK"}
                </p>
                {payment === "momo" && paymentCfg.momoQrImageUrl ? (
                  <img
                    src={paymentCfg.momoQrImageUrl}
                    alt=""
                    className="w-full max-w-[160px] mx-auto object-contain rounded-lg"
                  />
                ) : null}
                {payment === "bank_transfer" && paymentCfg.bankQrImageUrl ? (
                  <img
                    src={paymentCfg.bankQrImageUrl}
                    alt=""
                    className="w-full max-w-[160px] mx-auto object-contain rounded-lg"
                  />
                ) : null}
                {payment === "bank_transfer" &&
                (paymentCfg.bankAccountNumber || paymentCfg.bankName) ? (
                  <p className="text-[11px] text-on-surface-variant mt-3 text-center leading-snug">
                    {[paymentCfg.bankName, paymentCfg.bankAccountNumber].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-4">
              {[
                { icon: "verified_user", t: "Bảo mật SSL" },
                { icon: "credit_card", t: "Đa phương thức" },
                { icon: "workspace_premium", t: "Chất lượng" },
              ].map((b) => (
                <div
                  key={b.t}
                  className="flex flex-col items-center p-2 sm:p-3 bg-surface-container-lowest rounded-xl text-center"
                >
                  <span className="material-symbols-outlined text-primary mb-1 text-xl">{b.icon}</span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase leading-tight text-on-surface-variant">
                    {b.t}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
