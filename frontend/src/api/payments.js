import client from './client';

export const paymentsAPI = {
  initiate: (data) => client.post('/payments', data),
  getStatus: (paymentId) => client.get(`/payments/${paymentId}/status`),
  requestRefund: (paymentId, reason) => client.post(`/payments/${paymentId}/refund`, null, { params: { reason } }),
};
