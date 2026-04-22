import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import Modal from '../common/Modal';
import styles from './ReadingGoals.module.css';

const PERIODS = ['Weekly', 'Monthly', 'Semester', 'Yearly', 'Custom'];

export default function ReadingGoals() {
  const { readingGoals, transactions, dispatch, addToast, currentUser } = useLibrary();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', target: 5, period: 'Monthly', category: '', notes: '' });

  const myGoals = readingGoals.filter(g => g.userId === currentUser?.id);
  const myBorrows = transactions.filter(t => t.userId === currentUser?.id && t.status === 'returned').length;

  const handleAdd = (e) => {
    e.preventDefault();
    dispatch({
      type: 'ADD_GOAL',
      goal: {
        id: `goal${Date.now()}`,
        userId: currentUser?.id,
        ...form,
        target: +form.target,
        current: 0,
        createdAt: new Date().toISOString(),
        completed: false,
      },
    });
    addToast('Reading goal set!', 'success');
    setModal(false);
    setForm({ title: '', target: 5, period: 'Monthly', category: '', notes: '' });
  };

  const increment = (goal) => {
    const newCurrent = Math.min(goal.current + 1, goal.target);
    const completed = newCurrent >= goal.target;
    dispatch({ type: 'UPDATE_GOAL', goal: { ...goal, current: newCurrent, completed } });
    if (completed) addToast(`🎉 Goal "${goal.title}" completed!`, 'success');
    else addToast('Progress updated! Keep reading 📚', 'success');
  };

  const decrement = (goal) => {
    if (goal.current === 0) return;
    dispatch({ type: 'UPDATE_GOAL', goal: { ...goal, current: goal.current - 1, completed: false } });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Reading Goals</h2>
          <p className={styles.subtitle}>Set challenges, track achievements · {myBorrows} total books read</p>
        </div>
        <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #00b4d8, #0077a8)' }} onClick={() => setModal(true)}>
          🎯 New Goal
        </button>
      </div>

      {/* Overall stats strip */}
      <div className={styles.statsStrip}>
        <div className={styles.stripCard} style={{ '--c': '#00b4d8' }}>
          <span className={styles.stripIcon}>🎯</span>
          <div className={styles.stripVal}>{myGoals.length}</div>
          <div className={styles.stripLabel}>Active Goals</div>
        </div>
        <div className={styles.stripCard} style={{ '--c': '#00ffc8' }}>
          <span className={styles.stripIcon}>✅</span>
          <div className={styles.stripVal}>{myGoals.filter(g => g.completed).length}</div>
          <div className={styles.stripLabel}>Completed</div>
        </div>
        <div className={styles.stripCard} style={{ '--c': '#ffd700' }}>
          <span className={styles.stripIcon}>📚</span>
          <div className={styles.stripVal}>{myBorrows}</div>
          <div className={styles.stripLabel}>Total Read</div>
        </div>
        <div className={styles.stripCard} style={{ '--c': '#7b2fff' }}>
          <span className={styles.stripIcon}>🔥</span>
          <div className={styles.stripVal}>{myGoals.reduce((s, g) => s + g.current, 0)}</div>
          <div className={styles.stripLabel}>Goal Progress</div>
        </div>
      </div>

      {/* Goals */}
      {myGoals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No reading goals yet</h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(232,244,255,0.4)' }}>Set your first reading challenge!</p>
        </div>
      ) : (
        <div className={styles.goalGrid}>
          {myGoals.map(goal => {
            const pct = Math.round((goal.current / goal.target) * 100);
            return (
              <div key={goal.id} className={`${styles.goalCard} ${goal.completed ? styles.completed : ''}`}>
                {goal.completed && <div className={styles.completedBadge}>🏆 Completed!</div>}
                <div className={styles.goalTop}>
                  <div>
                    <h4 className={styles.goalTitle}>{goal.title || 'Reading Goal'}</h4>
                    <span className="badge badge-info" style={{ marginTop: 4 }}>{goal.period}</span>
                    {goal.category && <span className="badge badge-purple" style={{ marginTop: 4, marginLeft: 4 }}>{goal.category}</span>}
                  </div>
                  <button
                    className={styles.deleteGoal}
                    onClick={() => { dispatch({ type: 'DELETE_GOAL', id: goal.id }); addToast('Goal removed', 'warning'); }}
                  >✕</button>
                </div>

                {/* Big counter */}
                <div className={styles.counter}>
                  <button className={styles.counterBtn} onClick={() => decrement(goal)} disabled={goal.current === 0}>−</button>
                  <div className={styles.counterDisplay}>
                    <span className={styles.counterCurrent} style={{ color: goal.completed ? '#ffd700' : '#00b4d8' }}>{goal.current}</span>
                    <span className={styles.counterSlash}>/</span>
                    <span className={styles.counterTarget}>{goal.target}</span>
                    <span className={styles.counterUnit}>books</span>
                  </div>
                  <button className={styles.counterBtn} onClick={() => increment(goal)} disabled={goal.completed}>+</button>
                </div>

                {/* Progress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(232,244,255,0.45)', marginBottom: 6 }}>
                    <span>{pct}% complete</span>
                    <span>{goal.target - goal.current} more to go</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: goal.completed ? 'linear-gradient(90deg, #ffd700, #ff8c00)' : 'linear-gradient(90deg, #00b4d8, #7b2fff)' }} />
                  </div>
                </div>

                {goal.notes && <p className={styles.goalNotes}>{goal.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Set Reading Goal 🎯" size="sm">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Goal Title</label>
            <input className="form-input" placeholder="e.g. Read 10 books this month" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Target (books)</label>
              <input type="number" min={1} max={100} className="form-input" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Time Period</label>
              <select className="form-select" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
                {PERIODS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Focus Category (optional)</label>
            <input className="form-input" placeholder="e.g. Technology, Fiction…" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes / Motivation</label>
            <textarea className="form-textarea" placeholder="Why is this goal important to you?" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">🎯 Set Goal</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
