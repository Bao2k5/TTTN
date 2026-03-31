import api from './api';

export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId, qty = 1) => {
  const response = await api.post('/cart', { productId, qty });
  return response.data;
};

export const updateCartItem = async (productId, qty) => {
  const response = await api.put('/cart', { productId, qty });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/item/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

export default cartService;
