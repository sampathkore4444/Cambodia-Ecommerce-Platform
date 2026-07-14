import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Shield, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI, sellerAPI } from '../../api';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import styles from './SellPage.module.css';

const benefits = [
  { icon: <Store size={28} />, titleKm: 'លក់ទំនិញរបស់អ្នក', descKm: 'ដាក់លក់ផលិតផលរបស់អ្នកទៅកាន់អតិថិជនរាប់ពាន់នាក់នៅទូទាំងប្រទេសកម្ពុជា។' },
  { icon: <TrendingUp size={28} />, titleKm: 'ពង្រីកអាជីវកម្ម', descKm: 'ប្រើប្រាស់ឧបករណ៍វិភាគដើម្បីតាមដានការលក់ និងពង្រីកអាជីវកម្មរបស់អ្នក។' },
  { icon: <Shield size={28} />, titleKm: 'ប្រព័ន្ធបង់ប្រាក់សុវត្ថិភាព', descKm: 'ទទួលបានប្រាក់តាម Wing, ABA, Pi Pay និងវិធីបង់ប្រាក់ផ្សេងទៀត។' },
  { icon: <Users size={28} />, titleKm: 'ទីផ្សារធំ', descKm: 'ភ្ជាប់ជាមួយអ្នកទិញរាប់សែននាក់នៅក្នុងប្រទេសកម្ពុជា។' },
];

export default function SellPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUser, login } = useAuth();
  const isSeller = isAuthenticated && (user?.role === 'seller' || user?.role === 'admin');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopNameKm, setShopNameKm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (isSeller) {
    navigate('/seller/products/new');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!isAuthenticated) {
        try {
          await authAPI.register({ full_name: fullName, phone, email: email || undefined, password });
        } catch (regErr) {
          const msg = regErr.message || '';
          if (msg.includes('already exists') || msg.includes('conflict') || msg.includes('CONFLICT')) {
            await login({ identifier: phone, password });
          } else {
            throw regErr;
          }
        }
      }
      await sellerAPI.register({ shop_name: shopName, shop_name_kh: shopNameKm || undefined });
      updateUser({ role: 'seller' });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'មានបញ្ហា។ សូមព្យាយាមម្តងទៀត។');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.successBox}>
          <Store size={48} />
          <h2>ចុះឈ្មោះជោគជ័យ!</h2>
          <p>អ្នកក្លាយជាអ្នកលក់ហើយ។ សូមចាប់ផ្តើមដាក់ផលិតផលលក់ឥឡូវនេះ។</p>
          <Button size="lg" onClick={() => navigate('/seller/products/new')}>ចាប់ផ្តើមដាក់ផលិតផល</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>ចាប់ផ្តើមលក់នៅលើ KhmerMarket</h1>
          <p className={styles.heroSubtitle}>បើកហាងអនឡាញរបស់អ្នក</p>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}><Store size={24} /> បើកហាងថ្មី</h2>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>ឈ្មោះហាង (English) *</label>
              <input
                type="text" value={shopName} onChange={e => setShopName(e.target.value)}
                required placeholder="ឧ. ហាងខ្ញុំ"
                className={styles.fieldInput}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>ឈ្មោះហាង (ខ្មែរ)</label>
              <input
                type="text" value={shopNameKm} onChange={e => setShopNameKm(e.target.value)}
                placeholder="ឧ. ហាងខ្ញុំ"
                className={styles.fieldInput}
              />
            </div>

            {!isAuthenticated && (
              <>
                <div className={styles.divider}><span>ព័ត៌មានគណនី</span></div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>ឈ្មោះពេញ *</label>
                  <input
                    type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    required className={styles.fieldInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>លេខទូរស័ព្ទ *</label>
                  <input
                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    required placeholder="+855XXXXXXXXX"
                    className={styles.fieldInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>អ៊ីមែល</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className={styles.fieldInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>ពាក្យសម្ងាត់ *</label>
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    required className={styles.fieldInput}
                  />
                </div>
              </>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'កំពុងដំណើរការ...' : 'ចុះឈ្មោះជាអ្នកលក់'}
            </button>

            {!isAuthenticated && (
              <p className={styles.loginText}>មានគណនីរួចហើយ? <button type="button" onClick={() => navigate('/login')} className={styles.textLink}>ចូល</button></p>
            )}
          </form>
        </div>
      </section>

      <section className={styles.benefits}>
        <h2>អត្ថប្រយោជន៍</h2>
        <div className={styles.cardGrid}>
          {benefits.map((b, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardIcon}>{b.icon}</div>
              <h3>{b.titleKm}</h3>
              <p>{b.descKm}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
