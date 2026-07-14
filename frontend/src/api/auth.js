import client from './client';

export const authAPI = {
  login: (credentials) => client.post('/auth/login', credentials),
  register: (data) => client.post('/auth/register', data),
  loginByPhone: (phone) => client.post('/auth/login/phone', { phone }),
  verifyOTP: (phone, otp) => client.post('/auth/verify-otp', { phone, otp }),
  refreshToken: (token) => client.post('/auth/refresh', { refreshToken: token }),
  logout: () => client.post('/auth/logout'),
  socialLogin: (provider, token) => client.post('/auth/social', { provider, token }),
};
