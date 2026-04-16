import api from './api';
import { storage } from '../utils/helpers';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    storage.set('token', response.data.token);
    storage.set('user', response.data.user);
  }
  return response.data;
};

export const logout = () => {
  storage.remove('token');
  storage.remove('user');
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const getCurrentUser = () => {
  return storage.get('user');
};

export const isAuthenticated = () => {
  return !!storage.get('token');
};

export const isAdmin = () => {
  const user = storage.get('user');
  return user?.role === 'admin';
};

const authService = {
  register,
  login,
  logout,
  forgotPassword,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
};

export default authService;
