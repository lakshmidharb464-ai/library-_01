import { useLibrary } from '../../contexts/LibraryContext';
import TelemetryHUD from '../shared/TelemetryHUD';
import styles from './LibrarianDashboard.module.css';

export default function LibrarianDashboard() {
  const { transactions, books, users, calculateFine, currentUser } = useLibrary();
  const active = transactions.filter(t => t.status !== 'returned');
  const overdue = active.filter(t => new Date(t.dueDate) < new Date());
  const returned = transactions.filter(t => t.status === 'returned');
  const totalFines = returned.reduce((s, t) => s + (t.fine || 0), 0);

  const recent = [...active].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)).slice(0, 8);

  const metrics = [
    { label: 'Active Issues', val: active.length, max: 20, color: '#00ffc8', cAlpha: 'rgba(0,255,200,0.25)', icon: '📤' },
    { label: 'Overdue', val: overdue.length, max: 10, color: '#ff4d6d', cAlpha: 'rgba(255,77,109,0.25)', icon: '⚠️' },
    { label: 'Returned Today', val: returned.filter(t => new Date(t.returnDate).toDateString() === new Date().toDateString()).length, max: 10, color: '#00b4d8', cAlpha: 'rgba(0,180,216,0.25)', icon: '📥' },
    { label: 'Fines Collected', val: `₹${totalFines}`, max: 1000, color: '#ffd700', cAlpha: 'rgba(255,215,0,0.25)', icon: '💰' },
  ];

  return (
    <div className={`${styles.page} animate-fade-in`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Librarian Hub</h2>
          <p className={styles.sub}>
            Welcome back, <strong style={{color: 'white'}}>{currentUser?.name}</strong> &bull; Operational Dashboard Active
          </p>
        </div>
        <div className={styles.liveBadge}><span className={styles.dot}/> System Live</div>
      </div>

      <TelemetryHUD metrics={metrics} />

      {overdue.length > 0 && (
        <div className={styles.alert}>
          <span>⚠️</span>
          <div>
            <div style={{ color: '#ff4d6d', fontSize: '1.2rem', fontFamily: 'Orbitron', fontWeight: 800, textShadow: '0 0 10px rgba(255,77,109,0.5)' }}>
              CRITICAL: {overdue.length} OVERDUE ASSET{overdue.length > 1 ? 'S' : ''}!
            </div>
            <div style={{ color: 'rgba(232,244,255,0.7)', fontSize: '0.9rem', marginTop: 4 }}>
              Negative compounding active at ₹2/day baseline rate.
            </div>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Global Active Loans Matrix</div>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Resource Asset</th>
              <th>Member Entity</th>
              <th>Privilege</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Current Fine</th>
              <th>Status Marker</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'rgba(232,244,255,0.3)' }}>No active loans registered</td></tr>
            ) : recent.map(tx => {
              const book = books.find(b => b.id === tx.bookId);
              const user = users.find(u => u.id === tx.userId);
              const fine = calculateFine(tx.dueDate);
              const isOverdue = new Date(tx.dueDate) < new Date();
              return (
                <tr key={tx.id} className={`${isOverdue ? styles.overdueRow : ''} haptic-pulse`}>
                  <td>
                    <strong style={{ color: book?.coverColor || '#00ffc8' }}>
                      {book?.title || 'Unknown'}
                    </strong>
                  </td>
                  <td>{user?.name || 'Unknown'}</td>
                  <td><span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>{user?.role}</span></td>
                  <td style={{fontFamily: 'monospace', opacity: 0.8}}>{new Date(tx.issueDate).toLocaleDateString()}</td>
                  <td style={{ color: isOverdue ? '#ff4d6d' : '#00ffc8', fontFamily: 'monospace' }}>
                    {new Date(tx.dueDate).toLocaleDateString()}
                  </td>
                  <td style={{ color: fine > 0 ? '#ff4d6d' : '#00ffc8', fontWeight: 700, textShadow: fine > 0 ? '0 0 10px rgba(255,77,109,0.4)' : 'none' }}>
                    ₹{fine}
                  </td>
                  <td>
                    <span className={`badge badge-${isOverdue ? 'danger' : 'warning'} animate-glow-pulse`}>
                      {isOverdue ? 'BREACH' : 'ACTIVE'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
