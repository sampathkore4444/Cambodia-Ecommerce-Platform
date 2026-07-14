import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import Skeleton from '../../common/Loading/Skeleton';
import styles from './ProductGrid.module.css';

export default function ProductGrid({ products = [], loading = false, columns = 4 }) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <Skeleton variant="image" />
            <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Skeleton variant="text" />
              <Skeleton variant="text" width="60%" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div className={styles.grid}>
      {products.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
