import axios from 'axios';

const envUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = import.meta.env.PROD
  ? (envUrl && !envUrl.includes('localhost') ? envUrl : 'https://backend-fl66.onrender.com/api')
  : (envUrl || 'http://localhost:8080/api');

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      const token = localStorage.getItem('stm_token');
      if (token && token !== 'demo-token' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('stm_token');
        localStorage.removeItem('stm_user');
      }
    }
    return Promise.reject(err);
  }
);

export const demoTasks = [
  { id: 1, title: 'Design 3D dashboard', description: 'Floating stat cards with tilt', priority: 'High', deadline: '2026-10-15', status: 'In_Progress' },
  { id: 2, title: 'Wire auth pages', description: 'Login + register glass panels', priority: 'Medium', deadline: '2026-10-12', status: 'Pending' },
  { id: 3, title: 'Seed demo data', description: 'Sample tasks for charts', priority: 'Low', deadline: '2026-10-10', status: 'Completed' }
];

export default api;
