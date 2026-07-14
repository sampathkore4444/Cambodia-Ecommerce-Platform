import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button/Button';
import Spinner from '../../components/common/Loading/Spinner';
import SellerLayout from '../../components/seller/SellerLayout/SellerLayout';
import { sellerAPI, productsAPI } from '../../api';
import styles from './SellerProductsPage.module.css';

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await sellerAPI.getProducts({ page, per_page: 20 });
      const data = res.data;
      setProducts(data.data?.items || data.items || data.data || []);
      const total = data.data?.total || data.total || 0;
      setTotalPages(Math.max(1, Math.ceil(total / 20)));
    } catch (err) {
      setError(err.message || 'មិនអាចផ្ទុកផលិតផលបាន។');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`តើអ្នកប្រាកដថាចង់លុប "${name}"?`)) return;
    try {
      await productsAPI.deleteProduct(id);
      setProducts(p => p.filter(item => item.id !== id));
    } catch (err) {
      alert(err.message || 'មិនអាចលុបបាន។');
    }
  };

  if (loading && !products.length) {
    return <SellerLayout><div className={styles.loading}><Spinner size="lg" /></div></SellerLayout>;
  }

  return (
    <SellerLayout>
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>ផលិតផលរបស់ខ្ញុំ</h1>

        {error && <div className={styles.error}>{error}</div>}

        {!loading && products.length === 0 && (
          <div className={styles.empty}>
            <p>អ្នកមិនទាន់មានផលិតផលទេ។</p>
            <Link to="/seller/products/new"><Button>+ បន្ថែមផលិតផលដំបូង</Button></Link>
          </div>
        )}

        <div className={styles.list}>
          {products.map(p => (
            <div key={p.id} className={styles.productCard}>
              <div className={styles.productImage}>
                {p.primary_image || p.images?.[0]?.url
                  ? <img src={p.primary_image || p.images[0].url} alt={p.title} />
                  : <div className={styles.placeholderImg}>📦</div>
                }
              </div>
              <div className={styles.productInfo}>
                <h3>{p.title_kh || p.title}</h3>
                {p.title_kh && p.title && <p className={styles.titleEn}>{p.title}</p>}
                <p className={styles.price}>${Number(p.price).toFixed(2)}{p.compare_price ? <span className={styles.comparePrice}>${Number(p.compare_price).toFixed(2)}</span> : ''}</p>
                <p className={styles.meta}>ស្តុក: {p.stock_quantity} | លក់បាន: {p.sold_count || 0} | ⭐ {p.rating_avg || 0}</p>
              </div>
              <div className={styles.actions}>
                <Link to={`/seller/products/${p.id}/edit`}><Button variant="ghost" size="sm">កែ</Button></Link>
                <Button variant="ghost" size="sm" className={styles.deleteBtn} onClick={() => handleDelete(p.id, p.title)}>លុប</Button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>មុន</Button>
            <span className={styles.pageInfo}>ទំព័រ {page} / {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>បន្ទាប់</Button>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
