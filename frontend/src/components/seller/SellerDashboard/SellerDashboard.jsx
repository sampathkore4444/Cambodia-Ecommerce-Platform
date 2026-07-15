import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertTriangle, Eye, PlusCircle } from 'lucide-react';
import { sellerAPI } from '../../../api';
import { formatPrice } from '../../../utils/helpers';
import StatsCard from '../../admin/StatsCard/StatsCard';
import styles from './SellerDashboard.module.css';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      sellerAPI.getDashboard().catch(() => ({ data: { data: {} } })),
      sellerAPI.getAnalytics().catch(() => ({ data: { data: {} } })),
    ])
      .then(([dashRes, analyticsRes]) => {
        const d = dashRes.data.data || dashRes.data;
        const a = analyticsRes.data.data || analyticsRes.data;

        const totalRevenue = (a.orders || []).reduce((sum, o) => sum + Number(o.total || 0), 0);
        const avgOrderValue = (a.orders || []).length > 0 ? totalRevenue / (a.orders || []).length : 0;

        setStats([
          { label: 'ផលិតផលសរុប', value: String(d.total_products || 0), icon: Package },
          { label: 'បញ្ជាទិញសរុប', value: String(d.total_orders || 0), icon: ShoppingCart },
          { label: 'ប្រាក់ចំណូលសរុប', value: formatPrice(totalRevenue), icon: DollarSign },
          { label: 'ការបញ្ជាទិញជាមធ្យម', value: formatPrice(avgOrderValue), icon: TrendingUp },
        ]);

        setRecentOrders(d.recent_orders || []);
        setAnalytics(a);

        const low = (a.products || []).filter(p => (p.stock_quantity || 0) < 5 && (p.stock_quantity || 0) >= 0);
        setLowStockProducts(low);
      })
      .catch(() => {
        setStats([
          { label: 'ផលិតផលសរុប', value: '0', icon: Package },
          { label: 'បញ្ជាទិញសរុប', value: '0', icon: ShoppingCart },
          { label: 'ប្រាក់ចំណូលសរុប', value: '$0.00', icon: DollarSign },
          { label: 'ការបញ្ជាទិញជាមធ្យម', value: '$0.00', icon: TrendingUp },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const topProducts = (analytics?.products || [])
    .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
    .slice(0, 5);

  const ordersByStatus = {};
  (analytics?.orders || []).forEach(o => {
    ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
  });

  const totalOrders = Object.values(ordersByStatus).reduce((s, c) => s + c, 0) || 1;

  const statusLabels = {
    pending: 'រង់ចាំ', confirmed: 'បញ្ជាក់', processing: 'ដំណើរការ',
    shipped: 'ផ្ញើរួច', delivered: 'ដឹកជញ្ជូនរួច', completed: 'បញ្ចប់', cancelled: 'បោះបង់',
  };
  const statusColors = {
    pending: '#f59e0b', confirmed: '#3b82f6', processing: '#3b82f6',
    shipped: '#6366f1', delivered: '#10b981', completed: '#10b981', cancelled: '#ef4444',
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>តារាងព័ត៌មាន</h2>
        <div className={styles.quickActions}>
          <button className={styles.actionBtn} onClick={() => navigate('/seller/orders')}>
            <Eye size={16} /> មើលបញ្ជា
          </button>
          <button className={styles.actionBtn} onClick={() => navigate('/seller/products/new')}>
            <PlusCircle size={16} /> បន្ថែមផលិតផល
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatsCard key={i} label="..." value="..." icon={Package} />)
          : stats.map((s, i) => <StatsCard key={i} {...s} />)}
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>បញ្ជាថ្មីៗ</h3>
          <div className={styles.orderList}>
            {recentOrders.length === 0 && !loading && (
              <p className={styles.emptyText}>មិនមានបញ្ជាទេ</p>
            )}
            {recentOrders.map(order => (
              <div key={order.id} className={styles.orderItem}>
                <span className={styles.orderId}>{order.order_number || order.id?.slice(0, 8)}</span>
                <span className={styles.orderBuyer}>{order.buyer_name || 'អតិថិជន'}</span>
                <span className={styles.orderAmount}>${Number(order.total || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h3>ផលិតផលពេញនិយម</h3>
          <div className={styles.productList}>
            {topProducts.length === 0 && !loading && (
              <p className={styles.emptyText}>មិនមានផលិតផល</p>
            )}
            {topProducts.map(p => (
              <div key={p.id} className={styles.productItem}>
                <img src={p.images?.[0]?.url || '/placeholder.png'} alt={p.title} className={styles.productImg} />
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{p.title_kh || p.title}</span>
                  <span className={styles.productSold}>{p.sold_count || 0} បានលក់</span>
                </div>
                <span className={styles.productPrice}>{formatPrice(p.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {lowStockProducts.length > 0 && (
          <div className={styles.card}>
            <h3><AlertTriangle size={16} /> ស្តុកទាប</h3>
            <div className={styles.productList}>
              {lowStockProducts.map(p => (
                <div key={p.id} className={styles.productItem}>
                  <img src={p.images?.[0]?.url || '/placeholder.png'} alt={p.title} className={styles.productImg} />
                  <div className={styles.productInfo}>
                    <span className={styles.productName}>{p.title_kh || p.title}</span>
                    <span className={styles.lowStock}>នៅសល់ {p.stock_quantity || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.card}>
          <h3>ស្ថានភាពបញ្ជាទិញ</h3>
          <div className={styles.statusList}>
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <div key={status} className={styles.statusItem}>
                <div className={styles.statusInfo}>
                  <span className={styles.statusLabel}>{statusLabels[status] || status}</span>
                  <div className={styles.statusBar}>
                    <div
                      className={styles.statusBarFill}
                      style={{
                        width: `${(count / totalOrders) * 100}%`,
                        background: statusColors[status] || 'var(--primary)',
                      }}
                    />
                  </div>
                </div>
                <span className={styles.statusCount}>{count}</span>
              </div>
            ))}
            {Object.keys(ordersByStatus).length === 0 && !loading && (
              <p className={styles.emptyText}>មិនមានទិន្នន័យ</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
