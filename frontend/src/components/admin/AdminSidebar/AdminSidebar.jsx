import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings } from 'lucide-react';
import styles from './AdminSidebar.module.css';

const links = [
  { to: '/admin', label: 'តារាងព័ត៌មាន', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'ផលិតផល', icon: Package },
  { to: '/admin/orders', label: 'បញ្ជាទិញ', icon: ShoppingCart },
  { to: '/admin/users', label: 'អ្នកប្រើប្រាស់', icon: Users },
  { to: '/admin/settings', label: 'ការកំណត់', icon: Settings },
];

export default function AdminSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.badge}>Admin</span>
      </div>
      <nav className={styles.nav}>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            <l.icon size={18} />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
