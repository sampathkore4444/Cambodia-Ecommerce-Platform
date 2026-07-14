import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, Globe, ChevronDown, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useCart } from '../../../hooks/useCart';
import { LanguageContext } from '../../../context/LanguageContext';
import { useUIStore } from '../../../store';
import SearchBar from '../../common/SearchBar/SearchBar';
import MobileMenu from './MobileMenu';
import styles from './Header.module.css';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const { language, setLanguage, t } = useContext(LanguageContext);
  const { toggleCartDrawer, isMobileMenuOpen, toggleMobileMenu } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userWrapperRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    if (!showUserMenu) return;
    const handleClickOutside = (e) => {
      if (userWrapperRef.current && !userWrapperRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <div className={styles.left}>
            {!isHome && (
              <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
                <ArrowLeft size={22} />
              </button>
            )}
            <button className={styles.menuBtn} onClick={toggleMobileMenu}><Menu size={24} /></button>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoIcon}>🇰🇭</span>
              <span className={styles.logoText}>KhmerMarket</span>
            </Link>
          </div>

          <div className={styles.center}>
            <SearchBar className={styles.searchBar} />
          </div>

          <div className={styles.right}>
            <button className={styles.langBtn} onClick={() => setLanguage(language === 'km' ? 'en' : 'km')}>
              <Globe size={18} />
              <span>{language === 'km' ? 'EN' : 'KM'}</span>
            </button>

            <button className={styles.cartBtn} onClick={() => navigate('/cart')}>
              <ShoppingCart size={22} />
              {itemCount > 0 && <span className={styles.badge}>{itemCount > 99 ? '99+' : itemCount}</span>}
            </button>

            {isAuthenticated ? (
              <div className={styles.userWrapper} ref={userWrapperRef}>
                <button className={styles.userBtn} onClick={() => setShowUserMenu(!showUserMenu)}>
                  <div className={styles.avatar}>{user?.name?.[0] || 'U'}</div>
                  <span className={styles.userName}>{user?.name || 'User'}</span>
                  <ChevronDown size={16} />
                </button>
                {showUserMenu && (
                  <div className={styles.dropdown}>
                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>{t('userMenuProfile')}</Link>
                    <Link to="/orders" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>{t('userMenuOrders')}</Link>
                    <Link to="/wishlist" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>{t('userMenuWishlist')}</Link>
                    <Link to="/chat" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>{t('userMenuChat')}</Link>
                    {user?.role === 'seller' && <Link to="/seller/dashboard" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>{t('userMenuSeller')}</Link>}
                    {user?.role === 'buyer' && <Link to="/sell" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>{t('userMenuBecomeSeller')}</Link>}
                    {user?.role === 'admin' && <Link to="/admin" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>{t('userMenuAdmin')}</Link>}
                    <button className={styles.dropdownItem} onClick={() => { logout(); setShowUserMenu(false); }}>{t('userMenuLogout')}</button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.authBtns}>
                <Link to="/login" className={styles.loginLink}>{t('login')}</Link>
                <Link to="/register" className={styles.registerLink}>{t('register')}</Link>
              </div>
            )}
          </div>
        </div>
      </header>
      {isMobileMenuOpen && <MobileMenu />}
    </>
  );
}
