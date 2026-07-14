import client from './client';

export const shippingAPI = {
  calculate: (data) => client.post('/shipping/calculate', data),
  getProvinces: () => client.get('/shipping/provinces'),
  track: (trackingNumber) => client.post(`/shipping/track/${trackingNumber}`),
};
