import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '../../components/seller/ProductForm/ProductForm';
import SellerLayout from '../../components/seller/SellerLayout/SellerLayout';
import { productsAPI } from '../../api';
import styles from './SellerProductsPage.module.css';

export default function SellerProductNewPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data, images) => {
    const res = await productsAPI.createProduct(data);
    const productId = res.data.data?.id || res.data.id;
    if (productId && images?.length) {
      await Promise.all(
        images.map((img, i) => productsAPI.addImage(productId, { url: img.url, sort_order: i, is_primary: i === 0 }))
      );
    }
    navigate('/seller/products');
  };

  return (
    <SellerLayout>
      <div className={styles.page}>
        <Link to="/seller/products" className={styles.backLink}><ArrowLeft size={18} /> ត្រឡប់ទៅផលិតផល</Link>
        <ProductForm onSubmit={handleSubmit} />
      </div>
    </SellerLayout>
  );
}
