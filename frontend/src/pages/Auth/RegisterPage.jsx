import React from 'react';
import RegisterForm from '../../components/user/RegisterForm/RegisterForm';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <span className={styles.logo}>🇰🇭</span>
          <h1>KhmerMarket</h1>
          <p>ចុះឈ្មោះឥឡូវនេះ!</p>
        </div>
      </div>
      <div className={styles.right}>
        <RegisterForm />
      </div>
    </div>
  );
}
