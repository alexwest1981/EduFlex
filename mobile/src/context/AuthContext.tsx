import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService, tokenManager } from '../services';
import { User, LoginRequest, LoginResponse } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        const hasToken = await authService.isAuthenticated();
        if (hasToken) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        // Token invalid or expired
        await tokenManager.removeToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);

      // Create user object from login response
      const userData: User = {
        id: response.id,
        username: response.username,
        firstName: response.firstName,
        lastName: response.lastName,
        fullName: response.fullName,
        email: '', // Will be fetched with full profile
        role: response.role,
        profilePictureUrl: response.profilePictureUrl,
        points: response.points,
        level: response.level,
        earnedBadges: response.earnedBadges,
      };

      setUser(userData);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      // If refresh fails, user might need to re-login
      console.error('Failed to refresh user data:', error);
    }
  }, [user]);

  const updateUser = useCallback((data: Partial<User>): void => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
