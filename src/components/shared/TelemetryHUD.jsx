import { useLibrary } from '../../contexts/LibraryContext';
import styles from './TelemetryHUD.module.css';

export default function TelemetryHUD({ metrics = [] }) {
  const { settings } = useLibrary();

  // Calculate SVG stroke offset
  const calculateStrokeOffset = (val, max = 100) => {
    const pct = Math.min((val / max) * 100, 100);
    return 100 - pct;
  };

  return (
    <div className={styles.telemetryGrid}>
      {metrics.map((s, i) => (
        <div 
          key={s.label} 
          className={`${styles.statCard} glass-card`} 
          style={{ 
            '--c': s.color || 'var(--accent-primary)', 
            '--c-alpha': s.cAlpha || 'rgba(0,255,200,0.1)',
            animationDelay: settings.cinematicAnimations ? `${i * 0.1}s` : '0s',
            animationName: settings.cinematicAnimations ? undefined : 'none'
          }}
        >
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statVal}>{s.val}</span>
          </div>
          
          <div className={styles.statRing}>
            <svg className={styles.ringSvg} viewBox="0 0 36 36">
              <path 
                className={styles.ringCircle} 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                style={{ '--offset': calculateStrokeOffset(s.val, s.max) }}
              />
            </svg>
            <span className={styles.statIcon}>{s.icon}</span>
          </div>
          <div className={styles.statGlow} />
        </div>
      ))}
    </div>
  );
}
