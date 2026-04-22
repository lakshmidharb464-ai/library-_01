import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import styles from './LibrarySettings.module.css';

export default function LibrarySettings() {
  const { settings, updateSettings, addToast } = useLibrary();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(form);
      addToast('Settings saved successfully!', 'success');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      // Error handled in updateSettings
    }
  };

  const reset = () => { setForm({ ...settings }); addToast('Changes discarded', 'info'); };

  const Field = ({ label, helpText, children }) => (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>{label}</div>
      {helpText && <div className={styles.fieldHelp}>{helpText}</div>}
      <div className={styles.fieldControl}>{children}</div>
    </div>
  );

  const Toggle = ({ value, onChange }) => (
    <button type="button" className={`${styles.toggle} ${value ? styles.on : ''}`} onClick={() => onChange(!value)}>
      <span className={styles.thumb} />
    </button>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Library Settings</h2>
          <p className={styles.subtitle}>Configure system-wide parameters</p>
        </div>
        {saved && <div className={styles.savedBadge}>✓ Saved!</div>}
      </div>

      <form onSubmit={handleSave} className={styles.form}>
        {/* General */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🏛️ General</h3>
          <div className={styles.grid2}>
            <Field label="Library Name">
              <input className="form-input" value={form.libraryName} onChange={e => setForm(f => ({ ...f, libraryName: e.target.value }))} />
            </Field>
            <Field label="Fine Per Day (₹)" helpText="Applied to all overdue books">
              <input type="number" min={1} max={100} className="form-input" value={form.finePerDay} onChange={e => setForm(f => ({ ...f, finePerDay: +e.target.value }))} />
            </Field>
          </div>
        </div>

        {/* Loan Periods */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>📅 Loan Periods</h3>
          <div className={styles.grid3}>
            <Field label="Student Loan Days" helpText="Days before overdue">
              <input type="number" min={7} max={60} className="form-input" value={form.studentLoanDays} onChange={e => setForm(f => ({ ...f, studentLoanDays: +e.target.value }))} />
            </Field>
            <Field label="Faculty Loan Days" helpText="Extended faculty access">
              <input type="number" min={14} max={120} className="form-input" value={form.facultyLoanDays} onChange={e => setForm(f => ({ ...f, facultyLoanDays: +e.target.value }))} />
            </Field>
            <Field label="Max Books Per Student">
              <input type="number" min={1} max={10} className="form-input" value={form.maxBooksPerStudent} onChange={e => setForm(f => ({ ...f, maxBooksPerStudent: +e.target.value }))} />
            </Field>
            <Field label="Max Books Per Faculty">
              <input type="number" min={1} max={20} className="form-input" value={form.maxBooksPerFaculty} onChange={e => setForm(f => ({ ...f, maxBooksPerFaculty: +e.target.value }))} />
            </Field>
          </div>
        </div>

        {/* Hours */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🕐 Library Hours</h3>
          <div className={styles.grid3}>
            <Field label="Opening Time">
              <input type="time" className="form-input" value={form.openTime} onChange={e => setForm(f => ({ ...f, openTime: e.target.value }))} />
            </Field>
            <Field label="Closing Time">
              <input type="time" className="form-input" value={form.closeTime} onChange={e => setForm(f => ({ ...f, closeTime: e.target.value }))} />
            </Field>
            <Field label="Open on Weekends" helpText="Saturday & Sunday access">
              <Toggle value={form.weekendOpen} onChange={v => setForm(f => ({ ...f, weekendOpen: v }))} />
            </Field>
          </div>
        </div>

        {/* System */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>⚙️ System Preferences</h3>
          <div className={styles.grid3}>
            <Field label="Email Notifications" helpText="Send due-date reminders">
              <Toggle value={form.emailNotifications} onChange={v => setForm(f => ({ ...f, emailNotifications: v }))} />
            </Field>
            <Field label="Auto Fine Calculation" helpText="Auto-calculate on return">
              <Toggle value={form.autoFineCalculation} onChange={v => setForm(f => ({ ...f, autoFineCalculation: v }))} />
            </Field>
          </div>
        </div>

        {/* Live Preview */}
        <div className={styles.preview}>
          <h3 className={styles.sectionTitle}>📋 Current Configuration Preview</h3>
          <div className={styles.previewGrid}>
            {[
              ['Library', form.libraryName],
              ['Fine Rate', `₹${form.finePerDay}/day`],
              ['Student Loan', `${form.studentLoanDays} days`],
              ['Faculty Loan', `${form.facultyLoanDays} days`],
              ['Max Books (Student)', form.maxBooksPerStudent],
              ['Max Books (Faculty)', form.maxBooksPerFaculty],
              ['Hours', `${form.openTime} – ${form.closeTime}`],
              ['Weekends', form.weekendOpen ? 'Open' : 'Closed'],
            ].map(([k, v]) => (
              <div key={k} className={styles.previewItem}>
                <span className={styles.previewKey}>{k}</span>
                <span className={styles.previewVal}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" className="btn btn-secondary" onClick={reset}>↺ Discard</button>
          <button type="submit" className="btn btn-primary">💾 Save Settings</button>
        </div>
      </form>
    </div>
  );
}
