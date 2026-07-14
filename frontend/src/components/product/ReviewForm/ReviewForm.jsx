import React, { useState } from 'react';
import { Star, X, Camera } from 'lucide-react';
import { reviewsAPI, productsAPI } from '../../../api';
import Button from '../../common/Button/Button';
import styles from './ReviewForm.module.css';

export default function ReviewForm({ productId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (images.length + files.length > 5) {
      setError('អ្នកអាចបន្ថែមរូបភាពបានតែ ៥ ប៉ុណ្ណោះ');
      return;
    }
    setUploading(true);
    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const res = await productsAPI.uploadImage(file);
          return res.data.data?.url || res.data.url;
        })
      );
      setImages(prev => [...prev, ...uploads.filter(Boolean)]);
    } catch {
      setError('មិនអាចបញ្ចូលរូបភាពបាន។');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) { setError('សូមជ្រើសរើសការវាយតម្លៃ'); return; }
    setSubmitting(true);
    setError('');
    try {
      await reviewsAPI.createReview(productId, {
        rating,
        title: title || undefined,
        comment: comment || undefined,
        images: images.length > 0 ? images : undefined,
      });
      setRating(0); setTitle(''); setComment(''); setImages([]);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'មិនអាចផ្ញើមតិបាន។');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.heading}>សរសេរមតិយោបល់</h3>
      <div className={styles.ratingRow}>
        <span className={styles.label}>ការវាយតម្លៃ:</span>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} type="button" className={styles.starBtn}
              onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}>
              <Star size={24} fill={(hovered || rating) >= s ? 'var(--secondary)' : 'none'} stroke={(hovered || rating) >= s ? 'var(--secondary)' : 'var(--gray-300)'} />
            </button>
          ))}
        </div>
        {rating > 0 && <span className={styles.ratingLabel}>{ ['', 'ខ្សោយ', 'មធ្យម', 'ល្អ', 'ល្អខ្លាំង', 'អស្ចារ្យ'][rating] }</span>}
      </div>
      <input className={styles.input} type="text" placeholder="ចំណងជើង (ស្រេចចិត្ត)" value={title} onChange={e => setTitle(e.target.value)} maxLength={255} />
      <textarea className={styles.textarea} placeholder="សរសេរមតិយោបល់របស់អ្នក (ស្រេចចិត្ត)" value={comment} onChange={e => setComment(e.target.value)} rows={4} />
      <div className={styles.imageSection}>
        <label className={styles.imageUpload}>
          <Camera size={20} />
          <span>បន្ថែមរូបភាព</span>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} hidden disabled={uploading} />
        </label>
        {images.length > 0 && (
          <div className={styles.imagePreview}>
            {images.map((img, i) => (
              <div key={i} className={styles.imageItem}>
                <img src={img} alt={`Review ${i + 1}`} />
                <button type="button" className={styles.removeImage} onClick={() => removeImage(i)}><X size={14} /></button>
              </div>
            ))}
          </div>
        )}
        {uploading && <p className={styles.uploading}>កំពុងបញ្ចូលរូបភាព...</p>}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <Button type="submit" disabled={submitting || rating < 1}>
        {submitting ? 'កំពុងផ្ញើ...' : 'ផ្ញើមតិយោបល់'}
      </Button>
    </form>
  );
}
