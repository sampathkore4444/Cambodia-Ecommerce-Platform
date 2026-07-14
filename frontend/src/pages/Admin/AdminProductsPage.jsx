import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api';
import Badge from '../../components/common/Badge/Badge';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 20 };
      if (filter) params.status = filter;
      const res = await adminAPI.getProducts(params);
      setProducts(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch {
      toast.error('មិនអាចផ្ទុកទិន្នន័យបានទេ');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveProduct(id);
      toast.success('បានអនុម័តផលិតផល');
      load();
    } catch { toast.error('បរាជ័យ'); }
  };

  const handleFlag = async (id) => {
    const reason = reason => reason;
    if (!window.confirm('តើអ្នកប្រាកដជាចង់រារាំងផលិតផលនេះមែនទេ?')) return;
    try {
      await adminAPI.flagProduct(id, 'Flagged by admin');
      toast.success('បានរារាំងផលិតផល');
      load();
    } catch { toast.error('បរាជ័យ'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>ផលិតផល</h1>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          {['', 'active', 'inactive'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                background: filter === f ? 'var(--primary)' : 'var(--gray-100)',
                color: filter === f ? 'white' : 'var(--text-primary)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
              {f === '' ? 'ទាំងអស់' : f === 'active' ? 'សកម្ម' : 'អសកម្ម'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p>កំពុងផ្ទុក...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem' }}>ឈ្មោះ</th>
              <th style={{ padding: '0.75rem' }}>តម្លៃ</th>
              <th style={{ padding: '0.75rem' }}>ស្តុក</th>
              <th style={{ padding: '0.75rem' }}>ស្ថានភាព</th>
              <th style={{ padding: '0.75rem' }}>សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '0.75rem' }}>{p.title || p.title_kh || '-'}</td>
                <td style={{ padding: '0.75rem' }}>${p.price || 0}</td>
                <td style={{ padding: '0.75rem' }}>{p.stock_quantity ?? 0}</td>
                <td style={{ padding: '0.75rem' }}>
                  <Badge variant={p.is_active ? 'success' : 'error'} dot>{p.is_active ? 'active' : 'inactive'}</Badge>
                </td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  {!p.is_active && (
                    <button onClick={() => handleApprove(p.id)} style={{ fontSize: '12px', padding: '4px 8px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>អនុម័ត</button>
                  )}
                  {p.is_active && (
                    <button onClick={() => handleFlag(p.id)} style={{ fontSize: '12px', padding: '4px 8px', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>រារាំង</button>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>មិនមានផលិតផល</td></tr>}
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
  );
}
