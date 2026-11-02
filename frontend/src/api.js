import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// expired token -> logout (but a wrong password on the login form should just show its error)
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isAuthForm = /\/auth\/(login|register)/.test(err.config?.url || '');
    if (err.response?.status === 401 && !isAuthForm && localStorage.getItem('user')) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const EMAIL = 'shaupex@gmail.com';
export const errMsg = (e) => e.response?.data?.message || (e.request ? 'Cannot reach the server. Is the backend running?' : e.message);
export const money = (n) => 'Rs. ' + Number(n || 0).toLocaleString();
export const STATUS_NEXT = { Pending: ['Shipped', 'Cancelled'], Shipped: ['Delivered', 'Cancelled'], Delivered: [], Cancelled: [] };
export default api;
