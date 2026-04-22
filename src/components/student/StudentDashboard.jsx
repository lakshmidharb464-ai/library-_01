import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../../contexts/LibraryContext';
import TelemetryHUD from '../shared/TelemetryHUD';
import NeuroPulse from '../shared/NeuroPulse';
import styles from './StudentDashboard.module.css';

export default function StudentDashboard() {
  const { transactions, books, currentUser, calculateFine, systemStatus } = useLibrary();
  const navigate = useNavigate();

  const myTx = transactions.filter(t => t.userId === currentUser?.id);
  const active = myTx.filter(t => t.status !== 'returned');
  const overdue = active.filter(t => new Date(t.dueDate) < new Date());
  
  const dueSoon = active.filter(t => {
    const days = Math.ceil((new Date(t.dueDate) - Date.now()) / 86400000);
    return days >= 0 && days <= 3;
  });
  
  const pendingFines = overdue.reduce((s, t) => s + calculateFine(t.dueDate), 0);
  
  const metrics = [
    { label: 'Active Protocols', val: active.length, max: 3, color: '#00ffc8', cAlpha: 'rgba(0,255,200,0.2)', icon: '📚' },
    { label: 'Warning Phase', val: dueSoon.length, max: 3, color: '#ffbe0b', cAlpha: 'rgba(255,190,11,0.2)', icon: '⏰' },
    { label: 'System Breach', val: overdue.length, max: 2, color: '#ff4d6d', cAlpha: 'rgba(255,77,109,0.2)', icon: '⚠️' },
    { 
      label: 'System Sync', 
      val: systemStatus?.online ? (systemStatus?.dbConnected ? 'ONLINE' : 'DEGRADED') : 'OFFLINE', 
      max: 100, 
      color: systemStatus?.online ? (systemStatus?.dbConnected ? '#00ffc8' : '#ffbe0b') : '#ff4d6d', 
      cAlpha: systemStatus?.online ? (systemStatus?.dbConnected ? 'rgba(0,255,200,0.2)' : 'rgba(255,190,11,0.2)') : 'rgba(255,77,109,0.2)', 
      icon: '🕸️' 
    },
  ];

  return (
    <div className={styles.nexus}>
      <div className={styles.neuroPulseContainer}>
        <NeuroPulse />
      </div>

      <header className={styles.header}>
        <div className={styles.ident}>
          <div className={styles.portalTag}>STUDENT NEXUS // SECTOR-4</div>
          <h1 className={styles.title}>{currentUser?.name}</h1>
          <div className={styles.deptSub}>{currentUser?.department} // ENCRYPTED CONNECTION</div>
        </div>
        <div className={styles.loanSector}>
          <div className={styles.sectorLabel}>SECTOR PROTOCOL</div>
          <div className={styles.sectorVal}>14<small>DAYS</small></div>
        </div>
      </header>

      <TelemetryHUD metrics={metrics} />

      <main className={styles.grid}>
        <section className={`${styles.panel} glass-card`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}>🛰️</span>
            <h3 className={styles.panelTitle}>ACTIVE ASSET MATRIX</h3>
            <span className={styles.panelStatus}>ENCRYPTED FEED</span>
          </div>

          {active.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🌫️</div>
              <p>NO ACTIVE PROTOCOLS IN CURRENT SPHERE</p>
              <button className={styles.browseBtn} onClick={() => navigate('/student/books')}>INITIATE ARCHIVE SEARCH</button>
            </div>
          ) : (
            <div className={styles.assetList}>
              {active.map((tx, i) => {
                const book = books.find(b => b.id === tx.bookId);
                const isOverdue = new Date(tx.dueDate) < new Date();
                const daysLeft = Math.ceil((new Date(tx.dueDate) - Date.now()) / 86400000);
                const progress = Math.max(0, Math.min(100, (daysLeft / 14) * 100));

                return (
                  <div key={tx.id} className={styles.assetItem} style={{ borderLeftColor: book?.coverColor || '#00ffc8' }}>
                    <div className={styles.assetMain}>
                      <div className={styles.assetInfo}>
                        <div className={styles.assetTitle}>{book?.title}</div>
                        <div className={styles.assetAuthor}>{book?.author}</div>
                      </div>
                      <div className={styles.assetTelemetry}>
                        <div className={styles.telemetryVal} style={{ color: isOverdue ? '#ff4d6d' : daysLeft <= 3 ? '#ffbe0b' : '#00ffc8' }}>
                          {isOverdue ? `${Math.abs(daysLeft)}D DELAY` : `${daysLeft}D REMAINING`}
                        </div>
                        <div className={styles.telemetryBar}>
                          <div 
                            className={styles.telemetryFill} 
                            style={{ 
                              width: `${progress}%`, 
                              backgroundColor: isOverdue ? '#ff4d6d' : book?.coverColor || '#00ffc8',
                              boxShadow: `0 0 10px ${isOverdue ? '#ff4d6d' : book?.coverColor || '#00ffc8'}88`
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.sidePanel}>
          <div className={`${styles.miniCard} glass-card`}>
            <div className={styles.miniHeader}>NODE SERVICES</div>
            <div className={styles.systemGrid}>
              {[
                { name: 'Reservations', icon: '🔖', link: '/student/reservations' },
                { name: 'Study Groups', icon: '👥', link: '/student/groups' },
                { name: 'Reading Goals', icon: '🎯', link: '/student/goals' },
                { name: 'Study Timer', icon: '⌛', link: '/student/timer' },
              ].map(sys => (
                <div 
                  key={sys.name} 
                  className={styles.systemItem}
                  onClick={() => navigate(sys.link)}
                >
                  <span className={styles.sysIcon}>{sys.icon}</span>
                  <span className={styles.sysName}>{sys.name}</span>
                </div>
              ))}
            </div>
          </div>

          {overdue.length > 0 && (
            <div className={`${styles.hazardCard} glass-card`}>
              <div className={styles.hazardHeader}>🛑 CRITICAL BREACH</div>
              <div className={styles.hazardBody}>
                <div className={styles.hazardDesc}>Negative financial compounding active within local sector.</div>
                <div className={styles.hazardStat}>
                  <span className={styles.hazardVal}>₹{pendingFines}</span>
                  <span className={styles.hazardLabel}>ACCUMULATED PENALTY</span>
                </div>
              </div>
              <button className={styles.hazardAction}>HALT COMPOUNDING</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

