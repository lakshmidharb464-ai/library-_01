import { useLibrary } from '../../contexts/LibraryContext';
import TelemetryHUD from '../shared/TelemetryHUD';
import styles from './AdminDashboard.module.css';

const STAT_CONFIG = [
  { key: 'totalBooks',   label: 'Total Books',    icon: '📚', color: '#00ffc8', max: 100 },
  { key: 'totalUsers',   label: 'Total Members',  icon: '👥', color: '#7b2fff', max: 50 },
  { key: 'activeIssues', label: 'Active Issues',  icon: '📤', color: '#00b4d8', max: 20 },
  { key: 'overdueCount', label: 'Overdue',        icon: '⚠️', color: '#ff4d6d', max: 10 },
  { key: 'pendingFines', label: 'Pending Fines',  icon: '💰', color: '#ffd700', max: 1000 },
  { key: 'pendingRecommendations', label: 'Requests', icon: '💡', color: '#ffbe0b', max: 10 },
];

export default function AdminDashboard() {
  const { getStats, transactions, books, users, currentUser } = useLibrary();
  const stats = getStats();

  const recentTx = [...transactions]
    .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
    .slice(0, 6);

  return (
    <div className={`${styles.dashboard} animate-fade-in`}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Admin Nexus</h2>
          <p className={styles.pageSubtitle}>
            Welcome back, <strong style={{color: 'white'}}>{currentUser?.name || 'Administrator'}</strong> &bull; Complete system telemetry active
          </p>
        </div>
        <div className={styles.liveBadge}>
          <span className={styles.liveDot} />
          System Live
        </div>
      </div>

      {/* Stat Cards via HUD */}
      <TelemetryHUD 
        metrics={STAT_CONFIG.map(cfg => ({
          ...cfg,
          val: cfg.key === 'pendingFines' ? `₹${stats[cfg.key]}` : stats[cfg.key],
          cAlpha: `${cfg.color}22` // increased opacity for the flare
        }))} 
      />

      {/* Lower Dashboard Grid */}
      <div className={styles.lowerGrid}>
        
        {/* Recent Transactions: Futuristic Data Table */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Transactions</h3>
            <span className="badge badge-info animate-glow-pulse" style={{boxShadow: '0 0 10px #00b4d8'}}>
              {transactions.length} total logs
            </span>
          </div>
          
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Resource Asset</th>
                <th>Member Entity</th>
                <th>Log Type</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.map(tx => {
                const book = books.find(b => b.id === tx.bookId);
                const user = users.find(u => u.id === tx.userId);
                const overdue = tx.status !== 'returned' && new Date(tx.dueDate) < new Date();
                return (
                  <tr key={tx.id} className="haptic-pulse">
                    <td>
                      <strong style={{ color: book?.coverColor || '#fff' }}>
                        {book?.title || 'Unknown'}
                      </strong>
                    </td>
                    <td>{user?.name || 'Unknown'}</td>
                    <td>
                      <span className={`badge badge-${tx.type === 'return' ? 'success' : 'info'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{fontFamily: 'monospace', opacity: 0.8}}>
                      {new Date(tx.issueDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge badge-${tx.status === 'returned' ? 'success' : overdue ? 'danger' : 'warning'}`}>
                        {overdue && tx.status !== 'returned' ? 'CRITICAL OVERDUE' : tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Book Inventory: High-Fidelity List */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Inventory Telemetry</h3>
            <span className="badge badge-success animate-glow-pulse" style={{boxShadow: '0 0 10px #00ffc8'}}>
              {stats.availableBooks} Avail
            </span>
          </div>
          
          <div className={styles.bookList}>
            {books.slice(0, 5).map((book, i) => {
              const copiesNum = parseInt(book.copies) || 1;
              const availNum = parseInt(book.available) || 0;
              const pct = Math.round((availNum / copiesNum) * 100);
              const statusColor = pct > 50 ? '#00ffc8' : pct > 20 ? '#ffbe0b' : '#ff4d6d';

              return (
                <div 
                  key={book.id || i} 
                  className={`${styles.bookRow} stagger-${Math.min(i+1, 6)} animate-slide-left`}
                  style={{ '--row-color': book.coverColor || '#00ffc8' }}
                >
                  <div 
                    className={styles.bookDot} 
                    style={{ 
                      background: `linear-gradient(135deg, ${book.coverColor}dd, ${book.coverColor}44)`,
                      borderColor: book.coverColor 
                    }} 
                  />
                  <div className={styles.bookInfo}>
                    <span className={styles.bookTitle}>{book.title}</span>
                    <span className={styles.bookAuthor}>{book.author}</span>
                  </div>
                  <div className={styles.bookAvail}>
                    <span style={{ color: statusColor, textShadow: `0 0 10px ${statusColor}88` }}>
                      {availNum}/{copiesNum}
                    </span>
                    <div className={styles.bookAvailProgress}>
                      <div 
                        className={styles.bookAvailFill} 
                        style={{ width: `${pct}%`, background: statusColor, color: statusColor }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
