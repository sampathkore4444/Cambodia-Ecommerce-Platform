import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { reviewsAPI } from '../../../api';
import styles from './ReviewList.module.css';

export default function ReviewList({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    reviewsAPI.getProductReviews(productId, { page, per_page: 10 })
      .then(res => {
        const d = res.data.data || res.data;
        setReviews(d.reviews || d || []);
        setSummary(d.summary || null);
        setTotal(d.total || (d.reviews || d || []).length);
      })
      .catch(() => { setReviews([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [productId, page]);

  const handleHelpful = async (reviewId) => {
    try {
      await reviewsAPI.markHelpful(reviewId);
      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r
      ));
    } catch {}
  };

  if (loading) return <div className={styles.loading}>កំពុងផ្ទុក...</div>;

  return (
    <div className={styles.wrapper}>
      {summary && (
        <div className={styles.summary}>
          <div className={styles.avgBlock}>
            <span className={styles.avgNum}>{summary.average?.toFixed(1) || '0.0'}</span>
            <div className={styles.avgStars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill={i < Math.round(summary.average || 0) ? 'var(--secondary)' : 'none'} stroke={i < Math.round(summary.average || 0) ? 'var(--secondary)' : 'var(--gray-300)'} />
              ))}
            </div>
            <span className={styles.avgTotal}>{summary.total || 0} មតិ</span>
          </div>
          {summary.distribution && (
            <div className={styles.distribution}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = summary.distribution[star] || 0;
                const pct = summary.total > 0 ? (count / summary.total) * 100 : 0;
                return (
                  <div key={star} className={styles.distRow}>
                    <span className={styles.distLabel}>{star}</span>
                    <Star size={12} fill="var(--secondary)" stroke="var(--secondary)" />
                    <div className={styles.distBar}><div className={styles.distFill} style={{ width: `${pct}%` }} /></div>
                    <span className={styles.distCount}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {reviews.length === 0 ? (
        <p className={styles.empty}>មិនទាន់មានមតិយោបល់</p>
      ) : (
        <div className={styles.list}>
          {reviews.map(review => (
            <div key={review.id} className={styles.review}>
              <div className={styles.reviewHeader}>
                <div className={styles.avatar}>{review.user?.full_name?.[0] || 'U'}</div>
                <div className={styles.reviewMeta}>
                  <span className={styles.reviewerName}>{review.user?.full_name || 'អ្នកប្រើប្រាស់'}</span>
                  <div className={styles.reviewStars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill={i < review.rating ? 'var(--secondary)' : 'none'} stroke={i < review.rating ? 'var(--secondary)' : 'var(--gray-300)'} />
                    ))}
                  </div>
                </div>
                {review.is_verified && <span className={styles.verified}>ទិញរួច</span>}
              </div>
              {review.title && <h4 className={styles.reviewTitle}>{review.title}</h4>}
              {review.comment && <p className={styles.reviewComment}>{review.comment}</p>}
              {review.images && review.images.length > 0 && (
                <div className={styles.reviewImages}>
                  {review.images.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                      <img src={img} alt={`Review ${i + 1}`} className={styles.reviewImg} />
                    </a>
                  ))}
                </div>
              )}
              <div className={styles.reviewFooter}>
                <button className={styles.helpfulBtn} onClick={() => handleHelpful(review.id)}>
                  <ThumbsUp size={14} /> មានប្រយោជន៍ ({review.helpful_count || 0})
                </button>
              </div>
              {review.seller_response && (
                <div className={styles.sellerResponse}>
                  <span className={styles.sellerLabel}>ឆ្លើយតបពីអ្នកលក់:</span>
                  <p>{review.seller_response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {total > 10 && (
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>មុន</button>
          <span>ទំព័រ {page}</span>
          <button disabled={reviews.length < 10} onClick={() => setPage(p => p + 1)}>បន្ទាប់</button>
        </div>
      )}
    </div>
  );
}
