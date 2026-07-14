import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductDetail from '../../components/product/ProductDetail/ProductDetail';
import ProductGrid from '../../components/product/ProductGrid/ProductGrid';
import Spinner from '../../components/common/Loading/Spinner';
import { productsAPI } from '../../api';
import { addRecentlyViewed } from '../../utils/helpers';
import styles from './ProductDetailPage.module.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setNotFound(false);
    setRelatedProducts([]);
    productsAPI.getProduct(id)
      .then(res => {
        const raw = res.data.data || res.data;
        if (!raw || !raw.id) {
          setNotFound(true);
          return;
        }
        const productData = {
          id: raw.id,
          name: raw.title_kh || raw.title,
          title: raw.title,
          title_kh: raw.title_kh,
          price: raw.price,
          originalPrice: raw.compare_price,
          images: (raw.images || []).map(img => img.url || img),
          rating: raw.rating_avg || 0,
          soldCount: raw.sold_count || 0,
          stock: raw.stock_quantity || 0,
          location: raw.location_province || '',
          condition: raw.condition,
          description: raw.description || raw.description_kh || '',
          seller: raw.seller || { name: raw.seller_name || 'អ្នកលក់' },
          specifications: {},
          category_id: raw.category_id,
        };
        setProduct(productData);
        addRecentlyViewed(productData);

        if (raw.category_id) {
          productsAPI.getProductsByCategory(raw.category_id, { per_page: 8 })
            .then(relRes => {
              const items = (relRes.data.data || relRes.data || [])
                .filter(p => p.id !== raw.id)
                .map(p => ({
                  id: p.id,
                  name: p.title_kh || p.title,
                  price: p.price,
                  originalPrice: p.compare_price,
                  images: (p.images || []).map(img => img.url || img),
                  rating: p.rating_avg || 0,
                  soldCount: p.sold_count || 0,
                  location: p.location_province || 'ភ្នំពេញ',
                  condition: p.condition || 'new',
                }));
              setRelatedProducts(items.slice(0, 8));
            })
            .catch(() => {});
        }
      })
      .catch(err => {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(err.message || 'មិនអាចផ្ទុកផលិតផលបាន។');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.page}><Spinner size="lg" /></div>;

  if (notFound) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <div className={styles.notFoundIcon}>🔍</div>
          <h2 className={styles.notFoundTitle}>មិនមានផលិតផលនេះទេ</h2>
          <p className={styles.notFoundDesc}>ផលិតផលដែលអ្នកកំពុងស្វែងរកអាចត្រូវបានលុបចេញ ឬមិនមាននៅឡើយ។</p>
          <Link to="/" className={styles.notFoundLink}>ត្រឡប់ទៅទំព័រដើម</Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <p className={styles.errorText}>{error}</p>
          <Link to="/" className={styles.notFoundLink}>ត្រឡប់ទៅទំព័រដើម</Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className={styles.page}>
      <ProductDetail product={product} />
      {relatedProducts.length > 0 && (
        <section className={styles.related}>
          <h2>ផលិតផលពាក់ព័ន្ធ</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
