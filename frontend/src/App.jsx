import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CartPage from './pages/CartPage.jsx';
import Checkout from './pages/Checkout.jsx';
import Payment from './pages/Payment.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import AdminInventory from './pages/AdminInventory.jsx';
import Home from './pages/Home.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useCart } from './context/CartContext.jsx';

export default function App() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const isAdmin = user?.role === 'admin';
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-rose-600 text-white items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5.5a1 1 0 112 0V11a1 1 0 01-1 1h-3.5a1 1 0 110-2H13V7.5z"/></svg>
            </span>
            <span className="text-xl font-semibold tracking-tight">ShopX</span>
          </Link>
          <nav className="flex gap-5 text-sm items-center">
            <Link to="/home" className="hover:text-sky-400 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-sky-400 transition-colors">Products</Link>
            {isAdmin && (
              <>
                <Link to="/admin/products" className="hover:text-sky-400 transition-colors">Admin</Link>
                <Link to="/admin/orders" className="hover:text-sky-400 transition-colors">Orders</Link>
                <Link to="/admin/inventory" className="hover:text-sky-400 transition-colors">Inventory</Link>
              </>
            )}
            <Link to="/cart" className="relative inline-flex items-center" aria-label="Cart">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.51 0 .955.343 1.09.835l2.591 9.709a2.25 2.25 0 002.175 1.676h7.284a2.25 2.25 0 002.175-1.676l1.74-6.524a.75.75 0 10-1.45-.387l-1.74 6.524a.75.75 0 01-.725.559H9.492a.75.75 0 01-.725-.559L6.176 4.91A2.25 2.25 0 004.636 3.75H2.25z" />
                <path d="M8.25 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.75 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              {count > 0 && (
                <span id="cart-badge" className="absolute -top-2 -right-2 text-[10px] min-w-[18px] h-[18px] rounded-full bg-sky-600 text-white grid place-items-center px-1 animate-[pop_300ms]">{count}</span>
              )}
            </Link>
            {!user ? (
              <>
                <Link to="/login" className="hover:text-sky-400 transition-colors">Login</Link>
                <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-sky-600 text-white px-3 py-1.5 shadow hover:bg-sky-500 transition">Sign up</Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs text-gray-500">{user.name}</span>
                <button onClick={logout} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 dark:border-slate-700 px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-800 transition">Logout</button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to={user ? '/home' : '/login'} replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/admin/products" element={isAdmin ? <AdminProducts /> : <Navigate to="/login" replace />} />
          <Route path="/admin/orders" element={isAdmin ? <AdminOrders /> : <Navigate to="/login" replace />} />
          <Route path="/admin/inventory" element={isAdmin ? <AdminInventory /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ShopX. All rights reserved.
      </footer>
    </div>
  );
}
