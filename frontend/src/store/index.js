import { create } from 'zustand';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/helpers';

export const useAuthStore = create((set) => ({
  user: getStorageItem('user'),
  token: getStorageItem('token'),
  login: (user, token) => { setStorageItem('user', user); setStorageItem('token', token); set({ user, token }); },
  logout: () => { removeStorageItem('user'); removeStorageItem('token'); removeStorageItem('refreshToken'); set({ user: null, token: null }); },
  updateUser: (data) => set(state => ({ user: { ...state.user, ...data } })),
}));

export const useCartStore = create((set, get) => ({
  items: getStorageItem('cart') || [],
  total: 0,
  addItem: (item) => set(state => {
    const items = [...state.items, item];
    return { items, total: items.reduce((s, i) => s + i.price * i.quantity, 0) };
  }),
  removeItem: (id) => set(state => {
    const items = state.items.filter(i => i.productId !== id);
    return { items, total: items.reduce((s, i) => s + i.price * i.quantity, 0) };
  }),
  clearCart: () => set({ items: [], total: 0 }),
}));

export const useUIStore = create((set) => ({
  isMobileMenuOpen: false,
  isCartDrawerOpen: false,
  searchQuery: '',
  toggleMobileMenu: () => set(state => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleCartDrawer: () => set(state => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
