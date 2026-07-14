import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../hooks/useDebounce';
import { productsAPI } from '../../../api';
import styles from './SearchBar.module.css';

export default function SearchBar({ placeholder, onSearch, className, autoFocus = false }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (onSearch && debouncedQuery) onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    productsAPI.getSearchSuggestions(debouncedQuery)
      .then(res => {
        const items = res.data.data || [];
        setSuggestions(Array.isArray(items) ? items.slice(0, 6) : []);
      })
      .catch(() => setSuggestions([]));
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      setQuery(suggestions[activeIndex]);
      navigate(`/search?q=${encodeURIComponent(suggestions[activeIndex])}`);
    } else if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`${styles.wrapper} ${className || ''}`} ref={wrapperRef}>
      <form className={styles.searchBar} onSubmit={handleSubmit}>
        <Search size={20} className={styles.searchIcon} />
        <input
          type="text" value={query}
          onChange={e => { setQuery(e.target.value); setShowSuggestions(true); setActiveIndex(-1); }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder || 'ស្វែងរកផលិតផល...'}
          className={styles.input} autoFocus={autoFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {query && (
          <button type="button" className={styles.clear} onClick={() => { setQuery(''); setSuggestions([]); }}>
            <X size={18} />
          </button>
        )}
        <button type="submit" className={styles.submit}>ស្វែងរក</button>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <div className={styles.suggestions}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              className={`${styles.suggestion} ${i === activeIndex ? styles.activeSuggestion : ''}`}
              onClick={() => handleSuggestionClick(s)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <Search size={14} />
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
