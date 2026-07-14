import React from 'react';
import { Home, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.emoji}>🔍</div>
      <h1 className={styles.title}>404</h1>
      <h2 className={styles.heading}>មិនឃើញទំព័រនេះទេ</h2>
      <p className={styles.subtitle}>Page Not Found</p>
      <p className={styles.message}>
        ទំព័រដែលអ្នកស្វែងរកមិនមាន ឬត្រូវបានផ្លាស់ប្តូរ។
        <br />
        The page you are looking for does not exist or has been moved.
      </p>

      <form className={styles.searchForm} onSubmit={handleSearch}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ស្វែងរកផលិតផល..."
          />
        </div>
        <button type="submit" className={styles.searchBtn}>ស្វែងរក</button>
      </form>

      <button className={styles.homeBtn} onClick={() => navigate('/')}>
        <Home size={18} /> ត្រឡប់ទៅទំព័រដើម / Go Home
      </button>
    </div>
  );
}
