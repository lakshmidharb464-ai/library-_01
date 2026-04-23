import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import NexusToggle from '../common/NexusToggle';
import styles from './CustodianSettings.module.css';

export default function CustodianSettings() {
  const { settings, dispatch, addToast, updateSettings } = useLibrary();

  // Local state for number inputs before saving, to allow typing without immediate global dispatch
  const [localSettings, setLocalSettings] = useState({
    maxBorrowDays: settings.maxBorrowDays || 14,
    maxBooksPerUser: settings.maxBooksPerUser || 5,
    fineRatePerDay: settings.fineRatePerDay || 1.00,
    gracePeriodDays: settings.gracePeriodDays || 2,
    maxHoldDays: settings.maxHoldDays || 7,
    defaultFineCurrency: settings.defaultFineCurrency || 'USD',
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

  const saveSettings = async () => {
    try {
      await updateSettings(localSettings);
      addToast('Custodian protocols updated successfully.', 'success');
    } catch (err) {}
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Operational Protocols</h2>
        <p className={styles.subtitle}>Configure global borrowing rules, fine enforcements, and automation behaviors.</p>
      </div>

      <div className={styles.settingsGrid}>
        
        {/* Feature 1: Max Borrow Days */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Loan Period (Days)</h3>
              <p className={styles.cardDesc}>Maximum duration a standard asset can be borrowed before incurring fines.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="number" 
              name="maxBorrowDays"
              className={styles.numInput} 
              value={localSettings.maxBorrowDays} 
              onChange={handleInputChange} 
              min="1" 
            />
          </div>
        </div>

        {/* Feature 2: Max Books Per User */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Borrowing Limit</h3>
              <p className={styles.cardDesc}>Maximum number of physical or digital assets a user can hold simultaneously.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="number" 
              name="maxBooksPerUser"
              className={styles.numInput} 
              value={localSettings.maxBooksPerUser} 
              onChange={handleInputChange} 
              min="1" 
            />
          </div>
        </div>

        {/* Feature 3: Fine Rate Per Day */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Daily Fine Rate ($)</h3>
              <p className={styles.cardDesc}>Automated penalty charge applied per day for overdue assets.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="number" 
              name="fineRatePerDay"
              className={styles.numInput} 
              value={localSettings.fineRatePerDay} 
              onChange={handleInputChange} 
              min="0" 
              step="0.10"
            />
          </div>
        </div>

        {/* Feature 4: Auto-Renew Settings */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Auto-Renew Eligible</h3>
              <p className={styles.cardDesc}>Automatically extend loans if no other user has placed a reservation.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.autoRenewEnabled || false} 
              onChange={() => handleToggle('autoRenewEnabled', 'Auto-Renewal')} 
            />
          </div>
        </div>

        {/* Feature 5: Condition Checks */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Enforce Condition Checks</h3>
              <p className={styles.cardDesc}>Require manual condition sign-off upon asset return before restocking.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.enforceConditionChecks || false} 
              onChange={() => handleToggle('enforceConditionChecks', 'Condition Checks')} 
            />
          </div>
        </div>

        {/* Feature 6: Automated Overdue Notices */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Automated Overdue Notices</h3>
              <p className={styles.cardDesc}>Dispatch Comm-Link warnings to users 24 hours prior to fine generation.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.autoNotifyOverdue || false} 
              onChange={() => handleToggle('autoNotifyOverdue', 'Overdue Notices')} 
            />
          </div>
        </div>

        {/* Feature 7: Grace Period */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Grace Period (Days)</h3>
              <p className={styles.cardDesc}>Number of days after due date before fines are officially applied.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="number" 
              name="gracePeriodDays"
              className={styles.numInput} 
              value={localSettings.gracePeriodDays} 
              onChange={handleInputChange} 
              min="0" 
            />
          </div>
        </div>

        {/* Feature 8: Max Hold Duration */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Max Hold Duration (Days)</h3>
              <p className={styles.cardDesc}>How long a reserved asset stays on the hold shelf before returning to circulation.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="number" 
              name="maxHoldDays"
              className={styles.numInput} 
              value={localSettings.maxHoldDays} 
              onChange={handleInputChange} 
              min="1" 
            />
          </div>
        </div>

        {/* Feature 9: Automated Restocking */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Automated Restocking</h3>
              <p className={styles.cardDesc}>Instantly mark returned items as available, bypassing manual shelving logs.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.autoRestocking || false} 
              onChange={() => handleToggle('autoRestocking', 'Auto Restocking')} 
            />
          </div>
        </div>

        {/* Feature 10: Enable Digital Lending */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Enable Digital Lending</h3>
              <p className={styles.cardDesc}>Allow users to instantly borrow e-book versions if physical copies are unavailable.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.enableDigitalLending || false} 
              onChange={() => handleToggle('enableDigitalLending', 'Digital Lending')} 
            />
          </div>
        </div>

        {/* Feature 11: Inter-Library Loan */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Inter-Library Loan</h3>
              <p className={styles.cardDesc}>Enable requests for materials from partner library systems.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.allowInterLibraryLoan || false} 
              onChange={() => handleToggle('allowInterLibraryLoan', 'Inter-Library Loan')} 
            />
          </div>
        </div>

        {/* Feature 12: Maintenance Mode */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Maintenance Mode</h3>
              <p className={styles.cardDesc}>Restrict non-staff access to the system during database maintenance.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.maintenanceMode || false} 
              onChange={() => handleToggle('maintenanceMode', 'Maintenance Mode')} 
            />
          </div>
        </div>

        {/* Feature 13: Log Archiving */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Auto-Archive Logs</h3>
              <p className={styles.cardDesc}>Automatically move audit logs older than 90 days to cold storage.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.autoArchiveOldLogs || false} 
              onChange={() => handleToggle('autoArchiveOldLogs', 'Log Archiving')} 
            />
          </div>
        </div>

        {/* Feature 14: Default Currency */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Fine Currency</h3>
              <p className={styles.cardDesc}>Primary currency used for all system-wide fine calculations.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <select 
              name="defaultFineCurrency"
              className={styles.numInput} 
              value={localSettings.defaultFineCurrency || settings.defaultFineCurrency || 'USD'} 
              onChange={handleInputChange}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>

      </div>

      <div className={styles.saveBtnWrap}>
        <button className="btn btn-primary" onClick={saveSettings}>
          Apply Rule Changes
        </button>
      </div>
    </div>
  );
}
