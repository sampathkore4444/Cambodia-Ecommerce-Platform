import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api';
import AdminLayout from '../../components/admin/AdminLayout/AdminLayout';
import Badge from '../../components/common/Badge/Badge';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'warning', confirmed: 'info', processing: 'info',
  shipped: 'primary', delivered: 'success', completed: 'success', cancelled: 'error',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await adminAPI.getOrders(params);
      setOrders(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch {
      toast.error('មិនអាចផ្ទុកទិន្នន័យបានទេ');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const statuses = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const statusLabels = { '': 'ទាំងអស់', pending: 'រង់ចាំ', confirmed: 'បញ្ជាក់', processing: 'កំពុងដំណើរការ', shipped: 'បានផ្ញើ', delivered: 'បានដឹកជញ្ជូន', cancelled: 'បោះបង់' };

  return (
    <AdminLayout>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>បញ្ជាទិញ</h1>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          {statuses.map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                background: statusFilter === s ? 'var(--primary)' : 'var(--gray-100)',
                color: statusFilter === s ? 'white' : 'var(--text-primary)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p>កំពុងផ្ទុក...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem' }}>លេខបញ្ជា</th>
              <th style={{ padding: '0.75rem' }}>អ្នកទិញ</th>
              <th style={{ padding: '0.75rem' }}>សរុប</th>
              <th style={{ padding: '0.75rem' }}>វិធីបង់ប្រាក់</th>
              <th style={{ padding: '0.75rem' }}>ស្ថានភាព</th>
              <th style={{ padding: '0.75rem' }}>កាលបរិច្ឆេទ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>{o.order_number || o.id?.slice(0, 8)}</td>
                <td style={{ padding: '0.75rem' }}>{o.buyer?.full_name || o.buyer?.email || o.buyer_id?.slice(0, 8) || '-'}</td>
                <td style={{ padding: '0.75rem' }}>${o.total || 0}</td>
                <td style={{ padding: '0.75rem' }}>{o.payment_method || '-'}</td>
                <td style={{ padding: '0.75rem' }}><Badge variant={statusColors[o.status] || 'neutral'} dot>{o.status}</Badge></td>
                <td style={{ padding: '0.75rem' }}>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center' }}>មិនមានបញ្ជា</td></tr>}
          </tbody>
        </table>
      )}

      {total > 20 && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '0.5rem 1rem' }}>មុន</button>
          <span style={{ padding: '0.5rem' }}>ទំព័រ {page}</span>
          <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} style={{ padding: '0.5rem 1rem' }}>បន្ទាប់</button>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}
