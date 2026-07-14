import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './DataTable.module.css';

export default function DataTable({ columns, data, onRowClick, actions }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...(data || [])].sort((a, b) => {
    if (!sortKey) return 0;
    const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
    return sortDir === 'asc' ? cmp : -cmp;
  }).filter(row => !search || Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase())));

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.search}><Search size={16} /><input placeholder="ស្វែងរក..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} onClick={() => col.sortable !== false && toggleSort(col.key)} className={col.sortable !== false ? styles.sortable : ''}>
                  {col.label}
                  {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
              ))}
              {actions && <th>សកម្មភាព</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={row.id || i} onClick={() => onRowClick?.(row)} className={onRowClick ? styles.clickable : ''}>
                {columns.map(col => <td key={col.key}>{col.render ? col.render(row[col.key], row) : row[col.key]}</td>)}
                {actions && <td>{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <div className={styles.empty}>មិនមានទិន្នន័យ</div>}
      </div>
    </div>
  );
}
