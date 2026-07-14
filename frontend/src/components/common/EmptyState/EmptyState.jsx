import React from 'react';
import { Package } from 'lucide-react';
import Button from '../Button/Button';
import styles from './EmptyState.module.css';

export default function EmptyState({ icon, title, description, actionLabel, onAction, className }) {
  return (
    <div className={`${styles.empty} ${className || ''}`}>
      <div className={styles.icon}>{icon || <Package size={64} />}</div>
      <h3 className={styles.title}>{title || 'មិនមានទិន្នន័យ'}</h3>
      {description && <p className={styles.desc}>{description}</p>}
      {actionLabel && onAction && <Button onClick={onAction} className={styles.action}>{actionLabel}</Button>}
    </div>
  );
}
