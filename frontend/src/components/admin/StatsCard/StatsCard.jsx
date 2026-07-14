import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './StatsCard.module.css';

export default function StatsCard({ icon: Icon, label, value, change, positive }) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrap}><Icon size={22} /></div>
      <div className={styles.info}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {change && (
          <span className={`${styles.change} ${positive ? styles.positive : styles.negative}`}>
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {change}
          </span>
        )}
      </div>
    </div>
  );
}
