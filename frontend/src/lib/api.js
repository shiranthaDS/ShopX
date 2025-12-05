// Directly use the EXTERNAL ACA FQDN for auth-service (no "internal" in domain)
// This bypasses any environment variable to avoid misconfiguration in deployments.
const AUTH_API_BASE = 'https://auth-service.ambitiousbush-23a76182.uaenorth.azurecontainerapps.io';

export const api = {
  async login({ email, password }) {
    if (!AUTH_API_BASE) throw new Error('AUTH API base is not configured');
    const res = await fetch(`${AUTH_API_BASE}/api/auth/login`, {
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
    if (!AUTH_API_BASE) throw new Error('AUTH API base is not configured');
    const res = await fetch(`${AUTH_API_BASE}/api/auth/register`, {
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
    if (!AUTH_API_BASE) throw new Error('AUTH API base is not configured');
    const res = await fetch(`${AUTH_API_BASE}/api/auth/me`, {
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Unauthorized');
    return data;
  },
  async logout() {
    if (!AUTH_API_BASE) throw new Error('AUTH API base is not configured');
    const res = await fetch(`${AUTH_API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Logout failed');
  },
};
