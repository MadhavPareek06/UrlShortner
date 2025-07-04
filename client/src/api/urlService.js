import axios from 'axios';
import { URL_API_URL } from '../config/api.js';

const API_BASE_URL = URL_API_URL;

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

// Create a short URL
export const shortenUrl = async (originalUrl, title = '', description = '', customId = '', expiresAt = null) => {
  try {
    const response = await api.post('/shorten', {
      originalUrl,
      title,
      description,
      customId,
      expiresAt
    });

    if (response.data.success) {
      const baseUrl = import.meta.env.PROD
        ? 'https://urlshortner-9ig2.onrender.com'
        : 'http://localhost:5000';

      return {
        success: true,
        data: response.data.data,
        shortUrl: `${baseUrl}/${response.data.data.shortId}`,
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || 'Failed to shorten URL');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to shorten URL');
  }
};

// Get all URLs with pagination and filtering
export const getAllUrls = async (page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '', isActive = true) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
      ...(search && { search }),
      ...(isActive !== undefined && { isActive: isActive.toString() })
    });

    const response = await api.get(`/urls?${params}`);

    if (response.data.success) {
      return {
        success: true,
        urls: response.data.data.urls,
        pagination: response.data.data.pagination,
        total: response.data.data.total
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch URLs');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch URLs');
  }
};

// Get a single URL by shortId
export const getUrlByShortId = async (shortId) => {
  try {
    const response = await api.get(`/urls/${shortId}`);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      throw new Error(response.data.message || 'URL not found');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch URL');
  }
};

// Update a URL
export const updateUrl = async (shortId, updateData) => {
  try {
    const response = await api.put(`/urls/${shortId}`, updateData);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || 'Failed to update URL');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update URL');
  }
};

// Delete a URL
export const deleteUrl = async (shortId) => {
  try {
    const response = await api.delete(`/urls/${shortId}`);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || 'Failed to delete URL');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete URL');
  }
};

// Get URL analytics
export const getUrlAnalytics = async (shortId) => {
  try {
    const response = await api.get(`/analytics/${shortId}`);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch analytics');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch analytics');
  }
};

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    console.log('🔍 Fetching dashboard stats...');
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Token available:', !!token);

    const response = await api.get('/dashboard/stats');
    console.log('📊 Dashboard stats response:', response.data);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch dashboard stats');
    }
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    console.error('❌ Error response:', error.response?.data);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch dashboard stats');
  }
};

// Check API health
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return {
      success: true,
      status: response.data.status,
      data: response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'API is not responding');
  }
};
