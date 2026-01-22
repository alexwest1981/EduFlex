import api, { tokenManager } from './api';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

export const authService = {
  /**
   * Login user with username and password
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);

    // Store the token
    if (response.data.token) {
      await tokenManager.setToken(response.data.token);
    }

    return response.data;
  },

  /**
   * Register a new user
   */
  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/auth/register', userData);
    return response.data;
  },

  /**
   * Logout user - clear stored token
   */
  logout: async (): Promise<void> => {
    await tokenManager.removeToken();
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await tokenManager.getToken();
    return !!token;
  },

  /**
   * Refresh user data from server
   */
  refreshUserData: async (): Promise<User | null> => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) return null;

      return await authService.getCurrentUser();
    } catch {
      return null;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId: number, data: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (userId: number, oldPassword: string, newPassword: string): Promise<void> => {
    await api.post(`/users/${userId}/change-password`, {
      oldPassword,
      newPassword,
    });
  },
};
