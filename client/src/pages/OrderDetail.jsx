import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

const statusLabel = {
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  in_transit: "Đang giao",
};

const shippingMethodLabel = {
  standard: "Giao tiêu chuẩn",
  express: "Giao nhanh 2h",
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const o = await api.getOrder(id);
        if (!cancelled) setOrder(o);
      } catch (e) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-on-surface-variant">Đang tải...</div>
    );
  }
  if (err || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-error">
        {err || "Không tìm thấy"}{" "}
        <Link to="/don-hang" className="underline text-primary-container">
          Quay lại
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddress || {};

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
      <nav className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-4 uppercase tracking-wide">
        <Link to="/don-hang" className="hover:text-primary">
          Đơn hàng
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface">{order.orderCode}</span>
      </nav>
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary-container font-headline">
            Chi tiết đơn hàng
          </h1>
          <p className="mt-3 text-on-surface-variant">
            Đặt lúc {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-md bg-primary-container text-on-primary font-semibold text-sm shadow-md text-center"
        >
          Mua thêm
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
              Trạng thái
            </h3>
            <p className="font-bold text-lg text-primary-container">
              {statusLabel[order.status] || order.status}
            </p>
            {order.timeline?.length ? (
              <ul className="mt-6 space-y-3">
                {order.timeline.map((t, i) => (
                  <li key={i} className="text-sm text-on-surface-variant">
                    <span className="font-semibold text-on-surface block">{t.label}</span>
                    {t.detail}
                    {t.at ? (
                      <span className="block text-xs mt-0.5">
                        {new Date(t.at).toLocaleString("vi-VN")}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {order.shippingMethod || addr.fullName || addr.phone || addr.address || addr.note ? (
            <div className="bg-surface-container-lowest p-6 rounded-xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                Thông tin giao hàng
              </h3>
              <ul className="space-y-3 text-sm text-on-surface">
                {order.shippingMethod ? (
                  <li>
                    <span className="text-on-surface-variant block text-xs uppercase tracking-wide mb-0.5">
                      Phương thức giao
                    </span>
                    {shippingMethodLabel[order.shippingMethod] || order.shippingMethod}
                  </li>
                ) : null}
                {addr.fullName ? (
                  <li>
                    <span className="text-on-surface-variant block text-xs uppercase tracking-wide mb-0.5">
                      Họ tên
                    </span>
                    {addr.fullName}
                  </li>
                ) : null}
                {addr.phone ? (
                  <li>
                    <span className="text-on-surface-variant block text-xs uppercase tracking-wide mb-0.5">
                      Điện thoại
                    </span>
                    {addr.phone}
                  </li>
                ) : null}
                {addr.address ? (
                  <li>
                    <span className="text-on-surface-variant block text-xs uppercase tracking-wide mb-0.5">
                      Địa chỉ
                    </span>
                    {addr.address}
                  </li>
                ) : null}
                {addr.note ? (
                  <li>
                    <span className="text-on-surface-variant block text-xs uppercase tracking-wide mb-0.5">
                      Ghi chú
                    </span>
                    <span className="whitespace-pre-wrap">{addr.note}</span>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-headline font-bold text-primary-container">Sản phẩm</h3>
          <div className="bg-surface-container-low rounded-xl divide-y divide-outline-variant/10">
            {(order.items || []).map((line, idx) => (
              <div key={idx} className="flex gap-4 p-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container shrink-0">
                  {line.image ? (
                    <img src={line.image} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-primary-container">
                    {line.product?.slug ? (
                      <Link to={`/san-pham/${line.product.slug}`} className="hover:underline">
                        {line.name}
                      </Link>
                    ) : (
                      line.name
                    )}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {formatPrice(line.price)} × {line.quantity}
                  </p>
                </div>
                <div className="font-bold text-primary shrink-0">
                  {formatPrice(line.price * line.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl space-y-2 text-sm max-w-md ml-auto">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Tạm tính</span>
              <span className="font-bold">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Phí ship</span>
              <span className="font-bold">
                {order.shipping === 0 ? "Miễn phí" : formatPrice(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-outline-variant/15">
              <span className="font-headline font-bold text-primary-container">Tổng</span>
              <span className="font-extrabold text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
