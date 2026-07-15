import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Users, ShoppingCart, Package, AlertTriangle, UserCheck } from 'lucide-react';
import StatsCard from '../../components/admin/StatsCard/StatsCard';
import AdminLayout from '../../components/admin/AdminLayout/AdminLayout';
import Badge from '../../components/common/Badge/Badge';
import { adminAPI } from '../../api';
import styles from './AdminDashboardPage.module.css';

const statusColors = {
  pending: 'warning', confirmed: 'info', processing: 'info',
  shipped: 'primary', delivered: 'success', completed: 'success', cancelled: 'error',
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminAPI.getDashboardStats().catch(() => ({ data: { data: {} } })),
      adminAPI.getOrders({ per_page: 10 }).catch(() => ({ data: { data: [] } })),
    ]).then(([statsRes, ordersRes]) => {
      setStats(statsRes.data.data || {});
      setOrders(ordersRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><p>កំពុងផ្ទុក...</p></AdminLayout>;
  if (!stats) return <AdminLayout><p>មិនអាចផ្ទុកទិន្នន័យបានទេ</p></AdminLayout>;

  const statCards = [
    { icon: DollarSign, label: 'ចំណូលសរុប', value: `$${(stats.total_revenue || 0).toLocaleString()}` },
    { icon: Users, label: 'អ្នកប្រើប្រាស់', value: (stats.total_users || 0).toLocaleString() },
    { icon: ShoppingCart, label: 'បញ្ជាទិញ', value: (stats.total_orders || 0).toLocaleString() },
    { icon: Package, label: 'ផលិតផល', value: (stats.total_products || 0).toLocaleString() },
  ];

  return (
    <AdminLayout>
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <div className={styles.stats}>
        {statCards.map((s, i) => <StatsCard key={i} {...s} />)}
      </div>

      {(stats?.pending_products > 0 || stats?.pending_sellers > 0) && (
        <div className={styles.alerts}>
          {stats.pending_products > 0 && (
            <div className={styles.alertCard} onClick={() => navigate('/admin/products')}>
              <AlertTriangle size={20} />
              <div className={styles.alertInfo}>
                <span className={styles.alertCount}>{stats.pending_products}</span>
                <span>ផលិតផលរង់ចាំអនុម័ត</span>
              </div>
              <span className={styles.alertAction}>មើល →</span>
            </div>
          )}
          {stats.pending_sellers > 0 && (
            <div className={styles.alertCard} onClick={() => navigate('/admin/users')}>
              <UserCheck size={20} />
              <div className={styles.alertInfo}>
                <span className={styles.alertCount}>{stats.pending_sellers}</span>
                <span>អ្នកលក់រង់ចាំផ្ទៀងផ្ទាត់</span>
              </div>
              <span className={styles.alertAction}>មើល →</span>
            </div>
          )}
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.chart}>
          <h3>ទិន្នន័យសង្ខេប</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
            <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>បញ្ជាថ្មីៗ (៣០ថ្ងៃ)</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{stats.orders_30d || 0}</div>
            </div>
            <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>ចំណូល (៣០ថ្ងៃ)</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>${(stats.revenue_30d || 0).toLocaleString()}</div>
            </div>
            <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>បញ្ជារង់ចាំ</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: stats.pending_orders > 0 ? 'var(--warning)' : 'inherit' }}>{stats.pending_orders || 0}</div>
            </div>
            <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>ស្តុកទាប</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: stats.low_stock_products > 0 ? 'var(--error)' : 'inherit' }}>{stats.low_stock_products || 0}</div>
            </div>
          </div>
        </div>
      </div>
      <h2>បញ្ជាថ្មីៗ</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem' }}>លេខបញ្ជា</th>
            <th style={{ padding: '0.75rem' }}>អតិថិជន</th>
            <th style={{ padding: '0.75rem' }}>សរុប</th>
            <th style={{ padding: '0.75rem' }}>ស្ថានភាព</th>
            <th style={{ padding: '0.75rem' }}>កាលបរិច្ឆេទ</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
              <td style={{ padding: '0.75rem' }}>{o.order_number || o.id?.slice(0, 8)}</td>
              <td style={{ padding: '0.75rem' }}>{o.buyer?.full_name || o.buyer?.email || o.buyer_id?.slice(0, 8) || '-'}</td>
              <td style={{ padding: '0.75rem' }}>${o.total || 0}</td>
              <td style={{ padding: '0.75rem' }}><Badge variant={statusColors[o.status] || 'neutral'} dot>{o.status}</Badge></td>
              <td style={{ padding: '0.75rem' }}>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
          {orders.length === 0 && <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>មិនមានបញ្ជា</td></tr>}
        </tbody>
      </table>
    </div>
    </AdminLayout>
  );
}
