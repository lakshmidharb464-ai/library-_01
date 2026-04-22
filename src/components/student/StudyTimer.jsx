import { useState, useEffect, useRef } from 'react';
import styles from './StudyTimer.module.css';

const PRESETS = [
  { label: 'Pomodoro', work: 25, break: 5, icon: '🍅' },
  { label: 'Deep Work', work: 50, break: 10, icon: '🧠' },
  { label: 'Quick Sprint', work: 15, break: 3, icon: '⚡' },
  { label: 'Marathon', work: 90, break: 20, icon: '🏃' },
];

export default function StudyTimer() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [mode, setMode] = useState('work'); // 'work' | 'break'
  const [timeLeft, setTimeLeft] = useState(PRESETS[0].work * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalStudied, setTotalStudied] = useState(0); // minutes
  const [custom, setCustom] = useState({ work: 25, break: 5 });
  const [useCustom, setUseCustom] = useState(false);
  const [log, setLog] = useState([]);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const workMins = useCustom ? custom.work : preset.work;
  const breakMins = useCustom ? custom.break : preset.break;
  const totalDuration = mode === 'work' ? workMins * 60 : breakMins * 60;
  const pct = Math.round((1 - timeLeft / totalDuration) * 100);

  // Cleanup
  useEffect(() => () => clearInterval(intervalRef.current), []);

  const start = () => {
    setRunning(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          handleTimerEnd();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const pause = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setMode('work');
    setTimeLeft(workMins * 60);
  };

  const handleTimerEnd = () => {
    setRunning(false);
    if (mode === 'work') {
      setSessions(s => s + 1);
      const studied = workMins;
      setTotalStudied(t => t + studied);
      setLog(l => [{ type: 'work', mins: studied, at: new Date().toLocaleTimeString() }, ...l.slice(0, 9)]);
      setMode('break');
      setTimeLeft(breakMins * 60);
    } else {
      setLog(l => [{ type: 'break', mins: breakMins, at: new Date().toLocaleTimeString() }, ...l.slice(0, 9)]);
      setMode('work');
      setTimeLeft(workMins * 60);
    }
  };

  const switchMode = (m) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setMode(m);
    setTimeLeft((m === 'work' ? workMins : breakMins) * 60);
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const R = 80;
  const C = 2 * Math.PI * R;
  const dash = C * (1 - pct / 100);

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: 16 }}>
        <h2 className={styles.title}>Study Timer</h2>
        <p className={styles.subtitle}>Focus with Pomodoro-style intervals · {sessions} sessions · {totalStudied} min studied</p>
      </div>

      {/* Presets */}
      <div className={styles.presets}>
        {PRESETS.map(p => (
          <button
            key={p.label}
            className={`${styles.presetBtn} ${!useCustom && preset.label === p.label ? styles.presetActive : ''}`}
            onClick={() => { setPreset(p); setUseCustom(false); reset(); setTimeout(() => setTimeLeft(p.work * 60), 10); }}
          >
            {p.icon} {p.label}
            <span className={styles.presetSub}>{p.work}m / {p.break}m</span>
          </button>
        ))}
        <button
          className={`${styles.presetBtn} ${useCustom ? styles.presetActive : ''}`}
          onClick={() => { setUseCustom(true); reset(); setTimeout(() => setTimeLeft(custom.work * 60), 10); }}
        >
          ⚙️ Custom
          <span className={styles.presetSub}>{custom.work}m / {custom.break}m</span>
        </button>
      </div>

      {useCustom && (
        <div className={styles.customRow}>
          <div className="form-group">
            <label className="form-label">Work (min)</label>
            <input type="number" min={1} max={180} className="form-input" style={{ width: 100 }} value={custom.work}
              onChange={e => { setCustom(c => ({ ...c, work: +e.target.value })); setTimeLeft(+e.target.value * 60); }} />
          </div>
          <div className="form-group">
            <label className="form-label">Break (min)</label>
            <input type="number" min={1} max={60} className="form-input" style={{ width: 100 }} value={custom.break}
              onChange={e => setCustom(c => ({ ...c, break: +e.target.value }))} />
          </div>
        </div>
      )}

      {/* Mode Tabs */}
      <div className={styles.modeTabs}>
        <button className={`${styles.modeTab} ${mode === 'work' ? styles.workActive : ''}`} onClick={() => switchMode('work')}>Focus</button>
        <button className={`${styles.modeTab} ${mode === 'break' ? styles.breakActive : ''}`} onClick={() => switchMode('break')}>Break</button>
      </div>

      {/* Timer Circle */}
      <div className={styles.timerWrap}>
        <div className={styles.timerOuter} style={{ '--mode-color': mode === 'work' ? '#00b4d8' : '#00ffc8' }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle
              cx="100" cy="100" r={R}
              fill="none"
              stroke={mode === 'work' ? '#00b4d8' : '#00ffc8'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={dash}
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 8px ${mode === 'work' ? '#00b4d8' : '#00ffc8'})` }}
            />
          </svg>
          <div className={styles.timerCenter}>
            <div className={styles.timerTime} style={{ color: mode === 'work' ? '#00b4d8' : '#00ffc8' }}>
              {fmt(timeLeft)}
            </div>
            <div className={styles.timerMode}>{mode === 'work' ? '🎯 Focus' : '☕ Break'}</div>
            <div className={styles.timerSession}>Session #{sessions + 1}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {!running ? (
          <button className="btn btn-primary btn-lg" onClick={start}>▶ Start</button>
        ) : (
          <button className="btn btn-secondary btn-lg" onClick={pause}>⏸ Pause</button>
        )}
        <button className="btn btn-secondary btn-lg" onClick={reset}>↺ Reset</button>
      </div>

      {/* Session Log */}
      {log.length > 0 && (
        <div className={styles.logSection}>
          <h3 className={styles.logTitle}>📋 Session Log</h3>
          <div className={styles.logList}>
            {log.map((entry, i) => (
              <div key={i} className={styles.logItem}>
                <span>{entry.type === 'work' ? '🎯' : '☕'}</span>
                <span style={{ flex: 1 }}>{entry.type === 'work' ? 'Focus' : 'Break'} — {entry.mins} min</span>
                <span style={{ color: 'rgba(232,244,255,0.35)', fontSize: '0.78rem' }}>{entry.at}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
