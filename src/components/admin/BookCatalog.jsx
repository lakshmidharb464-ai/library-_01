import { useState, useMemo } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import Modal from '../common/Modal';
import styles from './BookCatalog.module.css';

const CATEGORIES = ['Technology', 'Computer Science', 'History', 'Self Development', 'Fiction', 'Psychology', 'Science', 'Mathematics', 'Other'];
const COLORS = ['#00ffc8', '#7b2fff', '#ff4d6d', '#ffd700', '#00b4d8', '#ff8c00', '#90e0ef', '#c77dff'];

const emptyBook = { title: '', author: '', isbn: '', category: 'Technology', copies: 1, available: 1, rating: 4.0, coverColor: '#00ffc8', year: new Date().getFullYear() };

export default function BookCatalog() {
  const { books, dispatch, addToast, apiFetch, seedDatabase } = useLibrary();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(emptyBook);
  const [editId, setEditId] = useState(null);
  const [viewBook, setViewBook] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return books.filter(b =>
      (catFilter === 'All' || b.category === catFilter) &&
      (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn?.includes(q))
    );
  }, [books, search, catFilter]);

  const openAdd = () => { setForm(emptyBook); setModal('add'); setEditId(null); };
  const openEdit = (book) => { setForm({ ...book }); setEditId(book.id); setModal('edit'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'add') {
        const payload = { 
          ...form, 
          totalCopies: +form.copies,
          availableCopies: +form.copies, // New books are fully available
          publishedYear: +form.year
        };
        const data = await apiFetch('/books', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const savedBook = data.data;
        dispatch({ 
          type: 'ADD_BOOK', 
          book: { 
            ...savedBook, 
            id: savedBook._id || savedBook.id, 
            available: savedBook.availableCopies, 
            copies: savedBook.totalCopies,
            year: savedBook.publishedYear
          } 
        });
        addToast(`"${form.title}" added to catalog`, 'success');
      } else {
        const payload = { 
          ...form, 
          totalCopies: +form.copies,
          publishedYear: +form.year
        };
        const data = await apiFetch(`/books/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        const updatedBook = data.data;
        dispatch({ 
          type: 'UPDATE_BOOK', 
          book: { 
            ...updatedBook, 
            id: updatedBook._id || updatedBook.id, 
            available: updatedBook.availableCopies, 
            copies: updatedBook.totalCopies,
            year: updatedBook.publishedYear
          } 
        });
        addToast(`"${form.title}" updated`, 'success');
      }
      setModal(null);
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (book) => {
    if (window.confirm(`Delete "${book.title}"?`)) {
      try {
        await apiFetch(`/books/${book.id}`, { method: 'DELETE' });
        dispatch({ type: 'DELETE_BOOK', id: book.id });
        addToast(`"${book.title}" removed`, 'warning');
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  const stars = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className="flex items-center justify-between gap-16" style={{ marginBottom: 20 }}>
        <div>
          <h2 className={styles.title}>Book Catalog</h2>
          <p className={styles.subtitle}>{books.length} books · {books.reduce((s,b) => s+b.available, 0)} available</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn btn-secondary" onClick={() => window.confirm('Seed database with default books?') && seedDatabase()}>Seed Database</button>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Book</button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className="search-bar" style={{ flex: 1 }}>
          <span>🔍</span>
          <input placeholder="Search by title, author, ISBN…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.catTabs}>
          {['All', ...CATEGORIES].map(c => (
            <button
              key={c}
              className={`${styles.catTab} ${catFilter === c ? styles.active : ''}`}
              onClick={() => setCatFilter(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📚</div><h3>No books found</h3></div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((book, i) => (
            <div key={book.id} className={`${styles.bookCard} animate-fade-in stagger-${Math.min(i+1, 6)}`}>
              <div className={styles.cover} style={{ background: `linear-gradient(135deg, ${book.coverColor}33, ${book.coverColor}11)`, borderColor: `${book.coverColor}44` }}>
                <span className={styles.coverIcon}>📖</span>
                <div className={styles.coverGlow} style={{ background: book.coverColor }} />
              </div>
              <div className={styles.cardContent}>
                <h4 className={styles.bookTitle}>{book.title}</h4>
                <p className={styles.bookAuthor}>{book.author}</p>
                <div className={styles.bookMeta}>
                  <span className="badge badge-info">{book.category}</span>
                  <span className={styles.year}>{book.year}</span>
                </div>
                <div className={styles.bookStats}>
                  <span className={styles.rating} style={{ color: '#ffd700' }}>{stars(book.rating)} {book.rating}</span>
                  <span className={`badge badge-${book.available > 2 ? 'success' : book.available > 0 ? 'warning' : 'danger'}`}>
                    {book.available}/{book.copies} avail
                  </span>
                </div>
              </div>
              <div className={styles.cardActions}>
                <button className="btn btn-secondary btn-sm" onClick={() => setViewBook(book)}>View</button>
                <button className="btn btn-purple btn-sm" onClick={() => openEdit(book)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(book)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add New Book' : 'Edit Book'} size="md">
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Author *</label>
              <input className="form-input" required value={form.author} onChange={e => setForm(f => ({...f, author: e.target.value}))} />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className="form-group">
              <label className="form-label">ISBN</label>
              <input className="form-input" value={form.isbn} onChange={e => setForm(f => ({...f, isbn: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className="form-group">
              <label className="form-label">Copies</label>
              <input type="number" min="1" className="form-input" value={form.copies} onChange={e => setForm(f => ({...f, copies: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input type="number" min="1900" max="2030" className="form-input" value={form.year} onChange={e => setForm(f => ({...f, year: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Rating (0-5)</label>
              <input type="number" step="0.1" min="0" max="5" className="form-input" value={form.rating} onChange={e => setForm(f => ({...f, rating: parseFloat(e.target.value)}))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Cover Color</label>
            <div className={styles.colorPicker}>
              {COLORS.map(c => (
                <button key={c} type="button" className={`${styles.colorDot} ${form.coverColor === c ? styles.colorActive : ''}`}
                  style={{ background: c }} onClick={() => setForm(f => ({...f, coverColor: c}))} />
              ))}
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Add Book' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewBook && (
        <Modal isOpen={true} onClose={() => setViewBook(null)} title="Book Details" size="sm">
          <div className={styles.viewModal}>
            <div className={styles.viewCover} style={{ background: `linear-gradient(135deg, ${viewBook.coverColor}44, ${viewBook.coverColor}11)` }}>
              <span style={{ fontSize: '3rem' }}>📖</span>
            </div>
            <h3 style={{ color: viewBook.coverColor, fontFamily: 'Orbitron', fontSize: '1rem' }}>{viewBook.title}</h3>
            <p style={{ color: 'rgba(232,244,255,0.6)', fontSize: '0.88rem' }}>by {viewBook.author}</p>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['ISBN', viewBook.isbn || 'N/A'],
                ['Category', viewBook.category],
                ['Year', viewBook.year],
                ['Total Copies', viewBook.copies],
                ['Available', viewBook.available],
                ['Rating', `${viewBook.rating} / 5`],
              ].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'rgba(232,244,255,0.45)', fontSize: '0.8rem' }}>{k}</span>
                  <span style={{ color: '#e8f4ff', fontSize: '0.85rem', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
