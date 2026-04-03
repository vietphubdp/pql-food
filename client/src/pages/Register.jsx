import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const inputClass =
  "auth-input block w-full pl-10 pr-4 py-3 bg-surface-container-highest/40 border-none rounded-lg " +
  "focus:ring-2 focus:ring-primary-container/20 focus:bg-surface-container-lowest outline-none text-on-surface";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const { register } = useAuth();
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register({ name, email, password, phone });
      nav("/", { replace: true });
    } catch (ex) {
      setErr(ex.message);
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center px-4 py-12 botanical-mesh min-h-[70vh]">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-xl bg-surface-container-lowest shadow-editorial">
        <div className="hidden lg:block lg:col-span-5 relative min-h-[440px]">
          <img
            alt="Nguyên liệu tươi"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFok-Hm7qsXfDlIjuYtAAluTbYqWoeaj8yNdGL0GqidL1ZJKQiXUpiDrQAWreNvWoW6HDe4BV0NusAh-x7yFUaKEn6zeu6dcUoBQ6P0NreVs039Bh89hhdJSjzRp4jTrjmgPeB68dva6WlnpCeqLebGp0WY51civwpZwQtp4HZzPGBnShbRbCL4JYoSSbum1W5XFsFmqO100Iug5ENZg3PkkLtMb5aUihTqsTFoLy8SCnWo8tKWuYaRhGnhT3pHXxDOwfbQSZLwwU"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-primary-container/25" />
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <h1 className="font-headline text-3xl font-extrabold tracking-tighter mb-2">
              Gia nhập cộng đồng PQLFood
            </h1>
            <p className="text-white/85 text-sm max-w-sm leading-relaxed">
              Đặt hàng nhanh, theo dõi đơn từ một nơi.
            </p>
          </div>
        </div>
        <div className="lg:col-span-7 p-8 md:p-14 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-primary-container mb-2">
              Tạo tài khoản
            </h2>
            <p className="text-on-surface-variant text-sm mb-8">Điền thông tin bên dưới.</p>
            {err ? <p className="text-error text-sm mb-4">{err}</p> : null}
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="reg-name">
                  Họ tên
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline pointer-events-none group-focus-within:text-primary-container">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </span>
                  <input
                    id="reg-name"
                    name="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="reg-email">
                  Email
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline pointer-events-none group-focus-within:text-primary-container">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </span>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="reg-phone">
                  Điện thoại
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline pointer-events-none group-focus-within:text-primary-container">
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </span>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="0900 000 000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="reg-password">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </span>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-container text-on-primary py-3.5 rounded-lg font-bold hover:opacity-95 transition-opacity"
              >
                Đăng ký
              </button>
            </form>
            <p className="mt-6 text-sm text-on-surface-variant text-center">
              Đã có tài khoản?{" "}
              <Link to="/dang-nhap" className="font-bold text-primary-container hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
