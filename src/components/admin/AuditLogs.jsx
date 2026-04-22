import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import styles from './AuditLogs.module.css';

export default function AuditLogs() {
  const { auditLogs } = useLibrary();
  const [filter, setFilter] = useState('');

  const filteredLogs = filter
    ? auditLogs.filter(log => log.action.includes(filter) || log.user.includes(filter) || log.details.toLowerCase().includes(filter.toLowerCase()))
    : auditLogs;

  const getActionColor = (action) => {
    if (action.includes('DELETE') || action.includes('CANCEL')) return '#ff4d6d';
    if (action.includes('ADD') || action.includes('CREATE') || action.includes('NEW')) return '#00ffc8';
    if (action.includes('UPDATE') || action.includes('EDIT')) return '#ffbe0b';
    if (action.includes('LOGIN') || action.includes('AUTH') || action.includes('START')) return '#7b2fff';
    return '#00b4d8';
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>System Audit Logs</h2>
          <p className={styles.subtitle}>Immutable ledger of system-wide operations and telematics</p>
        </div>
        <div className="search-bar" style={{ width: 300 }}>
          <span>🔍</span>
          <input type="text" placeholder="Search actions, users, details..." value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛡️</div>
            <h3>No logs generated yet</h3>
          </div>
        ) : (
          <table className={`data-table ${styles.logTable}`}>
            <thead>
              <tr>
                <th style={{ width: 150 }}>Timestamp</th>
                <th style={{ width: 200 }}>User / Actor</th>
                <th style={{ width: 200 }}>Action Code</th>
                <th>Detailed Telemetry</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td className={styles.mono}>{new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}</td>
                  <td className={styles.actor}>{log.user}</td>
                  <td>
                    <span className="badge" style={{ background: `${getActionColor(log.action)}20`, color: getActionColor(log.action), border: `1px solid ${getActionColor(log.action)}50` }}>
                      {log.action}
                    </span>
                  </td>
                  <td className={styles.details}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
