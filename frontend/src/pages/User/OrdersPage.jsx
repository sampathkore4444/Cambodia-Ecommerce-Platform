import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ordersAPI } from '../../api';
import Badge from '../../components/common/Badge/Badge';
import Spinner from '../../components/common/Loading/Spinner';
import { getStatusColor, getStatusLabel, formatPrice, formatDate } from '../../utils/helpers';
import styles from './OrdersPage.module.css';

const statusTabs = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    const params = activeTab !== 'all' ? { status: activeTab } : {};
    ordersAPI.getOrders({ params })
      .then(res => {
        const data = res.data;
        setOrders(data.data || data || []);
      })
      .catch(err => setError(err.message || 'មិនអាចផ្ទុកបញ្ជាបាន'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, activeTab]);

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>បញ្ជាទិញ</h1>
      <div className={styles.tabs}>
        {statusTabs.map(s => (
          <button key={s} className={`${styles.tab} ${activeTab === s ? styles.activeTab : ''}`} onClick={() => setActiveTab(s)}>
            {s === 'all' ? 'ទាំងអស់' : getStatusLabel(s)}
          </button>
        ))}
      </div>
      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div className={styles.orders}>
          {orders.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderId}>{order.order_number}</span>
                <Badge variant={getStatusColor(order.status)} dot>{getStatusLabel(order.status)}</Badge>
              </div>
              <div className={styles.orderFooter}>
                <span>{formatPrice(order.total)}</span>
                <span className={styles.date}>{formatDate(order.created_at)}</span>
              </div>
            </Link>
          ))}
          {orders.length === 0 && <p className={styles.empty}>មិនមានបញ្ជា</p>}
        </div>
      )}
    </div>
  );
}
