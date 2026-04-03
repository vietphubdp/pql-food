import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export default function Cart() {
  const { items, subtotal, setQuantity, removeItem } = useCart();
  const { user } = useAuth();

  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  return (
    <div className="pt-8 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-primary-container font-headline mb-2">
          Giỏ hàng
        </h1>
        <p className="text-on-surface-variant">Xem lại và chuyển tới thanh toán khi sẵn sàng.</p>
      </div>

      {items.length === 0 ? (
        <p className="text-on-surface-variant mb-6">
          Giỏ hàng trống.{" "}
          <Link to="/" className="text-primary-container font-bold underline">
            Mua sắm
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-low rounded-xl p-6 md:p-8 space-y-8">
              {items.map((line) => (
                <div
                  key={line.productId}
                  className="flex flex-col md:flex-row items-center gap-6 md:gap-8 group"
                >
                  <Link
                    to={`/san-pham/${line.slug}`}
                    className="w-28 h-28 md:w-32 md:h-32 shrink-0 rounded-xl overflow-hidden"
                  >
                    <img
                      src={line.image || "https://placehold.co/200x200/f3f4f3/073b3a?text=PQL"}
                      alt={line.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </Link>
                  <div className="flex-grow flex flex-col md:flex-row justify-between w-full gap-4">
                    <div>
                      <h3 className="text-lg font-bold font-headline text-primary-container">
                        <Link to={`/san-pham/${line.slug}`}>{line.name}</Link>
                      </h3>
                    </div>
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="flex items-center bg-surface-container-highest/40 rounded-lg p-1">
                        <button
                          type="button"
                          className="p-2 hover:bg-surface-container rounded"
                          onClick={() => setQuantity(line.productId, line.quantity - 1)}
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="px-3 font-bold font-headline">{line.quantity}</span>
                        <button
                          type="button"
                          className="p-2 hover:bg-surface-container rounded"
                          onClick={() => setQuantity(line.productId, line.quantity + 1)}
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-bold text-primary-container">
                          {formatPrice(line.price * line.quantity)}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-error font-semibold hover:underline mt-1"
                          onClick={() => removeItem(line.productId)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-surface-container-low rounded-xl p-6 md:p-8">
                <h2 className="text-xl font-bold font-headline text-primary-container mb-6">Tóm tắt</h2>
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Tạm tính</span>
                    <span className="text-primary-container font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Phí giao (ước tính)</span>
                    <span className="text-primary-container font-bold">
                      {shipping === 0 ? "Miễn phí" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="pt-4 flex justify-between border-t border-outline-variant/20">
                    <span className="text-lg font-bold text-primary-container">Tổng</span>
                    <span className="text-2xl font-extrabold text-primary-container">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
                {user ? (
                  <Link
                    to="/thanh-toan"
                    className="block w-full text-center bg-gradient-to-br from-primary-container to-primary text-on-primary py-4 rounded-lg font-bold text-lg shadow-[0_20px_40px_rgba(0,36,35,0.12)] hover:scale-[1.02] transition-all"
                  >
                    Tiến hành thanh toán
                  </Link>
                ) : (
                  <Link
                    to="/dang-nhap?redirect=/thanh-toan"
                    className="block w-full text-center bg-gradient-to-br from-primary-container to-primary text-on-primary py-4 rounded-lg font-bold text-lg shadow-[0_20px_40px_rgba(0,36,35,0.12)] hover:scale-[1.02] transition-all"
                  >
                    Đăng nhập để thanh toán
                  </Link>
                )}
                <p className="text-xs text-on-surface-variant mt-3 text-center">
                  Phí ship chính xác theo lựa chọn ở bước thanh toán.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
