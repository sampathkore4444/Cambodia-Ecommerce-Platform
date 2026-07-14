import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, PlusCircle, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../../hooks/useCart';
import styles from './BottomNav.module.css';

const tabs = [
  { path: '/', icon: Home, label: 'ទំព័រដើម' },
  { path: '/search', icon: Grid3X3, label: 'ប្រភេទ' },
  { path: '/sell', icon: PlusCircle, label: 'លក់', center: true },
  { path: '/cart', icon: ShoppingCart, label: 'រទេះ' },
  { path: '/profile', icon: User, label: 'ប្រវត្តិរូប' },
];

export default function BottomNav() {
  const { itemCount } = useCart();
  const location = useLocation();

  return (
    <nav className={styles.bottomNav}>
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        return (
          <Link key={tab.path} to={tab.path} className={`${styles.tab} ${tab.center ? styles.center : ''} ${isActive ? styles.active : ''}`}>
            {tab.center ? (
              <div className={styles.centerIcon}><tab.icon size={26} /></div>
            ) : (
              <>
                <div className={styles.iconWrap}>
                  <tab.icon size={22} />
                  {tab.path === '/cart' && itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
                </div>
                <span className={styles.label}>{tab.label}</span>
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
