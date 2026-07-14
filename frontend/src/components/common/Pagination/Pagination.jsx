import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button className={styles.btn} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft size={18} />
      </button>
      {getPages().map((p, i) =>
        p === '...' ? <span key={`e${i}`} className={styles.ellipsis}>...</span> :
        <button key={p} className={`${styles.pageBtn} ${p === page ? styles.active : ''}`} onClick={() => onPageChange(p)}>{p}</button>
      )}
      <button className={styles.btn} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
