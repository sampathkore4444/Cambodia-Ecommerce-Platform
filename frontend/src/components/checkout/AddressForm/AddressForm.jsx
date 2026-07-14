import React, { useState } from 'react';
import { KHMER_PROVINCES } from '../../../utils/constants';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import styles from './AddressForm.module.css';

export default function AddressForm({ onComplete, initialData }) {
  const [form, setForm] = useState(initialData || {
    recipientName: '', phone: '', province: '', district: '', commune: '', village: '', street: '', postalCode: '', label: 'home'
  });
  const [errors, setErrors] = useState({});

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    const errs = {};
    if (!form.recipientName) errs.recipientName = 'ត្រូវបំពេញឈ្មោះ';
    if (!form.phone) errs.phone = 'ត្រូវបំពេញទូរស័ព្ទ';
    if (!form.province) errs.province = 'ត្រូវជ្រើសរើសខេត្ត';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onComplete({
        recipient_name: form.recipientName,
        phone: form.phone,
        province: form.province,
        district: form.district,
        commune: form.commune,
        village: form.village,
        street_address: form.street,
        postal_code: form.postalCode,
        label: form.label,
        is_default: false,
      });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>អាសយដ្ឋានដឹកជញ្ជូន</h3>
      <div className={styles.labels}>
        {['home', 'office', 'other'].map(l => (
          <button key={l} type="button" className={`${styles.labelBtn} ${form.label === l ? styles.activeLabel : ''}`} onClick={() => update('label', l)}>
            {l === 'home' ? 'ផ្ទះ' : l === 'office' ? 'ការិយាល័យ' : 'ផ្សេងៗ'}
          </button>
        ))}
      </div>
      <div className={styles.row}>
        <Input label="ឈ្មោះអ្នកទទួល" name="recipientName" value={form.recipientName} onChange={e => update('recipientName', e.target.value)} error={errors.recipientName} required />
        <Input label="ទូរស័ព្ទ" name="phone" value={form.phone} onChange={e => update('phone', e.target.value)} error={errors.phone} prefix="+855" required />
      </div>
      <div className={styles.row}>
        <div className={styles.selectGroup}>
          <label className={styles.selectLabel}>ខេត្ត</label>
          <select className={styles.select} value={form.province} onChange={e => update('province', e.target.value)}>
            <option value="">ជ្រើសរើសខេត្ត</option>
            {KHMER_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {errors.province && <p className={styles.error}>{errors.province}</p>}
        </div>
        <Input label="ស្រុក" name="district" value={form.district} onChange={e => update('district', e.target.value)} />
      </div>
      <div className={styles.row}>
        <Input label="ឃុំ" name="commune" value={form.commune} onChange={e => update('commune', e.target.value)} />
        <Input label="ភូមិ" name="village" value={form.village} onChange={e => update('village', e.target.value)} />
      </div>
      <Input label="ផ្លូវ" name="street" value={form.street} onChange={e => update('street', e.target.value)} />
      <Button type="submit" fullWidth size="lg">បន្តទៅវិធីបង់ប្រាក់</Button>
    </form>
  );
}
