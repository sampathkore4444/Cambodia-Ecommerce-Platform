import React, { useState } from 'react';
import { formatPrice } from '../../../utils/helpers';
import { USD_TO_KHR_RATE } from '../../../utils/constants';
import styles from './CurrencyDisplay.module.css';

export default function CurrencyDisplay({ price, showBoth = false, size = 'md' }) {
  const [showKHR, setShowKHR] = useState(false);

  if (price == null) return null;

  return (
    <div className={`${styles.display} ${styles[size]}`}>
      {showBoth ? (
        <div className={styles.both}>
          <span className={styles.primary}>{formatPrice(price, 'USD')}</span>
          <span className={styles.secondary}>≈ {formatPrice(price, 'KHR')}</span>
        </div>
      ) : (
        <>
          <span className={styles.price}>{formatPrice(price, showKHR ? 'KHR' : 'USD')}</span>
          <button className={styles.toggle} onClick={() => setShowKHR(!showKHR)}>
            {showKHR ? 'USD' : 'KHR'}
          </button>
        </>
      )}
    </div>
  );
}
