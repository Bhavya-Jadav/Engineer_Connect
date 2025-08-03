// engineer_connect-app/src/utils/api.js
// Centralized API utility with proper CORS credentials

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const apiCall = async (endpoint, options = {}) => {
  const defaultOptions = {
    credentials: 'include', // Always include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Authentication API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await apiCall('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await apiCall('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  logout: async () => {
    const response = await apiCall('/api/users/logout', {
      method: 'POST',
    });
    return response.json();
  },

  getCurrentUser: async () => {
    const response = await apiCall('/api/users/me');
    if (response.ok) {
      return response.json();
    }
    return null;
  }
};

export default apiCall;
