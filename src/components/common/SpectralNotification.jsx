import { useEffect, useState } from 'react';
import styles from './SpectralNotification.module.css';

/**
 * SpectralNotification - A high-fidelity holographic alert.
 * Features scanlines, glitch entry, and translucent glassmorphism.
 */
export default function SpectralNotification({ message, type = 'success', id, onRemove }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Auto-close countdown (shorter than the context timeout to allow for animation)
    const timer = setTimeout(() => setIsClosing(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  const icons = {
    success: '✓',
    error: '⚠',
    info: 'ℹ',
    warning: '⚡'
  };

  return (
    <div 
      className={`${styles.notification} ${styles[type]} ${isClosing ? styles.closing : ''}`}
      onClick={() => setIsClosing(true)}
    >
      <div className={styles.glitchOverlay} />
      <div className={styles.scanlines} />
      
      <div className={styles.content}>
        <div className={styles.iconBox}>
          <span className={styles.icon}>{icons[type]}</span>
          <div className={styles.iconPulse} />
        </div>
        <div className={styles.messageRow}>
          <span className={styles.tag}>[ SYSTEM_ALERT ]</span>
          <p className={styles.message}>{message}</p>
        </div>
      </div>
      
      <div className={styles.progressBar}>
        <div className={styles.progressFill} />
      </div>
    </div>
  );
}
