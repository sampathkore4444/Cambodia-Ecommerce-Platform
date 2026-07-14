import client from './client';

export const reviewsAPI = {
  getProductReviews: (productId, params) => client.get(`/reviews/product/${productId}`, { params }),
  createReview: (productId, data) => client.post(`/reviews/product/${productId}`, data),
  updateReview: (reviewId, data) => client.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => client.delete(`/reviews/${reviewId}`),
  markHelpful: (reviewId) => client.post(`/reviews/${reviewId}/helpful`),
};
