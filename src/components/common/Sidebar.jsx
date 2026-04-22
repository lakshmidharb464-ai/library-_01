import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLibrary } from '../../contexts/LibraryContext';
import styles from './Sidebar.module.css';

const NAV = {
  admin: [
    { icon: '◈', label: 'Dashboard',      path: '/admin' },
    { icon: '📚', label: 'Book Catalog',   path: '/admin/books' },
    { icon: '👥', label: 'Personnel',      path: '/admin/users' },
    { icon: '💬', label: 'Comm-Link',      path: '/admin/comms' },
    { icon: '⭐', label: 'Reviews',        path: '/admin/reviews' },
    { icon: '💡', label: 'Requests',       path: '/admin/requests' },
    { icon: '📊', label: 'Analytics',      path: '/admin/analytics' },
    { icon: '📢', label: 'Announcements',  path: '/admin/announcements' },
    { icon: '🛡️', label: 'Audit Logs',    path: '/admin/logs' },
    { icon: '⚙️', label: 'Settings',       path: '/admin/settings' },
    { icon: '🔄', label: 'Import/Export',  path: '/admin/io' },
  ],
  librarian: [
    { icon: '◈', label: 'Dashboard',      path: '/librarian' },
    { icon: '👥', label: 'Personnel',      path: '/librarian/users' },
    { icon: '📤', label: 'Issue/Return',   path: '/librarian/issue' },
    { icon: '📌', label: 'Reservations',   path: '/librarian/reservations' },
    { icon: '💬', label: 'Comm-Link',      path: '/librarian/comms' },
    { icon: '💰', label: 'Fines',          path: '/librarian/fines' },
    { icon: '📋', label: 'Reports',        path: '/librarian/reports' },
    { icon: '🔖', label: 'Book Condition', path: '/librarian/condition' },
    { icon: '📅', label: 'Events',         path: '/librarian/events' },
    { icon: '💡', label: 'Recommendations',path: '/librarian/recommendations' },
    { icon: '⚙️', label: 'Settings',       path: '/librarian/settings' },
  ],
  faculty: [
    { icon: '◈', label: 'Dashboard',      path: '/faculty' },
    { icon: '👥', label: 'Student Auth',   path: '/faculty/users' },
    { icon: '📖', label: 'My Books',       path: '/faculty/mybooks' },
    { icon: '🔍', label: 'Browse',         path: '/faculty/browse' },
    { icon: '💬', label: 'Comm-Link',      path: '/faculty/comms' },
    { icon: '📝', label: 'Syllabus',       path: '/faculty/syllabus' },
    { icon: '📈', label: 'Reading Progress',path: '/faculty/progress' },
    { icon: '📋', label: 'Bibliography',   path: '/faculty/bibliography' },
    { icon: '💡', label: 'Recommend',      path: '/faculty/recommend' },
    { icon: '❤️', label: 'Wishlist',       path: '/faculty/wishlist' },
    { icon: '⚙️', label: 'Settings',       path: '/faculty/settings' },
  ],
  student: [
    { icon: '◈', label: 'Dashboard',      path: '/student' },
    { icon: '📖', label: 'My Books',       path: '/student/mybooks' },
    { icon: '🔍', label: 'Browse',         path: '/student/browse' },
    { icon: '💬', label: 'Comm-Link',      path: '/student/comms' },
    { icon: '📌', label: 'Reservations',   path: '/student/reservations' },
    { icon: '🎯', label: 'Reading Goals',  path: '/student/goals' },
    { icon: '⏱️', label: 'Study Timer',    path: '/student/timer' },
    { icon: '🤝', label: 'Study Groups',   path: '/student/groups' },
    { icon: '❤️', label: 'Wishlist',       path: '/student/wishlist' },
    { icon: '⚙️', label: 'Settings',       path: '/student/settings' },
  ],
};

const ROLE_COLORS = {
  admin:     '#ff4d6d',
  librarian: '#00ffc8',
  faculty:   '#7b2fff',
  student:   '#00b4d8',
};

const ROLE_LABELS = {
  admin:     '🛡️ Admin Nexus',
  librarian: '📚 Librarian',
  faculty:   '🧠 Faculty',
  student:   '🎓 Student',
};

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch, currentUser, addToast, getStats } = useLibrary();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = NAV[role] || [];
  const color = ROLE_COLORS[role] || '#00ffc8';
  const stats = getStats();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    addToast('Logged out successfully', 'info');
    navigate('/');
  };

  const isActive = (path) => {
    if (path === `/${role}`) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.glow} style={{ background: color }} />

      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon} style={{ '--role-color': color }}>LN</div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoName}>LibraNova</span>
            <span className={styles.roleLabel} style={{ color }}>{ROLE_LABELS[role]}</span>
          </div>
        )}
      </div>

      {/* User */}
      {currentUser && !collapsed && (
        <div className={styles.userCard}>
          <div className={styles.avatar} style={{ background: color }}>
            {currentUser.name.charAt(0)}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{currentUser.name}</span>
            <span className={styles.userRole} style={{ color }}>{currentUser.role}</span>
          </div>
        </div>
      )}

      {/* Quick Stats (only when expanded) */}
      {!collapsed && (
        <div className={styles.quickStats}>
          {role === 'admin' && <>
            <div className={styles.qStat}><span style={{ color }}>📚</span> {stats.totalBooks}</div>
            <div className={styles.qStat}><span style={{ color: '#ff4d6d' }}>⚠️</span> {stats.overdueCount}</div>
          </>}
          {role === 'librarian' && <>
            <div className={styles.qStat}><span style={{ color }}>📤</span> {stats.activeIssues}</div>
            <div className={styles.qStat}><span style={{ color: '#ff4d6d' }}>⚠️</span> {stats.overdueCount}</div>
          </>}
          {(role === 'student' || role === 'faculty') && <>
            <div className={styles.qStat}><span style={{ color }}>📖</span> {stats.availableBooks} avail</div>
          </>}
        </div>
      )}

      {/* Ctrl+K search hint */}
      {!collapsed && (
        <div className={styles.searchHint}>
          <span className={styles.searchHintIcon}>🔍</span>
          <span>Quick Search</span>
          <kbd className={styles.searchHintKbd}>⌘K</kbd>
        </div>
      )}

      {/* Nav */}
      <nav className={styles.nav}>
        {navItems.map(item => (
          <button
            key={item.path}
            className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
            style={isActive(item.path) ? { '--active-color': color } : {}}
            onClick={() => handleNavClick(item.path)}
            data-tooltip={collapsed ? item.label : undefined}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            {isActive(item.path) && <span className={styles.activeLine} style={{ background: color }} />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <button
          className={styles.collapseBtn}
          onClick={() => { setCollapsed(c => !c); }}
          onMouseEnter={undefined}
          data-tooltip={collapsed ? 'Expand' : undefined}
        >
          {collapsed ? '›' : '‹'}
        </button>
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          onMouseEnter={undefined}
          data-tooltip={collapsed ? 'Logout' : undefined}
        >
          <span>⏻</span>
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
