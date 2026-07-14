import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import CheckoutForm from '../../components/checkout/CheckoutForm/CheckoutForm';
import styles from './CheckoutPage.module.css';

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const buyNowItem = location.state?.buyNow || null;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>បង់ប្រាក់</h1>
      <CheckoutForm buyNowItem={buyNowItem} />
    </div>
  );
}
