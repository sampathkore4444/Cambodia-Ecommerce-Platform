import client from './client';

export const usersAPI = {
  getProfile: () => client.get('/users/me'),
  updateProfile: (data) => client.put('/users/me', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return client.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getAddresses: () => client.get('/users/me/addresses'),
  createAddress: (data) => client.post('/users/me/addresses', data),
  updateAddress: (id, data) => client.put(`/users/me/addresses/${id}`, data),
  deleteAddress: (id) => client.delete(`/users/me/addresses/${id}`),
  setDefaultAddress: (id) => client.put(`/users/me/addresses/${id}/default`),
};
