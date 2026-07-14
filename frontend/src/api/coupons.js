import client from './client';

export const couponsAPI = {
  create: (data) => client.post('/coupons', data),
  validate: (code, cartTotal) => client.post('/coupons/validate', { coupon_code: code, cart_total: cartTotal }),
  getSellerCoupons: () => client.get('/coupons/seller'),
  delete: (couponId) => client.delete(`/coupons/${couponId}`),
};
