import axios from 'axios';
import { API_URL } from '../config/env';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Sanctum stateless (Bearer tokens only — no cookies needed)
  timeout: 15000, // 15s timeout — prevents hanging requests
});

// Attach bearer token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handler — token expired or invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Dynamically import to avoid circular dependency at module load time
      import('../store/useAuthStore').then(({ useAuthStore }) => {
        useAuthStore.getState()._resetAuth();
      });
    }
    return Promise.reject(error);
  }
);

export default api;
