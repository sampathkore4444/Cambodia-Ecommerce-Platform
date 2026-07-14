export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
export const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || '';

export const CURRENCIES = { USD: 'USD', KHR: 'KHR' };

export const USD_TO_KHR_RATE = 4100;

export const KHMER_PROVINCES = [
  'បន្ទាយមានជ័យ','បាត់ដំបង','កំពង់ចាម','កំពង់ឆ្នាំង','កំពង់ស្ពឺ',
  'កំពង់ធំ','ក្រចេះ','មណ្ឌលគីរី','ភ្នំពេញ','ព្រះវិហារ',
  'ពោធិ៍សាត់','រតនគីរី','សៀមរាប','ស្ទឹងត្រែង','ស្វាយប៉ៃ',
  'តាកែវ','ឧត្តរមានជ័យ','កែប','ក្រុងព្រះសីហនុ','ខេត្តដទៃទៀត'
];

export const PAYMENT_METHODS = [
  { id: 'cod', name: 'Cash on Delivery', nameKm: 'បង់ប្រាក់ពេលទទួលទំនិញ', icon: 'banknote' },
  { id: 'aba', name: 'ABA Bank', nameKm: 'ធនាគារ ABA', icon: 'landmark' },
  { id: 'wing', name: 'Wing', nameKm: 'Wing', icon: 'wallet' },
  { id: 'pipay', name: 'Pi Pay', nameKm: 'Pi Pay', icon: 'smartphone' },
  { id: 'truemoney', name: 'True Money', nameKm: 'True Money', icon: 'smartphone' },
  { id: 'card', name: 'Credit/Debit Card', nameKm: 'ប័ណ្ណឥណទាន', icon: 'credit-card' },
];

export const ORDER_STATUSES = {
  pending: { label: 'Pending', labelKm: 'រង់ចាំ', color: 'warning' },
  confirmed: { label: 'Confirmed', labelKm: 'បញ្ជាក់', color: 'info' },
  processing: { label: 'Processing', labelKm: 'កំពុងដំណើរការ', color: 'info' },
  shipped: { label: 'Shipped', labelKm: 'បានផ្ញើ', color: 'primary' },
  delivered: { label: 'Delivered', labelKm: 'បានដឹកជញ្ជូន', color: 'success' },
  completed: { label: 'Completed', labelKm: 'បញ្ចប់', color: 'success' },
  cancelled: { label: 'Cancelled', labelKm: 'បោះបង់', color: 'error' },
};

export const PRODUCT_CONDITIONS = {
  new: { label: 'New', labelKm: 'ថ្មី' },
  like_new: { label: 'Like New', labelKm: 'ដូចថ្មី' },
  used_good: { label: 'Used - Good', labelKm: 'ប្រើប្រាស់ - ល្អ' },
  used_fair: { label: 'Used - Fair', labelKm: 'ប្រើប្រាស់ - មធ្យម' },
};

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', labelKm: 'ថ្មីបំផុត' },
  { value: 'price_asc', label: 'Price: Low to High', labelKm: 'តម្លៃ៖ ទាបទៅខ្ពស់' },
  { value: 'price_desc', label: 'Price: High to Low', labelKm: 'តម្លៃ៖ ខ្ពស់ទៅទាប' },
  { value: 'popular', label: 'Most Popular', labelKm: 'ពេញនិយមបំផុត' },
  { value: 'rating', label: 'Highest Rated', labelKm: 'ការវាយតម្លៃខ្ពស់បំផុត' },
];

export const CATEGORIES = [
  { id: 1, name: 'Electronics', nameKm: 'អេឡិចត្រូនិច', slug: 'electronics', icon: '📱' },
  { id: 2, name: 'Fashion', nameKm: 'សម្លៀកបំពាក់', slug: 'fashion', icon: '👗' },
  { id: 3, name: 'Home & Living', nameKm: 'ផ្ទះនិងជីវិត', slug: 'home-living', icon: '🏠' },
  { id: 4, name: 'Beauty & Health', nameKm: 'សម្ផស្សនិងសុខភាព', slug: 'beauty-health', icon: '💄' },
  { id: 5, name: 'Food & Grocery', nameKm: 'អាហារនិងទំនិញ', slug: 'food-grocery', icon: '🍜' },
  { id: 6, name: 'Sports & Outdoors', nameKm: 'កីឡានិងឧបករណ៍', slug: 'sports', icon: '⚽' },
  { id: 7, name: 'Baby & Kids', nameKm: 'ទារកនិងកុមារ', slug: 'baby-kids', icon: '👶' },
  { id: 8, name: 'Books & Media', nameKm: 'សៀវភៅនិងមេឌៀ', slug: 'books', icon: '📚' },
  { id: 9, name: 'Vehicles', nameKm: 'យានយន្ត', slug: 'vehicles', icon: '🚗' },
  { id: 10, name: 'Agriculture', nameKm: 'កសិកម្ម', slug: 'agriculture', icon: '🌾' },
];
