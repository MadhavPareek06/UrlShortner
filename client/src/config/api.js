// API Configuration
const getApiBaseUrl = () => {
  // Use environment variable if available
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // In production, use Render backend
  if (import.meta.env.PROD) {
    return 'https://urlshortner-9ig2.onrender.com/api';
  }

  // In development, use localhost
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();
export const AUTH_API_URL = `${API_BASE_URL}/auth`;
export const URL_API_URL = API_BASE_URL;
