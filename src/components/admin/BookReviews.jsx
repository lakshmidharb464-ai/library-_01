import { useLibrary } from '../../contexts/LibraryContext';
import styles from './BookReviews.module.css';

export default function BookReviews() {
  const { reviews, books, dispatch, addToast } = useLibrary();

  const stars = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

  const enriched = reviews.map(rev => ({
    ...rev,
    book: books.find(b => b.id === rev.bookId),
  }));

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: 20 }}>
        <h2 className={styles.title}>Book Reviews</h2>
        <p className={styles.subtitle}>{reviews.length} reviews submitted by members</p>
      </div>
      {enriched.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">⭐</div><h3>No reviews yet</h3></div>
      ) : (
        <div className={styles.grid}>
          {enriched.map(rev => (
            <div key={rev.id} className={`glass-card ${styles.card}`}>
              <div className={styles.cardHeader}>
                <div className={styles.bookBadge} style={{ background: `${rev.book?.coverColor || '#00ffc8'}22`, borderColor: `${rev.book?.coverColor || '#00ffc8'}44` }}>
                  <span>📖</span>
                  <span className={styles.bookName}>{rev.book?.title || 'Unknown Book'}</span>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => { dispatch({ type: 'DELETE_REVIEW', id: rev.id }); addToast('Review removed', 'warning'); }}>✕</button>
              </div>
              <div className={styles.stars}>{stars(rev.rating)} <span className={styles.ratingNum}>{rev.rating}/5</span></div>
              <p className={styles.comment}>"{rev.comment}"</p>
              <div className={styles.reviewer}>
                <div className={styles.avatar}>{rev.userName?.charAt(0) || '?'}</div>
                <div>
                  <div className={styles.reviewerName}>{rev.userName}</div>
                  <div className={styles.reviewDate}>{new Date(rev.date).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
