import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { CATEGORIES, PRODUCT_CONDITIONS, SORT_OPTIONS } from '../../../utils/constants';
import { KHMER_PROVINCES } from '../../../utils/constants';
import styles from './ProductFilters.module.css';

export default function ProductFilters({ filters, onFilterChange, onClear, isOpen, onClose }) {
  const [expanded, setExpanded] = useState({ category: true, price: true, condition: true, location: false });

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const Section = ({ title, sectionKey, children }) => (
    <div className={styles.section}>
      <button className={styles.sectionHeader} onClick={() => toggle(sectionKey)}>
        <span>{title}</span>
        {expanded[sectionKey] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expanded[sectionKey] && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.filters} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h3>តម្រង</h3>
          <button className={styles.resetBtn} onClick={onClear}><RotateCcw size={16} /> សម្អាត</button>
        </div>

        <Section title="ប្រភេទ" sectionKey="category">
          {CATEGORIES.map(cat => (
            <label key={cat.id} className={styles.checkItem}>
              <input type="checkbox" checked={filters.categories?.includes(cat.slug)} onChange={e => {
                const cats = filters.categories || [];
                onFilterChange({ categories: e.target.checked ? [...cats, cat.slug] : cats.filter(c => c !== cat.slug) });
              }} />
              <span>{cat.icon} {cat.nameKm}</span>
            </label>
          ))}
        </Section>

        <Section title="តម្លៃ" sectionKey="price">
          <div className={styles.priceRange}>
            <input type="number" placeholder="អប្បរមា" value={filters.minPrice || ''} onChange={e => onFilterChange({ minPrice: e.target.value })} className={styles.priceInput} />
            <span>-</span>
            <input type="number" placeholder="អតិបរមា" value={filters.maxPrice || ''} onChange={e => onFilterChange({ maxPrice: e.target.value })} className={styles.priceInput} />
          </div>
        </Section>

        <Section title="ស្ថានភាព" sectionKey="condition">
          {Object.entries(PRODUCT_CONDITIONS).map(([key, val]) => (
            <label key={key} className={styles.checkItem}>
              <input type="checkbox" checked={filters.conditions?.includes(key)} onChange={e => {
                const conds = filters.conditions || [];
                onFilterChange({ conditions: e.target.checked ? [...conds, key] : conds.filter(c => c !== key) });
              }} />
              <span>{val.labelKm}</span>
            </label>
          ))}
        </Section>

        <Section title="ទីតាំង" sectionKey="location">
          {KHMER_PROVINCES.map(prov => (
            <label key={prov} className={styles.checkItem}>
              <input type="radio" name="location" checked={filters.location === prov} onChange={() => onFilterChange({ location: prov })} />
              <span>{prov}</span>
            </label>
          ))}
        </Section>
      </div>
    </>
  );
}
