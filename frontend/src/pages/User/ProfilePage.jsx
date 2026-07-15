import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usersAPI } from '../../api';
import { getInitials } from '../../utils/helpers';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import ConfirmAction from '../../components/common/ConfirmAction/ConfirmAction';
import toast from 'react-hot-toast';
import styles from './ProfilePage.module.css';

const tabs = ['ប្រវត្តិរូប', 'អាសយដ្ឋាន', 'បញ្ជាទិញ', 'ការកំណត់'];

const provinces = [
  'បន្ទាយមានជ័យ','បាត់ដំបង','កំពង់ចាម','កំពង់ឆ្នាំង','កំពង់ស្ពឺ',
  'កំពង់ធំ','ក្រចេះ','មណ្ឌលគិរី','ភ្នំពេញ','ព្រៃវែង',
  'ព្រះសីហនុ','ស្ទឹងត្រែង','សៀមរាប','ឧត្តរមានជ័យ','តាកែវ',
  'កណ្ដាល','ពោធិ៍សាត់','រតនគិរី','កោះកុង','ព្រះត្រេះ',
];

const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'KHR', label: 'KHR (៛)' },
];

const langOptions = [
  { value: 'en', label: 'English' },
  { value: 'km', label: 'ខ្មែរ' },
];

const emptyAddress = {
  recipient_name: '', phone: '', province: '', district: '',
  commune: '', village: '', street_address: '', label: '', is_default: false,
};

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const [form, setForm] = useState({
    name: user?.name || user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrForm, setAddrForm] = useState({ ...emptyAddress });
  const [editingAddr, setEditingAddr] = useState(null);
  const [addrSaving, setAddrSaving] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);

  const [settings, setSettings] = useState({
    language_pref: user?.language_pref || user?.language || 'en',
    default_currency: user?.default_currency || user?.currency || 'USD',
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" />;

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersAPI.updateProfile({ display_name: form.name, full_name: form.name, email: form.email });
      updateUser({ name: form.name, email: form.email });
      toast.success('បានរក្សាទុកប្រវត្តិរូប');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'មិនអាចរក្សាទុកបាន');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('សូមជ្រើសរើសរូបភាព');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('រូបភាពត្រូវតែតូចជាង 5MB');
      return;
    }
    setAvatarUploading(true);
    try {
      const res = await usersAPI.uploadAvatar(file);
      const avatarUrl = res.data.data?.avatar_url || res.data.avatar_url;
      if (avatarUrl) updateUser({ avatar_url: avatarUrl });
      toast.success('បានផ្លាស់ប្តូររូបភាព');
    } catch (err) {
      toast.error(err.response?.data?.message || 'មិនអាចបញ្ចូលរូបភាពបាន');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  // --- Address ---
  const loadAddresses = useCallback(async () => {
    setAddrLoading(true);
    try {
      const res = await usersAPI.getAddresses();
      setAddresses(res.data.data || res.data || []);
    } catch {
      toast.error('មិនអាចផ្ទុកអាសយដ្ឋានបាន');
    } finally {
      setAddrLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 1) loadAddresses();
  }, [activeTab, loadAddresses]);

  const updateAddr = (f, v) => setAddrForm(p => ({ ...p, [f]: v }));

  const handleAddrSubmit = async () => {
    if (!addrForm.recipient_name || !addrForm.phone || !addrForm.province || !addrForm.district) {
      toast.error('សូមបំពេញព័ត៌មានដែលត្រូវការ');
      return;
    }
    setAddrSaving(true);
    try {
      if (editingAddr) {
        await usersAPI.updateAddress(editingAddr.id, addrForm);
        toast.success('បានកែប្រែអាសយដ្ឋាន');
      } else {
        await usersAPI.createAddress(addrForm);
        toast.success('បានបន្ថែមអាសយដ្ឋាន');
      }
      setShowAddrForm(false);
      setEditingAddr(null);
      setAddrForm({ ...emptyAddress });
      loadAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'មិនអាចរក្សាទុកបាន');
    } finally {
      setAddrSaving(false);
    }
  };

  const handleEditAddr = (addr) => {
    setEditingAddr(addr);
    setAddrForm({
      recipient_name: addr.recipient_name || '',
      phone: addr.phone || '',
      province: addr.province || '',
      district: addr.district || '',
      commune: addr.commune || '',
      village: addr.village || '',
      street_address: addr.street_address || '',
      label: addr.label || '',
      is_default: addr.is_default || false,
    });
    setShowAddrForm(true);
  };

  const handleDeleteAddr = async (id) => {
    try {
      await usersAPI.deleteAddress(id);
      toast.success('បានលុបអាសយដ្ឋាន');
      loadAddresses();
    } catch {
      toast.error('មិនអាចលុបបាន');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await usersAPI.setDefaultAddress(id);
      toast.success('បានកំណត់ជាអាសយដ្ឋានលំនាំដើម');
      loadAddresses();
    } catch {
      toast.error('មិនអាចកំណត់បាន');
    }
  };

  const openNewAddrForm = () => {
    setEditingAddr(null);
    setAddrForm({ ...emptyAddress });
    setShowAddrForm(true);
  };

  const cancelAddrForm = () => {
    setShowAddrForm(false);
    setEditingAddr(null);
    setAddrForm({ ...emptyAddress });
  };

  // --- Settings ---
  const handleSettingsSave = async () => {
    setSettingsSaving(true);
    try {
      await usersAPI.updateProfile({
        language_pref: settings.language_pref,
        default_currency: settings.default_currency,
      });
      updateUser({ language_pref: settings.language_pref, default_currency: settings.default_currency });
      toast.success('បានរក្សាទុកការកំណត់');
    } catch (err) {
      toast.error(err.response?.data?.message || 'មិនអាចរក្សាទុកបាន');
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="avatar" className={styles.sidebarAvatar} />
        ) : (
          <div className={styles.avatar}>{getInitials(user?.name || user?.full_name || 'U')}</div>
        )}
        <h3 className={styles.name}>{user?.name || user?.full_name || 'User'}</h3>
        <p className={styles.email}>{user?.email || user?.phone}</p>
        <nav className={styles.nav}>
          {tabs.map((tab, i) => (
            <button key={i} className={`${styles.navItem} ${activeTab === i ? styles.activeNav : ''}`} onClick={() => setActiveTab(i)}>{tab}</button>
          ))}
        </nav>
      </div>
      <div className={styles.content}>
        {/* Tab 0: Profile */}
        {activeTab === 0 && (
          <div className={styles.form}>
            <h2>ប្រវត្តិរូប</h2>
            <div className={styles.avatarUpload}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className={styles.avatarImg} />
              ) : (
                <div className={styles.largeAvatar}>{getInitials(user?.name || user?.full_name || 'U')}</div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              <Button variant="outline" size="sm" onClick={handleAvatarClick} loading={avatarUploading}>ផ្លាស់ប្តូររូបភាព</Button>
            </div>
            <div className={styles.formGrid}>
              <Input label="ឈ្មោះ" name="name" value={form.name} onChange={e => update('name', e.target.value)} />
              <Input label="អ៊ីមែល" name="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
              <Input label="ទូរស័ព្ទ" name="phone" value={form.phone} onChange={e => update('phone', e.target.value)} prefix="+855" />
            </div>
            <Button onClick={handleSave} loading={saving}>រក្សាទុក</Button>
          </div>
        )}

        {/* Tab 1: Addresses */}
        {activeTab === 1 && (
          <div className={styles.form}>
            <div className={styles.sectionHeader}>
              <h2>អាសយដ្ឋាន</h2>
              {!showAddrForm && (
                <Button size="sm" onClick={openNewAddrForm}>+ បន្ថែមអាសយដ្ឋាន</Button>
              )}
            </div>

            {showAddrForm && (
              <div className={styles.addrFormCard}>
                <h3>{editingAddr ? 'កែប្រែអាសយដ្ឋាន' : 'អាសយដ្ឋានថ្មី'}</h3>
                <div className={styles.formGrid}>
                  <Input label="ឈ្មោះអ្នកទទួល *" value={addrForm.recipient_name} onChange={e => updateAddr('recipient_name', e.target.value)} />
                  <Input label="ទូរស័ព្ទ *" value={addrForm.phone} onChange={e => updateAddr('phone', e.target.value)} prefix="+855" />
                  <div className={styles.selectWrap}>
                    <label className={styles.selectLabel}>ខេត្ត *</label>
                    <select className={styles.select} value={addrForm.province} onChange={e => updateAddr('province', e.target.value)}>
                      <option value="">ជ្រើសរើសខេត្ត</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <Input label="ស្រុក *" value={addrForm.district} onChange={e => updateAddr('district', e.target.value)} />
                  <Input label="ឃុំ" value={addrForm.commune} onChange={e => updateAddr('commune', e.target.value)} />
                  <Input label="ភូមិ" value={addrForm.village} onChange={e => updateAddr('village', e.target.value)} />
                  <Input label="ផ្លូវ" value={addrForm.street_address} onChange={e => updateAddr('street_address', e.target.value)} />
                  <Input label="សម្គាល់ (ឧ. ផ្ទះ, ការិយាល័យ)" value={addrForm.label} onChange={e => updateAddr('label', e.target.value)} />
                </div>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={addrForm.is_default} onChange={e => updateAddr('is_default', e.target.checked)} />
                  <span>កំណត់ជាអាសយដ្ឋានលំនាំដើម</span>
                </label>
                <div className={styles.formActions}>
                  <Button onClick={handleAddrSubmit} loading={addrSaving}>{editingAddr ? 'កែប្រែ' : 'រក្សាទុក'}</Button>
                  <Button variant="outline" onClick={cancelAddrForm}>បោះបង់</Button>
                </div>
              </div>
            )}

            {addrLoading ? <p>កំពុងផ្ទុក...</p> : addresses.length === 0 && !showAddrForm ? (
              <div className={styles.emptyState}>
                <p>មិនមានអាសយដ្ឋាននៅឡើយ</p>
                <Button size="sm" onClick={openNewAddrForm}>បន្ថែមអាសយដ្ឋានដំបូង</Button>
              </div>
            ) : (
              <div className={styles.addrList}>
                {addresses.map(addr => (
                  <div key={addr.id} className={`${styles.addrCard} ${addr.is_default ? styles.addrDefault : ''}`}>
                    <div className={styles.addrHeader}>
                      <div>
                        <strong>{addr.recipient_name}</strong>
                        {addr.is_default && <span className={styles.defaultBadge}>លំនាំដើម</span>}
                        {addr.label && <span className={styles.labelBadge}>{addr.label}</span>}
                      </div>
                      <span className={styles.addrPhone}>+855 {addr.phone}</span>
                    </div>
                    <p className={styles.addrText}>
                      {addr.street_address && `${addr.street_address}, `}
                      {addr.village && `${addr.village}, `}
                      {addr.commune && `${addr.commune}, `}
                      {addr.district}, {addr.province}
                    </p>
                    <div className={styles.addrActions}>
                      {!addr.is_default && (
                        <button className={styles.addrLink} onClick={() => handleSetDefault(addr.id)}>កំណត់ជាលំនាំដើម</button>
                      )}
                      <button className={styles.addrLink} onClick={() => handleEditAddr(addr)}>កែប្រែ</button>
                      <ConfirmAction message="តើអ្នកប្រាកដជាចង់លុបអាសយដ្ឋាននេះមែនទេ?" onConfirm={() => handleDeleteAddr(addr.id)}>
                        <button className={styles.addrLinkDanger}>លុប</button>
                      </ConfirmAction>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 2 && (
          <div className={styles.form}>
            <h2>បញ្ជាទិញ</h2>
            <p>មើលបញ្ជាទិញនៅ <Link to="/orders">ទំព័របញ្ជា</Link></p>
          </div>
        )}

        {/* Tab 3: Settings */}
        {activeTab === 3 && (
          <div className={styles.form}>
            <h2>ការកំណត់</h2>
            <div className={styles.formGrid}>
              <div className={styles.selectWrap}>
                <label className={styles.selectLabel}>ភាសា</label>
                <select className={styles.select} value={settings.language_pref} onChange={e => setSettings(p => ({ ...p, language_pref: e.target.value }))}>
                  {langOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className={styles.selectWrap}>
                <label className={styles.selectLabel}>រូបិយប័ណ្ណ</label>
                <select className={styles.select} value={settings.default_currency} onChange={e => setSettings(p => ({ ...p, default_currency: e.target.value }))}>
                  {currencyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={handleSettingsSave} loading={settingsSaving}>រក្សាទុក</Button>
          </div>
        )}
      </div>
    </div>
  );
}
