import React from 'react';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }) {
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
