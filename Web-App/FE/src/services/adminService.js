import { api } from './api';

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAllProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await api.put(`/products/${productId}`, productData);
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get('/admin/orders');
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/admin/orders/${orderId}`);
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/admin/orders/${orderId}/status`, { status });
  return response.data;
};

export const updateOrderShipping = async (orderId, shippingData) => {
  const response = await api.put(`/admin/orders/${orderId}/ship`, shippingData);
  return response.data;
};

export const getAllUsers = async (page = 1, limit = 20) => {
  const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/admin/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const uploadProductImage = async (productId, imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  const response = await api.post(`/admin/products/${productId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteProductImage = async (productId, imageUrl) => {
  const response = await api.delete(`/admin/products/${productId}/images`, {
    data: { imageUrl }
  });
  return response.data;
};

export const getAdminLogs = async () => {
  const response = await api.get('/admin/logs');
  return response.data;
};

export const sendTestEmail = async (emailData) => {
  const response = await api.post('/admin/send-test-email', emailData);
  return response.data;
};
