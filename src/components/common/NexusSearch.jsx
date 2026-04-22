import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLibrary } from '../../contexts/LibraryContext';
import styles from './NexusSearch.module.css';

/**
 * NexusSearch — Global command palette (Ctrl+K).
 * Searches books, users, and nav routes to provide instant navigation.
 */

const ROUTE_INDEX = {
  admin: [
    { label: 'Admin Dashboard', path: '/admin', icon: '◈', keywords: 'home overview telemetry' },
    { label: 'Book Catalog', path: '/admin/books', icon: '📚', keywords: 'catalog inventory manage' },
    { label: 'Personnel Manager', path: '/admin/users', icon: '👥', keywords: 'users members staff' },
    { label: 'Comm-Link', path: '/admin/comms', icon: '💬', keywords: 'messages chat' },
    { label: 'Reviews', path: '/admin/reviews', icon: '⭐', keywords: 'book reviews ratings' },
    { label: 'Requests', path: '/admin/requests', icon: '💡', keywords: 'recommendations requests' },
    { label: 'Analytics', path: '/admin/analytics', icon: '📊', keywords: 'stats charts data' },
    { label: 'Announcements', path: '/admin/announcements', icon: '📢', keywords: 'news alerts' },
    { label: 'Audit Logs', path: '/admin/logs', icon: '🛡️', keywords: 'logs history' },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️', keywords: 'config preferences' },
    { label: 'Import/Export', path: '/admin/io', icon: '🔄', keywords: 'import export backup' },
  ],
  librarian: [
    { label: 'Librarian Dashboard', path: '/librarian', icon: '◈', keywords: 'home overview' },
    { label: 'Issue/Return', path: '/librarian/issue', icon: '📤', keywords: 'checkout return loan' },
    { label: 'Reservations', path: '/librarian/reservations', icon: '📌', keywords: 'reserve hold' },
    { label: 'Comm-Link', path: '/librarian/comms', icon: '💬', keywords: 'messages chat' },
    { label: 'Fines Engine', path: '/librarian/fines', icon: '💰', keywords: 'fines penalties' },
    { label: 'Reports Hub', path: '/librarian/reports', icon: '📋', keywords: 'reports analytics' },
    { label: 'Book Condition', path: '/librarian/condition', icon: '🔖', keywords: 'condition damage' },
    { label: 'Events', path: '/librarian/events', icon: '📅', keywords: 'events calendar' },
    { label: 'Recommendations', path: '/librarian/recommendations', icon: '💡', keywords: 'recommend suggest' },
    { label: 'Settings', path: '/librarian/settings', icon: '⚙️', keywords: 'config preferences' },
  ],
  faculty: [
    { label: 'Faculty Dashboard', path: '/faculty', icon: '◈', keywords: 'home overview' },
    { label: 'My Books', path: '/faculty/mybooks', icon: '📖', keywords: 'borrowed loans' },
    { label: 'Browse', path: '/faculty/browse', icon: '🔍', keywords: 'search catalog find' },
    { label: 'Comm-Link', path: '/faculty/comms', icon: '💬', keywords: 'messages chat' },
    { label: 'Syllabus Builder', path: '/faculty/syllabus', icon: '📝', keywords: 'curriculum course' },
    { label: 'Reading Progress', path: '/faculty/progress', icon: '📈', keywords: 'progress tracking' },
    { label: 'Bibliography', path: '/faculty/bibliography', icon: '📋', keywords: 'references citations' },
    { label: 'Recommend', path: '/faculty/recommend', icon: '💡', keywords: 'recommend suggest' },
    { label: 'Wishlist', path: '/faculty/wishlist', icon: '❤️', keywords: 'wishlist favorites' },
    { label: 'Settings', path: '/faculty/settings', icon: '⚙️', keywords: 'config preferences' },
  ],
  student: [
    { label: 'Student Dashboard', path: '/student', icon: '◈', keywords: 'home overview' },
    { label: 'My Books', path: '/student/mybooks', icon: '📖', keywords: 'borrowed loans' },
    { label: 'Browse', path: '/student/browse', icon: '🔍', keywords: 'search catalog find' },
    { label: 'Comm-Link', path: '/student/comms', icon: '💬', keywords: 'messages chat' },
    { label: 'Reservations', path: '/student/reservations', icon: '📌', keywords: 'reserve hold' },
    { label: 'Reading Goals', path: '/student/goals', icon: '🎯', keywords: 'goals targets' },
    { label: 'Study Timer', path: '/student/timer', icon: '⏱️', keywords: 'timer pomodoro focus' },
    { label: 'Study Groups', path: '/student/groups', icon: '🤝', keywords: 'groups collab peer' },
    { label: 'Wishlist', path: '/student/wishlist', icon: '❤️', keywords: 'wishlist favorites' },
    { label: 'Settings', path: '/student/settings', icon: '⚙️', keywords: 'config preferences' },
  ],
};

