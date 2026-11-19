import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const readStoredUser = () => {
  const savedUser = localStorage.getItem('ccms_user');
  if (!savedUser) return null;

  try {
    const user = JSON.parse(savedUser);
    if (user && typeof user === 'object' && !Array.isArray(user)) {
      return user;
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }

  localStorage.removeItem('ccms_user');
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('ccms_token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ccms_token');
    localStorage.removeItem('ccms_user');
  };

  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      const savedToken = localStorage.getItem('ccms_token');
      try {
        if (savedToken) {
          const res = await authService.getCurrentUser();
          if (!active) return;

          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('ccms_user', JSON.stringify(res.data));
          } else {
            logout();
          }
        } else {
          setUser(null);
          localStorage.removeItem('ccms_user');
        }
      } catch (error) {
        if (!active) return;
        if (error.response?.status === 401) {
          logout();
        } else {
          setUser(readStoredUser());
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    initAuth();

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      const { user: userData, token: jwtToken } = res.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('ccms_token', jwtToken);
      localStorage.setItem('ccms_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      const { user: newUser, token: jwtToken } = res.data;
      setUser(newUser);
      setToken(jwtToken);
      localStorage.setItem('ccms_token', jwtToken);
      localStorage.setItem('ccms_user', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
