import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import Modal from '../common/Modal';
import styles from './ReadingProgress.module.css';

export default function ReadingProgress() {
  const { readingProgress, books, dispatch, addToast, currentUser, apiFetch } = useLibrary();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ bookId: '', totalPages: 300, currentPage: 0, notes: '', status: 'reading' });

  const myProgress = readingProgress.filter(p => p.userId === currentUser?.id);

  const handleAdd = async (e) => {
    e.preventDefault();
    const existing = myProgress.find(p => p.bookId === form.bookId);
    const progressData = {
      userId: currentUser?.id,
      bookId: form.bookId,
      totalPages: +form.totalPages,
      currentPage: +form.currentPage,
      notes: form.notes,
      status: form.status,
    };

    try {
      const res = await apiFetch('/faculty/progress', {
        method: 'POST',
        body: JSON.stringify(progressData),
      });
      dispatch({ type: 'UPSERT_PROGRESS', progress: { ...res.data, id: res.data._id || res.data.id } });
      addToast(existing ? 'Progress updated!' : 'Book added to reading tracker!', 'success');
      setModal(false);
      setForm({ bookId: '', totalPages: 300, currentPage: 0, notes: '', status: 'reading' });
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this book from your tracker?')) return;
    try {
      await apiFetch(`/faculty/progress/${id}`, { method: 'DELETE' });
      dispatch({ type: 'DELETE_PROGRESS', id });
      addToast('Removed from tracker', 'warning');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const STATUS_META = {
    reading:   { color: '#00d2ff', icon: '📖', label: 'Reading' },
    completed: { color: '#00ffc8', icon: '✅', label: 'Completed' },
    paused:    { color: '#ffcc33', icon: '⏸️', label: 'Paused' },
    abandoned: { color: '#ff4d6d', icon: '🚫', label: 'Dropped' },
  };

  const openEdit = (p) => {
    setForm({ bookId: p.bookId, totalPages: p.totalPages, currentPage: p.currentPage, notes: p.notes, status: p.status });
    setModal(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Reading Progress</h2>
          <p className={styles.subtitle}>Track what you've read and your progress across the collection</p>
        </div>
        <button className="btn btn-purple" onClick={() => { setForm({ bookId: '', totalPages: 300, currentPage: 0, notes: '', status: 'reading' }); setModal(true); }}>
          + Track Book
        </button>
      </div>

      {/* Stats strip */}
      {myProgress.length > 0 && (
        <div className={styles.statsStrip}>
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <div key={key} className={styles.stripItem} style={{ '--c': meta.color }}>
              <strong>{myProgress.filter(p => p.status === key).length}</strong>
              <span>{meta.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Cards */}
      {myProgress.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" style={{ filter: 'drop-shadow(0 0 20px rgba(123, 47, 255, 0.4))' }}>📈</div>
          <h3 style={{ fontFamily: 'Orbitron', letterSpacing: '1px' }}>No Active Trackers</h3>
          <p style={{ fontSize: '0.9rem', color: 'rgba(232, 244, 255, 0.4)', maxWidth: '400px', margin: '12px auto 24px' }}>
            Initialize your reading telemetry. Click the button above to begin tracking your scholarly progress.
          </p>
          <button className="btn btn-purple" onClick={() => setModal(true)}>Initialize Tracker</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {myProgress.map(p => {
            const book = books.find(b => b.id === p.bookId);
            const pct = Math.round((p.currentPage / p.totalPages) * 100);
            const meta = STATUS_META[p.status];
            return (
              <div key={p.id} className={styles.card} style={{ '--c': meta.color }}>
                <div className={styles.cardTop}>
                  <div className={styles.cardCover} style={{ 
                    background: `linear-gradient(135deg, ${meta.color}22, ${meta.color}11)`,
                    border: `1px solid ${meta.color}44`,
                    color: meta.color,
                    textShadow: `0 0 10px ${meta.color}66`
                  }}>📖</div>
                  <div className={styles.cardInfo}>
                    <h4 className={styles.cardTitle}>{book?.title || 'Unknown Book'}</h4>
                    <p className={styles.cardAuthor}>{book?.author}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: 8 }}>
                      <span className="badge" style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}40` }}>
                        {meta.icon} {meta.label}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleDelete(p.id)}>✕</button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span>Page {p.currentPage} / {p.totalPages}</span>
                    <span style={{ color: meta.color }}>{pct}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '6px', background: 'rgba(255,255,255,0.05)' }}>
                    <div className="progress-fill" style={{ 
                      width: `${pct}%`, 
                      background: `linear-gradient(90deg, ${meta.color}, ${meta.color}88)`,
                      boxShadow: `0 0 10px ${meta.color}44`
                    }} />
                  </div>
                </div>

                {p.notes && (
                  <div className={styles.notes}>
                    <span className={styles.notesLabel}>Protocol Notes</span>
                    {p.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Track Reading Progress" size="sm">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Book</label>
            <select className="form-select" required value={form.bookId} onChange={e => setForm(f => ({ ...f, bookId: e.target.value }))}>
              <option value="">— Choose a book —</option>
              {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Total Pages</label>
              <input type="number" min={1} className="form-input" value={form.totalPages} onChange={e => setForm(f => ({ ...f, totalPages: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Current Page</label>
              <input type="number" min={0} max={form.totalPages} className="form-input" value={form.currentPage} onChange={e => setForm(f => ({ ...f, currentPage: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="reading">📖 Reading</option>
              <option value="completed">✅ Completed</option>
              <option value="paused">⏸️ Paused</option>
              <option value="abandoned">🚫 Dropped</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" placeholder="Key takeaways, thoughts…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-purple">Save Progress</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
