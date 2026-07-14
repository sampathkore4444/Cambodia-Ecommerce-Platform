import client from './client';

export const wishlistAPI = {
  getWishlist: (params) => client.get('/wishlist', { params }),
  addToWishlist: (productId) => client.post('/wishlist', { product_id: productId }),
  removeFromWishlist: (productId) => client.delete(`/wishlist/${productId}`),
};
