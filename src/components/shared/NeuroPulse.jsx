import styles from './NeuroPulse.module.css';

/**
 * NeuroPulse - A cinematic telemetry widget showing simulated study activity.
 */
export default function NeuroPulse() {
  return (
    <div className={`${styles.pulseCard} glass-card`}>
      <div className={styles.header}>
        <div className={styles.titles}>
          <span className={styles.tag}>// LIVE_TELEMETRY</span>
          <h4 className={styles.title}>NEURO-INTERFACE_PULSE</h4>
        </div>
        <div className={styles.status}>
          <div className={styles.statusDot} />
          <span>SYNC_ACTIVE</span>
        </div>
      </div>

      <div className={styles.pulseArea}>
        <svg className={styles.pulseSvg} viewBox="0 0 200 60">
          <path 
            className={styles.pulsePath} 
            d="M0 30 L40 30 L50 10 L60 50 L70 30 L110 30 L120 45 L130 15 L140 30 L200 30" 
            fill="none" 
            stroke="#00ffc8" 
            strokeWidth="2"
          />
          <path 
            className={styles.pulsePathGlow} 
            d="M0 30 L40 30 L50 10 L60 50 L70 30 L110 30 L120 45 L130 15 L140 30 L200 30" 
            fill="none" 
            stroke="#00ffc8" 
            strokeWidth="4"
          />
        </svg>
      </div>

      <div className={styles.stats}>
        <div className={styles.statLine}>
          <span>SYNC_VELOCITY</span>
          <span className={styles.statVal}>84.2%</span>
        </div>
        <div className={styles.statLine}>
          <span>NEURAL_LOAD</span>
          <span className={styles.statVal}>LOW</span>
        </div>
      </div>
    </div>
  );
}
