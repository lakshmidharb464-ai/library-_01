import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import Modal from '../common/Modal';
import styles from './PeerStudyGroups.module.css';

export default function PeerStudyGroups() {
  const { studyGroups, books, users, currentUser, dispatch, addToast } = useLibrary();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', topic: '', bookId: '', meetingFrequency: 'Weekly' });

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch({
      type: 'ADD_GROUP',
      group: {
        id: `sg${Date.now()}`,
        name: form.name,
        topic: form.topic,
        bookId: form.bookId,
        meetingFrequency: form.meetingFrequency,
        ownerId: currentUser.id,
        members: [currentUser.id],
        created: new Date().toISOString(),
      },
    });
    addToast(`Group "${form.name}" created!`, 'success');
    setModal(false);
    setForm({ name: '', topic: '', bookId: '', meetingFrequency: 'Weekly' });
  };

  const joinGroup = (groupId) => {
    dispatch({ type: 'JOIN_GROUP', groupId, userId: currentUser.id });
    addToast('Joined study group', 'success');
  };

  const leaveGroup = (groupId) => {
    dispatch({ type: 'LEAVE_GROUP', groupId, userId: currentUser.id });
    addToast('Left study group', 'info');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Peer Study Groups</h2>
          <p className={styles.subtitle}>Collaborate, track group progress, and study together</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Create Group</button>
      </div>

      <div className={styles.grid}>
        {studyGroups.map(group => {
          const book = books.find(b => b.id === group.bookId);
          const owner = users.find(u => u.id === group.ownerId);
          const amMember = group.members.includes(currentUser.id);
          const isOwner = group.ownerId === currentUser.id;

          return (
            <div key={group.id} className={`${styles.card} ${amMember ? styles.myGroup : ''}`}>
              {amMember && <div className={styles.memberBadge}>Joined</div>}
              
              <div className={styles.cardHeader}>
                <h3 className={styles.groupName}>{group.name}</h3>
                <span className="badge badge-info">{group.topic}</span>
              </div>
              
              <div className={styles.metaData}>
                <div className={styles.metaRow}><span>👑 Admin:</span> {owner?.name || 'Unknown'}</div>
                <div className={styles.metaRow}><span>👥 Members:</span> {group.members.length}</div>
                <div className={styles.metaRow}><span>📅 Meets:</span> {group.meetingFrequency}</div>
              </div>

              {book && (
                <div className={styles.bookFocus}>
                  <div className={styles.bCover} style={{ background: book.coverColor || '#00b4d8' }}>📖</div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#00b4d8', fontWeight: 700, textTransform: 'uppercase' }}>Focus Book</div>
                    <div className={styles.bTitle}>{book.title}</div>
                  </div>
                </div>
              )}

              <div className={styles.actions}>
                {amMember ? (
                  <>
                    <button className="btn btn-secondary btn-sm" disabled>✓ Member</button>
                    {!isOwner && <button className="btn btn-danger btn-sm" onClick={() => leaveGroup(group.id)}>Leave</button>}
                    {isOwner && <button className="btn btn-danger btn-sm" onClick={() => { dispatch({ type: 'DELETE_GROUP', id: group.id }); addToast('Group deleted', 'warning'); }}>Delete</button>}
                  </>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => joinGroup(group.id)}>Join Group</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {studyGroups.length === 0 && (
        <div className="empty-state"><div className="empty-icon">🤝</div><h3>No study groups yet</h3><p>Be the first to create one!</p></div>
      )}

      {/* Create Modal */}
      {modal && (
        <Modal isOpen={true} onClose={() => setModal(false)} title="Create Study Group" size="sm">
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Group Name</label>
              <input required className="form-input" placeholder="e.g. Algo Masters" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Topic Area</label>
              <input required className="form-input" placeholder="e.g. Computer Science" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Focus Book (Optional)</label>
              <select className="form-select" value={form.bookId} onChange={e => setForm(f => ({ ...f, bookId: e.target.value}))}>
                <option value="">— No specific book —</option>
                {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Meeting Frequency</label>
              <select className="form-select" value={form.meetingFrequency} onChange={e => setForm(f => ({ ...f, meetingFrequency: e.target.value}))}>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Bi-weekly</option>
                <option>Monthly</option>
                <option>Asynchronous</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Group</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
