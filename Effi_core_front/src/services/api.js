import axios from 'axios';

const API_BASE_URL = '/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('📤 Request to:', config.url, 'with token:', !!token);
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401) {
          if (originalRequest.url.includes('/auth/login')) {
            return Promise.reject(error);
          }

          if (!originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
              try {
                const newTokens = await this.refreshToken();
                if (newTokens.efficore_token) {
                  originalRequest.headers.Authorization = `Bearer ${newTokens.efficore_token}`;
                  return this.client(originalRequest);
                }
              } catch (refreshError) {
                this.clearAuthData();
                window.location.href = '/login';
                return Promise.reject(refreshError);
              }
            }
          }

          this.clearAuthData();
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    );

  }

  clearAuthData() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async login(email, password) {
    try {
      const response = await this.client.post('/auth/login', { email, password });

      if (response.data.efficore_token) {
        localStorage.setItem('access_token', response.data.efficore_token);
      }
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }

      console.log('✅ Login successful, tokens saved');
      return response.data;
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.detail ||
          error.response.data?.message ||
          'Invalid email or password';
        throw new Error(message);
      } else {
        throw new Error('Network error');
      }
    }
  }


  async getCurrentUser() {
    const response = await this.client.get('/auth/user/me');
    return response.data;
  }

  async register(userData) {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async logout() {
    try {
      const response = await this.client.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      this.clearAuthData();
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.client.post('/auth/refresh', {
        refresh_token: refreshToken
      });

      if (response.data.efficore_token) {
        localStorage.setItem('access_token', response.data.efficore_token);
        console.log('✅ Token refreshed successfully');
      }
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.clearAuthData();
      throw error;
    }
  }

  async resetPassword(email) {
    const response = await this.client.post('/auth/reset', { email });
    return response.data;
  }

  async confirmEmail(token) {
    const response = await this.client.get(`/auth/confirm/email/${token}`);
    return response.data;
  }

  async confirmPasswordReset(token, newPassword) {
    const response = await this.client.patch(`/auth/reset/email_confirmed/${token}`, {
      password: newPassword,
    });
    return response.data;
  }

  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  getAuthToken() {
    return localStorage.getItem('access_token');
  }
}

export const apiService = new ApiService();