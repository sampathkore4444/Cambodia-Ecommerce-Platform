import React, { useState } from 'react';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({ siteName: 'KhmerMarket', siteNameKm: 'ខ្មែរម៉ាកែត', currency: 'USD', exchangeRate: '4100', shippingFee: '5', freeShippingThreshold: '50' });
  const update = (f, v) => setSettings(p => ({ ...p, [f]: v }));

  return (
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
        <Button>រក្សាទុក</Button>
      </div>
    </div>
  );
}
