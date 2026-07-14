import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import BottomNav from '../BottomNav/BottomNav';
import CartDrawer from '../../cart/CartDrawer/CartDrawer';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import styles from './MainLayout.module.css';

export default function MainLayout({ children }) {
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>{children}</div>
      </main>
      {!isMobile && <Footer />}
      {isMobile && <BottomNav />}
      <CartDrawer />
    </div>
  );
}
