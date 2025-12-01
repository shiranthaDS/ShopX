const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4001';

export const api = {
  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Login failed');
    return data;
  },
  async register({ name, email, password }) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Register failed');
    return data;
  },
  async me() {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Unauthorized');
    return data;
  },
  async logout() {
    const res = await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Logout failed');
  },
};
