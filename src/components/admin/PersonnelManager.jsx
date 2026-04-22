import { useState, useMemo } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import Modal from '../common/Modal';
import styles from './PersonnelManager.module.css';

const DEPARTMENTS = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Library', 'Administration', 'Biology', 'English'];
const getEmptyUser = (roles) => ({ name: '', email: '', role: roles[0], department: 'Computer Science', status: 'active' });

export default function PersonnelManager({ manageableRoles = ['student', 'faculty', 'librarian'] }) {
  const { users, dispatch, addToast, apiFetch } = useLibrary();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(getEmptyUser(manageableRoles));
  const [editId, setEditId] = useState(null);

  const stats = useMemo(() => {
    const counts = { student: 0, faculty: 0, librarian: 0, admin: 0 };
    users.forEach(u => { if (counts[u.role] !== undefined) counts[u.role]++; });
    return counts;
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u =>
      manageableRoles.includes(u.role) &&
      (roleFilter === 'All' || u.role === roleFilter) &&
      (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department?.toLowerCase().includes(q))
    );
  }, [users, search, roleFilter, manageableRoles]);

  const openAdd = () => { setForm(getEmptyUser(manageableRoles)); setEditId(null); setModal('add'); };
  const openEdit = (u) => { setForm({ ...u }); setEditId(u.id); setModal('edit'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const joinDate = form.joinDate || new Date().toISOString().split('T')[0];
    try {
      if (modal === 'add') {
        const payload = { ...form, joinDate };
        const data = await apiFetch('/users', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        dispatch({ type: 'ADD_USER', user: { ...data.data, id: data.data._id || data.data.id } });
        addToast(`${form.name} added as ${form.role}`, 'success');
      } else {
        const data = await apiFetch(`/users/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ ...form, joinDate })
        });
        dispatch({ type: 'UPDATE_USER', user: { ...data.data, id: data.data._id || data.data.id } });
        addToast(`${form.name}'s profile updated`, 'success');
      }
      setModal(null);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleStatus = async (u) => {
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    try {
      const data = await apiFetch(`/users/${u.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...u, isActive: newStatus === 'active' })
      });
      dispatch({ type: 'UPDATE_USER', user: { ...data.data, id: data.data._id || data.data.id } });
      addToast(`${u.name} is now ${newStatus}`, 'info');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (u) => {
    if (window.confirm(`Remove ${u.name} from the system?`)) {
      try {
        await apiFetch(`/users/${u.id}`, { method: 'DELETE' });
        dispatch({ type: 'DELETE_USER', id: u.id });
        addToast(`${u.name} removed`, 'warning');
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  const ROLE_COLOR = { student: '#00b4d8', faculty: '#7b2fff', librarian: '#00ffc8', admin: '#ff4d6d' };

  return (
    <div className={styles.page}>
      <div className="flex items-center justify-between gap-16" style={{ marginBottom: 20 }}>
        <div>
          <h2 className={styles.title}>Personnel Manager</h2>
          <p className={styles.subtitle}>{filtered.length} members accessible</p>
        </div>
        <button className="btn btn-primary" style={{ boxShadow: '0 0 15px rgba(0,255,200,0.3)' }} onClick={openAdd}>+ Add Member</button>
      </div>

      {/* Role Telemetry Bar */}
      <div className={styles.metricBar}>
        {manageableRoles.map(role => (
          <div key={role} className={styles.metricCard} style={{ '--c': ROLE_COLOR[role] }}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>{role === 'admin' ? '🛡️' : role === 'librarian' ? '📚' : role === 'faculty' ? '🧠' : '🎓'}</span>
              <span className={styles.metricLabel}>{role}s</span>
            </div>
            <div className={styles.metricValue}>{stats[role]}</div>
            <div className={styles.metricGlow} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className="search-bar" style={{ flex: 1 }}>
          <span>🔍</span>
          <input placeholder="Search by name, email, department…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.roleTabs}>
          {['All', ...manageableRoles].map(r => (
            <button key={r} className={`${styles.roleTab} ${roleFilter === r ? styles.active : ''}`}
              style={roleFilter === r ? { color: ROLE_COLOR[r] || '#00ffc8', borderColor: ROLE_COLOR[r] || '#00ffc8' } : {}}
              onClick={() => setRoleFilter(r)}>{r}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Department</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'rgba(232,244,255,0.3)' }}>No members found</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div className={styles.memberCell}>
                    <div className={styles.avatar} style={{ background: ROLE_COLOR[u.role] || '#00ffc8' }}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className={styles.memberName}>{u.name}</div>
                      <div className={styles.memberEmail}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge" style={{ background: `${ROLE_COLOR[u.role]}20`, color: ROLE_COLOR[u.role], border: `1px solid ${ROLE_COLOR[u.role]}50` }}>{u.role}</span></td>
                <td>{u.department}</td>
                <td>{u.joinDate ? new Date(u.joinDate).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <button 
                    className={`${styles.statusBadge} ${styles[u.status]}`}
                    onClick={() => handleToggleStatus(u)}
                    title="Click to toggle status"
                  >
                    {u.status}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Member' : 'Edit Member'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} disabled={manageableRoles.length === 1}>
                {manageableRoles.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className={styles.formActions}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Add Member' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
