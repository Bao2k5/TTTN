import api from './api';

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getProductBySlug = async (slug) => {
  const response = await api.get(`/products/slug/${slug}`);
  return response.data;
};

export const getNewArrivals = async () => {
  const response = await api.get('/products/new-arrivals');
  return response.data;
};

export const getProductsByCollection = async (slug, limit = null, filters = {}) => {
  const params = {
    ...(limit && { limit }),
    ...(filters.material && { material: filters.material }),
    ...(filters.color && { color: filters.color }),
    ...(filters.shape && { shape: filters.shape }),
    ...(filters.ready && { ready: filters.ready }),
    ...(filters.sort && { sort: filters.sort }),
  };
  const response = await api.get(`/collections/${slug}/products`, { params });
  return response.data;
};

export const searchProducts = async (query, limit = 10) => {
  const response = await api.get('/products/search', {
    params: { q: query, limit },
  });
  return response.data;
};

export const getProductReviews = async (productId) => {
  const response = await api.get(`/products/${productId}/reviews`);
  return response.data;
};

export const createReview = async (productId, reviewData) => {
  const response = await api.post(`/products/${productId}/reviews`, reviewData);
  return response.data;
};

const productService = {
  getProducts,
  getProductById,
  getProductBySlug,
  getNewArrivals,
  getProductsByCollection,
  searchProducts,
  getProductReviews,
  createReview,
};

export default productService;
