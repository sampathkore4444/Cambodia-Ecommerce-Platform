import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { useUIStore } from '../../../store';
import { formatPrice } from '../../../utils/helpers';
import Button from '../../common/Button/Button';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { items, total, itemCount } = useCart();
  const { isCartDrawerOpen, toggleCartDrawer } = useUIStore();
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={toggleCartDrawer} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <h3>រទេះ ({itemCount})</h3>
          <button onClick={toggleCartDrawer} className={styles.close}><X size={20} /></button>
        </div>
        <div className={styles.items}>
          {items.length === 0 ? (
            <p className={styles.empty}>រទេះទទេ</p>
          ) : items.slice(0, 5).map(item => (
            <div key={item.productId} className={styles.item}>
              <img src={item.image || '/placeholder.png'} alt="" className={styles.itemImg} />
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemPrice}>{formatPrice(item.price)} × {item.quantity}</span>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.total}><span>សរុប</span><span>{formatPrice(total)}</span></div>
            <Button fullWidth onClick={() => { toggleCartDrawer(); navigate('/cart'); }}>មើលរទេះ</Button>
          </div>
        )}
      </div>
    </>
  );
}
