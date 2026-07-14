import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { getStorageItem, removeStorageItem, setStorageItem } from '../utils/helpers';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

client.interceptors.request.use(config => {
  const token = getStorageItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

client.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getStorageItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const payload = res.data.data || res.data;
          const { access_token: token } = payload;
          setStorageItem('token', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        } catch {
          removeStorageItem('token');
          removeStorageItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default client;
