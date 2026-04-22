import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import styles from './Reservations.module.css';

export default function Reservations() {
  const { reservations, books, users, dispatch, addToast } = useLibrary();
  const [bookId, setBookId] = useState('');
  const [userId, setUserId] = useState('');

  const handleReserve = (e) => {
    e.preventDefault();
    const existing = reservations.find(r => r.bookId === bookId && r.userId === userId && r.status === 'pending');
    if (existing) { addToast('This member already has a pending reservation for that book', 'warning'); return; }
    dispatch({
      type: 'ADD_RESERVATION',
      reservation: {
        id: `res${Date.now()}`,
        bookId, userId,
        date: new Date().toISOString(),
        status: 'pending',
        expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      },
    });
    addToast('Reservation created — expires in 3 days', 'success');
    setBookId(''); setUserId('');
  };

  const fulfill = (res) => {
    dispatch({ type: 'UPDATE_RESERVATION', reservation: { ...res, status: 'fulfilled' } });
    addToast('Reservation fulfilled!', 'success');
  };

  const cancel = (res) => {
    dispatch({ type: 'UPDATE_RESERVATION', reservation: { ...res, status: 'cancelled' } });
    addToast('Reservation cancelled', 'warning');
  };

  const pending = reservations.filter(r => r.status === 'pending');
  const done    = reservations.filter(r => r.status !== 'pending');

  const STATUS_COLOR = { pending: '#ffbe0b', fulfilled: '#00ffc8', cancelled: '#ff4d6d', expired: '#7b2fff' };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Book Reservations</h2>
          <p className={styles.subtitle}>{pending.length} pending · Holds expire after 3 days</p>
        </div>
      </div>

      {/* New Reservation */}
      <div className={styles.formCard}>
        <h3 className={styles.formTitle}>📌 Create Reservation / Hold</h3>
        <form onSubmit={handleReserve} className={styles.formRow}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Book</label>
            <select className="form-select" value={bookId} onChange={e => setBookId(e.target.value)} required>
              <option value="">— Choose book —</option>
              {books.map(b => <option key={b.id} value={b.id}>{b.title} ({b.available} avail.)</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Member</label>
            <select className="form-select" value={userId} onChange={e => setUserId(e.target.value)} required>
              <option value="">— Choose member —</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Reserve</button>
        </form>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>⏳ Pending Holds</h3>
          <div className={styles.list}>
            {pending.map(res => {
              const book = books.find(b => b.id === res.bookId);
              const user = users.find(u => u.id === res.userId);
              const daysLeft = Math.ceil((new Date(res.expiresAt) - Date.now()) / 86400000);
              return (
                <div key={res.id} className={styles.resCard}>
                  <div className={styles.resLeft}>
                    <div className={styles.resBookDot} style={{ background: book?.coverColor || '#ffbe0b' }} />
                    <div>
                      <div className={styles.resTitle}>{book?.title || 'Unknown'}</div>
                      <div className={styles.resMeta}>{user?.name} · {user?.role}</div>
                      <div className={styles.resDate}>Reserved {new Date(res.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className={styles.resRight}>
                    <span style={{ color: daysLeft <= 1 ? '#ff4d6d' : '#ffbe0b', fontSize: '0.8rem', fontWeight: 700 }}>
                      Expires in {daysLeft}d
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => fulfill(res)}>✓ Fulfill</button>
                      <button className="btn btn-danger btn-sm" onClick={() => cancel(res)}>✕ Cancel</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      {done.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>📋 Reservation History</h3>
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr><th>Book</th><th>Member</th><th>Reserved</th><th>Status</th></tr>
              </thead>
              <tbody>
                {done.map(res => {
                  const book = books.find(b => b.id === res.bookId);
                  const user = users.find(u => u.id === res.userId);
                  return (
                    <tr key={res.id}>
                      <td><strong>{book?.title}</strong></td>
                      <td>{user?.name}</td>
                      <td>{new Date(res.date).toLocaleDateString()}</td>
                      <td>
                        <span className="badge" style={{ background: `${STATUS_COLOR[res.status]}20`, color: STATUS_COLOR[res.status], border: `1px solid ${STATUS_COLOR[res.status]}50` }}>
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reservations.length === 0 && (
        <div className="empty-state"><div className="empty-icon">📌</div><h3>No reservations yet</h3></div>
      )}
    </div>
  );
}
