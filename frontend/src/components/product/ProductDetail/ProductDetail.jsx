import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Share2, MessageCircle, Heart } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useCart } from '../../../hooks/useCart';
import { wishlistAPI, chatAPI } from '../../../api';
import { formatPrice, generateStars } from '../../../utils/helpers';
import { PRODUCT_CONDITIONS } from '../../../utils/constants';
import ImageGallery from '../../common/ImageGallery/ImageGallery';
import CurrencyDisplay from '../../common/CurrencyDisplay/CurrencyDisplay';
import Badge from '../../common/Badge/Badge';
import Button from '../../common/Button/Button';
import ReviewList from '../ReviewList/ReviewList';
import ReviewForm from '../ReviewForm/ReviewForm';
import toast from 'react-hot-toast';
import styles from './ProductDetail.module.css';

export default function ProductDetail({ product }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [liked, setLiked] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !product?.id) return;
    wishlistAPI.getWishlist()
      .then(res => {
        const items = res.data.data || res.data || [];
        const wishlisted = Array.isArray(items) && items.some(w => {
          const pid = w.product_id || w.product?.id;
          return String(pid) === String(product.id);
        });
        setLiked(wishlisted);
      })
      .catch(() => {});
  }, [isAuthenticated, product?.id]);

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('សូមចុះឈ្មោះដើម្បីបន្ថែមទៅបំណងប្រាថ្នា');
      return;
    }
    const next = !liked;
    setLiked(next);
    try {
      if (next) {
        await wishlistAPI.addToWishlist(product.id);
        toast.success('បានបន្ថែមទៅបំណងប្រាថ្នា');
      } else {
        await wishlistAPI.removeFromWishlist(product.id);
        toast.success('បានដកចេញពីបំណងប្រាថ្នា');
      }
    } catch {
      setLiked(!next);
      toast.error('មិនអាចអាប់ដេតបំណងប្រាថ្នាបាន');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch { /* user cancelled */ }
    } else {
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toast.success('បានចម្លងតំណភ្ជាប់');
      } catch {
        toast.error('មិនអាចចម្លងតំណភ្ជាប់បាន');
      }
    }
  };

  const handleChat = async () => {
    if (!isAuthenticated) {
      toast.error('សូមចុះឈ្មោះដើម្បីជជែក');
      return;
    }
    if (!product.seller?.id) {
      toast.error('មិនមានព័ត៌មានអ្នកលក់');
      return;
    }
    try {
      const res = await chatAPI.createRoom({ seller_id: product.seller.id, product_id: product.id });
      const room = res.data.data || res.data;
      navigate('/chat', { state: { roomId: room.id } });
    } catch {
      toast.error('មិនអាចបង្កើតបន្ទប់ជជែកបាន');
    }
  };

  if (!product) return null;

  const stars = generateStars(product.rating);

  return (
    <div className={styles.detail}>
      <div className={styles.left}>
        <ImageGallery images={product.images || []} />
      </div>
      <div className={styles.right}>
        <h1 className={styles.title}>{product.name}</h1>
        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            {stars.map((s, i) => <Star key={i} size={16} fill={s === 'full' ? 'var(--secondary)' : 'none'} stroke={s === 'empty' ? 'var(--gray-300)' : 'var(--secondary)'} />)}
          </div>
          <span className={styles.ratingText}>{product.rating?.toFixed(1) || '0.0'}</span>
          <span className={styles.soldText}>{product.soldCount || 0} បានលក់</span>
        </div>
        <div className={styles.priceRow}>
          <CurrencyDisplay price={product.price} showBoth size="lg" />
          {product.originalPrice && product.originalPrice > product.price && (
            <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        {product.condition && (
          <div className={styles.condition}>
            <span className={styles.label}>ស្ថានភាព:</span>
            <Badge variant="info">{PRODUCT_CONDITIONS[product.condition]?.labelKm || product.condition}</Badge>
          </div>
        )}
        <div className={styles.stock}>
          <span className={styles.label}>ស្តុក:</span>
          <span className={product.stock > 0 ? styles.inStock : styles.outOfStock}>
            {product.stock > 0 ? `មាន ${product.stock} កំប្លេរ` : 'អស់ស្តុក'}
          </span>
        </div>
        <div className={styles.quantityRow}>
          <span className={styles.label}>ចំនួន:</span>
          <div className={styles.stepper}>
            <button className={styles.stepBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>-</button>
            <span className={styles.qtyValue}>{quantity}</span>
            <button className={styles.stepBtn} onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}>+</button>
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant="outline" size="lg" fullWidth onClick={() => addItem(product, quantity)} disabled={!product.stock}>បន្ថែមទៅរទេះ</Button>
          <Button size="lg" fullWidth onClick={() => navigate('/checkout', { state: { buyNow: { product, quantity } } })}>ទិញភ្លាម</Button>
        </div>
        <div className={styles.shareRow}>
          <Button variant="ghost" size="sm" onClick={toggleWishlist}>
            <Heart size={16} fill={liked ? 'var(--khmer-red)' : 'none'} stroke={liked ? 'var(--khmer-red)' : 'currentColor'} />
            {liked ? 'ដកចេញ' : 'បន្ថែមទៅបំណងប្រាថ្នា'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}><Share2 size={16} /> ចែករំលែក</Button>
          <Button variant="ghost" size="sm" onClick={handleChat}><MessageCircle size={16} /> ជជែក</Button>
        </div>
        <div className={styles.sellerCard}>
          <div className={styles.sellerAvatar}>{product.seller?.name?.[0] || 'S'}</div>
          <div className={styles.sellerInfo}>
            <span className={styles.sellerName}>{product.seller?.name || 'អ្នកលក់'}</span>
            <span className={styles.sellerLoc}>{product.location || 'ភ្នំពេញ'}</span>
          </div>
          <Button variant="outline" size="sm">មើលហាង</Button>
        </div>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'description' ? styles.activeTab : ''}`} onClick={() => setActiveTab('description')}>ពិពណ៌នា</button>
          <button className={`${styles.tab} ${activeTab === 'specs' ? styles.activeTab : ''}`} onClick={() => setActiveTab('specs')}>លក្ខណៈសម្បត្តិ</button>
          <button className={`${styles.tab} ${activeTab === 'reviews' ? styles.activeTab : ''}`} onClick={() => setActiveTab('reviews')}>មតិយោបល់</button>
        </div>
        <div className={styles.tabContent}>
          {activeTab === 'description' && <p>{product.description || 'មិនមានពិពណ៌នា'}</p>}
          {activeTab === 'specs' && (
            <div className={styles.specs}>
              {product.specifications && Object.keys(product.specifications).length > 0 ? Object.entries(product.specifications).map(([k, v]) => (
                <div key={k} className={styles.specRow}><span className={styles.specKey}>{k}</span><span className={styles.specVal}>{v}</span></div>
              )) : <p>មិនមានព័ត៌មាន</p>}
            </div>
          )}
          {activeTab === 'reviews' && (
            <div>
              {isAuthenticated && (
                <ReviewForm productId={product.id} onSuccess={() => setReviewRefreshKey(k => k + 1)} />
              )}
              <ReviewList key={reviewRefreshKey} productId={product.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
