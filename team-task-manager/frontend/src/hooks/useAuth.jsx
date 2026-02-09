import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../services/api';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuthStatus = async () => {
      try {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (isLoggedIn) {
          // Since we're using server sessions, we just need to verify if user is logged in
          // We can make a lightweight request to check auth status
          try {
            const response = await authAPI.getCurrentUser();
            if (response.data.user) {
              setUser(response.data.user);
              setIsAuthenticated(true);
            } else {
              // User is not authenticated, clear local storage
              localStorage.removeItem('isLoggedIn');
            }
          } catch (error) {
            // If the request fails, user is not authenticated
            localStorage.removeItem('isLoggedIn');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid state
        localStorage.removeItem('isLoggedIn');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user } = response.data;

      // Store login state
      localStorage.setItem('isLoggedIn', 'true');

      // Force the state update to trigger re-render
      setUser(user);
      setIsAuthenticated(true);

      // Small delay to ensure session cookie is processed by browser
      await new Promise(resolve => setTimeout(resolve, 100));

      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user } = response.data;

      // Store login state
      localStorage.setItem('isLoggedIn', 'true');

      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear all stored data
      localStorage.removeItem('isLoggedIn');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed';
      return { success: false, error: message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;