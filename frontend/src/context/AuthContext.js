import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI, usersAPI } from '../api';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/helpers';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStorageItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    if (token && !user) {
      usersAPI.getProfile()
        .then(res => setUser(res.data.data || res.data))
        .catch(() => { removeStorageItem('token'); setToken(null); })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = useCallback(async (credentials) => {
    const loginPayload = { identifier: credentials.email || credentials.phone || credentials.identifier, password: credentials.password };
    const res = await authAPI.login(loginPayload);
    const payload = res.data.data || res.data;
    const { access_token: newToken, user: userData } = payload;
    setStorageItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    toast.success('ស្វាគមន៍ត្រឡប់មកវិញ!');
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const payload = res.data.data || res.data;
    const { access_token: newToken, user: userData } = payload;
    setStorageItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    toast.success('ចុះឈ្មោះជោគជ័យ!');
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    removeStorageItem('token');
    removeStorageItem('refreshToken');
    setToken(null);
    setUser(null);
    toast.success('បានចេញដោយជោគជ័យ');
  }, []);

  const socialLogin = useCallback(async (provider, socialToken) => {
    const res = await authAPI.socialLogin(provider, socialToken);
    const payload = res.data.data || res.data;
    const { access_token: newToken, user: userData } = payload;
    setStorageItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    toast.success('ស្វាគមន៍!');
    return userData;
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, logout, socialLogin, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
