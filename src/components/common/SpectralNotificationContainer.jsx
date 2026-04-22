import { useLibrary } from '../../contexts/LibraryContext';
import SpectralNotification from './SpectralNotification';
import styles from './SpectralNotification.module.css';

/**
 * SpectralNotificationContainer - Global overlay for high-fidelity alerts.
 */
export default function SpectralNotificationContainer() {
  const { toasts } = useLibrary();

  return (
    <div className={styles.container}>
      {toasts.map(toast => (
        <SpectralNotification 
          key={toast.id} 
          {...toast} 
        />
      ))}
    </div>
  );
}
