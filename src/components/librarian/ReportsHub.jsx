import { useLibrary } from '../../contexts/LibraryContext';

export default function ReportsHub() {
  const { transactions, books, users } = useLibrary();

  const issued = transactions.filter(t => t.type === 'issue');
  const returned = transactions.filter(t => t.status === 'returned');
  const overdue = transactions.filter(t => t.status !== 'returned' && new Date(t.dueDate) < new Date());
  const totalFines = returned.reduce((s, t) => s + (t.fine || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.4rem', fontWeight: 800, color: '#e8f4ff' }}>Reports Hub</h2>
        <p style={{ color: 'rgba(232,244,255,0.45)', fontSize: '0.85rem', marginTop: 2 }}>Comprehensive transaction audit</p>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 14 }}>
        {[
          { label: 'Total Issues', val: issued.length, color: '#00b4d8' },
          { label: 'Total Returns', val: returned.length, color: '#00ffc8' },
          { label: 'Overdue', val: overdue.length, color: '#ff4d6d' },
          { label: 'Fines Collected', val: `₹${totalFines}`, color: '#ffd700' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(232,244,255,0.45)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Full Transaction Log */}
      <div className="glass-card" style={{ padding: 20 }}>
        <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.8rem', fontWeight: 700, color: 'rgba(232,244,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Full Transaction Log</h3>
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Book</th><th>Member</th><th>Issued</th><th>Due</th><th>Returned</th><th>Fine</th><th>Status</th></tr>
          </thead>
          <tbody>
            {[...transactions].reverse().map((tx, i) => {
              const book = books.find(b => b.id === tx.bookId);
              const user = users.find(u => u.id === tx.userId);
              const overdue = tx.status !== 'returned' && new Date(tx.dueDate) < new Date();
              return (
                <tr key={tx.id}>
                  <td style={{ color: 'rgba(232,244,255,0.3)', fontFamily: 'Orbitron', fontSize: '0.7rem' }}>{transactions.length - i}</td>
                  <td><strong>{book?.title || '—'}</strong></td>
                  <td>{user?.name || '—'}</td>
                  <td>{new Date(tx.issueDate).toLocaleDateString()}</td>
                  <td style={{ color: new Date(tx.dueDate) < new Date() && tx.status !== 'returned' ? '#ff4d6d' : 'inherit' }}>
                    {new Date(tx.dueDate).toLocaleDateString()}
                  </td>
                  <td>{tx.returnDate ? new Date(tx.returnDate).toLocaleDateString() : '—'}</td>
                  <td style={{ color: tx.fine > 0 ? '#ff4d6d' : '#00ffc8', fontWeight: 700 }}>
                    {tx.fine > 0 ? `₹${tx.fine}` : '—'}
                  </td>
                  <td><span className={`badge badge-${tx.status === 'returned' ? 'success' : overdue ? 'danger' : 'warning'}`}>
                    {overdue && tx.status !== 'returned' ? 'overdue' : tx.status}
                  </span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
