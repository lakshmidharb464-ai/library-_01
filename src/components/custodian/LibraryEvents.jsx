import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import Modal from '../common/Modal';
import styles from './LibraryEvents.module.css';

export default function LibraryEvents() {
  const { events, users, dispatch, addToast, currentUser } = useLibrary();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', type: 'Workshop', maxAttendees: 50 });

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch({
      type: 'ADD_EVENT',
      event: {
        id: `ev${Date.now()}`,
        title: form.title,
        date: new Date(`${form.date}T${form.time}`).toISOString(),
        type: form.type,
        organizer: currentUser.id,
        attendees: 0,
        maxAttendees: +form.maxAttendees,
        status: 'Upcoming',
      },
    });
    addToast('Event created successfully!', 'success');
    setModal(false);
    setForm({ title: '', date: '', time: '', type: 'Workshop', maxAttendees: 50 });
  };

  const TYPE_COLORS = {
    'Workshop': '#00ffc8',
    'Book Club': '#7b2fff',
    'Author Talk': '#ffbe0b',
    'Seminar': '#00b4d8',
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Event Manager</h2>
          <p className={styles.subtitle}>Schedule and manage library workshops and book clubs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Schedule Event</button>
      </div>

      <div className={styles.list}>
        {events.map(event => {
          const org = users.find(u => u.id === event.organizer);
          const color = TYPE_COLORS[event.type] || '#fff';
          const evDate = new Date(event.date);

          return (
            <div key={event.id} className={styles.card}>
              <div className={styles.dateBlock} style={{ '--c': color }}>
                <div className={styles.month}>{evDate.toLocaleString('default', { month: 'short' })}</div>
                <div className={styles.day}>{evDate.getDate()}</div>
                <div className={styles.time}>{evDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              
              <div className={styles.info}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className={styles.evTitle}>{event.title}</h3>
                  <span className="badge" style={{ background: `${color}20`, color, borderColor: `${color}40` }}>{event.type}</span>
                </div>
                <div className={styles.evMeta}>Organized by {org?.name || 'Unknown'}</div>
                
                <div className={styles.progressContainer}>
                  <div className={styles.progressLabel}>
                    <span>RSVPs</span>
                    <span>{event.attendees} / {event.maxAttendees}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(event.attendees/event.maxAttendees)*100}%`, background: color }} />
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button className="btn btn-secondary btn-sm">Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => { dispatch({ type: 'DELETE_EVENT', id: event.id }); addToast('Event cancelled', 'warning'); }}>Cancel</button>
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="empty-state"><div className="empty-icon">📅</div><h3>No upcoming events</h3></div>
      )}

      {/* Editor Modal */}
      {modal && (
        <Modal isOpen={true} onClose={() => setModal(false)} title="Schedule Event">
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input required className="form-input" placeholder="e.g. Intro to React Workshop" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value}))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input required type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input required type="time" className="form-input" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value}))} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value}))}>
                  {Object.keys(TYPE_COLORS).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Max Attendees</label>
                <input required type="number" min="1" className="form-input" value={form.maxAttendees} onChange={e => setForm(f => ({ ...f, maxAttendees: e.target.value}))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Schedule</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
