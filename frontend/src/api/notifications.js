import client from './client';

export const notificationsAPI = {
  getNotifications: (params) => client.get('/notifications', { params }),
  markAsRead: (notificationId) => client.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => client.put('/notifications/read-all'),
  getUnreadCount: () => client.get('/notifications/unread-count'),
  registerDevice: (token) => client.post('/notifications/register-device', { token }),
};
