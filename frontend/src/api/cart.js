import client from './client';

export const cartAPI = {
  getCart: () => client.get('/cart'),
  addToCart: (data) => client.post('/cart/items', data),
  updateCartItem: (id, quantity) => client.put(`/cart/items/${id}`, { quantity }),
  removeFromCart: (id) => client.delete(`/cart/items/${id}`),
  clearCart: () => client.delete('/cart'),
};
