import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowLeft, ShoppingCart, Trash2 } from 'lucide-react';
import { getCompareProducts, removeFromCompare, clearCompare, formatPrice, generateStars } from '../../utils/helpers';
import { useCart } from '../../hooks/useCart';
import Button from '../../components/common/Button/Button';
import toast from 'react-hot-toast';
import styles from './ComparePage.module.css';

export default function ComparePage() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(getCompareProducts());
  }, []);

  const handleRemove = (id) => {
    removeFromCompare(id);
    setProducts(getCompareProducts());
  };

  const handleClear = () => {
    clearCompare();
    setProducts([]);
  };

  const handleAddToCart = (product) => {
    addItem(product);
    toast.success('បានបន្ថែមទៅកន្ត្រក');
  };

  if (products.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h2>មិនមានផលិតផលសម្រាប់ប្រៀបធៀប</h2>
          <p>សូមបន្ថែមផលិតផលពីទំព័រផលិតផល</p>
          <Link to="/" className={styles.backLink}>ត្រឡប់ទៅទំព័រដើម</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/" className={styles.backLink}><ArrowLeft size={18} /> ត្រឡប់</Link>
        <h1>ប្រៀបធៀបផលិតផល ({products.length})</h1>
        <button className={styles.clearAll} onClick={handleClear}><Trash2 size={16} /> លុបទាំងអស់</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.labelCol}>ផលិតផល</th>
              {products.map(p => (
                <th key={p.id} className={styles.productCol}>
                  <div className={styles.productHeader}>
                    <button className={styles.removeBtn} onClick={() => handleRemove(p.id)}><X size={16} /></button>
                    <Link to={`/products/${p.id}`}>
                      <img src={p.images?.[0] || '/placeholder.png'} alt={p.name} className={styles.productImg} />
                    </Link>
                    <Link to={`/products/${p.id}`} className={styles.productName}>{p.name}</Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.label}>តម្លៃ</td>
              {products.map(p => (
                <td key={p.id} className={styles.value}>
                  <span className={styles.price}>{formatPrice(p.price)}</span>
                  {p.originalPrice && <span className={styles.originalPrice}>{formatPrice(p.originalPrice)}</span>}
                </td>
              ))}
            </tr>
            <tr>
              <td className={styles.label}>ការវាយតម្លៃ</td>
              {products.map(p => (
                <td key={p.id} className={styles.value}>
                  <div className={styles.rating}>
                    {generateStars(p.rating).map((s, i) => (
                      <span key={i} className={`${styles.star} ${styles[s]}`}>★</span>
                    ))}
                    <span>{p.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className={styles.label}>បានលក់</td>
              {products.map(p => (
                <td key={p.id} className={styles.value}>{p.soldCount || 0}</td>
              ))}
            </tr>
            <tr>
              <td className={styles.label}>ស្ថានភាព</td>
              {products.map(p => (
                <td key={p.id} className={styles.value}>
                  {p.condition === 'new' ? 'ថ្មី' : p.condition === 'used' ? 'ប្រើប្រាស់แล้ว' : 'ជួសជុល'}
                </td>
              ))}
            </tr>
            <tr>
              <td className={styles.label}>ទីតាំង</td>
              {products.map(p => (
                <td key={p.id} className={styles.value}>{p.location || 'ភ្នំពេញ'}</td>
              ))}
            </tr>
            <tr>
              <td className={styles.label}>សកម្មភាព</td>
              {products.map(p => (
                <td key={p.id} className={styles.value}>
                  <Button size="sm" onClick={() => handleAddToCart(p)}>
                    <ShoppingCart size={14} /> ទិញ
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
