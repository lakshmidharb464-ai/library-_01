import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import styles from './IssueReturn.module.css';

export default function IssueReturn() {
  const { books, users, transactions, settings, dispatch, addToast, calculateFine, apiFetch, fetchData } = useLibrary();
  const [tab, setTab] = useState('issue');

  // Issue state
  const [issueBook, setIssueBook] = useState('');
  const [issueUser, setIssueUser] = useState('');

  // Return state
  const [returnTxId, setReturnTxId] = useState('');

  const handleIssue = async (e) => {
    e.preventDefault();
    const book = books.find(b => b.id === issueBook);
    const user = users.find(u => u.id === issueUser);
    if (!book || !user) return;
    
    try {
      const data = await apiFetch('/transactions/issue', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, bookId: book.id })
      });
      
      addToast(`"${book.title}" issued to ${user.name}`, 'success');
      setIssueBook(''); setIssueUser('');
      fetchData(); // Refresh all state from backend
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleReturn = async (tx) => {
    try {
      const data = await apiFetch('/transactions/return', {
        method: 'POST',
        body: JSON.stringify({ transactionId: tx.id })
      });
      
      const fine = data.data.fineAmount || 0;
      const book = books.find(b => b.id === tx.bookId);
      addToast(`"${book?.title}" returned${fine > 0 ? ` — Fine: ₹${fine}` : ' — No fine'}`, fine > 0 ? 'warning' : 'success');
      fetchData(); // Refresh all state
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const activeTx = transactions.filter(t => t.status !== 'Returned');
  const selectedTx = activeTx.find(t => t.id === returnTxId);
  const previewFine = selectedTx ? calculateFine(selectedTx.dueDate) : 0;

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: 20 }}>
        <h2 className={styles.title}>Issue & Return</h2>
        <p className={styles.subtitle}>Manage book loans and returns</p>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'issue' ? styles.active : ''}`} onClick={() => setTab('issue')}>📤 Issue Book</button>
        <button className={`${styles.tab} ${tab === 'return' ? styles.activeReturn : ''}`} onClick={() => setTab('return')}>📥 Return Book</button>
      </div>

      {tab === 'issue' && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 className={styles.sectionTitle}>Issue a Book</h3>
          <form onSubmit={handleIssue} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Select Book</label>
              <select className="form-select" value={issueBook} onChange={e => setIssueBook(e.target.value)} required>
                <option value="">— Choose a book —</option>
                {books.filter(b => b.available > 0).map(b => (
                  <option key={b.id} value={b.id}>{b.title} ({b.available} available)</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Select Member</label>
              <select className="form-select" value={issueUser} onChange={e => setIssueUser(e.target.value)} required>
                <option value="">— Choose a member —</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            {issueUser && (
              <div className={styles.info}>
                ⏱ Loan period: <strong style={{ color: '#00ffc8' }}>{users.find(u => u.id === issueUser)?.role === 'faculty' ? '30' : '14'} days</strong>
              </div>
            )}
            <button type="submit" className="btn btn-primary">Issue Book</button>
          </form>
        </div>
      )}

      {tab === 'return' && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 className={styles.sectionTitle}>Process Return</h3>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Select Active Loan</label>
            <select className="form-select" value={returnTxId} onChange={e => setReturnTxId(e.target.value)}>
              <option value="">— Choose loan to return —</option>
              {activeTx.map(tx => {
                const b = books.find(bk => bk.id === tx.bookId);
                const u = users.find(us => us.id === tx.userId);
                const overdue = new Date(tx.dueDate) < new Date();
                return (
                  <option key={tx.id} value={tx.id}>
                    {b?.title} — {u?.name} {overdue ? '⚠️ OVERDUE' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedTx && (
            <div className={styles.returnPreview}>
              <div className={styles.previewRow}>
                <span>Book</span>
                <strong>{books.find(b => b.id === selectedTx.bookId)?.title}</strong>
              </div>
              <div className={styles.previewRow}>
                <span>Member</span>
                <strong>{users.find(u => u.id === selectedTx.userId)?.name}</strong>
              </div>
              <div className={styles.previewRow}>
                <span>Due Date</span>
                <strong style={{ color: new Date(selectedTx.dueDate) < new Date() ? '#ff4d6d' : '#00ffc8' }}>
                  {new Date(selectedTx.dueDate).toLocaleDateString()}
                </strong>
              </div>
              <div className={styles.previewRow}>
                <span>Fine</span>
                <strong style={{ color: previewFine > 0 ? '#ff4d6d' : '#00ffc8', fontSize: '1.1rem' }}>
                  ₹{previewFine} {previewFine > 0 ? `(₹${settings.finePerDay || 5}/day)` : '(No fine)'}
                </strong>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={() => { handleReturn(selectedTx); setReturnTxId(''); }}>
                Confirm Return
              </button>
            </div>
          )}

          {activeTx.length === 0 && (
            <div className="empty-state"><div className="empty-icon">📥</div><h3>No active loans to return</h3></div>
          )}
        </div>
      )}
    </div>
  );
}
