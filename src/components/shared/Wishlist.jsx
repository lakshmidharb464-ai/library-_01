import { useLibrary } from '../../contexts/LibraryContext';
import styles from './SharedAssets.module.css';

export default function Wishlist() {
  const { wishlist, books, dispatch, addToast, currentUser } = useLibrary();

  const myWishlist = wishlist.filter(w => w.userId === currentUser?.id);
  const wishlistBooks = myWishlist.map(w => ({
    ...w,
    book: books.find(b => b.id === w.bookId),
  })).filter(w => w.book);

  const remove = (bookId) => {
    dispatch({ type: 'TOGGLE_WISHLIST', bookId, userId: currentUser?.id });
    addToast('Removed from wishlist', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header>
        <div style={{ fontSize: '0.65rem', color: '#00ffc8', fontFamily: 'Orbitron', letterSpacing: '0.2em', marginBottom: 4 }}>SAVED_ASSETS // SECTOR-7</div>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.4rem', fontWeight: 800, color: '#e8f4ff', margin: 0 }}>My Wishlist</h2>
        <p style={{ color: 'rgba(232,244,255,0.45)', fontSize: '0.85rem', marginTop: 2 }}>{wishlistBooks.length} book{wishlistBooks.length !== 1 ? 's' : ''} synchronized</p>
      </header>

      {wishlistBooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛡️</div>
          <h3>NO_SAVED_PROTOCOLS</h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(232,244,255,0.4)' }}>Initiate capture on library assets to populate this sector.</p>
        </div>
      ) : (
        <div className={styles.assetGrid}>
          {wishlistBooks.map(({ book, addedAt }) => (
            <div key={book.id} className={styles.assetCard}>
              <div className={styles.coverBox} style={{ borderColor: `${book.coverColor}44` }}>
                <div className={styles.coverGlow} style={{ background: book.coverColor }} />
                📖
              </div>
              
              <div className={styles.content}>
                <h4 className={styles.title}>{book.title}</h4>
                <p className={styles.author}>{book.author}</p>
                
                <div className={styles.tags}>
                  <span className="badge badge-info">{book.category}</span>
                </div>

                <div className={styles.telemetry}>
                  <div>
                    <div className={styles.telLabel}>Added On</div>
                    <div className={styles.telVal}>{new Date(addedAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.telLabel}>Unit Status</div>
                    <div className={styles.telVal} style={{ color: book.available > 0 ? '#00ffc8' : '#ff4d6d' }}>
                      {book.available > 0 ? 'AVAILABLE' : 'BORROWED'}
                    </div>
                  </div>
                </div>
              </div>

              <button
                className={`${styles.actionBtn} ${styles.danger}`}
                onClick={() => remove(book.id)}
                title="Remove from wishlist"
                style={{ position: 'absolute', top: 10, right: 10 }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
