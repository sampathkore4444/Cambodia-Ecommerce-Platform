import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import ProductGrid from '../../components/product/ProductGrid/ProductGrid';
import { CATEGORIES, KHMER_PROVINCES as PROVINCES } from '../../utils/constants';
import { productsAPI } from '../../api';
import { debounce } from '../../utils/helpers';
import styles from './SearchResultsPage.module.css';

const popularSearches = ['iPhone', 'Samsung', 'Laptop', 'កាបូប', 'សម្លៀកបំពាក់', 'AirPods'];

const priceRanges = [
  { label: 'ទាំងអស់', min: 0, max: Infinity },
  { label: 'ក្រោម $10', min: 0, max: 10 },
  { label: '$10 - $50', min: 10, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $500', min: 100, max: 500 },
  { label: '$500+', min: 500, max: Infinity },
];

const conditions = [
  { value: '', label: 'ទាំងអស់' },
  { value: 'new', label: 'ថ្មី' },
  { value: 'used', label: 'ប្រើប្រាស់แล้ว' },
  { value: 'refurbished', label: 'ជួសជុល' },
];

const sortOptions = [
  { value: '', label: 'ពេញនិយម' },
  { value: 'price_asc', label: 'តម្លៃទាប' },
  { value: 'price_desc', label: 'តម្លៃខ្ពស់' },
  { value: 'rating', label: 'ការវាយតម្លៃ' },
  { value: 'newest', label: 'ថ្មីបំផុត' },
  { value: 'sales', label: 'លក់ដាច់ខ្លាំង' },
];

function mapProduct(raw) {
  return {
    id: raw.id,
    name: raw.title_kh || raw.title,
    price: raw.price,
    originalPrice: raw.compare_price || undefined,
    images: (raw.images || []).map(img => img.url || img),
    rating: raw.rating_avg || 0,
    soldCount: raw.sold_count || 0,
    location: raw.location_province || 'ភ្នំពេញ',
    condition: raw.condition || 'new',
  };
}

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || '';
  const minPriceParam = searchParams.get('min_price') || '';
  const maxPriceParam = searchParams.get('max_price') || '';
  const conditionParam = searchParams.get('condition') || '';
  const locationParam = searchParams.get('location') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [dbCategories, setDbCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [localSort, setLocalSort] = useState(sortParam);
  const [localPriceRange, setLocalPriceRange] = useState(
    minPriceParam && maxPriceParam ? `${minPriceParam}-${maxPriceParam}` : '0-Infinity'
  );
  const [localCondition, setLocalCondition] = useState(conditionParam);
  const [localLocation, setLocalLocation] = useState(locationParam);

  useEffect(() => {
    productsAPI.getCategories()
      .then(res => {
        const cats = res.data.data || res.data || [];
        setDbCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => setDbCategories([]));
  }, []);

  const resolvedCategoryId = useMemo(() => {
    if (dbCategories.length === 0) return null;
    const flat = [];
    const walk = (list) => {
      for (const c of list) {
        flat.push(c);
        if (c.children) walk(c.children);
      }
    };
    walk(dbCategories);
    const match = flat.find(c => c.slug === categorySlug);
    return match ? match.id : null;
  }, [dbCategories, categorySlug]);

  const categoryMeta = useMemo(
    () => CATEGORIES.find(c => c.slug === categorySlug) || null,
    [categorySlug]
  );

  useEffect(() => {
    setLoading(true);
    let request;

    const params = {
      per_page: 40,
      sort: sortParam || undefined,
      min_price: minPriceParam || undefined,
      max_price: maxPriceParam || undefined,
      condition: conditionParam || undefined,
      location: locationParam || undefined,
    };

    if (query) {
      request = productsAPI.searchProducts(query, params);
    } else if (resolvedCategoryId) {
      request = productsAPI.getProductsByCategory(resolvedCategoryId, params);
    } else if (categorySlug && resolvedCategoryId === null && dbCategories.length > 0) {
      setResults([]);
      setLoading(false);
      return;
    } else {
      setResults([]);
      setLoading(false);
      return;
    }

    request
      .then(res => {
        const items = res.data.data || [];
        setResults(Array.isArray(items) ? items.map(mapProduct) : []);
        setTotalCount(res.data.meta?.total || items.length || 0);
      })
      .catch(() => {
        setResults([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [query, resolvedCategoryId, categorySlug, dbCategories.length, sortParam, minPriceParam, maxPriceParam, conditionParam, locationParam]);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    if (localSort) params.set('sort', localSort);
    else params.delete('sort');
    if (localCondition) params.set('condition', localCondition);
    else params.delete('condition');
    if (localLocation) params.set('location', localLocation);
    else params.delete('location');
    if (localPriceRange) {
      const [min, max] = localPriceRange.split('-');
      if (min !== '0') params.set('min_price', min);
      else params.delete('min_price');
      if (max !== 'Infinity') params.set('max_price', max);
      else params.delete('max_price');
    }
    setSearchParams(params);
  }, [localSort, localCondition, localLocation, localPriceRange, searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    setLocalSort('');
    setLocalPriceRange('0-Infinity');
    setLocalCondition('');
    setLocalLocation('');
    const params = new URLSearchParams(searchParams);
    params.delete('sort');
    params.delete('condition');
    params.delete('location');
    params.delete('min_price');
    params.delete('max_price');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const hasActiveFilters = sortParam || conditionParam || locationParam || minPriceParam || maxPriceParam;

  const heading = query
    ? `លទ្ធផលសម្រាប់ "${query}" - ${totalCount} មុខ`
    : categoryMeta
      ? `${categoryMeta.nameKm} - ${totalCount} មុខ`
      : '';

  return (
    <div className={styles.page}>
      <SearchBar />
      <div className={styles.toolbar}>
        <p className={styles.resultText}>{heading}</p>
        <div className={styles.toolbarActions}>
          <button
            className={`${styles.filterToggle} ${showFilters ? styles.filterActive : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} /> តម្រង
          </button>
          <select
            className={styles.sortSelect}
            value={localSort}
            onChange={e => setLocalSort(e.target.value)}
          >
            {sortOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>តម្លៃ</label>
            <div className={styles.filterOptions}>
              {priceRanges.map(r => (
                <button
                  key={r.label}
                  className={`${styles.filterOption} ${localPriceRange === `${r.min}-${r.max}` ? styles.filterOptionActive : ''}`}
                  onClick={() => setLocalPriceRange(`${r.min}-${r.max}`)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>ស្ថានភាព</label>
            <div className={styles.filterOptions}>
              {conditions.map(c => (
                <button
                  key={c.value}
                  className={`${styles.filterOption} ${localCondition === c.value ? styles.filterOptionActive : ''}`}
                  onClick={() => setLocalCondition(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>ទីតាំង</label>
            <select
              className={styles.locationSelect}
              value={localLocation}
              onChange={e => setLocalLocation(e.target.value)}
            >
              <option value="">ទាំងអស់</option>
              {PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterActions}>
            <button className={styles.applyBtn} onClick={applyFilters}>អនុវត្ត</button>
            {hasActiveFilters && (
              <button className={styles.clearBtn} onClick={clearFilters}>សម្អាត</button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <ProductGrid products={[]} loading={true} />
      ) : results.length > 0 ? (
        <ProductGrid products={results} />
      ) : (
        <div className={styles.suggestions}>
          <h3>ការស្វែងរកពេញនិយម</h3>
          <div className={styles.tags}>
            {popularSearches.map(s => (
              <a key={s} href={`/search?q=${encodeURIComponent(s)}`} className={styles.tag}>{s}</a>
            ))}
          </div>
          <h3>ប្រភេទ</h3>
          <div className={styles.tags}>
            {CATEGORIES.map(c => (
              <Link key={c.id} to={`/search?category=${c.slug}`} className={styles.tag}>{c.icon} {c.nameKm}</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
