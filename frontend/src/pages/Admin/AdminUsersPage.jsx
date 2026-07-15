import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api';
import AdminLayout from '../../components/admin/AdminLayout/AdminLayout';
import Badge from '../../components/common/Badge/Badge';
import ConfirmAction from '../../components/common/ConfirmAction/ConfirmAction';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ page, per_page: 20 });
      setUsers(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch {
      toast.error('មិនអាចផ្ទុកទិន្នន័យបានទេ');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadSellers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSellers({ page, per_page: 20 });
      setSellers(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch {
      toast.error('មិនអាចផ្ទុកទិន្នន័យអ្នកលក់បានទេ');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    else loadSellers();
  }, [tab, page, loadUsers, loadSellers]);

  const handleBan = async (userId) => {
    try {
      await adminAPI.banUser(userId, 'Banned by admin');
      toast.success('បានហាមឃាត់អ្នកប្រើប្រាស់');
      loadUsers();
    } catch {
      toast.error('បរាជ័យ');
    }
  };

  const handleUnban = async (userId) => {
    try {
      await adminAPI.unbanUser(userId);
      toast.success('បានដោះលែងអ្នកប្រើប្រាស់');
      loadUsers();
    } catch {
      toast.error('បរាជ័យ');
    }
  };

  const handleVerifySeller = async (sellerId) => {
    try {
      await adminAPI.verifySeller(sellerId);
      toast.success('បានផ្ទៀងផ្ទាត់អ្នកលក់');
      loadSellers();
    } catch {
      toast.error('បរាជ័យ');
    }
  };

  return (
    <AdminLayout>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <h1>គ្រប់គ្រងអ្នកប្រើប្រាស់</h1>

      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
        <button
          onClick={() => setTab('users')}
          style={{
            padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
            background: tab === 'users' ? 'var(--primary)' : 'var(--gray-100)',
            color: tab === 'users' ? 'white' : 'var(--text-primary)', fontWeight: 600,
          }}
        >
          អ្នកប្រើប្រាស់
        </button>
        <button
          onClick={() => setTab('sellers')}
          style={{
            padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
            background: tab === 'sellers' ? 'var(--primary)' : 'var(--gray-100)',
            color: tab === 'sellers' ? 'white' : 'var(--text-primary)', fontWeight: 600,
          }}
        >
          អ្នកលក់
        </button>
      </div>

      {loading ? (
        <p>កំពុងផ្ទុក...</p>
      ) : tab === 'users' ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem' }}>ឈ្មោះ</th>
              <th style={{ padding: '0.75rem' }}>អ៊ីមែល</th>
              <th style={{ padding: '0.75rem' }}>ទូរស័ព្ទ</th>
              <th style={{ padding: '0.75rem' }}>តួនាទី</th>
              <th style={{ padding: '0.75rem' }}>ស្ថានភាព</th>
              <th style={{ padding: '0.75rem' }}>សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '0.75rem' }}>{u.full_name || u.display_name || '-'}</td>
                <td style={{ padding: '0.75rem' }}>{u.email || '-'}</td>
                <td style={{ padding: '0.75rem' }}>{u.phone || '-'}</td>
                <td style={{ padding: '0.75rem' }}><Badge variant={u.role === 'seller' ? 'primary' : 'neutral'}>{u.role}</Badge></td>
                <td style={{ padding: '0.75rem' }}>
                  <Badge variant={u.is_active ? 'success' : 'error'} dot>{u.is_active ? 'active' : 'banned'}</Badge>
                </td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  {u.is_active ? (
                    <ConfirmAction message="តើអ្នកប្រាកដជាចង់ហាមឃាត់អ្នកប្រើប្រាស់នេះមែនទេ?" onConfirm={() => handleBan(u.id)}>
                      <button style={{ fontSize: '12px', padding: '4px 8px', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>ហាមឃាត់</button>
                    </ConfirmAction>
                  ) : (
                    <button onClick={() => handleUnban(u.id)} style={{ fontSize: '12px', padding: '4px 8px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>ដោះលែង</button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center' }}>មិនមានទិន្នន័យ</td></tr>}
          </tbody>
        </table>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem' }}>ឈ្មោះហាង</th>
              <th style={{ padding: '0.75rem' }}>អ្នកកាន់</th>
              <th style={{ padding: '0.75rem' }}>អ៊ីមែល</th>
              <th style={{ padding: '0.75rem' }}>ផ្ទៀងផ្ទាត់</th>
              <th style={{ padding: '0.75rem' }}>សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '0.75rem' }}>{s.shop_name || '-'}</td>
                <td style={{ padding: '0.75rem' }}>{s.user?.full_name || '-'}</td>
                <td style={{ padding: '0.75rem' }}>{s.user?.email || '-'}</td>
                <td style={{ padding: '0.75rem' }}>
                  <Badge variant={s.is_verified ? 'success' : 'warning'} dot>{s.is_verified ? 'verified' : 'pending'}</Badge>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {!s.is_verified && (
                    <button onClick={() => handleVerifySeller(s.id)} style={{ fontSize: '12px', padding: '4px 8px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>ផ្ទៀងផ្ទាត់</button>
                  )}
                </td>
              </tr>
            ))}
            {sellers.length === 0 && <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>មិនមានអ្នកលក់</td></tr>}
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
