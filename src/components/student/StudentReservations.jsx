import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import styles from './StudentReservations.module.css';

export default function StudentReservations() {
  const { reservations, books, dispatch, addToast, currentUser } = useLibrary();
  const [bookId, setBookId] = useState('');

  const myReservations = reservations.filter(r => r.userId === currentUser?.id);
  const pending = myReservations.filter(r => r.status === 'pending');

  const handleReserve = (e) => {
    e.preventDefault();
    const alreadyReserved = pending.find(r => r.bookId === bookId);
    if (alreadyReserved) { addToast('You already have a pending reservation for this book', 'warning'); return; }
    dispatch({
      type: 'ADD_RESERVATION',
      reservation: {
        id: `res${Date.now()}`,
        bookId, userId: currentUser?.id,
        date: new Date().toISOString(),
        status: 'pending',
        expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      },
    });
    addToast('Reservation placed! The librarian will notify you when ready.', 'success');
    setBookId('');
  };

  const cancel = (res) => {
    dispatch({ type: 'UPDATE_RESERVATION', reservation: { ...res, status: 'cancelled' } });
    addToast('Reservation cancelled', 'info');
  };

  const STATUS_COLOR = { pending: '#ffbe0b', fulfilled: '#00ffc8', cancelled: '#ff4d6d' };

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: 16 }}>
        <h2 className={styles.title}>My Reservations</h2>
        <p className={styles.subtitle}>Reserve books currently unavailable · holds expire in 3 days</p>
      </div>

      {/* Info Banner */}
      <div className={styles.infoBanner}>
        <span>📌</span>
        <p>Reserve any book and get notified when it's ready for pickup. Holds expire after 3 days if not collected.</p>
      </div>

      {/* Reserve Form */}
      <div className={styles.formCard}>
        <h3 className={styles.formTitle}>Place a Hold</h3>
        <form onSubmit={handleReserve} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Select Book</label>
            <select className="form-select" value={bookId} onChange={e => setBookId(e.target.value)} required>
              <option value="">— Choose a book —</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title} {b.available === 0 ? '(All borrowed)' : `(${b.available} available)`}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">📌 Reserve</button>
        </form>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h3 className={styles.sectionTitle}>⏳ Active Holds ({pending.length})</h3>
          <div className={styles.list}>
            {pending.map(res => {
              const book = books.find(b => b.id === res.bookId);
              const daysLeft = Math.ceil((new Date(res.expiresAt) - Date.now()) / 86400000);
              return (
                <div key={res.id} className={styles.resCard}>
                  <div className={styles.coverDot} style={{ background: book?.coverColor || '#00b4d8' }}>📖</div>
                  <div className={styles.info}>
                    <div className={styles.resTitle}>{book?.title}</div>
                    <div className={styles.resMeta}>{book?.author}</div>
                    <div className={styles.resDate}>Reserved {new Date(res.date).toLocaleDateString()}</div>
                  </div>
                  <div className={styles.resRight}>
                    <span className="badge badge-warning">Expires in {daysLeft}d</span>
                    <button className="btn btn-danger btn-sm" onClick={() => cancel(res)}>Cancel</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      {myReservations.filter(r => r.status !== 'pending').length > 0 && (
        <div>
          <h3 className={styles.sectionTitle}>📋 History</h3>
          <div className={styles.list}>
            {myReservations.filter(r => r.status !== 'pending').map(res => {
              const book = books.find(b => b.id === res.bookId);
              return (
                <div key={res.id} className={`${styles.resCard} ${styles.resolved}`}>
                  <div className={styles.coverDot} style={{ background: book?.coverColor || '#00b4d8' }}>📖</div>
                  <div className={styles.info}>
                    <div className={styles.resTitle}>{book?.title}</div>
                    <div className={styles.resDate}>{new Date(res.date).toLocaleDateString()}</div>
                  </div>
                  <span className="badge" style={{ background: `${STATUS_COLOR[res.status]}18`, color: STATUS_COLOR[res.status], border: `1px solid ${STATUS_COLOR[res.status]}40` }}>
                    {res.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {myReservations.length === 0 && (
        <div className="empty-state"><div className="empty-icon">📌</div><h3>No reservations yet</h3></div>
      )}
    </div>
  );
}
