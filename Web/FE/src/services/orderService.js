import api from './api';

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const mockPayment = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/pay`);
  return response.data;
};

export const createPaymentIntent = async (orderData) => {
  const response = await api.post('/orders/create-payment-intent', orderData);
  return response.data;
};

const orderService = {
  createOrder,
  getMyOrders,
  getOrderById,
  mockPayment,
  createPaymentIntent,
};

export default orderService;
