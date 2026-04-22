import { useLibrary } from '../../contexts/LibraryContext';
import styles from './ReviewRequests.module.css';

export default function ReviewRequests() {
  const { recommendations, dispatch, addToast } = useLibrary();

  const handleAction = (rec, action) => {
    dispatch({ type: 'UPDATE_RECOMMENDATION', rec: { ...rec, status: action } });
    addToast(`Request "${rec.title}" ${action}`, action === 'approved' ? 'success' : 'warning');
  };

  const pending = (recommendations || []).filter(r => r.status === 'pending');
  const done = (recommendations || []).filter(r => r.status !== 'pending');

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: 20 }}>
        <h2 className={styles.title}>Acquisition Requests</h2>
        <p className={styles.subtitle}>{pending.length} pending · {done.length} resolved</p>
      </div>

      {pending.length === 0 && done.length === 0 && (
        <div className="empty-state"><div className="empty-icon">💡</div><h3>No requests yet</h3></div>
      )}

      {pending.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>⏳ Pending Review</h3>
          <div className={styles.list}>
            {pending.map(rec => (
              <div key={rec.id} className={`glass-card ${styles.card}`}>
                <div className={styles.cardLeft}>
                  <span className={styles.cardIcon}>📖</span>
                  <div>
                    <div className={styles.cardTitle}>{rec.title}</div>
                    <div className={styles.cardMeta}>by {rec.author} · {rec.category}</div>
                    <div className={styles.cardReason}>"{rec.reason}"</div>
                    <div className={styles.cardRequester}>Requested by <strong>{rec.requestedByName}</strong> · {new Date(rec.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleAction(rec, 'approved')}>✓ Approve</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleAction(rec, 'rejected')}>✕ Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>✓ Resolved</h3>
          <div className={styles.list}>
            {done.map(rec => (
              <div key={rec.id} className={`glass-card ${styles.card} ${styles.resolved}`}>
                <div className={styles.cardLeft}>
                  <span className={styles.cardIcon}>📖</span>
                  <div>
                    <div className={styles.cardTitle}>{rec.title}</div>
                    <div className={styles.cardMeta}>by {rec.author} · {rec.category}</div>
                    <div className={styles.cardRequester}>Requested by <strong>{rec.requestedByName}</strong></div>
                  </div>
                </div>
                <span className={`badge badge-${rec.status === 'approved' ? 'success' : 'danger'}`}>{rec.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
