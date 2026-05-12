import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise errors so every catch block gets err.message as a readable string
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      err.message = 'Cannot reach the server — check your connection.';
    } else {
      err.message = err.response.data?.error || `Server error (${err.response.status}).`;
    }
    return Promise.reject(err);
  }
);

export default api;
