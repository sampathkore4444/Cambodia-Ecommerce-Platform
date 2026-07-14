import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import styles from './ImageGallery.module.css';

export default function ImageGallery({ images = [] }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (!images.length) return <div className={styles.placeholder}>រូបភាពមិនមាន</div>;

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage} onClick={() => setZoomed(!zoomed)}>
        <img src={images[active]} alt={`Product ${active + 1}`} className={styles.img} loading="lazy" />
        <button className={styles.zoomBtn}><ZoomIn size={20} /></button>
        {images.length > 1 && (
          <>
            <button className={`${styles.nav} ${styles.prev}`} onClick={e => { e.stopPropagation(); setActive(a => Math.max(0, a - 1)); }} disabled={active === 0}><ChevronLeft size={24} /></button>
            <button className={`${styles.nav} ${styles.next}`} onClick={e => { e.stopPropagation(); setActive(a => Math.min(images.length - 1, a + 1)); }} disabled={active === images.length - 1}><ChevronRight size={24} /></button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className={styles.thumbs}>
          {images.map((img, i) => (
            <button key={i} className={`${styles.thumb} ${i === active ? styles.activeThumb : ''}`} onClick={() => setActive(i)}>
              <img src={img} alt={`Thumb ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {zoomed && (
        <div className={styles.zoomOverlay} onClick={() => setZoomed(false)}>
          <img src={images[active]} alt="Zoomed" className={styles.zoomImg} />
        </div>
      )}
    </div>
  );
}
