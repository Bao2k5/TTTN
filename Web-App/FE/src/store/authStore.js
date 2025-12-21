import { create } from 'zustand';
import authService from '../services/authService';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  error: null,

  initialize: () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          user,
          isAuthenticated: true,
          isAdmin: user?.role === 'admin',
        });
      }
    } catch (error) {
      console.error('Error initializing auth store:', error);
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login({ email, password });

      set({
        user: response.user,
        isAuthenticated: true,
        isAdmin: response.user?.role === 'admin',
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Đăng nhập thất bại' 
      });
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(userData);

      if (response?.token && response?.user) {
        try {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        } catch (err) {
          console.error('Error saving auth after register:', err);
        }

        set({
          user: response.user,
          isAuthenticated: true,
          isAdmin: response.user?.role === 'admin',
          loading: false,
          error: null,
        });
      } else {
        set({ loading: false, error: null });
      }

      return response;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Đăng ký thất bại' 
      });
      console.error('Register error:', error);
      throw error;
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  updateUser: (user) => {
    set({ user });
  },
}));

export { useAuthStore };
export default useAuthStore;
