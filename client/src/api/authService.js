import axios from 'axios';
import { AUTH_API_URL } from '../config/api.js';

const API_BASE_URL = AUTH_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/refresh`, {
            refreshToken: refreshToken
          });

          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Register a new user
export const register = async (userData) => {
  try {
    const response = await api.post('/register', userData);

    if (response.data.success) {
      const { user, tokens } = response.data.data;

      // Store tokens and user data
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        user,
        message: response.data.message
      };
    }

    throw new Error(response.data.message || 'Registration failed');
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Registration failed');
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);

    if (response.data.success) {
      const { user, tokens } = response.data.data;

      // Store tokens and user data
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        user,
        message: response.data.message
      };
    }

    throw new Error(response.data.message || 'Login failed');
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Login failed');
  }
};

// Logout user
export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      await api.post('/logout', { refreshToken });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage regardless of API call success
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// Logout from all devices
export const logoutAll = async () => {
  try {
    await api.post('/logout-all');
  } catch (error) {
    console.error('Logout all error:', error);
  } finally {
    // Clear local storage regardless of API call success
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// Get current user profile
export const getProfile = async () => {
  try {
    const response = await api.get('/profile');

    if (response.data.success) {
      const user = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        user
      };
    }

    throw new Error(response.data.message || 'Failed to get profile');
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to get profile');
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/profile', profileData);

    if (response.data.success) {
      const user = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        user,
        message: response.data.message
      };
    }

    throw new Error(response.data.message || 'Failed to update profile');
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update profile');
  }
};

// Verify token
export const verifyToken = async () => {
  try {
    const response = await api.get('/verify-token');

    if (response.data.success) {
      return {
        success: true,
        user: response.data.data.user
      };
    }

    throw new Error('Token verification failed');
  } catch (error) {
    // Clear invalid tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    throw new Error(error.response?.data?.message || error.message || 'Token verification failed');
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  const user = getCurrentUser();
  return !!(token && user);
};

// Get access token
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

// Get refresh token
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};
