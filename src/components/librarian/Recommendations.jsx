import { useLibrary } from '../../contexts/LibraryContext';

export default function Recommendations() {
  const { recommendations, dispatch, addToast } = useLibrary();

  const pending = recommendations.filter(r => r.status === 'pending');
  const done = recommendations.filter(r => r.status !== 'pending');

  const handleApprove = (rec) => { dispatch({ type: 'UPDATE_RECOMMENDATION', rec: { ...rec, status: 'approved' } }); addToast(`"${rec.title}" approved for acquisition`, 'success'); };
  const handleReject  = (rec) => { dispatch({ type: 'UPDATE_RECOMMENDATION', rec: { ...rec, status: 'rejected' } }); addToast(`"${rec.title}" rejected`, 'warning'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.4rem', fontWeight: 800, color: '#e8f4ff' }}>Recommendations</h2>
        <p style={{ color: 'rgba(232,244,255,0.45)', fontSize: '0.85rem', marginTop: 2 }}>Faculty book acquisition requests</p>
      </div>

      {pending.length === 0 && done.length === 0 && (
        <div className="empty-state"><div className="empty-icon">💡</div><h3>No recommendations yet</h3></div>
      )}

      {pending.map(rec => (
        <div key={rec.id} className="glass-card" style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 700, color: '#e8f4ff', marginBottom: 2 }}>{rec.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(232,244,255,0.5)' }}>by {rec.author} · {rec.category}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(232,244,255,0.4)', marginTop: 6, fontStyle: 'italic' }}>"{rec.reason}"</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(232,244,255,0.35)', marginTop: 4 }}>— {rec.requestedByName}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="btn btn-primary btn-sm" onClick={() => handleApprove(rec)}>✓ Approve</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleReject(rec)}>✕ Reject</button>
          </div>
        </div>
      ))}

      {done.map(rec => (
        <div key={rec.id} className="glass-card" style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.65 }}>
          <div>
            <div style={{ fontWeight: 700, color: '#e8f4ff' }}>{rec.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(232,244,255,0.45)' }}>by {rec.author}</div>
          </div>
          <span className={`badge badge-${rec.status === 'approved' ? 'success' : 'danger'}`}>{rec.status}</span>
        </div>
      ))}
    </div>
  );
}
