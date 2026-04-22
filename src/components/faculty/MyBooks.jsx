import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import Modal from '../common/Modal';
import BookScanner from '../shared/BookScanner';
import styles from '../shared/SharedAssets.module.css';

export default function MyBooks({ role = 'faculty' }) {
  const { transactions, books, currentUser, calculateFine, reviews } = useLibrary();
  const [viewBook, setViewBook] = useState(null);

  const myActive = transactions.filter(t => t.userId === currentUser?.id && t.status !== 'returned');
  const myHistory = transactions.filter(t => t.userId === currentUser?.id && t.status === 'returned');

  const renderLoan = (tx, isHistory = false) => {
    const book = books.find(b => b.id === tx.bookId);
    const fine = calculateFine(tx.dueDate);
    const isOverdue = !isHistory && new Date(tx.dueDate) < new Date();
    const daysLeft = Math.ceil((new Date(tx.dueDate) - Date.now()) / 86400000);

    return (
      <div 
        key={tx.id} 
        className={styles.assetCard} 
        style={{ opacity: isHistory ? 0.6 : 1, cursor: 'pointer' }}
        onClick={() => setViewBook(book)}
      >
        {!isHistory && (
          <div className={styles.assetStatus} style={{ color: isOverdue ? '#ff4d6d' : '#00ffc8' }}>
            {isOverdue ? 'CRITICAL_OVERDUE' : 'ACTIVE_LOAN'}
          </div>
        )}
        
        <div className={styles.coverBox} style={{ borderColor: `${book?.coverColor || '#00ffc8'}44` }}>
          <div className={styles.coverGlow} style={{ background: book?.coverColor || '#00ffc8' }} />
          📖
        </div>

        <div className={styles.content}>
          <h4 className={styles.title}>{book?.title}</h4>
          <p className={styles.author}>{book?.author}</p>
          
          <div className={styles.tags}>
            <span className={`badge badge-${isOverdue ? 'danger' : 'info'}`}>
              {isHistory ? 'Archived' : isOverdue ? 'Overdue' : 'On Loan'}
            </span>
            {fine > 0 && <span className="badge badge-warning">Fine: ₹{fine}</span>}
          </div>

          <div className={styles.telemetry}>
            <div>
              <div className={styles.telLabel}>{isHistory ? 'Returned' : 'Due Date'}</div>
              <div className={styles.telVal} style={{ color: isOverdue ? '#ff4d6d' : 'inherit' }}>
                {new Date(isHistory ? tx.returnDate : tx.dueDate).toLocaleDateString()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={styles.telLabel}>{isHistory ? 'Final Status' : 'Time Remaining'}</div>
              <div className={styles.telVal} style={{ color: isOverdue ? '#ff4d6d' : '#00ffc8' }}>
                {isHistory ? 'STABLE_CLOSED' : isOverdue ? `${Math.abs(daysLeft)}D_LAG` : `${daysLeft}D_REMAIN`}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <div style={{ fontSize: '0.65rem', color: '#00ffc8', fontFamily: 'Orbitron', letterSpacing: '0.2em', marginBottom: 4 }}>ASSET_INVENTORY // SECTOR-4</div>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.4rem', fontWeight: 800, color: '#e8f4ff', margin: 0 }}>My Books</h2>
        <p style={{ color: 'rgba(232,244,255,0.45)', fontSize: '0.85rem', marginTop: 2 }}>{myActive.length} assets deployed · {myHistory.length} archived</p>
      </header>

      {myActive.length > 0 && (
        <section>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(232,244,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Currently Deployed</h3>
          <div className={styles.assetGrid}>
            {myActive.map(tx => renderLoan(tx, false))}
          </div>
        </section>
      )}

      {myHistory.length > 0 && (
        <section>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(232,244,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>System Archive</h3>
          <div className={styles.assetGrid}>
            {myHistory.map(tx => renderLoan(tx, true))}
          </div>
        </section>
      )}

      {myActive.length === 0 && myHistory.length === 0 && (
        <div className="empty-state"><div className="empty-icon">📂</div><h3>DATABASE_EMPTY</h3></div>
      )}

      {viewBook && (
        <Modal isOpen={true} onClose={() => setViewBook(null)} title="Asset Telemetry" size="lg">
          <BookScanner book={viewBook} reviews={reviews.filter(r => r.bookId === viewBook.id)} />
        </Modal>
      )}
    </div>
  );
}
