import { useLibrary } from '../../contexts/LibraryContext';
import styles from './ToastContainer.module.css';

const ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

export default function ToastContainer() {
  const { toasts } = useLibrary();
  return (
    <div className={styles.container}>
      {toasts.map(t => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          <span className={styles.icon}>{ICONS[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
