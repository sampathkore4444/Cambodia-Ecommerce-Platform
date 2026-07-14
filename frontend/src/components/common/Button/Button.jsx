import React from 'react';
import { classNames } from '../../../utils/helpers';
import styles from './Button.module.css';

export default function Button({
  children, variant = 'primary', size = 'md', fullWidth = false,
  loading = false, disabled = false, icon, iconPosition = 'left',
  type = 'button', onClick, className, ...props
}) {
  return (
    <button
      type={type}
      className={classNames(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      {icon && iconPosition === 'left' && <span className={styles.icon}>{icon}</span>}
      {children && <span className={classNames(loading && styles.loadingText)}>{children}</span>}
      {icon && iconPosition === 'right' && <span className={styles.icon}>{icon}</span>}
    </button>
  );
}
