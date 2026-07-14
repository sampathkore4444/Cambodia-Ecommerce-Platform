import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import styles from './ProfilePage.module.css';

const tabs = ['ប្រវត្តិរូប', 'អាសយដ្ឋាន', 'បញ្ជាទិញ', 'ការកំណត់'];

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });

  if (!isAuthenticated) return <Navigate to="/login" />;

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <div className={styles.avatar}>{getInitials(user?.name || 'U')}</div>
        <h3 className={styles.name}>{user?.name || 'User'}</h3>
        <p className={styles.email}>{user?.email || user?.phone}</p>
        <nav className={styles.nav}>
          {tabs.map((tab, i) => (
            <button key={i} className={`${styles.navItem} ${activeTab === i ? styles.activeNav : ''}`} onClick={() => setActiveTab(i)}>{tab}</button>
          ))}
        </nav>
      </div>
      <div className={styles.content}>
        {activeTab === 0 && (
          <div className={styles.form}>
            <h2>ប្រវត្តិរូប</h2>
            <div className={styles.avatarUpload}>
              <div className={styles.largeAvatar}>{getInitials(user?.name || 'U')}</div>
              <Button variant="outline" size="sm">ផ្លាស់ប្តូររូបភាព</Button>
            </div>
            <div className={styles.formGrid}>
              <Input label="ឈ្មោះ" name="name" value={form.name} onChange={e => update('name', e.target.value)} />
              <Input label="អ៊ីមែល" name="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
              <Input label="ទូរស័ព្ទ" name="phone" value={form.phone} onChange={e => update('phone', e.target.value)} prefix="+855" />
            </div>
            <Button>រក្សាទុក</Button>
          </div>
        )}
        {activeTab === 1 && <div className={styles.form}><h2>អាសយដ្ឋាន</h2><p>មិនមានអាសយដ្ឋាន</p></div>}
        {activeTab === 2 && <div className={styles.form}><h2>បញ្ជាទិញ</h2><p>មើលបញ្ជាទិញនៅ <a href="/orders">ទំព័របញ្ជា</a></p></div>}
        {activeTab === 3 && <div className={styles.form}><h2>ការកំណត់</h2><p>ការកំណត់នឹងមកដល់ឆាប់ៗនេះ</p></div>}
      </div>
    </div>
  );
}
