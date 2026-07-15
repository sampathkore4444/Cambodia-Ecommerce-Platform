import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { GOOGLE_CLIENT_ID, FACEBOOK_APP_ID } from '../../../utils/constants';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import styles from './LoginForm.module.css';

function loadScript(src, id) {
  return new Promise((resolve) => {
    if (document.getElementById(id)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.id = id;
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

export default function LoginForm() {
  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('phone');
  const [form, setForm] = useState({ email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleBtnRef = useRef(null);
  const fbInitialized = useRef(false);

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSocial = async (provider, token) => {
    setLoading(true);
    setError('');
    try {
      await socialLogin(provider, token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Social login failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadScript('https://accounts.google.com/gsi/client', 'google-gsi').then(() => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => handleSocial('google', response.credential),
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline', size: 'large', width: '100%', text: 'continue_with',
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!FACEBOOK_APP_ID || fbInitialized.current) return;
    loadScript('https://connect.facebook.net/en_US/sdk.js', 'facebook-jssdk').then(() => {
      window.FB.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: 'v19.0' });
      fbInitialized.current = true;
    });
  }, []);

  const handleFacebookLogin = () => {
    if (!window.FB) { setError('Facebook SDK not loaded'); return; }
    window.FB.login((response) => {
      if (response.authResponse?.accessToken) {
        handleSocial('facebook', response.authResponse.accessToken);
      }
    }, { scope: 'email' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(tab === 'phone' ? { phone: form.phone, password: form.password } : { email: form.email, password: form.password });
      if (userData?.role === 'admin') navigate('/admin', { replace: true });
      else if (userData?.role === 'seller') navigate('/seller/dashboard', { replace: true });
      else navigate('/', { replace: true });
    } catch (err) { setError(err.message || 'កំហុសក្នុងការចូល'); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Login</h2>
      <p className={styles.subtitle}>ស្វាគមន៍ត្រឡប់មកវិញ!</p>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'phone' ? styles.activeTab : ''}`} onClick={() => setTab('phone')}>ទូរស័ព្ទ</button>
        <button className={`${styles.tab} ${tab === 'email' ? styles.activeTab : ''}`} onClick={() => setTab('email')}>អ៊ីមែល</button>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        {tab === 'phone' ? (
          <Input label="ទូរស័ព្ទ" name="phone" value={form.phone} onChange={e => update('phone', e.target.value)} prefix="+855" placeholder="12 345 678" required />
        ) : (
          <Input label="អ៊ីមែល" name="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@email.com" required />
        )}
        <Input label="ពាក្យសម្ងាត់" name="password" type="password" value={form.password} onChange={e => update('password', e.target.value)} required />
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" fullWidth size="lg" loading={loading}>Login</Button>
      </form>
      <div className={styles.links}>
        <Link to="/forgot-password" className={styles.link}>ភ្លេចពាក្យសម្ងាត់?</Link>
      </div>
      <div className={styles.divider}><span>ឬ</span></div>
      <div className={styles.socials}>
        <button className={styles.socialBtn} onClick={handleFacebookLogin} style={{ background: '#1877F2', color: 'white' }} disabled={loading}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="white" style={{ marginRight: 8 }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </button>
        <div ref={googleBtnRef} className={styles.socialBtnWrapper}>
          {!GOOGLE_CLIENT_ID && (
            <button className={styles.socialBtn} style={{ background: 'white', border: '1px solid var(--border)' }} disabled={loading}>
              <svg viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: 8 }}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          )}
        </div>
      </div>
      <p className={styles.registerText}>មិនទាន់មានគណនី? <Link to="/register" className={styles.registerLink}>ចុះឈ្មោះ</Link></p>
    </div>
  );
}
