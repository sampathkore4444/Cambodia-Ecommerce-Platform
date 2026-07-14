import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { useAuth } from '../../../hooks/useAuth';
import { formatPrice } from '../../../utils/helpers';
import Button from '../../common/Button/Button';
import styles from './CartSummary.module.css';

export default function CartSummary() {
  const { items, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const shippingFee = total > 50 ? 0 : 5;
  const grandTotal = total + shippingFee;

  return (
    <div className={styles.summary}>
      <h3 className={styles.heading}>សង្ខេបបញ្ជា</h3>
      <div className={styles.row}><span>សរុបរង ({items.length} ផលិតផល)</span><span>{formatPrice(total)}</span></div>
      <div className={styles.row}><span>ការដឹកជញ្ជូន</span><span>{shippingFee === 0 ? 'ឥតគិតថ្លៃ' : formatPrice(shippingFee)}</span></div>
      <div className={styles.couponRow}>
        <input type="text" placeholder="លេខបញ្ចុះតម្លៃ" value={coupon} onChange={e => setCoupon(e.target.value)} className={styles.couponInput} />
        <Button variant="outline" size="sm">អនុវត្ត</Button>
      </div>
      <div className={styles.divider} />
      <div className={styles.totalRow}><span>សរុប</span><span className={styles.total}>{formatPrice(grandTotal)}</span></div>
      <Button fullWidth size="lg" onClick={() => navigate(isAuthenticated ? '/checkout' : '/login')}>បង់ប្រាក់</Button>
      <div className={styles.secure}>🔒 ការបង់ប្រាក់សុវត្ថិភាព</div>
    </div>
  );
}
