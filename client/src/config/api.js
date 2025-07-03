// API Configuration
const getApiBaseUrl = () => {
  // In production, use the same domain
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // In development, use localhost
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();
export const AUTH_API_URL = `${API_BASE_URL}/auth`;
export const URL_API_URL = API_BASE_URL;
