import { create } from 'zustand';
import api from '../lib/axios';

// Safely parse stored user
const storedUser = () => {
  try { return JSON.parse(localStorage.getItem('auth_user')) || null; }
  catch { return null; }
};

export const useAuthStore = create((set) => ({
  user: storedUser(),
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  userLoading: false,

  login: async (email, password) => {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('auth_token', res.data.token);
    localStorage.setItem('auth_user', JSON.stringify(res.data.user));
    set({ user: res.data.user, token: res.data.token, isAuthenticated: true });
    return res.data;
  },

  register: async (name, email, password, password_confirmation) => {
    const res = await api.post('/register', { name, email, password, password_confirmation });
    localStorage.setItem('auth_token', res.data.token);
    localStorage.setItem('auth_user', JSON.stringify(res.data.user));
    set({ user: res.data.user, token: res.data.token, isAuthenticated: true });
    return res.data;
  },

  // Internal reset — no API call, used by 401 interceptor to avoid loops
  _resetAuth: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  logout: async () => {
    try { await api.post('/logout'); } catch (e) { console.error('Logout failed silently', e); }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    set({ userLoading: true });
    try {
      const res = await api.get('/user');
      localStorage.setItem('auth_user', JSON.stringify(res.data));
      set({ user: res.data, isAuthenticated: true, userLoading: false });
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      set({ user: null, token: null, isAuthenticated: false, userLoading: false });
    }
  },
}));

