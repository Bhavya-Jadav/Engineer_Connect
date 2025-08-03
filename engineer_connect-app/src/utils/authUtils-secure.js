// engineer_connect-app/src/utils/authUtils-secure.js
// Secure authentication utilities without localStorage

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Authentication API calls (all use secure cookies)
export const authAPI = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null; // Not authenticated
        }
        throw new Error('Failed to get user data');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Check session status
  checkSession: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/session-status`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        return { authenticated: false };
      }

      return await response.json();
    } catch (error) {
      console.error('Session check error:', error);
      return { authenticated: false };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Profile update failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
};

// Generic API call with authentication
export const authenticatedFetch = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include', // Always include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    
    // If unauthorized, redirect to login
    if (response.status === 401) {
      window.location.href = '/login';
      return null;
    }

    return response;
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
};

// Safe localStorage for non-sensitive data only
export const safeStorage = {
  // Only for UI preferences, not authentication data
  setPreference: (key, value) => {
    try {
      localStorage.setItem(`pref_${key}`, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save preference:', error);
    }
  },

  getPreference: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(`pref_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to get preference:', error);
      return defaultValue;
    }
  },

  removePreference: (key) => {
    try {
      localStorage.removeItem(`pref_${key}`);
    } catch (error) {
      console.warn('Failed to remove preference:', error);
    }
  },

  // Clear all preferences
  clearPreferences: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('pref_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear preferences:', error);
    }
  }
};

// Migration utility to clear old localStorage data
export const migrateFromLocalStorage = () => {
  try {
    // Remove old authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    console.log('✅ Migrated from localStorage authentication to secure sessions');
  } catch (error) {
    console.warn('Migration warning:', error);
  }
};

export default authAPI;
