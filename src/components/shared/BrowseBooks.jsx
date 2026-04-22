import { useState, useMemo } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import Modal from '../common/Modal';
import BookScanner from './BookScanner';
import styles from './BrowseBooks.module.css';
import shared from './SharedAssets.module.css';

const CATEGORIES = ['All', 'Technology', 'Computer Science', 'History', 'Self Development', 'Fiction', 'Psychology', 'Science', 'Mathematics', 'Other'];
const SORT_OPTIONS = [
  { value: 'title', label: 'Title A-Z' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'available', label: 'Most Available' },
  { value: 'year', label: 'Newest First' },
];

export default function BrowseBooks({ role }) {
  const { books, reviews, wishlist, dispatch, addToast, currentUser } = useLibrary();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('rating');
  const [viewBook, setViewBook] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const myWishlist = wishlist.filter(w => w.userId === currentUser?.id);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = books.filter(b =>
      (category === 'All' || b.category === category) &&
      (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.category.toLowerCase().includes(q))
    );
    switch (sort) {
      case 'title':     result = result.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'rating':    result = result.sort((a, b) => b.rating - a.rating); break;
      case 'available': result = result.sort((a, b) => b.available - a.available); break;
      case 'year':      result = result.sort((a, b) => b.year - a.year); break;
    }
    return result;
  }, [books, search, category, sort]);

  const isWishlisted = (bookId) => myWishlist.some(w => w.bookId === bookId);

  const toggleWishlist = (bookId) => {
    dispatch({ type: 'TOGGLE_WISHLIST', bookId, userId: currentUser?.id });
    const wasIn = isWishlisted(bookId);
    addToast(wasIn ? 'Removed from wishlist' : 'Added to wishlist ❤️', wasIn ? 'info' : 'success');
  };

  const bookReviews = (bookId) => reviews.filter(r => r.bookId === bookId);

  const submitReview = (e) => {
    e.preventDefault();
    if (!reviewModal) return;
    dispatch({
      type: 'ADD_REVIEW',
      review: {
        id: `rev${Date.now()}`,
        bookId: reviewModal.id,
        userId: currentUser?.id,
        userName: currentUser?.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        date: new Date().toISOString(),
      }
    });
    addToast(`Review submitted for "${reviewModal.title}"`, 'success');
    setReviewModal(null);
    setReviewForm({ rating: 5, comment: '' });
  };

  const stars = (r, interactive = false, onChange) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < Math.round(r) ? styles.starFilled : styles.starEmpty}
        onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
        style={interactive ? { cursor: 'pointer' } : {}}
      >★</span>
    ));
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div className={styles.page}>
      <header style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '0.65rem', color: '#00ffc8', fontFamily: 'Orbitron', letterSpacing: '0.2em', marginBottom: 4 }}>ARCHIVE_INDEX // SECTOR-1</div>
        <h2 className={styles.title}>Browse Library</h2>
        <p className={styles.subtitle}>{books.length} assets identified · {books.reduce((s, b) => s + b.available, 0)} ready for acquisition</p>
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <div className="search-bar" style={{ flex: 1 }}>
          <span>🔍</span>
          <input placeholder="Search assets by title, author, or class…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button style={{ background: 'none', border: 'none', color: 'rgba(232,244,255,0.4)', cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className="form-select" style={{ width: 160 }} value={sort} onChange={e => setSort(e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className={styles.catTabs}>
        {CATEGORIES.map(c => (
          <button key={c} className={`${styles.catTab} ${category === c ? styles.catActive : ''}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📂</div><h3>DATABASE_QUERY_EMPTY</h3></div>
      ) : (
        <div className={shared.assetGrid}>
          {filtered.map((book, i) => {
            const wishlisted = isWishlisted(book.id);
            const avgRating = bookReviews(book.id).length > 0
              ? (bookReviews(book.id).reduce((s, r) => s + r.rating, 0) / bookReviews(book.id).length).toFixed(1)
              : book.rating;
            return (
              <div 
                key={book.id} 
                className={`${shared.assetCard} animate-fade-in stagger-${Math.min(i+1, 6)}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer' }}
                onClick={() => setViewBook(book)}
              >
                <div className="prismatic-shimmer" />
                <div className="neural-scanline" />

                <button
                  className={`${styles.heartBtn} ${wishlisted ? styles.hearted : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(book.id); }}
                  title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >❤</button>

                <div className={shared.coverBox} style={{ borderColor: `${book.coverColor}44` }}>
                  <div className={shared.coverGlow} style={{ background: book.coverColor }} />
                  📖
                </div>

                <div className={shared.content}>
                  <h4 className={shared.title}>{book.title}</h4>
                  <p className={shared.author}>{book.author} · {book.year}</p>
                  
                  <div className={shared.tags}>
                    <span className="badge badge-info">{book.category}</span>
                    <span className="badge badge-cinematic">⭐ {avgRating}</span>
                  </div>

                  <div className={shared.telemetry}>
                    <div>
                      <div className={shared.telLabel}>Unit Avail</div>
                      <div className={shared.telVal} style={{ color: book.available > 0 ? '#00ffc8' : '#ff4d6d' }}>
                        {book.available}/{book.copies} UNITS
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className={shared.telLabel}>Protocol</div>
                      <div className={shared.telVal}>
                        {book.available > 0 ? 'READY' : 'QUEUED'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Details Modal */}
      {viewBook && (
        <Modal isOpen={true} onClose={() => setViewBook(null)} title="System Asset Calibration" size="lg">
          <BookScanner book={viewBook} reviews={bookReviews(viewBook.id)} />
        </Modal>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <Modal isOpen={true} onClose={() => setReviewModal(null)} title={`Review: ${reviewModal.title}`} size="sm">
          <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Your Rating</label>
              <div style={{ display: 'flex', gap: 8, fontSize: '1.8rem' }}>
                {stars(reviewForm.rating, true, (r) => setReviewForm(f => ({...f, rating: r})))}
                <span style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', color: '#ffd700', marginLeft: 6, alignSelf: 'center' }}>{reviewForm.rating}/5</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Your Review</label>
              <textarea className="form-textarea" required placeholder="Share your thoughts on this book…" value={reviewForm.comment} onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setReviewModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-cinematic">Submit Review ⭐</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
