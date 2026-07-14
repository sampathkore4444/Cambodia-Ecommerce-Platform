import React from 'react';
import styles from './Badge.module.css';
import { classNames } from '../../../utils/helpers';

export default function Badge({ children, variant = 'neutral', dot = false, size = 'md', className }) {
  return (
    <span className={classNames(styles.badge, styles[variant], styles[size], className)}>
      {dot && <span className={classNames(styles.dot, styles[`${variant}Dot`])} />}
      {children}
    </span>
  );
}
