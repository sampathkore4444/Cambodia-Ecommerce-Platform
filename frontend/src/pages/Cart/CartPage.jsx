import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import CartItem from '../../components/cart/CartItem/CartItem';
import CartSummary from '../../components/cart/CartSummary/CartSummary';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { items } = useCart();

  if (!items.length) {
    return <EmptyState title="រទេះទទេ" description="អ្នកមិនទាន់មានផលិតផលក្នុងរទេះ" actionLabel="បន្តទិញឥវ៉ាន់" onAction={() => window.location.href = '/'} />;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>រទេះទិញទំនិញ ({items.length})</h1>
      <div className={styles.content}>
        <div className={styles.items}>
          {items.map(item => <CartItem key={item.productId} item={item} />)}
        </div>
        <div className={styles.summary}>
          <CartSummary />
        </div>
      </div>
      <Link to="/" className={styles.continue}>← បន្តទិញឥវ៉ាន់</Link>
    </div>
  );
}
