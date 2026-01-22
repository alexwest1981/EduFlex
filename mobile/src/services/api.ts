import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../utils/constants';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage keys
const TOKEN_KEY = 'auth_token';
const TENANT_KEY = 'tenant_id';

// Token management
export const tokenManager = {
  getToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: async (token: string): Promise<void> => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  removeToken: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  getTenantId: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(TENANT_KEY);
    } catch {
      return null;
    }
  },

  setTenantId: async (tenantId: string): Promise<void> => {
    await SecureStore.setItemAsync(TENANT_KEY, tenantId);
  },
};

// Request interceptor - add auth token and tenant header
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenManager.getToken();
    const tenantId = await tokenManager.getTenantId();

    console.log('🌐 API Request:', {
      url: config.url,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
      hasTenantId: !!tenantId
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ API Request without token:', config.url);
    }

    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    console.error('🔴 API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      console.error('⚠️ 401 Unauthorized - NOT removing token (debug)');
      // TEMPORARY: Don't remove token to debug why backend rejects it
      // await tokenManager.removeToken();
    }

    if (error.response?.status === 403) {
      console.warn('Access forbidden');
    }

    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded');
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper for handling API errors
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Ett fel uppstod';
  }
  return 'Ett oväntat fel uppstod';
};
