import client from './client';

export const sellerAPI = {
  register: (data) => client.post('/seller/register', data),
  getDashboard: () => client.get('/seller/dashboard'),
  getProducts: (params) => client.get('/seller/products', { params }),
  getOrders: (params) => client.get('/seller/orders', { params }),
  updateOrderItemStatus: (orderId, itemId, status) =>
    client.put(`/seller/orders/${orderId}/items/${itemId}/status`, { status }),
  updateShop: (data) => client.put('/seller/shop', data),
  getAnalytics: (params) => client.get('/seller/analytics', { params }),
  bulkUpload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post('/seller/bulk/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
};
