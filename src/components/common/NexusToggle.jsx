import styles from './NexusToggle.module.css';

/**
 * NexusToggle - A cinematic animated switch component.
 * Provides tactile visual feedback and atmospheric glow.
 */
export default function NexusToggle({ label, isChecked, onChange }) {
  return (
    <div className={styles.toggleContainer} onClick={onChange}>
      <div className={`${styles.track} ${isChecked ? styles.active : ''}`}>
        <div className={styles.glow} />
        <div className={styles.thumb}>
          <div className={styles.thumbCore} />
        </div>
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
