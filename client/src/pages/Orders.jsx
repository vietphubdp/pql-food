import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const list = await api.myOrders(filter === "all" ? null : filter);
        if (!cancelled) setOrders(list);
      } catch (e) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20 min-h-screen">
      <header className="mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary-container mb-3">
          Đơn hàng của bạn
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-sm md:text-base">
          Xem và theo dõi từng đơn đã đặt.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3">
          <div className="bg-surface-container-low p-6 rounded-xl">
            <h3 className="font-headline font-bold text-primary-container mb-4">Lọc</h3>
            <div className="space-y-3">
              {[
                { v: "all", l: "Tất cả" },
                { v: "processing", l: "Đang xử lý" },
                { v: "in_transit", l: "Đang giao" },
                { v: "completed", l: "Hoàn thành" },
                { v: "cancelled", l: "Đã hủy" },
              ].map((x) => (
                <label key={x.v} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="st"
                    checked={filter === x.v}
                    onChange={() => setFilter(x.v)}
                    className="text-primary-container focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-on-surface">{x.l}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>
        <section className="lg:col-span-9 space-y-5">
          {loading ? (
            <p className="text-on-surface-variant">Đang tải...</p>
          ) : err ? (
            <p className="text-error">{err}</p>
          ) : orders.length === 0 ? (
            <p className="text-on-surface-variant">
              Chưa có đơn.{" "}
              <Link to="/" className="text-primary-container font-bold underline">
                Mua sắm
              </Link>
            </p>
          ) : (
            orders.map((o) => (
              <div
                key={o._id}
                className="bg-surface-container-lowest p-6 md:p-8 rounded-xl hover:-translate-y-1 transition-all shadow-editorial flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      {statusLabel[o.status] || o.status}
                    </span>
                    <span className="text-sm text-on-surface-variant">
                      {new Date(o.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <p className="font-headline font-bold text-primary-container text-lg">{o.orderCode}</p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {(o.items || []).length} sản phẩm
                  </p>
                </div>
                <div className="text-right flex flex-col gap-2 items-end">
                  <span className="text-xl font-extrabold text-primary">{formatPrice(o.total)}</span>
                  <Link
                    to={`/don-hang/${o._id}`}
                    className="text-primary-container font-bold text-sm hover:underline"
                  >
                    Chi tiết →
                  </Link>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
