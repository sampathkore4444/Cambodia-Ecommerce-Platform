import React, { useState } from 'react';
import styles from './ConfirmAction.module.css';

export default function ConfirmAction({ children, message, onConfirm, variant = 'danger' }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    setShowConfirm(false);
    onConfirm();
  };

  if (showConfirm) {
    return (
      <div className={styles.confirmWrap}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles[variant]}`} onClick={handleConfirm}>បាទ/ចាស</button>
          <button className={`${styles.btn} ${styles.cancel}`} onClick={() => setShowConfirm(false)}>បោះបង់</button>
        </div>
      </div>
    );
  }

  return (
    <span onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }} className={styles.trigger}>
      {children}
    </span>
  );
}
