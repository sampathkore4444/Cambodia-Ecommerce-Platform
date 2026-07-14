import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { X, Home, ShoppingCart, User, MessageCircle, Tag, Globe } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { LanguageContext } from '../../../context/LanguageContext';
import { useUIStore } from '../../../store';
import styles from './Header.module.css';

export default function MobileMenu() {
  const { isAuthenticated, user, logout } = useAuth();
  const { language, setLanguage, t } = useContext(LanguageContext);
  const { toggleMobileMenu } = useUIStore();

  return (
    <div className={styles.mobileOverlay}>
      <div className={styles.mobileMenu}>
        <div className={styles.mobileHeader}>
          <span className={styles.logoText}>KhmerMarket</span>
          <button onClick={toggleMobileMenu} className={styles.mobileClose}><X size={24} /></button>
        </div>

        {isAuthenticated && (
          <div className={styles.mobileUser}>
            <div className={styles.avatar}>{user?.name?.[0] || 'U'}</div>
            <div>
              <div className={styles.mobileUserName}>{user?.name || 'User'}</div>
              <div className={styles.mobileUserEmail}>{user?.email || user?.phone}</div>
            </div>
          </div>
        )}

        <nav className={styles.mobileNav}>
          <Link to="/" className={styles.mobileLink} onClick={toggleMobileMenu}><Home size={20} /> {t('home')}</Link>
          <Link to="/search" className={styles.mobileLink} onClick={toggleMobileMenu}><Tag size={20} /> {t('categories')}</Link>
          <Link to="/cart" className={styles.mobileLink} onClick={toggleMobileMenu}><ShoppingCart size={20} /> {t('cart')}</Link>
          {isAuthenticated && <Link to="/chat" className={styles.mobileLink} onClick={toggleMobileMenu}><MessageCircle size={20} /> {t('chat')}</Link>}
          {isAuthenticated ? (
            <>
              <Link to="/profile" className={styles.mobileLink} onClick={toggleMobileMenu}><User size={20} /> {t('profile')}</Link>
              <Link to="/orders" className={styles.mobileLink} onClick={toggleMobileMenu}>{t('orders')}</Link>
              <button className={styles.mobileLink} onClick={() => { logout(); toggleMobileMenu(); }}>{t('logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.mobileLink} onClick={toggleMobileMenu}>{t('login')}</Link>
              <Link to="/register" className={styles.mobileLink} onClick={toggleMobileMenu}>{t('register')}</Link>
            </>
          )}
        </nav>

        <button className={styles.mobileLang} onClick={() => setLanguage(language === 'km' ? 'en' : 'km')}>
          <Globe size={18} /> {language === 'km' ? 'English' : 'ភាសាខ្មែរ'}
        </button>
      </div>
      <div className={styles.mobileBackdrop} onClick={toggleMobileMenu} />
    </div>
  );
}
