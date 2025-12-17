import { create } from 'zustand';
import api from '../services/api';

const useWishlistStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchWishlist: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/users/wishlist');
      set({ 
        items: response.data.wishlist || [], 
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      // Handle timeout and network errors
      let errorMessage = 'Failed to fetch wishlist';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ 
        loading: false, 
        error: errorMessage,
        items: [] // Fallback to empty array on error
      });
    }
  },

  addToWishlist: async (product) => {
    set({ loading: true, error: null });
    try {
      console.log('=== WISHLIST DEBUG ===');
      console.log('Product object:', JSON.stringify(product, null, 2));
      console.log('Product type:', typeof product);
      console.log('Product keys:', product ? Object.keys(product) : 'undefined');
      console.log('Product._id:', product?._id);
      console.log('Product.id:', product?.id);
      
      if (!product || (!product._id && !product.id)) {
        throw new Error('Product or product.id is undefined');
      }
      
      // Dùng product.id nếu có, ngược lại dùng product._id
      const productId = product._id || product.id;
      const payload = { productId };
      console.log('Sending payload:', JSON.stringify(payload, null, 2));
      
      await api.post('/users/wishlist', payload);
      const { items } = get();
      const exists = items.find(item => {
        const itemProductId = item.product._id || item.product.id;
        return itemProductId === productId;
      });

      if (!exists) {
        set({ 
          items: [...items, { product }], 
          loading: false 
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      let errorMessage = 'Failed to add to wishlist';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ 
        loading: false, 
        error: errorMessage
      });
      throw error;
    }
  },

  removeFromWishlist: async (productId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/users/wishlist/${productId}`);
      const { items } = get();
      set({ 
        items: items.filter(item => item.product._id !== productId),
        loading: false 
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      let errorMessage = 'Failed to remove from wishlist';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ 
        loading: false, 
        error: errorMessage
      });
      throw error;
    }
  },

  isInWishlist: (productId) => {
    const { items } = get();
    return items.some(item => {
      const itemProductId = item.product._id || item.product.id;
      return itemProductId === productId;
    });
  },

  clearWishlist: () => {
    set({ items: [], error: null });
  },

  getWishlistCount: () => {
    const { items } = get();
    return items.length;
  },
}));

export default useWishlistStore;
