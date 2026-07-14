import React from 'react';
import { classNames } from '../../../utils/helpers';
import styles from './Skeleton.module.css';

export default function Skeleton({ variant = 'text', width, height, count = 1, className }) {
  return (
    <div className={classNames(styles.skeleton, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={classNames(styles[variant])} style={{ width, height }} />
      ))}
    </div>
  );
}
