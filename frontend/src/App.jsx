import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductPage from './pages/ProductPage';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import About from './pages/About';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import Legal from './pages/Legal';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMessages from './pages/admin/AdminMessages';

function Guard({ children, admin, customer }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  if (customer && user.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

export default function App() {
  const loc = useLocation();
  // new page = start at the top (except when only the filters in the URL changed)
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  const isAdmin = loc.pathname.startsWith('/admin');

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className={isAdmin ? 'admin-wrap' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/delivery-returns" element={<Legal page="delivery" />} />
          <Route path="/privacy" element={<Legal page="privacy" />} />
          <Route path="/terms" element={<Legal page="terms" />} />
          <Route path="/checkout" element={<Guard customer><Checkout /></Guard>} />
          <Route path="/orders" element={<Guard customer><MyOrders /></Guard>} />
          <Route path="/admin" element={<Guard admin><AdminLayout /></Guard>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>
          <Route path="*" element={
            <div className="container section"><div className="empty">
              <h3>Page not found</h3><p>The page you are looking for does not exist.</p>
              <Link className="btn btn-primary" to="/">Back to home</Link>
            </div></div>} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
