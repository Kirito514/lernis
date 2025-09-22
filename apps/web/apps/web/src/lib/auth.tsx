'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

// Local types
interface User {
  id: string;
  email: string;
  role: string;
  username: string;
  createdAt: string;
  isVerified: boolean;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/auth/me');
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await api.post('/auth/register', data);
      const { user, accessToken, refreshToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        throw new Error('No refresh token');
      }

      const response = await api.post('/auth/refresh', {
        refreshToken: refreshTokenValue,
      });

      const { accessToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
