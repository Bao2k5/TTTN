
import api from './api';

export const getAddresses = async () => {
  const response = await api.get('/address');
  return response.data;
};

export const createAddress = async (addressData) => {
  const response = await api.post('/address', addressData);
  return response.data;
};

export const updateAddress = async (id, addressData) => {
  const response = await api.put(`/address/${id}`, addressData);
  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await api.delete(`/address/${id}`);
  return response.data;
};

export const setDefaultAddress = async (id) => {
  const response = await api.put(`/address/${id}/set-default`);
  return response.data;
};

export default {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
