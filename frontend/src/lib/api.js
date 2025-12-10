// Directly use the EXTERNAL ACA FQDN for auth-service
const AUTH_API_BASE = 'https://auth-service.ambitiousbush-23a76182.uaenorth.azurecontainerapps.io';

// Token management
const TOKEN_KEY = 'shopx_auth_token';

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

const setAuthToken = (token) => {
  if (typeof window !== 'undefined' && token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Helper to add auth header
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  async login({ email, password }) {
    const res = await fetch(`${AUTH_API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Login failed');
    // Store token from response
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },
  async register({ name, email, password }) {
    const res = await fetch(`${AUTH_API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Register failed');
    // Store token from response
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },
  async me() {
    const token = getAuthToken();
    if (!token) return null; // No token, not logged in
    
    const res = await fetch(`${AUTH_API_BASE}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    
    if (res.status === 401) {
      clearAuthToken();
      return null; // Invalid token
    }
    
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to fetch user');
    return data;
  },
  async logout() {
    clearAuthToken();
    try {
      const res = await fetch(`${AUTH_API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      // Ignore errors - token is already cleared
    } catch (e) {
      // Ignore errors - token is already cleared
    }
  },
};
