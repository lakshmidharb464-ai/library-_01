import { useState, useMemo } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import styles from './UserApprovals.module.css';

export default function UserApprovals() {
  const { users, apiFetch, dispatch, addToast } = useLibrary();
  const [processingId, setProcessingId] = useState(null);

  const pendingUsers = useMemo(() => {
    return users.filter(u => u.status === 'pending');
  }, [users]);

  const handleApprove = async (user) => {
    setProcessingId(user.id);
    try {
      const data = await apiFetch(`/admin/approve/${user.id}`, {
        method: 'PATCH'
      });
      dispatch({ 
        type: 'UPDATE_USER', 
        user: { ...user, status: 'active', isActive: true } 
      });
      addToast(`${user.name} approved successfully`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (user) => {
    if (!window.confirm(`Are you sure you want to reject ${user.name}?`)) return;
    setProcessingId(user.id);
    try {
      const data = await apiFetch(`/admin/reject/${user.id}`, {
        method: 'PATCH'
      });
      dispatch({ 
        type: 'UPDATE_USER', 
        user: { ...user, status: 'rejected', isActive: false } 
      });
      addToast(`${user.name} rejected`, 'warning');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const ROLE_COLORS = {
    student: '#00b4d8',
    faculty: '#7b2fff',
    custodian: '#00ffc8',
    admin: '#ff4d6d'
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Pending Approvals</h2>
        <p className={styles.subtitle}>
          {pendingUsers.length} users awaiting system authorization
        </p>
      </div>

      {pendingUsers.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🛡️</div>
          <h3 className={styles.emptyText}>ALL CLEAR // NO PENDING REQUESTS</h3>
        </div>
      ) : (
        <div className={styles.grid}>
          {pendingUsers.map(user => (
            <div key={user.id} className={`glass-card ${styles.card}`}>
              <div className={styles.userHeader}>
                <div 
                  className={styles.avatar}
                  style={{ 
                    border: `2px solid ${ROLE_COLORS[user.role] || '#fff'}30`,
                    color: ROLE_COLORS[user.role] || '#fff'
                  }}
                >
                  {user.name.charAt(0)}
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user.name}</div>
                  <div className={styles.userEmail}>{user.email}</div>
                </div>
              </div>

              <div className={styles.userMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Designation</span>
                  <span className={styles.metaValue} style={{ color: ROLE_COLORS[user.role] }}>
                    {user.role === 'custodian' ? 'CUSTODIAN' : user.role.toUpperCase()}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Department</span>
                  <span className={styles.metaValue}>{user.department || 'General'}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>System ID</span>
                  <span className={styles.metaValue}>{user.universityId || 'N/A'}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Applied On</span>
                  <span className={styles.metaValue}>
                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className={styles.actions}>
                <button 
                  className={styles.btnApprove}
                  onClick={() => handleApprove(user)}
                  disabled={processingId === user.id}
                >
                  {processingId === user.id ? (
                    <div className={styles.cyberLoader}><span /><span /><span /></div>
                  ) : '✓ AUTHORIZE'}
                </button>
                <button 
                  className={styles.btnReject}
                  onClick={() => handleReject(user)}
                  disabled={processingId === user.id}
                >
                  {processingId === user.id ? (
                    <div className={styles.cyberLoader}><span /><span /><span /></div>
                  ) : '✕ DENY ACCESS'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
