import React from 'react';
import SellerSidebar from '../SellerSidebar/SellerSidebar';
import styles from './SellerLayout.module.css';

export default function SellerLayout({ children }) {
  return (
    <div className={styles.layout}>
      <SellerSidebar />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
