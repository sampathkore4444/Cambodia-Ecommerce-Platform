import client from './client';

export const ordersAPI = {
  getOrders: (params) => client.get('/orders', { params }),
  getOrder: (id) => client.get(`/orders/${id}`),
  getTracking: (id) => client.get(`/orders/${id}/tracking`),
  createOrder: (data) => client.post('/orders', data),
  cancelOrder: (id, reason) => client.put(`/orders/${id}/cancel`, { reason }),
  confirmDelivery: (id) => client.post(`/orders/${id}/confirm-receipt`),
};
