import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import NexusToggle from '../common/NexusToggle';
import styles from './StudentSettings.module.css';

export default function StudentSettings() {
  const { settings, dispatch, addToast, updateSettings, changePassword } = useLibrary();
  const [activeTab, setActiveTab] = useState('preferences');

  const [localSettings, setLocalSettings] = useState({
    defaultTimerMins: settings.defaultTimerMins || 25,
    dailyReadingGoal: settings.dailyReadingGoal || 20,
    dailyReminderTime: settings.dailyReminderTime || 18,
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleToggle = async (key, label) => {
    const newValue = !settings[key];
    try {
      await updateSettings({ [key]: newValue });
      addToast(`${label} ${newValue ? 'Enabled' : 'Disabled'}`, 'success');
    } catch (err) {}
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };

  const saveSettings = async () => {
    try {
      await updateSettings(localSettings);
      addToast('Student preferences updated successfully.', 'success');
    } catch (err) {}
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      return addToast('New passwords do not match', 'error');
    }
    if (securityData.newPassword.length < 6) {
      return addToast('Password must be at least 6 characters', 'error');
    }
    
    try {
      await changePassword(securityData.currentPassword, securityData.newPassword);
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {}
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Student Settings</h2>
        <p className={styles.subtitle}>Manage your library experience and account security.</p>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'preferences' ? styles.active : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'security' ? styles.active : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      {activeTab === 'preferences' ? (
        <>
          <div className={styles.settingsGrid}>
            {/* Feature 1: Default Study Timer */}
            <div className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Pomodoro Timer (Mins)</h3>
                  <p className={styles.cardDesc}>Default focus session length for the study timer.</p>
                </div>
              </div>
              <div className={styles.controlWrap}>
                <input 
                  type="number" 
                  name="defaultTimerMins"
                  className={styles.numInput} 
                  value={localSettings.defaultTimerMins} 
                  onChange={handleInputChange} 
                  min="1" 
                />
              </div>
            </div>

            {/* Feature 2: Daily Reading Goal */}
            <div className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Daily Goal (Pages)</h3>
                  <p className={styles.cardDesc}>Target number of pages to read each day.</p>
                </div>
              </div>
              <div className={styles.controlWrap}>
                <input 
                  type="number" 
                  name="dailyReadingGoal"
                  className={styles.numInput} 
                  value={localSettings.dailyReadingGoal} 
                  onChange={handleInputChange} 
                  min="1" 
                />
              </div>
            </div>

            {/* Feature 3: Reminder Time */}
            <div className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Reminder Hour (0-23)</h3>
                  <p className={styles.cardDesc}>Time of day to receive automated reminders.</p>
                </div>
              </div>
              <div className={styles.controlWrap}>
                <input 
                  type="number" 
                  name="dailyReminderTime"
                  className={styles.numInput} 
                  value={localSettings.dailyReminderTime} 
                  onChange={handleInputChange} 
                  min="0" 
                  max="23"
                />
              </div>
            </div>

            {/* Focus Mode */}
            <div className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Focus Mode</h3>
                  <p className={styles.cardDesc}>Silence non-critical notifications during study sessions.</p>
                </div>
              </div>
              <div className={styles.controlWrap}>
                <NexusToggle 
                  isChecked={settings.focusModeEnabled || false} 
                  onChange={() => handleToggle('focusModeEnabled', 'Focus Mode')} 
                />
              </div>
            </div>

            {/* Public Reading History */}
            <div className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Public History</h3>
                  <p className={styles.cardDesc}>Allow others to see your reading activity.</p>
                </div>
              </div>
              <div className={styles.controlWrap}>
                <NexusToggle 
                  isChecked={settings.publicReadingHistory || false} 
                  onChange={() => handleToggle('publicReadingHistory', 'Public History')} 
                />
              </div>
            </div>

            {/* Auto-renew */}
            <div className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Auto-Renew Asset</h3>
                  <p className={styles.cardDesc}>Automatically attempt to renew your loans.</p>
                </div>
              </div>
              <div className={styles.controlWrap}>
                <NexusToggle 
                  isChecked={settings.studentAutoRenew || false} 
                  onChange={() => handleToggle('studentAutoRenew', 'Auto-Renew')} 
                />
              </div>
            </div>
            
            {/* Dark Mode */}
            <div className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>E-Reader Dark Mode</h3>
                  <p className={styles.cardDesc}>Default to dark mode in the viewer.</p>
                </div>
              </div>
              <div className={styles.controlWrap}>
                <NexusToggle 
                  isChecked={settings.readerDarkMode || false} 
                  onChange={() => handleToggle('readerDarkMode', 'Dark Mode')} 
                />
              </div>
            </div>

            {/* Newsletter */}
            <div className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Newsletter Subscription</h3>
                  <p className={styles.cardDesc}>Stay updated with library events.</p>
                </div>
              </div>
              <div className={styles.controlWrap}>
                <NexusToggle 
                  isChecked={settings.newsletterSub || false} 
                  onChange={() => handleToggle('newsletterSub', 'Newsletter')} 
                />
              </div>
            </div>

          </div>

          <div className={styles.saveBtnWrap}>
            <button className="btn btn-primary" onClick={saveSettings}>
              Apply Preferences
            </button>
          </div>
        </>
      ) : (
        <div className={styles.securitySection}>
          <div className={styles.securityGrid}>
            <div className={styles.securityCard}>
              <h3 className={styles.cardTitle}>Change Password</h3>
              <p className={styles.cardDesc}>Ensure your account uses a long, random password to stay secure.</p>
              
              <form onSubmit={handleUpdatePassword} className={styles.passwordForm}>
                <div className={styles.formGroup}>
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    name="currentPassword" 
                    value={securityData.currentPassword} 
                    onChange={handleSecurityChange}
                    placeholder="Enter current password"
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>New Password</label>
                  <input 
                    type="password" 
                    name="newPassword" 
                    value={securityData.newPassword} 
                    onChange={handleSecurityChange}
                    placeholder="Minimum 6 characters"
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={securityData.confirmPassword} 
                    onChange={handleSecurityChange}
                    placeholder="Repeat new password"
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary">Update Password</button>
              </form>
            </div>

            <div className={styles.securityCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Two-Factor Authentication</h3>
                  <p className={styles.cardDesc}>Add an extra layer of security to your account.</p>
                </div>
                <span className={styles.comingSoon}>Coming Soon</span>
              </div>
              <div className={styles.controlWrap}>
                <NexusToggle 
                  isChecked={false} 
                  disabled={true}
                  onChange={() => {}} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
