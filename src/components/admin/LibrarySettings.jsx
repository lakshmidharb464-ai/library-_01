import { useState, useEffect } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import NexusToggle from '../common/NexusToggle';
// Using the same stylesheet for consistent "premium" feel
import styles from '../custodian/CustodianSettings.module.css';

export default function LibrarySettings() {
  const { settings, updateSettings, addToast } = useLibrary();

  const [localSettings, setLocalSettings] = useState({
    libraryName: settings.libraryName || 'LibraNova Nexus',
    finePerDay: settings.finePerDay || 1,
    studentLoanDays: settings.studentLoanDays || 14,
    facultyLoanDays: settings.facultyLoanDays || 30,
    maxBooksPerStudent: settings.maxBooksPerStudent || 5,
    maxBooksPerFaculty: settings.maxBooksPerFaculty || 10,
    openTime: settings.openTime || '08:00',
    closeTime: settings.closeTime || '20:00',
  });

  // Sync state if settings context loads later
  useEffect(() => {
    setLocalSettings(prev => ({
      ...prev,
      ...settings
    }));
  }, [settings]);

  const handleToggle = async (key, label) => {
    const newValue = !settings[key];
    try {
      await updateSettings({ [key]: newValue });
      addToast(`${label} ${newValue ? 'Enabled' : 'Disabled'}`, 'success');
    } catch (err) {}
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setLocalSettings(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? (parseFloat(value) || 0) : value 
    }));
  };

  const saveSettings = async () => {
    try {
      await updateSettings(localSettings);
      addToast('System configuration updated successfully.', 'success');
    } catch (err) {}
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>System Configuration</h2>
        <p className={styles.subtitle}>Manage global library parameters, loan periods, and operating hours.</p>
      </div>

      <div className={styles.settingsGrid}>
        
        {/* Feature 1: Library Name */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>System Designation</h3>
              <p className={styles.cardDesc}>The primary identification name for this library instance.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="text" 
              name="libraryName"
              className={styles.numInput} 
              style={{ width: '160px', textAlign: 'left' }}
              value={localSettings.libraryName} 
              onChange={handleInputChange} 
            />
          </div>
        </div>

        {/* Feature 2: Fine Per Day */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Global Fine Rate (₹)</h3>
              <p className={styles.cardDesc}>Standard penalty applied per day for overdue assets across all users.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="number" 
              name="finePerDay"
              className={styles.numInput} 
              value={localSettings.finePerDay} 
              onChange={handleInputChange} 
              min="0" 
            />
          </div>
        </div>

        {/* Feature 3: Student Loan Days */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Student Loan Period</h3>
              <p className={styles.cardDesc}>Maximum duration in days a student can borrow standard assets.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="number" 
              name="studentLoanDays"
              className={styles.numInput} 
              value={localSettings.studentLoanDays} 
              onChange={handleInputChange} 
              min="1" 
            />
          </div>
        </div>

        {/* Feature 4: Faculty Loan Days */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Faculty Loan Period</h3>
              <p className={styles.cardDesc}>Extended duration in days for faculty asset borrowing.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="number" 
              name="facultyLoanDays"
              className={styles.numInput} 
              value={localSettings.facultyLoanDays} 
              onChange={handleInputChange} 
              min="1" 
            />
          </div>
        </div>

        {/* Feature 5: Max Books Student */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Student Borrowing Limit</h3>
              <p className={styles.cardDesc}>Maximum number of concurrent assets a student can hold.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="number" 
              name="maxBooksPerStudent"
              className={styles.numInput} 
              value={localSettings.maxBooksPerStudent} 
              onChange={handleInputChange} 
              min="1" 
            />
          </div>
        </div>

        {/* Feature 6: Max Books Faculty */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Faculty Borrowing Limit</h3>
              <p className={styles.cardDesc}>Maximum number of concurrent assets a faculty member can hold.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="number" 
              name="maxBooksPerFaculty"
              className={styles.numInput} 
              value={localSettings.maxBooksPerFaculty} 
              onChange={handleInputChange} 
              min="1" 
            />
          </div>
        </div>

        {/* Feature 7: Open Time */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Daily Activation Time</h3>
              <p className={styles.cardDesc}>Time when library systems and doors become operational.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="time" 
              name="openTime"
              className={styles.numInput} 
              style={{ width: '120px' }}
              value={localSettings.openTime} 
              onChange={handleInputChange} 
            />
          </div>
        </div>

        {/* Feature 8: Close Time */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Daily Standby Time</h3>
              <p className={styles.cardDesc}>Time when library systems transition to after-hours standby mode.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="time" 
              name="closeTime"
              className={styles.numInput} 
              style={{ width: '120px' }}
              value={localSettings.closeTime} 
              onChange={handleInputChange} 
            />
          </div>
        </div>

        {/* Feature 9: Weekend Operations */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Weekend Operations</h3>
              <p className={styles.cardDesc}>Enable standard operating procedures on Saturdays and Sundays.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.weekendOpen || false} 
              onChange={() => handleToggle('weekendOpen', 'Weekend Operations')} 
            />
          </div>
        </div>

        {/* Feature 10: Email Notifications */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Comm-Link Notifications</h3>
              <p className={styles.cardDesc}>Automated dispatch of email reminders for due dates and holds.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.emailNotifications || false} 
              onChange={() => handleToggle('emailNotifications', 'Comm-Link')} 
            />
          </div>
        </div>

        {/* Feature 11: Auto Fine Calculation */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Automated Fines</h3>
              <p className={styles.cardDesc}>Automatically compute and apply penalty charges upon overdue returns.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.autoFineCalculation || false} 
              onChange={() => handleToggle('autoFineCalculation', 'Automated Fines')} 
            />
          </div>
        </div>

      </div>

      <div className={styles.saveBtnWrap}>
        <button className="btn btn-primary" onClick={saveSettings}>
          Commit Configuration
        </button>
      </div>
    </div>
  );
}
