import { useLibrary } from '../../contexts/LibraryContext';
import styles from './FinesEngine.module.css';

export default function FinesEngine() {
  const { transactions, books, users, calculateFine, dispatch, addToast } = useLibrary();

  const overdueTx = transactions.filter(t =>
    t.status !== 'returned' && new Date(t.dueDate) < new Date()
  );

  const returned = transactions.filter(t => t.status === 'returned' && t.fine > 0);
  const totalCollected = returned.reduce((s, t) => s + t.fine, 0);
  const pendingFines = overdueTx.reduce((s, t) => s + calculateFine(t.dueDate), 0);

  const handleCollect = (tx) => {
    const fine = calculateFine(tx.dueDate);
    dispatch({ type: 'RETURN_BOOK', transactionId: tx.id, fine, returnDate: new Date().toISOString() });
    const book = books.find(b => b.id === tx.bookId);
    addToast(`Fine of ₹${fine} collected for "${book?.title}"`, 'success');
  };

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: 20 }}>
        <h2 className={styles.title}>Fines Engine</h2>
        <p className={styles.subtitle}>Track and collect overdue penalties (₹2/day)</p>
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryCard} style={{ '--c': '#ff4d6d' }}>
          <span>⚠️</span>
          <div>
            <div className={styles.summaryVal}>₹{pendingFines}</div>
            <div className={styles.summaryLabel}>Pending Fines</div>
          </div>
        </div>
        <div className={styles.summaryCard} style={{ '--c': '#00ffc8' }}>
          <span>✓</span>
          <div>
            <div className={styles.summaryVal}>₹{totalCollected}</div>
            <div className={styles.summaryLabel}>Total Collected</div>
          </div>
        </div>
        <div className={styles.summaryCard} style={{ '--c': '#ffbe0b' }}>
          <span>📋</span>
          <div>
            <div className={styles.summaryVal}>{overdueTx.length}</div>
            <div className={styles.summaryLabel}>Overdue Books</div>
          </div>
        </div>
      </div>

      {/* Overdue List */}
      <div className="glass-card" style={{ padding: 20 }}>
        <h3 className={styles.sectionTitle}>Overdue Books — Action Required</h3>
        {overdueTx.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>All clear! No overdue books.</h3>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Book</th><th>Member</th><th>Due Date</th><th>Days Overdue</th><th>Fine</th><th>Action</th></tr>
            </thead>
            <tbody>
              {overdueTx.map(tx => {
                const book = books.find(b => b.id === tx.bookId);
                const user = users.find(u => u.id === tx.userId);
                const daysOverdue = Math.floor((Date.now() - new Date(tx.dueDate)) / 86400000);
                const fine = calculateFine(tx.dueDate);
                return (
                  <tr key={tx.id}>
                    <td><strong>{book?.title}</strong></td>
                    <td>{user?.name}</td>
                    <td style={{ color: '#ff4d6d' }}>{new Date(tx.dueDate).toLocaleDateString()}</td>
                    <td><span className="badge badge-danger">{daysOverdue} days</span></td>
                    <td><strong style={{ color: '#ff4d6d', fontFamily: 'Orbitron', fontSize: '0.9rem' }}>₹{fine}</strong></td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => handleCollect(tx)}>
                        Collect & Return
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Fine History */}
      {returned.length > 0 && (
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 className={styles.sectionTitle}>Fine Collection History</h3>
          <table className="data-table">
            <thead>
              <tr><th>Book</th><th>Member</th><th>Return Date</th><th>Fine Paid</th></tr>
            </thead>
            <tbody>
              {returned.slice(-8).reverse().map(tx => {
                const book = books.find(b => b.id === tx.bookId);
                const user = users.find(u => u.id === tx.userId);
                return (
                  <tr key={tx.id}>
                    <td>{book?.title}</td>
                    <td>{user?.name}</td>
                    <td>{new Date(tx.returnDate).toLocaleDateString()}</td>
                    <td><span className="badge badge-warning" style={{ fontFamily: 'Orbitron' }}>₹{tx.fine}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
