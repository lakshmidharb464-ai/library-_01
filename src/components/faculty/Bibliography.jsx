import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import Modal from '../common/Modal';
import BookScanner from '../shared/BookScanner';
import styles from './Bibliography.module.css';

const CITE_STYLES = ['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE'];

const generateCitation = (book, style) => {
  const year = book.year || new Date().getFullYear();
  const authorParts = book.author.split(' ');
  const lastName = authorParts[authorParts.length - 1];
  const initials = authorParts.slice(0, -1).map(n => n[0] + '.').join(' ');

  switch (style) {
    case 'APA':
      return `${lastName}, ${initials} (${year}). *${book.title}*. Library Catalog.`;
    case 'MLA':
      return `${lastName}, ${book.author.replace(lastName, '').trim()}. *${book.title}*. ${year}.`;
    case 'Chicago':
      return `${book.author}. *${book.title}*. ${year}.`;
    case 'Harvard':
      return `${lastName}, ${initials.replace(/\./g, '')} ${year}, *${book.title}*, Library.`;
    case 'IEEE':
      return `${initials} ${lastName}, "*${book.title}*," ${year}.`;
    default:
      return `${book.author}. ${book.title}. ${year}.`;
  }
};

export default function Bibliography() {
  const { bibliographies, books, dispatch, addToast, currentUser, reviews, apiFetch } = useLibrary();
  const [bookId, setBookId] = useState('');
  const [style, setStyle] = useState('APA');
  const [projectName, setProjectName] = useState('');
  const [copied, setCopied] = useState(null);
  const [viewBook, setViewBook] = useState(null);

  const myBib = (bibliographies || []).filter(e => e.userId === currentUser?.id);

  const handleAdd = async (e) => {
    e.preventDefault();
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    const citation = generateCitation(book, style);
    const entryData = {
      userId: currentUser?.id,
      bookId,
      style,
      citation,
      projectName: projectName || 'General',
    };

    try {
      const res = await apiFetch('/faculty/bibliographies', {
        method: 'POST',
        body: JSON.stringify(entryData),
      });
      dispatch({ type: 'ADD_BIB_ENTRY', entry: { ...res.data, id: res.data._id || res.data.id } });
      addToast(`Citation added in ${style} format`, 'success');
      setBookId('');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/faculty/bibliographies/${id}`, { method: 'DELETE' });
      dispatch({ type: 'DELETE_BIB_ENTRY', id });
      addToast('Citation removed', 'warning');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const copyAll = (project) => {
    const entries = myBib.filter(e => e.projectName === project);
    const text = entries.map((e, i) => `[${i + 1}] ${e.citation.replace(/\*/g, '')}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(project);
      addToast('Bibliography copied to clipboard!', 'success');
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const projects = [...new Set(myBib.map(e => e.projectName))];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Bibliography Builder</h2>
          <p className={styles.subtitle}>Generate & manage academic citations for your research</p>
        </div>
        <span className="badge badge-purple">{myBib.length} citations</span>
      </div>

      {/* Add Citation */}
      <div className={styles.addCard}>
        <h3 className={styles.addTitle}>📚 Add Citation</h3>
        <form onSubmit={handleAdd} className={styles.addForm}>
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">Book</label>
            <select className="form-select" required value={bookId} onChange={e => setBookId(e.target.value)}>
              <option value="">— Select book —</option>
              {books.map(b => <option key={b.id} value={b.id}>{b.title} — {b.author}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Citation Style</label>
            <select className="form-select" value={style} onChange={e => setStyle(e.target.value)}>
              {CITE_STYLES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Project / Paper Name</label>
            <input className="form-input" placeholder="e.g. AI Research Paper" value={projectName} onChange={e => setProjectName(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-purple" style={{ alignSelf: 'flex-end' }}>+ Add</button>
        </form>

        {/* Preview */}
        {bookId && (
          <div className={styles.preview}>
            <span className={styles.previewLabel}>{style} Preview:</span>
            <span className={styles.previewText}>{generateCitation(books.find(b => b.id === bookId), style)}</span>
          </div>
        )}
      </div>

      {/* Projects */}
      {myBib.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📝</div><h3>No citations yet</h3></div>
      ) : (
        projects.map(project => {
          const entries = myBib.filter(e => e.projectName === project);
          return (
            <div key={project} className={styles.projectSection}>
              <div className={styles.projectHeader}>
                <h3 className={styles.projectName}>📁 {project}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={`btn btn-secondary btn-sm`} onClick={() => copyAll(project)}>
                    {copied === project ? '✓ Copied!' : '📋 Copy All'}
                  </button>
                </div>
              </div>
              <div className={styles.citationList}>
                {entries.map((entry, i) => (
                  <div key={entry.id} className={styles.citation}>
                    <span className={styles.citNum}>[{i + 1}]</span>
                    <div className={styles.citContent}>
                      <p 
                        className={styles.citText}
                        onClick={() => setViewBook(books.find(b => b.id === entry.bookId))}
                        style={{ cursor: 'pointer' }}
                      >
                        {entry.citation.replace(/\*/g, '')}
                      </p>
                      <div className={styles.citMeta}>
                        <span className="badge badge-purple">{entry.style}</span>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(232,244,255,0.35)' }}>Added {new Date(entry.addedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      className={styles.delBtn}
                      onClick={() => handleDelete(entry.id)}
                    >🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {viewBook && (
        <Modal isOpen={true} onClose={() => setViewBook(null)} title="Bibliographic Asset Scan" size="lg">
          <BookScanner book={viewBook} reviews={reviews.filter(r => r.bookId === viewBook.id)} />
        </Modal>
      )}
    </div>
  );
}
