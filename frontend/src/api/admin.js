import client from './client';

export const adminAPI = {
  getDashboardStats: () => client.get('/admin/dashboard'),
  getUsers: (params) => client.get('/admin/users', { params }),
  banUser: (userId, reason) => client.put(`/admin/users/${userId}/ban`, { reason }),
  unbanUser: (userId) => client.put(`/admin/users/${userId}/unban`),
  verifyUser: (userId) => client.put(`/admin/users/${userId}/verify`),
  getSellers: (params) => client.get('/admin/sellers', { params }),
  verifySeller: (sellerId) => client.put(`/admin/sellers/${sellerId}/verify`),
  getProducts: (params) => client.get('/admin/products', { params }),
  approveProduct: (productId) => client.put(`/admin/products/${productId}/approve`),
  flagProduct: (productId, reason) => client.put(`/admin/products/${productId}/flag`, { reason }),
  getOrders: (params) => client.get('/admin/orders', { params }),
  getPaymentReports: (params) => client.get('/admin/payments/reports', { params }),
  createCategory: (data) => client.post('/admin/categories', data),
  updateCategory: (categoryId, data) => client.put(`/admin/categories/${categoryId}`, data),
  deleteCategory: (categoryId) => client.delete(`/admin/categories/${categoryId}`),
  getDisputes: (params) => client.get('/admin/disputes', { params }),
  resolveDispute: (disputeId, resolution) => client.put(`/admin/disputes/${disputeId}/resolve`, { resolution }),
};
