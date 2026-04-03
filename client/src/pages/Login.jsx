import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      nav(redirect, { replace: true });
    } catch (ex) {
      setErr(ex.message);
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center px-4 py-12 botanical-mesh min-h-[70vh]">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-xl bg-surface-container-lowest shadow-editorial">
        <div className="hidden lg:block lg:col-span-5 relative min-h-[400px]">
          <img
            alt="Rau củ"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYfXwZFHMFiNTKOXPQeKGJV7-J--XHDyzfswZVPPjKmMej2sbU3ebu9GH9kQYUf239jTeehoo8LggPExrncJwgzBB2YcFLwlINqOQduH9Apf8gV4DM51c1QATbREYoGlYEBgwQE0D8-42nEKg3NBavFiveXjVp01XkMF7b4KFHhgPmGPU082HQzzRFJW3DRwHXbPQwzterRkYhsxIMHTaBh0R6eU_vuZPtgmKuhsFlsqLDP7CwpfsyOgzqh3xLqpcuZh3eZzXTCXY"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-primary-container/25" />
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <h1 className="font-headline text-3xl font-extrabold tracking-tighter mb-2">PQLFood</h1>
            <p className="text-white/85 text-sm max-w-xs">Thực phẩm tươi, nguồn gốc rõ ràng.</p>
          </div>
        </div>
        <div className="lg:col-span-7 p-8 md:p-14 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-primary-container mb-2">
              Đăng nhập
            </h2>
            <p className="text-on-surface-variant text-sm mb-8">
              Truy cập giỏ hàng và đơn hàng của bạn.
            </p>
            {err ? <p className="text-error text-sm mb-4">{err}</p> : null}
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="email">
                  Email
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline pointer-events-none group-focus-within:text-primary-container">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input block w-full pl-10 pr-4 py-3 bg-surface-container-highest/40 border-none rounded-lg focus:ring-2 focus:ring-primary-container/20 focus:bg-surface-container-lowest outline-none text-on-surface"
                    placeholder="you@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="password">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input block w-full pl-10 pr-4 py-3 bg-surface-container-highest/40 border-none rounded-lg focus:ring-2 focus:ring-primary-container/20 focus:bg-surface-container-lowest outline-none text-on-surface"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-container text-on-primary py-3.5 rounded-lg font-bold hover:opacity-95 transition-opacity"
              >
                Đăng nhập
              </button>
            </form>
            <p className="mt-6 text-sm text-on-surface-variant text-center">
              Chưa có tài khoản?{" "}
              <Link to="/dang-ky" className="font-bold text-primary-container hover:underline">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
