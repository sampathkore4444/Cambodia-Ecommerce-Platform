import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import ProductGrid from '../../components/product/ProductGrid/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters/ProductFilters';
import { productsAPI } from '../../api';
import { SORT_OPTIONS } from '../../utils/constants';
import styles from './ProductListPage.module.css';

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

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productsAPI.getProducts({ page, per_page: 20, sort, ...filters })
      .then(res => {
        if (cancelled) return;
        const data = res.data;
        setProducts((data.data || data || []).map(mapProduct));
        setTotal(data.total || (data.data || data || []).length);
      })
      .catch(() => {
        if (!cancelled) { setProducts([]); setTotal(0); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, sort, filters]);

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>ទំព័រដើម / ផលិតផលទាំងអស់</div>
      <div className={styles.topBar}>
        <button className={styles.filterBtn} onClick={() => setShowFilters(true)}><Filter size={18} /> តម្រង</button>
        <span className={styles.resultCount}>មាន {total} មុខទំនិញ</span>
        <select className={styles.sortSelect} value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.labelKm}</option>)}
        </select>
      </div>
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <ProductFilters filters={filters} onFilterChange={f => { setFilters(p => ({ ...p, ...f })); setPage(1); }} onClear={() => { setFilters({}); setPage(1); }} isOpen={showFilters} onClose={() => setShowFilters(false)} />
        </aside>
        <div className={styles.main}>
          <ProductGrid products={products} loading={loading} />
          <div className={styles.pagination}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className={styles.pageBtn}>មុន</button>
            <span className={styles.pageInfo}>ទំព័រ {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={products.length < 20} className={styles.pageBtn}>បន្ទាប់</button>
          </div>
        </div>
      </div>
    </div>
  );
}
