import { useRef } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import styles from './ImportExport.module.css';

export default function ImportExport() {
  const { books, users, transactions, recommendations, reviews, dispatch, addToast } = useLibrary();
  const fileRef = useRef(null);

  const exportData = () => {
    const data = { books, users, transactions, recommendations, reviews, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `libranova-backup-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    addToast('Database exported successfully!', 'success');
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (!data.books || !data.users) throw new Error('Invalid format');
        dispatch({ type: 'IMPORT_DATA', data });
        addToast('Database imported successfully!', 'success');
      } catch {
        addToast('Invalid JSON file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const stats = [
    { label: 'Books', count: books.length, icon: '📚', color: '#00ffc8' },
    { label: 'Users', count: users.length, icon: '👥', color: '#7b2fff' },
    { label: 'Transactions', count: transactions.length, icon: '🔄', color: '#00b4d8' },
    { label: 'Recommendations', count: recommendations.length, icon: '💡', color: '#ffbe0b' },
    { label: 'Reviews', count: reviews.length, icon: '⭐', color: '#ffd700' },
  ];

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: 20 }}>
        <h2 className={styles.title}>Import / Export</h2>
        <p className={styles.subtitle}>Backup and restore your entire library database</p>
      </div>

      {/* Snapshot Summary */}
      <div className={`glass-card ${styles.snapshot}`}>
        <h3 className={styles.snapshotTitle}>Current Database Snapshot</h3>
        <div className={styles.snapshotGrid}>
          {stats.map(s => (
            <div key={s.label} className={styles.snapshotItem} style={{ '--s-color': s.color }}>
              <span className={styles.snapshotIcon}>{s.icon}</span>
              <span className={styles.snapshotCount}>{s.count}</span>
              <span className={styles.snapshotLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actionGrid}>
        {/* Export */}
        <div className={`glass-card ${styles.actionCard}`}>
          <div className={styles.actionIcon}>📤</div>
          <h3 className={styles.actionTitle}>Export Database</h3>
          <p className={styles.actionDesc}>Download a complete JSON backup of all books, users, transactions, recommendations, and reviews.</p>
          <button className="btn btn-primary" onClick={exportData}>Export Now</button>
        </div>

        {/* Import */}
        <div className={`glass-card ${styles.actionCard}`}>
          <div className={styles.actionIcon}>📥</div>
          <h3 className={styles.actionTitle}>Import Database</h3>
          <p className={styles.actionDesc}>Restore from a previously exported JSON file. This will overwrite current data.</p>
          <input type="file" accept=".json" ref={fileRef} onChange={importData} style={{ display: 'none' }} />
          <button className="btn btn-purple" onClick={() => fileRef.current.click()}>Choose File</button>
        </div>
      </div>

      <div className={`glass-card ${styles.warning}`}>
        <span>⚠️</span>
        <p>Importing a file will <strong>overwrite all current data</strong>. Make sure to export first as a backup.</p>
      </div>
    </div>
  );
}
