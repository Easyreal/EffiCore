import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!apiService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Checking authentication...');
      const userData = await apiService.getCurrentUser();
      console.log('✅ User authenticated:', userData);
      setUser(userData);
    } catch (error) {
      console.error('❌ Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchCurrentUser = async () => {
  try {
    const userData = await apiService.getCurrentUser();
    setUser(userData);
    return userData;
  } catch (err) {
    setUser(null);
    throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      await apiService.login(email, password);
      const userData = await apiService.getCurrentUser();
      setUser(userData);

      return { success: true };
    } catch (error) {
      let message = 'Login failed';
      if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };


  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const result = await apiService.register(userData);
      return { success: true, data: result };
    } catch (error) {
      const message = error.response?.data?.detail ||
                     error.response?.data?.message ||
                     'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
      window.location.href = '/login';
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      const result = await apiService.resetPassword(email);
      return { success: true, data: result };
    } catch (error) {
      const message = error.response?.data?.detail || 'Password reset failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    clearError,
    isAuthenticated: !!user,
    fetchCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};