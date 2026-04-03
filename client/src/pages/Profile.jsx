import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, saveProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSave(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await saveProfile({ name, phone });
      setMsg("Đã lưu.");
    } catch (ex) {
      setErr(ex.message);
    }
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN", { month: "short", year: "numeric" })
    : "";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
      <header className="mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary-container mb-2">
          Tài khoản
        </h1>
        <p className="text-on-surface-variant max-w-xl text-sm md:text-base">
          Cập nhật họ tên và số điện thoại liên hệ.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-4 space-y-6">
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-editorial">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-primary-container font-headline font-bold text-xl">
                {(user?.name || "?").charAt(0)}
              </div>
              <div>
                <h2 className="font-headline text-lg font-bold text-primary-container">{user?.name}</h2>
                <p className="text-sm text-on-surface-variant">Thành viên từ {memberSince}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm pt-4 border-t border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container/60 text-lg">mail</span>
                <span>{user?.email}</span>
              </div>
            </div>
          </section>
          <nav className="space-y-2">
            <span className="flex items-center justify-between p-4 bg-primary-container text-on-primary rounded-xl">
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined">person</span>
                Hồ sơ
              </span>
            </span>
            <Link
              to="/don-hang"
              className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors text-primary-container"
            >
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined">receipt_long</span>
                Đơn hàng
              </span>
              <span className="material-symbols-outlined">chevron_right</span>
            </Link>
          </nav>
        </aside>
        <section className="lg:col-span-8 bg-surface-container-low rounded-xl p-6 md:p-8">
          <h3 className="font-headline text-xl font-bold text-primary-container mb-6">Chỉnh sửa hồ sơ</h3>
          {msg ? <p className="text-primary-container text-sm mb-3">{msg}</p> : null}
          {err ? <p className="text-error text-sm mb-3">{err}</p> : null}
          <form onSubmit={onSave} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold uppercase text-on-primary-container/70 mb-1">
                Họ tên
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-3 px-4 rounded-lg bg-surface-container-highest/40 border-none focus:ring-2 focus:ring-primary-container/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-on-primary-container/70 mb-1">
                Điện thoại
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full py-3 px-4 rounded-lg bg-surface-container-highest/40 border-none focus:ring-2 focus:ring-primary-container/20 outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-primary-container text-on-primary px-8 py-3 rounded-lg font-bold hover:opacity-95"
            >
              Lưu thay đổi
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
