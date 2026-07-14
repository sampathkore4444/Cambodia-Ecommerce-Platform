import { USD_TO_KHR_RATE } from './constants';

export function formatPrice(amount, currency = 'USD') {
  if (amount == null) return '';
  const num = Number(amount);
  if (currency === 'KHR') {
    const khr = Math.round(num * USD_TO_KHR_RATE);
    return `៛${khr.toLocaleString()}`;
  }
  return `$${num.toFixed(2)}`;
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateKhmer(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('km-KH', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function truncate(str, len = 50) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

export function getInitials(name) {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function generateStars(rating) {
  const stars = [];
  const full = Math.floor(rating || 0);
  const half = (rating % 1) >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  for (let i = 0; i < full; i++) stars.push('full');
  for (let i = 0; i < half; i++) stars.push('half');
  for (let i = 0; i < empty; i++) stars.push('empty');
  return stars;
}

export function getStatusColor(status) {
  const map = { pending:'warning', confirmed:'info', processing:'info', shipped:'primary', delivered:'success', completed:'success', cancelled:'error' };
  return map[status] || 'neutral';
}

export function getStatusLabel(status) {
  const map = { pending:'រង់ចាំ', confirmed:'បញ្ជាក់', processing:'ដំណើរការ', shipped:'ផ្ញើរួច', delivered:'ដឹកជញ្ជូនរួច', completed:'បញ្ចប់', cancelled:'បោះបង់' };
  return map[status] || status;
}

export function classNames(...args) {
  return args.filter(Boolean).join(' ');
}

export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function getStorageItem(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

export function setStorageItem(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function removeStorageItem(key) {
  try { localStorage.removeItem(key); } catch {}
}

export function slugify(text) {
  return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

const RECENTLY_VIEWED_KEY = 'recently_viewed';
const MAX_RECENTLY_VIEWED = 12;

export function addRecentlyViewed(product) {
  if (!product || !product.id) return;
  const items = getRecentlyViewed();
  const filtered = items.filter(i => i.id !== product.id);
  filtered.unshift({
    id: product.id,
    name: product.name || product.title_kh || product.title,
    price: product.price,
    originalPrice: product.originalPrice || product.compare_price,
    images: product.images || [],
    rating: product.rating || product.rating_avg || 0,
    soldCount: product.soldCount || product.sold_count || 0,
    location: product.location || product.location_province || 'ភ្នំពេញ',
    condition: product.condition || 'new',
  });
  setStorageItem(RECENTLY_VIEWED_KEY, filtered.slice(0, MAX_RECENTLY_VIEWED));
}

export function getRecentlyViewed() {
  return getStorageItem(RECENTLY_VIEWED_KEY) || [];
}

export function clearRecentlyViewed() {
  removeStorageItem(RECENTLY_VIEWED_KEY);
}

const COMPARE_KEY = 'compare_products';
const MAX_COMPARE = 4;

export function getCompareProducts() {
  return getStorageItem(COMPARE_KEY) || [];
}

export function addToCompare(product) {
  if (!product || !product.id) return { success: false, message: 'មិនមានផលិតផល' };
  const items = getCompareProducts();
  if (items.length >= MAX_COMPARE) {
    return { success: false, message: `អ្នកអាចប្រៀបធៀបបានតែ ${MAX_COMPARE} ផលិតផលប៉ុណ្ណោះ` };
  }
  if (items.some(i => i.id === product.id)) {
    return { success: false, message: 'ផលិតផលនេះមានរួចហើយ' };
  }
  items.push({
    id: product.id,
    name: product.name || product.title_kh || product.title,
    price: product.price,
    originalPrice: product.originalPrice || product.compare_price,
    images: product.images || [],
    rating: product.rating || product.rating_avg || 0,
    soldCount: product.soldCount || product.sold_count || 0,
    location: product.location || product.location_province || 'ភ្នំពេញ',
    condition: product.condition || 'new',
    stock: product.stock || product.stock_quantity || 0,
    description: product.description || product.description_kh || '',
  });
  setStorageItem(COMPARE_KEY, items);
  return { success: true, message: 'បានបន្ថែមទៅការប្រៀបធៀប' };
}

export function removeFromCompare(productId) {
  const items = getCompareProducts().filter(i => i.id !== productId);
  setStorageItem(COMPARE_KEY, items);
}

export function clearCompare() {
  removeStorageItem(COMPARE_KEY);
}
