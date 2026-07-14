import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Settings, Plus } from 'lucide-react';
import styles from './SellerSidebar.module.css';

const links = [
  { to: '/seller/dashboard', label: 'តារាងព័ត៌មាន', icon: LayoutDashboard },
  { to: '/seller/products', label: 'ផលិតផល', icon: Package },
  { to: '/seller/orders', label: 'បញ្ជាទិញ', icon: ShoppingCart },
];

export default function SellerSidebar() {
  const location = useLocation();
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            <l.icon size={18} />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <NavLink to="/seller/products/new" className={styles.addBtn}>
        <Plus size={18} />
        <span>បន្ថែមផលិតផល</span>
      </NavLink>
    </aside>
  );
}
