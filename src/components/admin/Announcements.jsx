import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import styles from './Announcements.module.css';

const PRIORITIES = ['info', 'success', 'warning', 'danger'];
const PRIORITY_ICONS = { info: 'ℹ️', success: '✅', warning: '⚠️', danger: '🚨' };
const PRIORITY_LABELS = { info: 'Info', success: 'Good News', warning: 'Warning', danger: 'Urgent' };

const emptyForm = { title: '', body: '', priority: 'info', pinned: false };

export default function Announcements() {
  const { announcements, dispatch, addToast, currentUser } = useLibrary();
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const handlePost = (e) => {
    e.preventDefault();
    dispatch({
      type: 'ADD_ANNOUNCEMENT',
      ann: {
        id: `a${Date.now()}`,
        ...form,
        author: currentUser?.name || 'Admin',
        date: new Date().toISOString(),
      },
    });
    addToast('Announcement posted to all portals!', 'success');
    setForm(emptyForm);
    setShowForm(false);
  };

  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.date) - new Date(a.date);
  });

  const PRIORITY_COLORS = {
    info:    { bg: 'rgba(0,180,216,0.1)',  border: 'rgba(0,180,216,0.3)',  text: '#00b4d8' },
    success: { bg: 'rgba(0,255,200,0.1)',  border: 'rgba(0,255,200,0.3)',  text: '#00ffc8' },
    warning: { bg: 'rgba(255,190,11,0.1)', border: 'rgba(255,190,11,0.3)', text: '#ffbe0b' },
    danger:  { bg: 'rgba(255,77,109,0.1)', border: 'rgba(255,77,109,0.3)', text: '#ff4d6d' },
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Announcements</h2>
          <p className={styles.subtitle}>Broadcasts to all library portals · {announcements.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ New Announcement'}
        </button>
      </div>

      {/* Compose Form */}
      {showForm && (
        <div className={styles.composeCard}>
          <h3 className={styles.composeTitle}>📢 Compose Announcement</h3>
          <form onSubmit={handlePost} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" required placeholder="Announcement title…" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="form-textarea" required rows={4} placeholder="Write your message here…" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
            </div>
            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <div className={styles.priorityPicker}>
                  {PRIORITIES.map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`${styles.pBtn} ${form.priority === p ? styles.pActive : ''}`}
                      style={form.priority === p ? { borderColor: PRIORITY_COLORS[p].border, color: PRIORITY_COLORS[p].text, background: PRIORITY_COLORS[p].bg } : {}}
                      onClick={() => setForm(f => ({ ...f, priority: p }))}
                    >
                      {PRIORITY_ICONS[p]} {PRIORITY_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.pinToggle}>
                <label className="form-label">Pin to top</label>
                <button
                  type="button"
                  className={`${styles.toggle} ${form.pinned ? styles.toggleOn : ''}`}
                  onClick={() => setForm(f => ({ ...f, pinned: !f.pinned }))}
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">📢 Post Announcement</button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      {sorted.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📢</div><h3>No announcements yet</h3></div>
      ) : (
        <div className={styles.list}>
          {sorted.map(ann => {
            const c = PRIORITY_COLORS[ann.priority];
            return (
              <div key={ann.id} className={styles.annCard} style={{ background: c.bg, borderColor: c.border }}>
                {ann.pinned && <span className={styles.pinBadge}>📌 Pinned</span>}
                <div className={styles.annHeader}>
                  <div className={styles.annLeft}>
                    <span className={styles.annIcon}>{PRIORITY_ICONS[ann.priority]}</span>
                    <div>
                      <h4 className={styles.annTitle} style={{ color: c.text }}>{ann.title}</h4>
                      <span className={styles.annMeta}>
                        By {ann.author} · {new Date(ann.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className={styles.annActions}>
                    <button
                      className={`${styles.annBtn} ${ann.pinned ? styles.pinnedBtn : ''}`}
                      onClick={() => dispatch({ type: 'PIN_ANNOUNCEMENT', id: ann.id })}
                      title={ann.pinned ? 'Unpin' : 'Pin'}
                    >📌</button>
                    <button
                      className={`${styles.annBtn} ${styles.deleteBtn}`}
                      onClick={() => { dispatch({ type: 'DELETE_ANNOUNCEMENT', id: ann.id }); addToast('Announcement deleted', 'warning'); }}
                      title="Delete"
                    >🗑️</button>
                  </div>
                </div>
                <p className={styles.annBody}>{ann.body}</p>
                <div className={styles.annFooter}>
                  <span className="badge" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                    {PRIORITY_LABELS[ann.priority]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
