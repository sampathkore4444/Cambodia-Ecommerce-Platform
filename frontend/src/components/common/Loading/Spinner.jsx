import React from 'react';
import { classNames } from '../../../utils/helpers';
import styles from './Spinner.module.css';

export default function Spinner({ size = 'md', className }) {
  return (
    <div className={classNames(styles.spinner, styles[size], className)}>
      <div className={styles.circle} />
    </div>
  );
}
