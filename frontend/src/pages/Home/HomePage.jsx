import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Truck, RotateCcw, Headphones, Clock, Trash2 } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import PromoBanner from '../../components/common/PromoBanner/PromoBanner';
import ProductGrid from '../../components/product/ProductGrid/ProductGrid';
import { CATEGORIES } from '../../utils/constants';
import { productsAPI } from '../../api';
import { LanguageContext } from '../../context/LanguageContext';
import { getRecentlyViewed, clearRecentlyViewed } from '../../utils/helpers';
import styles from './HomePage.module.css';

function mapProduct(raw) {
  return {
    id: raw.id,
    name: raw.title_kh || raw.title,
    price: raw.price,
    originalPrice: raw.compare_price || undefined,
    images: (raw.images || []).map(img => img.url || img),
    rating: raw.rating_avg || 0,
    soldCount: raw.sold_count || 0,
    location: raw.location_province || 'ភ្នំពេញ',
    condition: raw.condition || 'new',
  };
}

const truspBadges = [
  { icon: Shield, titleKey: 'securePayment', titleEn: 'Secure Payment', descKey: 'securePaymentDesc' },
  { icon: Truck, titleKey: 'fastDelivery', titleEn: 'Fast Delivery', descKey: 'fastDeliveryDesc' },
  { icon: RotateCcw, titleKey: 'easyReturns', titleEn: 'Easy Returns', descKey: 'easyReturnsDesc' },
  { icon: Headphones, titleKey: 'support247', titleEn: '24/7 Support', descKey: 'support247Desc' },
];

export default function HomePage() {
  const { t } = useContext(LanguageContext);
  const [trending, setTrending] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setRecentlyViewed(getRecentlyViewed());
    Promise.all([
      productsAPI.getTrendingProducts().catch(() => ({ data: { data: [] } })),
      productsAPI.getProducts({ per_page: 8 }).catch(() => ({ data: { data: [] } })),
      productsAPI.getFlashSales({ per_page: 8 }).catch(() => ({ data: { data: [] } })),
    ])
      .then(([trendingRes, productsRes, flashRes]) => {
        setTrending((trendingRes.data.data || trendingRes.data || []).map(mapProduct));
        setAllProducts((productsRes.data.data || productsRes.data || []).map(mapProduct));
        const flashItems = (flashRes.data.data || flashRes.data || []).map(mapProduct);
        setFlashSaleProducts(flashItems);
      })
      .finally(() => setLoading(false));
  }, []);

  const flashSaleDisplay = flashSaleProducts.length
    ? flashSaleProducts
    : allProducts.filter(p => p.originalPrice);

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('heroTitle')}</h1>
          <p className={styles.heroSubtitle}>{t('heroSubtitle')}</p>
          <SearchBar className={styles.heroSearch} />
        </div>
      </section>

      <PromoBanner />

      <section className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>{t('featuredCategories')}</h2>
        <div className={styles.categoriesGrid}>
          {CATEGORIES.map(cat => (
            <Link key={cat.id} to={`/search?category=${cat.slug}`} className={styles.categoryCard}>
              <span className={styles.catIcon}>{cat.icon}</span>
              <span className={styles.catName}>{cat.nameKm}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.flashSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🔥 {t('flashSale')}</h2>
          <div className={styles.countdown}>
            <FlashCountdown />
          </div>
        </div>
        {flashSaleDisplay.length > 0 ? (
          <ProductGrid products={flashSaleDisplay} loading={loading} />
        ) : (
          !loading && <p className={styles.emptyText}>មិនមានផលិតផលក្នុងការលក់បញ្ចុះតម្លៃទេ</p>
        )}
      </section>

      <section className={styles.trendingSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('trendingProducts')}</h2>
          <Link to="/search" className={styles.viewAll}>{t('viewAll')} →</Link>
        </div>
        <ProductGrid
          products={trending.length ? trending : allProducts}
          loading={loading}
        />
        {!loading && !trending.length && !allProducts.length && (
          <p className={styles.emptyText}>មិនមានផលិតផលនៅឡើយទេ</p>
        )}
      </section>

      {recentlyViewed.length > 0 && (
        <section className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}><Clock size={20} /> ទំព័រដែលអ្នកបានមើលថ្មីៗ</h2>
            <button className={styles.clearRecent} onClick={() => { clearRecentlyViewed(); setRecentlyViewed([]); }}>
              <Trash2 size={14} /> លុប
            </button>
          </div>
          <ProductGrid products={recentlyViewed} />
        </section>
      )}

      <section className={styles.trustSection}>
        <h2 className={styles.sectionTitle}>{t('whyKhmerMarket')}</h2>
        <div className={styles.trustGrid}>
          {truspBadges.map((badge, i) => (
            <div key={i} className={styles.trustCard}>
              <div className={styles.trustIcon}><badge.icon size={32} /></div>
              <h3 className={styles.trustTitle}>{t(badge.titleKey)}</h3>
              <p className={styles.trustDesc}>{t(badge.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.appBanner}>
        <div className={styles.appContent}>
          <h2>{t('downloadAppTitle')}</h2>
          <p>{t('downloadAppDesc')}</p>
          <div className={styles.appButtons}>
            <button className={styles.appBtn}>{t('appStore')}</button>
            <button className={styles.appBtn}>{t('googlePlay')}</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FlashCountdown() {
  const [time, setTime] = useState(getTimeToMidnight());

  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeToMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <span className={styles.timeBlock}>{String(time.hours).padStart(2, '0')}</span>:
      <span className={styles.timeBlock}>{String(time.minutes).padStart(2, '0')}</span>:
      <span className={styles.timeBlock}>{String(time.seconds).padStart(2, '0')}</span>
    </>
  );
}

function getTimeToMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}
