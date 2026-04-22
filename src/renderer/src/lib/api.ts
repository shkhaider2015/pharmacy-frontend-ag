import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedPayload<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface BaseResponse<T> {
  data: T;
  statusCode: number;
  message: string;
}

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // Connected to backend global prefix
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (like 401s)
api.interceptors.response.use(
  (response) => {
    // Optional: Could add global success toasts here if configured by header
    return response;
  },
  (error) => {
    // Show a toast message for visually indicating network failure
    const errorMsg = error.response?.data?.message || error.message || 'An unexpected error occurred';
    toast.error(errorMsg);

    if (error.response && error.response.status === 401) {
      // Clear session on 401 Unauthorized
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
