/**
 * @file AuthContext.jsx
 * @description React context for global auth state.
 *              Provides login/logout functions and current user to all children.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage so state survives page refreshes
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = data.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    return newUser;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await axiosInstance.post('/auth/register', { name, email, password });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(token);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming auth context
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
