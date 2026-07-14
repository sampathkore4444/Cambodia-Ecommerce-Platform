import React, { useState, useEffect } from 'react';
import { sellerAPI } from '../../../api';
import { getStatusColor, getStatusLabel } from '../../../utils/helpers';
import Badge from '../../common/Badge/Badge';
import styles from './OrderManagement.module.css';

const statusTabs = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    setLoading(true);
    const params = activeTab !== 'all' ? { status: activeTab } : {};
    sellerAPI.getOrders(params)
      .then(res => {
        const items = res.data.data || res.data.items || [];
        setOrders(Array.isArray(items) ? items : []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const filtered = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>ការគ្រប់គ្រងបញ្ជា</h2>
      <div className={styles.tabs}>
        {statusTabs.map(s => (
          <button key={s} className={`${styles.tab} ${activeTab === s ? styles.activeTab : ''}`} onClick={() => setActiveTab(s)}>
            {s === 'all' ? 'ទាំងអស់' : getStatusLabel(s)}
          </button>
        ))}
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>លេខបញ្ជា</th><th>អ្នកទិញ</th><th>ផលិតផល</th><th>សរុប</th><th>ស្ថានភាព</th><th>កាលបរិច្ឆេទ</th><th>សកម្មភាព</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.emptyText}>កំពុងផ្ទុក...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className={styles.emptyText}>មិនមានបញ្ជា</td></tr>
            ) : filtered.map(order => (
              <tr key={order.id}>
                <td className={styles.orderId}>{order.order_number || order.id?.slice(0, 8)}</td>
                <td>{order.buyer_name || 'អតិថិជន'}</td>
                <td>{order.items?.length || order.item_count || 0} មុខ</td>
                <td>${Number(order.total || 0).toFixed(2)}</td>
                <td><Badge variant={getStatusColor(order.status)} dot>{getStatusLabel(order.status)}</Badge></td>
                <td>{order.created_at ? new Date(order.created_at).toLocaleDateString('km-KH') : ''}</td>
                <td><button className={styles.actionBtn}>មើល</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
