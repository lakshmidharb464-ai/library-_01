import { useLibrary } from '../../contexts/LibraryContext';
import styles from './Analytics.module.css';

export default function Analytics() {
  const { books, users, transactions, calculateFine, getBook, getUser } = useLibrary();

  const categoryStats = books.reduce((acc, b) => {
    acc[b.category] = (acc[b.category] || 0) + 1;
    return acc;
  }, {});
  const maxCat = Math.max(...Object.values(categoryStats));

  const roleStats = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const overdue = transactions.filter(t => t.status !== 'returned' && new Date(t.dueDate) < new Date());
  const totalFines = transactions.filter(t => t.status === 'returned').reduce((s, t) => s + (t.fine || 0), 0);
  const pendingFines = overdue.reduce((s, t) => s + calculateFine(t.dueDate), 0);

  const topRated = [...books].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const mostBorrowed = books.map(b => ({
    ...b,
    count: transactions.filter(t => t.bookId === b.id).length,
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const recentTransactions = [...transactions].sort((a, b) => new Date(b.issueDate || b.timestamp) - new Date(a.issueDate || a.timestamp)).slice(0, 6);

  const ROLE_COLORS = { student: '#00b4d8', faculty: '#7b2fff', librarian: '#00ffc8', admin: '#ff4d6d' };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>System Analytics</h2>
          <p className={styles.subtitle}>Real-time telemetry from Nexus Core</p>
        </div>
        <div className={styles.statusPulse}>
          <div className={styles.pulseDot} />
          <span>DATA_STREAM_ACTIVE</span>
        </div>
      </header>

      {/* Primary KPI Dashboard */}
      <div className={styles.kpiRow}>
        {[
          { label: 'System Requests', value: transactions.length, color: '#00b4d8', sub: 'Total Operations' },
          { label: 'Active Streams', value: transactions.filter(t => t.status === 'active').length, color: '#00ffc8', sub: 'Current Loans' },
          { label: 'Overdue Latency', value: overdue.length, color: '#ff4d6d', sub: 'Critical Delays' },
          { label: 'Credits_Sync', value: `₹${totalFines}`, color: '#ffd700', sub: 'Fines Harvested' },
          { label: 'Pending_Sync', value: `₹${pendingFines}`, color: '#ffbe0b', sub: 'Estimated Returns' },
        ].map(kpi => (
          <div key={kpi.label} className={styles.kpiCard} style={{ '--c': kpi.color }}>
            <div className={styles.kpiGrid} />
            <div className={styles.kpiData}>
              <span className={styles.kpiSub}>{kpi.sub}</span>
              <div className={styles.kpiValue}>{kpi.value}</div>
              <div className={styles.kpiLabel}>{kpi.label}</div>
            </div>
            <div className={styles.kpiGlow} />
          </div>
        ))}
      </div>

      <div className={styles.mainGrid}>
        {/* Category Frequency (Left Column) */}
        <div className={styles.col1}>
          <div className={styles.telemetrySection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Asset Classification</h3>
              <span className={styles.telemetryTag}>CATEGORIES</span>
            </div>
            <div className={styles.barChart}>
              {Object.entries(categoryStats).sort((a,b) => b[1]-a[1]).map(([cat, count]) => (
                <div key={cat} className={styles.barRow}>
                  <div className={styles.barInfo}>
                    <span className={styles.barLabel}>{cat}</span>
                    <span className={styles.barVal}>{count} Units</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${(count/maxCat)*100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.telemetrySection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Identity Distribution</h3>
              <span className={styles.telemetryTag}>ROLES</span>
            </div>
            <div className={styles.roleGrid}>
              {Object.entries(roleStats).map(([role, count]) => {
                const pct = Math.round((count / users.length) * 100);
                return (
                  <div key={role} className={styles.roleBox} style={{ '--c': ROLE_COLORS[role] }}>
                    <div className={styles.rolePulse} />
                    <div className={styles.roleInfo}>
                      <span className={styles.roleName}>{role}</span>
                      <span className={styles.rolePct}>{pct}%</span>
                    </div>
                    <div className={styles.roleValue}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Pulse Stream (Center Column) */}
        <div className={styles.col2}>
          <div className={styles.telemetrySection} style={{ height: '100%' }}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Recent System Pulses</h3>
              <span className={styles.telemetryTag}>LIVE_FETCH</span>
            </div>
            <div className={styles.pulseStream}>
              {recentTransactions.map((tx, i) => {
                const book = getBook(tx.bookId);
                const user = getUser(tx.userId);
                return (
                  <div key={tx.id || i} className={styles.pulseItem}>
                    <div className={styles.pulseLine} />
                    <div className={styles.pulseContent}>
                      <div className={styles.pulseMeta}>
                        <span className={styles.pulseType}>{tx.type.toUpperCase()}</span>
                        <span className={styles.pulseTime}>{new Date(tx.issueDate || tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={styles.pulseDetail}>
                        <span className={styles.pulseAsset}>{book?.title || 'Unknown Asset'}</span>
                        <span className={styles.pulseUser}>{user?.name || 'Unknown Subject'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {recentTransactions.length === 0 && (
                <div className={styles.emptyPulse}>NO_RECENT_TRANSMISSIONS</div>
              )}
            </div>
            <div className={styles.streamFooter}>
              <span>ENCRYPTED_LINK_STEADY</span>
            </div>
          </div>
        </div>

        {/* Top Asset Tracking (Right Column) */}
        <div className={styles.col3}>
          <div className={styles.telemetrySection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Premium Curations</h3>
              <span className={styles.telemetryTag}>RATING_MAX</span>
            </div>
            <div className={styles.assetList}>
              {topRated.map((b, i) => (
                <div key={b.id} className={styles.assetItem}>
                  <div className={styles.assetRank}>{i+1}</div>
                  <div className={styles.assetInfo}>
                    <span className={styles.assetTitle}>{b.title}</span>
                    <span className={styles.assetMetrics}>SCORE: {b.rating} // {b.category}</span>
                  </div>
                  <div className={styles.assetGlow} style={{ background: b.coverColor }} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.telemetrySection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>High Demand Velocity</h3>
              <span className={styles.telemetryTag}>BORROW_DELTA</span>
            </div>
            <div className={styles.assetList}>
              {mostBorrowed.map((b, i) => (
                <div key={b.id} className={styles.assetItem}>
                  <div className={styles.assetRank}>{i+1}</div>
                  <div className={styles.assetInfo}>
                    <span className={styles.assetTitle}>{b.title}</span>
                    <span className={styles.assetMetrics}>CYCLES: {b.count} // {b.author}</span>
                  </div>
                  <div className={styles.assetGlow} style={{ background: b.coverColor }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
