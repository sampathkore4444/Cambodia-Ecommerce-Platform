import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/user/LoginForm/LoginForm';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <span className={styles.logo}>🇰🇭</span>
          <h1>KhmerMarket</h1>
          <p>ទីផ្សារអនឡាញកម្ពុជា</p>
        </div>
      </div>
      <div className={styles.right}>
        <LoginForm />
      </div>
    </div>
  );
}
