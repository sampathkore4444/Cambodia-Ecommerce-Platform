import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { wishlistAPI } from '../../api';
import ProductGrid from '../../components/product/ProductGrid/ProductGrid';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { Heart } from 'lucide-react';

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
    isLiked: true,
  };
}

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    wishlistAPI.getWishlist()
      .then(res => setItems((res.data.data || []).map(mapProduct)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (loading) return null;

  if (!items.length) {
    return <EmptyState icon={<Heart size={64} />} title="បំណងប្រាថ្នាទទេ" description="អ្នកមិនទាន់មានផលិតផលក្នុងបញ្ជី" actionLabel="ស្វែងរកឥឡូវនេះ" onAction={() => window.location.href = '/search'} />;
  }

  return (
    <div>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-lg)' }}>បំណងប្រាថ្នា</h1>
      <ProductGrid products={items} />
    </div>
  );
}
