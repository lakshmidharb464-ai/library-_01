import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import Modal from '../common/Modal';
import BookScanner from '../shared/BookScanner';
import TelemetryHUD from '../shared/TelemetryHUD';
import NeuroPulse from '../shared/NeuroPulse';
import styles from './FacultyDashboard.module.css';

export default function FacultyDashboard() {
  const { transactions, books, currentUser, calculateFine, recommendations, systemStatus, reviews } = useLibrary();
  const navigate = useNavigate();
  const [viewBook, setViewBook] = useState(null);

  const myTx = transactions.filter(t => t.userId === currentUser?.id);
  const active = myTx.filter(t => t.status !== 'returned');
  const overdue = active.filter(t => new Date(t.dueDate) < new Date());
  const myRecs = recommendations.filter(r => r.requestedBy === currentUser?.id);
  const pendingFines = overdue.reduce((s, t) => s + calculateFine(t.dueDate), 0);

  const metrics = [
    { label: 'Active Protocols', val: active.length, max: 10, color: '#7b2fff', cAlpha: 'rgba(123,47,255,0.2)', icon: '🧠' },
    { label: 'Breach Alerts', val: overdue.length, max: 5, color: '#ff4d6d', cAlpha: 'rgba(255,77,109,0.2)', icon: '🔥' },
    { label: 'Fiscal Drift', val: `₹${pendingFines}`, max: 1000, color: '#ffbe0b', cAlpha: 'rgba(255,190,11,0.2)', icon: '💰' },
    { 
      label: 'System Sync', 
      val: systemStatus?.online ? (systemStatus?.dbConnected ? 'ONLINE' : 'DEGRADED') : 'OFFLINE', 
      max: 100, 
      color: systemStatus?.online ? (systemStatus?.dbConnected ? '#00ffc8' : '#ffbe0b') : '#ff4d6d', 
      cAlpha: systemStatus?.online ? (systemStatus?.dbConnected ? 'rgba(0,255,200,0.2)' : 'rgba(255,190,11,0.2)') : 'rgba(255,77,109,0.2)', 
      icon: '📡' 
    },
  ];

  return (
    <div className={styles.overmind}>
      <div className={styles.neuroPulseContainer}>
        <NeuroPulse />
      </div>

      <header className={styles.header}>
        <div className={styles.ident}>
          <div className={styles.portalTag}>FACULTY OVERMIND // NEXUS-7</div>
          <h1 className={styles.title}>{currentUser?.name}</h1>
          <div className={styles.deptSub}>{currentUser?.department} // STRATEGIC ACCESS ACTIVE</div>
        </div>
        <div className={styles.loanSector}>
          <div className={styles.sectorLabel}>LOAN LIFESPAN</div>
          <div className={styles.sectorVal}>30<small>DAYS</small></div>
        </div>
      </header>

      <TelemetryHUD metrics={metrics} />

      <main className={styles.grid}>
        <section className={`${styles.panel} glass-card`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}>📊</span>
            <h3 className={styles.panelTitle}>STRATEGIC ASSET MATRIX</h3>
            <span className={styles.panelStatus}>LIVE TELEMETRY</span>
          </div>

          {active.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🛰️</div>
              <p>NO ACTIVE ASSETS IN CURRENT SECTOR</p>
            </div>
          ) : (
            <div className={styles.assetList}>
              {active.map((tx, i) => {
                const book = books.find(b => b.id === tx.bookId);
                const isOverdue = new Date(tx.dueDate) < new Date();
                const daysLeft = Math.ceil((new Date(tx.dueDate) - Date.now()) / 86400000);
                const progress = Math.max(0, Math.min(100, (daysLeft / 30) * 100));

                return (
                  <div 
                    key={tx.id} 
                    className={styles.assetItem} 
                    style={{ borderLeftColor: book?.coverColor, cursor: 'pointer' }}
                    onClick={() => setViewBook(book)}
                  >
                    <div className={styles.assetMain}>
                      <div className={styles.assetInfo}>
                        <div className={styles.assetTitle}>{book?.title}</div>
                        <div className={styles.assetAuthor}>{book?.author}</div>
                      </div>
                      <div className={styles.assetTelemetry}>
                        <div className={styles.telemetryVal} style={{ color: isOverdue ? '#ff4d6d' : daysLeft <= 5 ? '#ffbe0b' : '#00ffc8' }}>
                          {isOverdue ? `${Math.abs(daysLeft)}D DELAY` : `${daysLeft}D REMAINING`}
                        </div>
                        <div className={styles.telemetryBar}>
                          <div 
                            className={styles.telemetryFill} 
                            style={{ 
                              width: `${progress}%`, 
                              backgroundColor: isOverdue ? '#ff4d6d' : book?.coverColor || '#7b2fff',
                              boxShadow: `0 0 10px ${isOverdue ? '#ff4d6d' : book?.coverColor || '#7b2fff'}88`
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
            <div className={styles.miniHeader}>CORE SYSTEMS</div>
            <div className={styles.systemGrid}>
              {[
                { name: 'Syllabi', icon: '📝', link: '/faculty/syllabus' },
                { name: 'Bibliography', icon: '📚', link: '/faculty/bibliography' },
                { name: 'Asset Scanner', icon: '⚡', link: '/faculty/browse' },
                { name: 'Requests', icon: '➕', link: '/faculty/recommendations' },
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
            <div className={`${styles.breachCard} glass-card`}>
              <div className={styles.breachHeader}>⚠️ PROTOCOL BREACH</div>
              <div className={styles.breachBody}>
                <div className={styles.breachStat}>
                  <span className={styles.breachVal}>{overdue.length}</span>
                  <span className={styles.breachLabel}>ASSETS DEFERRED</span>
                </div>
                <div className={styles.breachStat}>
                  <span className={styles.breachVal}>₹{pendingFines}</span>
                  <span className={styles.breachLabel}>FISCAL PENALTY</span>
                </div>
              </div>
              <div className={styles.breachFooter}>IMMEDIATE RESTORATION REQUIRED</div>
            </div>
          )}
        </section>
      </main>

      {viewBook && (
        <Modal isOpen={true} onClose={() => setViewBook(null)} title="System Asset Calibration" size="lg">
          <BookScanner book={viewBook} reviews={reviews.filter(r => r.bookId === viewBook.id)} />
        </Modal>
      )}
    </div>
  );
}

