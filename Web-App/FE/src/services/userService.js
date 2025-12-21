import api from './api';

export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

export const getWishlist = async () => {
  const response = await api.get('/users/wishlist');
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await api.post('/users/wishlist', { productId });
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/users/wishlist/${productId}`);
  return response.data;
};

export const getCollections = async () => {
  const response = await api.get('/collections');
  return response.data;
};

export const getCollectionBySlug = async (slug) => {
  const response = await api.get(`/collections/${slug}`);
  return response.data;
};

export const getActivePromos = async () => {
  const response = await api.get('/promos/active');
  return response.data;
};

const userService = {
  getProfile,
  updateProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getCollections,
  getCollectionBySlug,
  getActivePromos,
};

export default userService;
