import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductForm from '../../components/seller/ProductForm/ProductForm';
import Spinner from '../../components/common/Loading/Spinner';
import SellerLayout from '../../components/seller/SellerLayout/SellerLayout';
import { productsAPI } from '../../api';
import styles from './SellerProductsPage.module.css';

export default function SellerProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    productsAPI.getProduct(id)
      .then(res => { if (active) setProduct(res.data.data || res.data); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const handleSubmit = async (data, images) => {
    try {
      await productsAPI.updateProduct(id, data);
      if (images?.length) {
        await Promise.all(
          images.map((img, i) => {
            if (img.id) return Promise.resolve();
            return productsAPI.addImage(id, { url: img.url, sort_order: i, is_primary: i === 0 });
          })
        );
      }
      toast.success('បានកែប្រែផលិតផល');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'មិនអាចកែប្រែបាន');
    }
  };

  return (
    <SellerLayout>
      {loading && <div className={styles.loading}><Spinner size="lg" /></div>}
      {error && <div className={styles.error}>{error}</div>}
      {!loading && !product && <div className={styles.error}>មិនพบផលិតផល</div>}
      {!loading && product && (
        <div className={styles.page}>
          <Link to="/seller/products" className={styles.backLink}><ArrowLeft size={18} /> ត្រឡប់ទៅផលិតផល</Link>
          <ProductForm product={product} onSubmit={handleSubmit} />
        </div>
      )}
    </SellerLayout>
  );
}
