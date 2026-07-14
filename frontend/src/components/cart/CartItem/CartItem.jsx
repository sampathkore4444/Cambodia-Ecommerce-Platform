import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatPrice } from '../../../utils/helpers';
import { useCart } from '../../../hooks/useCart';
import styles from './CartItem.module.css';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className={styles.item}>
      <img src={item.image || '/placeholder.png'} alt={item.name} className={styles.image} />
      <div className={styles.info}>
        <h4 className={styles.title}>{item.name}</h4>
        {item.variant && <span className={styles.variant}>{item.variant}</span>}
        <div className={styles.price}>{formatPrice(item.price)}</div>
        <div className={styles.bottom}>
          <div className={styles.stepper}>
            <button onClick={() => updateQuantity(item.id || item.productId, item.quantity - 1)} disabled={item.quantity <= 1} className={styles.stepBtn}>-</button>
            <span className={styles.qty}>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id || item.productId, item.quantity + 1)} className={styles.stepBtn}>+</button>
          </div>
          <span className={styles.subtotal}>{formatPrice(item.price * item.quantity)}</span>
          <button className={styles.removeBtn} onClick={() => removeItem(item.id || item.productId)}><Trash2 size={16} /></button>
        </div>
      </div>
    </div>
  );
}
