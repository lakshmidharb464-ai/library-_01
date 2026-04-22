import { useState, useEffect } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import styles from './BookScanner.module.css';

export default function BookScanner({ book, reviews = [] }) {
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState([]);
  const { transactions, currentUser, dispatch, addToast, settings } = useLibrary();

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setScanning(false), 500);
      }
    }, 20);

    const s = [
      { label: 'ASSET_ID', value: `LN-${book.id.toUpperCase()}` },
      { label: 'HASH_VERIFY', value: 'SHA-256_STABLE', color: '#00ffc8' },
      { label: 'RATING_INDEX', value: `${book.rating}/5.0` },
      { label: 'POPULARITY', value: 'HIGH_DEMAND', color: '#ffbe0b' },
    ];
    setStats(s);

    return () => clearInterval(interval);
  }, [book.id, book.rating]);

  const myActive = transactions.filter(t => t.userId === currentUser?.id && t.status !== 'returned');
  const maxBooks = currentUser?.role === 'faculty' ? settings.maxBooksPerFaculty : settings.maxBooksPerStudent;
  const canBorrow = myActive.length < maxBooks && book.available > 0;
  
  const handleBorrow = () => {
    if (!canBorrow) {
      addToast(book.available === 0 ? 'Asset exhausted in local sector.' : 'Sector protocol limit reached.', 'error');
      return;
    }
    
    dispatch({
      type: 'ISSUE_BOOK',
      transaction: {
        id: `t${Date.now()}`,
        bookId: book.id,
        userId: currentUser?.id,
        type: 'issue',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + (currentUser?.role === 'faculty' ? 30 : 14) * 86400000).toISOString(),
        returnDate: null,
        fine: 0,
        status: 'active'
      }
    });
    addToast(`Asset "${book.title}" acquired. Synchronization successful.`, 'success');
  };

  const handleReserve = () => {
    dispatch({
      type: 'ADD_RESERVATION',
      reservation: {
        id: `res${Date.now()}`,
        bookId: book.id,
        userId: currentUser?.id,
        date: new Date().toISOString(),
        status: 'pending',
        expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      },
    });
    addToast(`Reservation queued for "${book.title}".`, 'success');
  };

  return (
    <div className={styles.scannerBody}>
      {/* Target Acquisition HUD */}
      <div className={styles.targetBox}>
        <div className={styles.cornerT} />
        <div className={styles.cornerB} />
        
        <div className={styles.coverWrap} style={{ '--theme': book.coverColor }}>
          <span className={styles.bookEmoji}>📖</span>
          <div className={styles.coverGlow} />
          {scanning && <div className={styles.scanBeam} style={{ top: `${progress}%` }} />}
        </div>

        <div className={styles.telemetryOverlay}>
          <div className={styles.lineGlow} style={{ height: `${progress}%` }} />
          <div className={styles.hudText}>{scanning ? 'ACQUIRING_ASSET_METADATA...' : 'ASSET_ACQUIRED_STABLE'}</div>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <header className={styles.header}>
          <h2 className={styles.title} style={{ color: book.coverColor }}>{book.title}</h2>
          <p className={styles.subtitle}>AUTHOR_ENTITY: {book.author}</p>
        </header>

        <div className={styles.statsGrid}>
          {stats.map(s => (
            <div key={s.label} className={styles.statLine}>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statDots} />
              <span className={styles.statValue} style={s.color ? { color: s.color } : {}}>{s.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.metaRow}>
          <div className={styles.metaCol}>
            <span className={styles.metaLabel}>GENRE_CLASS</span>
            <span className={styles.metaValue}>{book.category.toUpperCase()}</span>
          </div>
          <div className={styles.metaCol}>
            <span className={styles.metaLabel}>CHRONO_INDEX</span>
            <span className={styles.metaValue}>{book.year}</span>
          </div>
          <div className={styles.metaCol}>
            <span className={styles.metaLabel}>UNIT_AVAIL</span>
            <span className={styles.metaValue} style={{ color: book.available > 0 ? '#00ffc8' : '#ff4d6d' }}>
              {book.available} / {book.copies}
            </span>
          </div>
        </div>

        {/* Action Layer */}
        {!scanning && (
          <div className={styles.actionLayer}>
            {book.available > 0 ? (
              <button 
                className={`${styles.actionBtn} ${!canBorrow ? styles.btnDisabled : ''}`} 
                onClick={handleBorrow}
                disabled={!canBorrow}
              >
                <span className={styles.btnIcon}>⚡</span>
                <span className={styles.btnText}>INITIALIZE_LOAN</span>
                <span className={styles.btnSub}>[{myActive.length}/{maxBooks} PROTOCOLS]</span>
              </button>
            ) : (
              <button className={styles.actionBtn} onClick={handleReserve} style={{ '--btn-theme': '#ffbe0b' }}>
                <span className={styles.btnIcon}>🔖</span>
                <span className={styles.btnText}>QUEUE_RESERVATION</span>
                <span className={styles.btnSub}>[NOTIFY_UPON_RETURN]</span>
              </button>
            )}
            <div className={styles.securitySeal}>// SECURED_BY_LIBRANOVA_CORE</div>
          </div>
        )}

        {/* Member Feedback Matrix */}
        <div className={styles.reviewSection}>
          <h4 className={styles.sectionHeader}>// NEURAL_FEEDBACK_MATRIX</h4>
          <div className={styles.reviewList}>
            {reviews.length > 0 ? reviews.slice(0, 2).map(r => (
              <div key={r.id} className={styles.reviewCard}>
                <div className={styles.revHeader}>
                  <span className={styles.revUser}>{r.userName.toUpperCase()}</span>
                  <span className={styles.revStars}>{'★'.repeat(r.rating)}</span>
                </div>
                <p className={styles.revText}>"{r.comment}"</p>
              </div>
            )) : <div className={styles.emptyReviews}>NO_NEURAL_LOGS_DETECTED</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
