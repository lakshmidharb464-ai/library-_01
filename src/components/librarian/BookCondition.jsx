import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import Modal from '../common/Modal';
import styles from './BookCondition.module.css';

const CONDITIONS = ['Good', 'Fair', 'Poor', 'Damaged'];
const CONDITION_META = {
  Good:    { color: '#00ffc8', icon: '✅', desc: 'Like new, no visible wear' },
  Fair:    { color: '#ffbe0b', icon: '🟡', desc: 'Minor wear, fully readable' },
  Poor:    { color: '#ff8c00', icon: '🟠', desc: 'Significant wear, still usable' },
  Damaged: { color: '#ff4d6d', icon: '❌', desc: 'Needs replacement or repair' },
};

export default function BookCondition() {
  const { books, bookConditions, dispatch, addToast } = useLibrary();
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState({ condition: 'Good', notes: '' });
  const [filter, setFilter] = useState('All');

  const getCondition = (bookId) => bookConditions.find(c => c.bookId === bookId) || { condition: 'Good', notes: '', lastChecked: null };

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch({
      type: 'UPDATE_CONDITION',
      condition: {
        bookId: editBook.id,
        condition: form.condition,
        notes: form.notes,
        lastChecked: new Date().toISOString(),
      },
    });
    addToast(`Condition for "${editBook.title}" updated`, 'success');
    setEditBook(null);
  };

  const openEdit = (book) => {
    const cond = getCondition(book.id);
    setForm({ condition: cond.condition, notes: cond.notes || '' });
    setEditBook(book);
  };

  // Summary counts
  const summary = CONDITIONS.reduce((acc, c) => {
    acc[c] = books.filter(b => getCondition(b.id).condition === c).length;
    return acc;
  }, {});

  const filtered = filter === 'All' ? books : books.filter(b => getCondition(b.id).condition === filter);

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: 16 }}>
        <h2 className={styles.title}>Book Condition Tracker</h2>
        <p className={styles.subtitle}>Monitor and update physical condition of all library books</p>
      </div>

      {/* Summary */}
      <div className={styles.summaryRow}>
        {['All', ...CONDITIONS].map(c => {
          const meta = c !== 'All' ? CONDITION_META[c] : null;
          const count = c === 'All' ? books.length : summary[c];
          return (
            <button
              key={c}
              className={`${styles.sumCard} ${filter === c ? styles.sumActive : ''}`}
              style={filter === c && meta ? { '--c': meta.color, borderColor: `${meta.color}50` } : {}}
              onClick={() => setFilter(c)}
            >
              <span className={styles.sumIcon}>{meta ? meta.icon : '📚'}</span>
              <span className={styles.sumCount} style={meta && filter === c ? { color: meta.color } : {}}>{count}</span>
              <span className={styles.sumLabel}>{c}</span>
            </button>
          );
        })}
      </div>

      {/* Books Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Book</th><th>Author</th><th>Category</th><th>Condition</th><th>Last Checked</th><th>Notes</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.map(book => {
              const cond = getCondition(book.id);
              const meta = CONDITION_META[cond.condition];
              return (
                <tr key={book.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: book.coverColor, flexShrink: 0 }} />
                      <strong>{book.title}</strong>
                    </div>
                  </td>
                  <td>{book.author}</td>
                  <td><span className="badge badge-info">{book.category}</span></td>
                  <td>
                    <span className="badge" style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}40` }}>
                      {meta.icon} {cond.condition}
                    </span>
                  </td>
                  <td style={{ color: 'rgba(232,244,255,0.45)', fontSize: '0.8rem' }}>
                    {cond.lastChecked ? new Date(cond.lastChecked).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(232,244,255,0.5)', fontSize: '0.8rem' }}>
                    {cond.notes || '—'}
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(book)}>Update</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editBook && (
        <Modal isOpen={true} onClose={() => setEditBook(null)} title={`Update Condition: ${editBook.title}`} size="sm">
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <div className={styles.conditionPicker}>
                {CONDITIONS.map(c => {
                  const meta = CONDITION_META[c];
                  return (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.condBtn} ${form.condition === c ? styles.condActive : ''}`}
                      style={form.condition === c ? { borderColor: `${meta.color}60`, background: `${meta.color}12`, color: meta.color } : {}}
                      onClick={() => setForm(f => ({ ...f, condition: c }))}
                    >
                      {meta.icon} {c}
                    </button>
                  );
                })}
              </div>
              {form.condition && (
                <p style={{ fontSize: '0.78rem', color: CONDITION_META[form.condition].color, marginTop: 6 }}>
                  {CONDITION_META[form.condition].desc}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" placeholder="Describe any damage or notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditBook(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Condition</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
