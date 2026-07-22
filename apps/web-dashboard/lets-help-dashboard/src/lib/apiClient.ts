import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAcceptLanguage } from '@/lib/apiHeaders';
import params from '@/params';
import {
  clearAuthSession,
  ensureValidAccessToken,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  isRefreshTokenExpired,
  redirectToLogin,
  refreshAccessToken,
} from '@/lib/authSession';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;

  return url.includes(params.paths.authLogin) || url.includes(params.paths.authRefresh);
}

apiClient.interceptors.request.use(async (config) => {
  config.headers['Accept-Language'] = getAcceptLanguage();

  if (typeof window === 'undefined' || isAuthEndpoint(config.url)) {
    return config;
  }

  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();

  if (accessToken && !isAccessTokenExpired()) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  }

  if (refreshToken && !isRefreshTokenExpired()) {
    try {
      const token = await ensureValidAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch {
      clearAuthSession();
    }
    return config;
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
      return;
    }

    resolve(token);
  });

  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const token = await refreshAccessToken();
      processQueue(null, token);
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
