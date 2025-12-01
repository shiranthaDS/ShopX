import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-600 text-white font-bold">S</span>
          <span className="text-xl font-semibold tracking-tight">ShopX</span>
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link to="/login" className="hover:underline">Login</Link>
          <Link to="/register" className="hover:underline">Register</Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ShopX. All rights reserved.
      </footer>
    </div>
  );
}
