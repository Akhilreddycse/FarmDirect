import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('farmdirect_token'));
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadUser = async () => {
    const savedToken = localStorage.getItem('farmdirect_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to load user profile', err);
      localStorage.removeItem('farmdirect_token');
      localStorage.removeItem('farmdirect_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('farmdirect_token', res.data.token);
        localStorage.setItem('farmdirect_user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        addToast(`Welcome back, ${res.data.user.name}!`, 'success');
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      // Distinguish between network errors (server down) and credential errors
      const isNetworkError = !err.response;
      const msg = isNetworkError
        ? 'Cannot connect to server. Please ensure the backend is running.'
        : err.response?.data?.message || 'Login failed. Please check your credentials.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        localStorage.setItem('farmdirect_token', res.data.token);
        localStorage.setItem('farmdirect_user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        addToast('Account created successfully!', 'success');
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const isNetworkError = !err.response;
      const msg = isNetworkError
        ? 'Cannot connect to server. Please ensure the backend is running.'
        : err.response?.data?.message || 'Registration failed. Please check details.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('farmdirect_token');
    localStorage.removeItem('farmdirect_user');
    setToken(null);
    setUser(null);
    addToast('Logged out successfully', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        reloadUser: loadUser,
        isAuthenticated: !!user,
        isFarmer: user?.role === 'farmer',
        isConsumer: user?.role === 'consumer',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
