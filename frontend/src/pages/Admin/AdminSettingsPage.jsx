import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout/AdminLayout';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({ siteName: 'KhmerMarket', siteNameKm: 'ខ្មែរម៉ាកែត', currency: 'USD', exchangeRate: '4100', shippingFee: '5', freeShippingThreshold: '50' });
  const [saving, setSaving] = useState(false);
  const update = (f, v) => setSettings(p => ({ ...p, [f]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Replace with actual API call when settings endpoint is implemented
      await new Promise(r => setTimeout(r, 500));
      toast.success('បានរក្សាទុកការកំណត់');
    } catch (err) {
      toast.error(err.message || 'មិនអាចរក្សាទុកបាន');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', maxWidth: 600 }}>
      <h1>ការកំណត់</h1>
      <div style={{ background: 'var(--background)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <h3>ទូទៅ</h3>
        <Input label="ឈ្មោះវេបសាយ" value={settings.siteName} onChange={e => update('siteName', e.target.value)} />
        <Input label="ឈ្មោះ (ខ្មែរ)" value={settings.siteNameKm} onChange={e => update('siteNameKm', e.target.value)} />
        <h3>សម្បទាន</h3>
        <Input label="អត្រាប្តូរប្រាក់ (USD to KHR)" value={settings.exchangeRate} onChange={e => update('exchangeRate', e.target.value)} />
        <Input label="ថ្លៃដឹកជញ្ជូន ($)" value={settings.shippingFee} onChange={e => update('shippingFee', e.target.value)} />
        <Input label="ដឹកជញ្ជូនឥតគិតថ្លៃ (min $)" value={settings.freeShippingThreshold} onChange={e => update('freeShippingThreshold', e.target.value)} />
        <Button onClick={handleSave} loading={saving}>រក្សាទុក</Button>
      </div>
    </div>
    </AdminLayout>
  );
}
