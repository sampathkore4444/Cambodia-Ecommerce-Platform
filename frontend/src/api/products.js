import client from './client';

export const productsAPI = {
  getProducts: (params) => client.get('/products', { params }),
  getProduct: (id) => client.get(`/products/${id}`),
  getTrendingProducts: () => client.get('/products/trending'),
  getFlashSales: (params) => client.get('/products/flash-sales', { params }),
  searchProducts: (query, params) => client.get('/search', { params: { q: query, ...params } }),
  getSearchSuggestions: (query) => client.get('/search/suggestions', { params: { q: query } }),
  getCategories: () => client.get('/categories'),
  getProductsByCategory: (categoryId, params) => client.get(`/products`, { params: { category_id: categoryId, ...params } }),
  createProduct: (data) => client.post('/products', data),
  updateProduct: (id, data) => client.put(`/products/${id}`, data),
  deleteProduct: (id) => client.delete(`/products/${id}`),
  addImage: (productId, data) => client.post(`/products/${productId}/images`, data),
  deleteImage: (imageId) => client.delete(`/products/images/${imageId}`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
  addVariant: (productId, data) => client.post(`/products/${productId}/variants`, data),
  updateVariant: (variantId, data) => client.put(`/products/variants/${variantId}`, data),
  deleteVariant: (variantId) => client.delete(`/products/variants/${variantId}`),
};
