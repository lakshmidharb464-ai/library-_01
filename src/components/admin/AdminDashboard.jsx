import { useLibrary } from '../../contexts/LibraryContext';
import TelemetryHUD from '../shared/TelemetryHUD';
import SystemHealthChart from './SystemHealthChart';
import styles from './AdminDashboard.module.css';

const STAT_CONFIG = [
  { key: 'totalBooks',   label: 'Archive Assets',    icon: '📚', color: '#00ffc8', max: 100 },
  { key: 'totalUsers',   label: 'Authorized Entities',  icon: '👥', color: '#7b2fff', max: 50 },
  { key: 'activeIssues', label: 'Active Protocols',  icon: '📤', color: '#00b4d8', max: 20 },
  { key: 'overdueCount', label: 'Breach Protocols',  icon: '⚠️', color: '#ff4d6d', max: 10 },
  { key: 'pendingFines', label: 'Fiscal Drift',      icon: '💰', color: '#ffd700', max: 1000 },
  { key: 'pendingRecommendations', label: 'Asset Requests', icon: '💡', color: '#ffbe0b', max: 10 },
  { key: 'systemSync',   label: 'System Sync',       icon: '📡', color: '#00ffc8', max: 100 },
];

export default function AdminDashboard() {
  const { getStats, transactions, books, users, currentUser, systemStatus, auditLogs } = useLibrary();
  const stats = getStats();

  const recentTx = [...transactions]
    .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
    .slice(0, 6);

  // Process real telemetry from auditLogs
  const processTelemetry = () => {
    const logs = [...auditLogs || []].reverse();
    if (logs.length === 0) return { load: [0, 0, 0, 0, 0, 0, 0], security: [100, 100, 100, 100, 100, 100, 100] };

    // Group logs into 7 buckets (e.g., last 7 days or sessions)
    const buckets = 7;
    const loadTrend = new Array(buckets).fill(0);
    const securityTrend = new Array(buckets).fill(100);

    const logCount = logs.length;
    const bucketSize = Math.max(1, Math.floor(logCount / buckets));

    for (let i = 0; i < buckets; i++) {
      const start = i * bucketSize;
      const end = Math.min((i + 1) * bucketSize, logCount);
      const bucketLogs = logs.slice(start, end);
      
      // Load = normalized count of logs in this bucket
      loadTrend[i] = Math.min(100, Math.round((bucketLogs.length / (bucketSize || 1)) * 50 + 20));
      
      // Security = 100 - (percentage of 'SECURITY' alerts in this bucket)
      const securityAlerts = bucketLogs.filter(l => l.action === 'SECURITY' && (l.details.toLowerCase().includes('failed') || l.details.toLowerCase().includes('breach'))).length;
      securityTrend[i] = Math.max(0, 100 - Math.round((securityAlerts / (bucketLogs.length || 1)) * 100));
    }

    return { loadTrend, securityTrend };
  };

  const { loadTrend, securityTrend } = processTelemetry();

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
          val: cfg.key === 'pendingFines' ? `₹${stats[cfg.key]}` : 
               cfg.key === 'systemSync' ? stats.onlineStatus.toUpperCase() : 
               stats[cfg.key],
          cAlpha: `${cfg.color}22` 
        }))} 
      />

      {/* Advanced Telemetry Section */}
      <div className={styles.telemetryGrid}>
        <SystemHealthChart data={loadTrend} label="Neural Load Telemetry" color="#00ffc8" />
        <SystemHealthChart data={securityTrend} label="Security Integrity Sync" color="#7b2fff" />
      </div>

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
