import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import Modal from '../common/Modal';
import BookScanner from '../shared/BookScanner';
import styles from './SyllabusBuilder.module.css';

export default function SyllabusBuilder() {
  const { syllabi, books, dispatch, addToast, currentUser, reviews, apiFetch } = useLibrary();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ courseCode: '', courseName: '', term: 'Fall 2026', core: [], supplementary: [] });
  const [activeCourse, setActiveCourse] = useState(null);
  const [viewBook, setViewBook] = useState(null);

  const mySyllabi = syllabi.filter(s => s.facultyId === currentUser?.id);

  const handleSave = async (e) => {
    e.preventDefault();
    const isNew = !activeCourse;
    const syllabusData = {
      facultyId: currentUser?.id,
      facultyName: currentUser?.name,
      courseCode: form.courseCode.toUpperCase(),
      courseName: form.courseName,
      term: form.term,
      coreBooks: form.core,
      supplementaryBooks: form.supplementary,
    };

    try {
      if (isNew) {
        const res = await apiFetch('/faculty/syllabi', {
          method: 'POST',
          body: JSON.stringify(syllabusData),
        });
        dispatch({ type: 'ADD_SYLLABUS', syllabus: { ...res.data, id: res.data._id || res.data.id } });
      } else {
        const res = await apiFetch(`/faculty/syllabi/${activeCourse.id}`, {
          method: 'PUT',
          body: JSON.stringify(syllabusData),
        });
        dispatch({ type: 'UPDATE_SYLLABUS', syllabus: { ...res.data, id: res.data._id || res.data.id } });
      }
      addToast(isNew ? 'Syllabus created' : 'Syllabus updated', 'success');
      setModal(false);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/faculty/syllabi/${id}`, { method: 'DELETE' });
      dispatch({ type: 'DELETE_SYLLABUS', id });
      addToast('Syllabus deleted', 'warning');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openForm = (course = null) => {
    setActiveCourse(course);
    if (course) {
      setForm({ courseCode: course.courseCode, courseName: course.courseName, term: course.term, core: course.coreBooks, supplementary: course.supplementaryBooks });
    } else {
      setForm({ courseCode: '', courseName: '', term: 'Fall 2026', core: [], supplementary: [] });
    }
    setModal(true);
  };

  const toggleBook = (id, listType) => {
    setForm(f => {
      const list = f[listType];
      if (list.includes(id)) return { ...f, [listType]: list.filter(b => b !== id) };
      return { ...f, [listType]: [...list, id] };
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Syllabus & Reserves</h2>
          <p className={styles.subtitle}>Curate reading lists directly from the library catalog</p>
        </div>
        <button className="btn btn-purple" onClick={() => openForm(null)}>+ Create Syllabus</button>
      </div>

      {mySyllabi.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📝</div><h3>No syllabi created</h3><p style={{fontSize:'0.85rem', color:'rgba(232,244,255,0.4)'}}>Link library assets to your courses</p></div>
      ) : (
        <div className={styles.grid}>
          {mySyllabi.map(syl => (
            <div key={syl.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.courseCode}>{syl.courseCode}</h3>
                  <div className={styles.courseName}>{syl.courseName}</div>
                </div>
                <span className="badge badge-purple">{syl.term}</span>
              </div>
              
              <div className={styles.bookList}>
                <h4 className={styles.listLabel}>Core Textbooks ({syl.coreBooks.length})</h4>
                {syl.coreBooks.map(bId => {
                  const b = books.find(x => x.id === bId);
                  return b ? (
                    <div 
                      key={bId} 
                      className={styles.bookItem}
                      onClick={() => setViewBook(b)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className={styles.bIcon}>📖</span> <span className={styles.bTitle}>{b.title}</span> <span className={styles.bAvail}>{b.available} avail</span>
                    </div>
                  ) : null;
                })}
              </div>

              {syl.supplementaryBooks.length > 0 && (
                <div className={styles.bookList} style={{ marginTop: 12 }}>
                  <h4 className={styles.listLabel}>Supplementary Reading ({syl.supplementaryBooks.length})</h4>
                  {syl.supplementaryBooks.map(bId => {
                    const b = books.find(x => x.id === bId);
                    return b ? (
                      <div 
                        key={bId} 
                        className={styles.bookItem}
                        onClick={() => setViewBook(b)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className={styles.bIcon}>📚</span> <span className={styles.bTitle}>{b.title}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              <div className={styles.actions}>
                <button className="btn btn-secondary btn-sm" onClick={() => openForm(syl)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(syl.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {modal && (
        <Modal isOpen={true} onClose={() => setModal(false)} title={activeCourse ? `Edit ${activeCourse.courseCode}` : "Create Course Syllabus"}>
          <form onSubmit={handleSave} className={styles.form}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Course Code</label>
                <input required className="form-input" placeholder="e.g. CS101" value={form.courseCode} onChange={e => setForm(f => ({ ...f, courseCode: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Course Name</label>
                <input required className="form-input" placeholder="e.g. Intro to Algorithms" value={form.courseName} onChange={e => setForm(f => ({ ...f, courseName: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Term</label>
                <input required className="form-input" value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value}))} />
              </div>
            </div>

            <div className={styles.selectorGrid}>
              <div className={styles.selectorCol}>
                <h4 className={styles.selectorTitle}>Core Textbooks (Required)</h4>
                <div className={styles.selectorList}>
                  {books.map(b => (
                    <label key={b.id} className={styles.checkboxItem}>
                      <input type="checkbox" checked={form.core.includes(b.id)} onChange={() => toggleBook(b.id, 'core')} />
                      <span>{b.title} <small>({b.author})</small></span>
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.selectorCol}>
                <h4 className={styles.selectorTitle}>Supplementary Reading</h4>
                <div className={styles.selectorList}>
                  {books.map(b => (
                    <label key={b.id} className={styles.checkboxItem}>
                      <input type="checkbox" checked={form.supplementary.includes(b.id)} onChange={() => toggleBook(b.id, 'supplementary')} />
                      <span>{b.title} <small>({b.author})</small></span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-purple">Save Syllabus</button>
            </div>
          </form>
        </Modal>
      )}

      {viewBook && (
        <Modal isOpen={true} onClose={() => setViewBook(null)} title="Instructional Asset Scan" size="lg">
          <BookScanner book={viewBook} reviews={reviews.filter(r => r.bookId === viewBook.id)} />
        </Modal>
      )}
    </div>
  );
}
