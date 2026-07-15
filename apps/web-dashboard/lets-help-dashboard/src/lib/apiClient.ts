import axios from 'axios';
import i18n from '@/i18n';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  config.headers['Accept-Language'] = i18n.language || 'es';
  return config;
});

export default apiClient;
