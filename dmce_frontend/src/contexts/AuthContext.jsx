import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authStatus = localStorage.getItem('isAuthenticated');
      const grNumber = localStorage.getItem('gr_number');

      if (!authStatus || authStatus !== 'true' || !grNumber) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      // Verify with backend
      const response = await fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Fallback to localStorage in case of network issues
      const localAuth = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(localAuth === 'true');
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    localStorage.setItem('gr_number', userData.gr_number || userData.user_id);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('loginTime', userData.login_time || new Date().toISOString());
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Call backend logout
      await fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    }

    // Clear local storage
    localStorage.removeItem('gr_number');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginTime');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};