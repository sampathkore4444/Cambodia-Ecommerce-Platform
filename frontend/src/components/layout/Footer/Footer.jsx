import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Send, Smartphone } from 'lucide-react';
import { LanguageContext } from '../../../context/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useContext(LanguageContext);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}><span>🇰🇭</span> KhmerMarket</div>
            <p className={styles.desc}>{t('heroTitle')}. {t('heroSubtitle')}.</p>
            <div className={styles.social}>
              <a href="https://facebook.com" className={styles.socialLink}><Facebook size={20} /></a>
              <a href="https://t.me" className={styles.socialLink}><Send size={20} /></a>
              <a href="https://tiktok.com" className={styles.socialLink}><Smartphone size={20} /></a>
            </div>
          </div>

          <div className={styles.links}>
            <h4 className={styles.heading}>{t('aboutUs')}</h4>
            <Link to="/about">{t('aboutKhmerMarket')}</Link>
            <Link to="/contact">{t('contact')}</Link>
            <Link to="/faq">{t('faq')}</Link>
            <Link to="/terms">{t('terms')}</Link>
            <Link to="/privacy">{t('privacy')}</Link>
          </div>

          <div className={styles.links}>
            <h4 className={styles.heading}>{t('categories')}</h4>
            <Link to="/search?category=electronics">{t('electronics')}</Link>
            <Link to="/search?category=fashion">{t('fashion')}</Link>
            <Link to="/search?category=home-living">{t('homeLiving')}</Link>
            <Link to="/search?category=beauty">{t('beauty')}</Link>
            <Link to="/search?category=food">{t('food')}</Link>
          </div>

          <div className={styles.links}>
            <h4 className={styles.heading}>{t('paymentMethods')}</h4>
            <span>💵 {t('cashOnDelivery')}</span>
            <span>🏦 ABA Bank</span>
            <span>📱 Wing</span>
            <span>📱 Pi Pay</span>
            <span>📱 True Money</span>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© 2024 KhmerMarket. {t('allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
}