export default function NexusSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { books, users, currentRole } = useLibrary();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build search results  
  const results = useMemo(() => {
    if (!query.trim()) {
      // Show navigation routes as default when empty
      return (ROUTE_INDEX[currentRole] || []).map(r => ({
        type: 'nav',
        label: r.label,
        sub: r.path,
        icon: r.icon,
        path: r.path,
      }));
    }

    const q = query.toLowerCase();
    const items = [];

    // 1. Nav routes
    const routes = ROUTE_INDEX[currentRole] || [];
    routes.forEach(r => {
      if (r.label.toLowerCase().includes(q) || r.keywords.includes(q)) {
        items.push({ type: 'nav', label: r.label, sub: r.path, icon: r.icon, path: r.path });
      }
    });

    // 2. Books
    books.forEach(b => {
      if (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q)) {
        const browsePath = currentRole === 'admin' ? '/admin/books' : `/${currentRole}/browse`;
        items.push({ type: 'book', label: b.title, sub: `${b.author} · ${b.category}`, icon: '📕', path: browsePath });
      }
    });

    // 3. Users (admin/librarian only)
    if (currentRole === 'admin' || currentRole === 'librarian') {
      users.forEach(u => {
        if (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) {
          const usersPath = currentRole === 'admin' ? '/admin/users' : '/librarian/users';
          items.push({ type: 'user', label: u.name, sub: `${u.role} · ${u.department}`, icon: '👤', path: usersPath });
        }
      });
    }

    return items.slice(0, 12);
  }, [query, books, users, currentRole]);

  // Reset selected when results change
  useEffect(() => setSelectedIdx(0), [results.length]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIdx(i => (i + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIdx(i => (i - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIdx]) {
          navigate(results[selectedIdx].path);
          onClose();
        }
        break;
      case 'Escape':
        onClose();
        break;
      default:
        break;
    }
  };

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[selectedIdx];
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIdx]);

  if (!isOpen) return null;

  const TYPE_LABELS = { nav: 'Navigation', book: 'Books', user: 'Users' };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.palette} onClick={e => e.stopPropagation()}>
        {/* Search Input */}
        <div className={styles.inputRow}>
          <span className={styles.searchIcon}>⌘</span>
          <input
            ref={inputRef}
            className={styles.searchInput}
            placeholder="Search books, pages, users..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className={styles.kbd}>ESC</kbd>
        </div>

        {/* Results */}
        <div className={styles.resultsList} ref={listRef}>
          {results.length === 0 && query.trim() && (
            <div className={styles.emptyState}>
              <span>🔍</span>
              <span>No results for "<strong>{query}</strong>"</span>
            </div>
          )}
          {results.map((item, i) => {
            // Render section header if type changes
            const showHeader = i === 0 || results[i - 1].type !== item.type;
            return (
              <div key={`${item.type}-${item.label}-${i}`}>
                {showHeader && (
                  <div className={styles.sectionLabel}>{TYPE_LABELS[item.type] || item.type}</div>
                )}
                <button
                  className={`${styles.resultItem} ${i === selectedIdx ? styles.selected : ''}`}
                  onMouseEnter={() => { setSelectedIdx(i); }}
                  onClick={() => { navigate(item.path); onClose(); }}
                >
                  <span className={styles.resultIcon}>{item.icon}</span>
                  <div className={styles.resultText}>
                    <span className={styles.resultLabel}>{item.label}</span>
                    <span className={styles.resultSub}>{item.sub}</span>
                  </div>
                  <span className={styles.resultArrow}>↵</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer hints */}
        <div className={styles.footer}>
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Open</span>
          <span><kbd>ESC</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
