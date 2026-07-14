import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { classNames } from '../../../utils/helpers';
import styles from './Modal.module.css';

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md', className }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={classNames(styles.modal, styles[size], className)} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
