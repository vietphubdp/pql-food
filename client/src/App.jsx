import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import CategoryListing from "./pages/CategoryListing.jsx";
import ProductCatalog from "./pages/ProductCatalog.jsx";
import Checkout from "./pages/Checkout.jsx";
import AboutContact from "./pages/AboutContact.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useAdminAuth } from "./context/AdminAuthContext.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminProducts from "./admin/AdminProducts.jsx";
import AdminCategories from "./admin/AdminCategories.jsx";
import AdminOrders from "./admin/AdminOrders.jsx";
import AdminOrderDetail from "./admin/AdminOrderDetail.jsx";
import AdminPaymentSettings from "./admin/AdminPaymentSettings.jsx";
import AdminContactSettings from "./admin/AdminContactSettings.jsx";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-on-surface-variant">
        Đang tải...
      </div>
    );
  }
  if (!user) return <Navigate to="/dang-nhap" replace />;
  return children;
}

function AdminPrivateRoute({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600 gap-3">
        <span className="material-symbols-outlined animate-spin text-2xl text-teal-600">
          progress_activity
        </span>
        Đang tải…
      </div>
    );
  }
  if (!admin) return <Navigate to="/quan-tri/dang-nhap" replace />;
  return children;
}

function AdminLoginRoute() {
  const { admin, loading } = useAdminAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        Đang tải…
      </div>
    );
  }
  if (admin) return <Navigate to="/quan-tri" replace />;
  return <AdminLogin />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/quan-tri/dang-nhap" element={<AdminLoginRoute />} />
      <Route
        path="/quan-tri"
        element={
          <AdminPrivateRoute>
            <AdminLayout />
          </AdminPrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="san-pham" element={<AdminProducts />} />
        <Route path="danh-muc" element={<AdminCategories />} />
        <Route path="don-hang" element={<AdminOrders />} />
        <Route path="don-hang/:id" element={<AdminOrderDetail />} />
        <Route path="thanh-toan" element={<AdminPaymentSettings />} />
        <Route path="lien-he" element={<AdminContactSettings />} />
      </Route>

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/danh-muc/:slug" element={<CategoryListing />} />
        <Route path="/cua-hang" element={<ProductCatalog />} />
        <Route path="/san-pham/:slug" element={<ProductDetail />} />
        <Route path="/gio-hang" element={<Cart />} />
        <Route path="/thanh-toan" element={<Checkout />} />
        <Route path="/ve-chung-toi" element={<AboutContact />} />
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/dang-ky" element={<Register />} />
        <Route
          path="/tai-khoan"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/don-hang"
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          }
        />
        <Route
          path="/don-hang/:id"
          element={
            <PrivateRoute>
              <OrderDetail />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}
