import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import styles from './AcquisitionRecommender.module.css';

const CATEGORIES = ['Technology', 'Computer Science', 'History', 'Self Development', 'Fiction', 'Psychology', 'Science', 'Mathematics', 'Other'];

export default function AcquisitionRecommender() {
  const { dispatch, addToast, currentUser, apiFetch } = useLibrary();
  const [form, setForm] = useState({ title: '', author: '', category: 'Technology', reason: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.reason) return;
    
    setLoading(true);
    try {
      const recData = {
        ...form,
        requestedBy: currentUser?.id,
        requestedByName: currentUser?.name,
        date: new Date().toISOString(),
        status: 'pending',
      };

      const res = await apiFetch('/faculty/recommendations', {
        method: 'POST',
        body: JSON.stringify(recData),
      });

      dispatch({
        type: 'ADD_RECOMMENDATION',
        rec: { ...res.data, id: res.data._id || res.data.id }
      });

      addToast(`Recommendation for "${form.title}" submitted!`, 'success');
      setForm({ title: '', author: '', category: 'Technology', reason: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.glitchContainer}>
          <h2 className={styles.title} data-text="ACQUISITION ENGINE">ACQUISITION ENGINE</h2>
        </div>
        <p className={styles.subtitle}>Curate the future of the LibraNova collection</p>
      </div>

      {submitted && (
        <div className={styles.successMessage}>
          <span className={styles.checkIcon}>✓</span>
          <div className={styles.successText}>
            <strong>Recommendation Transmitted</strong>
            <p>Your request has been queued for Librarian review.</p>
          </div>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardGlow} />
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <div className="form-group">
              <label className={styles.label}>Asset Title</label>
              <input 
                className={styles.input} 
                required 
                placeholder="e.g. Quantum Computing: A Gentle Introduction" 
                value={form.title} 
                onChange={e => setForm(f => ({...f, title: e.target.value}))} 
              />
            </div>
            
            <div className={styles.row}>
              <div className="form-group">
                <label className={styles.label}>Primary Author</label>
                <input 
                  className={styles.input} 
                  required 
                  placeholder="Full name" 
                  value={form.author} 
                  onChange={e => setForm(f => ({...f, author: e.target.value}))} 
                />
              </div>
              <div className="form-group">
                <label className={styles.label}>Classification</label>
                <select 
                  className={styles.select} 
                  value={form.category} 
                  onChange={e => setForm(f => ({...f, category: e.target.value}))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className={styles.label}>Justification for Acquisition</label>
            <textarea 
              className={styles.textarea} 
              required 
              placeholder="Detail the academic value or student demand for this asset..." 
              value={form.reason} 
              onChange={e => setForm(f => ({...f, reason: e.target.value}))} 
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={loading}
          >
            {loading ? 'TRANSMITTING...' : 'INITIALIZE REQUEST'}
            <span className={styles.btnFlash} />
          </button>
        </form>
      </div>

      <div className={styles.infoBox}>
        <span className={styles.infoIcon}>ⓘ</span>
        <p>Recommendations are evaluated weekly by the Acquisitions Committee based on budget and curriculum alignment.</p>
      </div>
    </div>
  );
}

