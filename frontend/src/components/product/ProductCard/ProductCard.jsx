import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, GitCompareArrows } from 'lucide-react';
import { truncate, addToCompare } from '../../../utils/helpers';
import { formatPrice } from '../../../utils/helpers';
import { wishlistAPI } from '../../../api';
import { useAuth } from '../../../hooks/useAuth';
import Badge from '../../common/Badge/Badge';
import toast from 'react-hot-toast';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, isLiked: initialLiked, onLikeChange }) {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(initialLiked ?? product.isLiked ?? false);

  const toggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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
      onLikeChange?.(product.id, next);
    } catch {
      setLiked(!next);
      toast.error('មិនអាចអាប់ដេតបំណងប្រាថ្នាបាន');
    }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = addToCompare(product);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} className={styles.image} loading="lazy" />
        {product.condition === 'new' && <Badge variant="success" size="sm" className={styles.conditionBadge}>ថ្មី</Badge>}
        <button className={`${styles.heart} ${liked ? styles.liked : ''}`} onClick={toggleLike}>
          <Heart size={18} fill={liked ? 'var(--khmer-red)' : 'none'} />
        </button>
        <button className={styles.compareBtn} onClick={handleCompare} title="ប្រៀបធៀប">
          <GitCompareArrows size={16} />
        </button>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{truncate(product.name, 60)}</h3>
        <div className={styles.price}>{formatPrice(product.price)}</div>
        <div className={styles.meta}>
          <div className={styles.rating}>
            <Star size={14} fill="var(--secondary)" stroke="var(--secondary)" />
            <span>{product.rating?.toFixed(1) || '4.0'}</span>
          </div>
          <span className={styles.sold}>{product.soldCount || 0} បានលក់</span>
        </div>
        <div className={styles.location}>{product.location || 'ភ្នំពេញ'}</div>
      </div>
    </Link>
  );
}
