import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import NexusToggle from '../common/NexusToggle';
import styles from './FacultySettings.module.css';

export default function FacultySettings() {
  const { settings, dispatch, addToast, updateSettings } = useLibrary();

  const [localSettings, setLocalSettings] = useState({
    maxRecommendedBooks: settings.maxRecommendedBooks || 10,
    officeHoursLeadTime: settings.officeHoursLeadTime || 24,
    maxStudentsPerGroup: settings.maxStudentsPerGroup || 30,
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
      addToast('Faculty preferences updated successfully.', 'success');
    } catch (err) {}
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Faculty Preferences</h2>
        <p className={styles.subtitle}>Configure syllabus defaults, student engagement, and notification parameters.</p>
      </div>

      <div className={styles.settingsGrid}>
        
        {/* Feature 1: Max Recommended Books */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Syllabus Recommends</h3>
              <p className={styles.cardDesc}>Maximum number of recommended books displayed per course syllabus.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="number" 
              name="maxRecommendedBooks"
              className={styles.numInput} 
              value={localSettings.maxRecommendedBooks} 
              onChange={handleInputChange} 
              min="1" 
            />
          </div>
        </div>

        {/* Feature 2: Office Hours Lead Time */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Lead Time (Hours)</h3>
              <p className={styles.cardDesc}>Advance notice required for office hour appointment bookings.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="number" 
              name="officeHoursLeadTime"
              className={styles.numInput} 
              value={localSettings.officeHoursLeadTime} 
              onChange={handleInputChange} 
              min="1" 
            />
          </div>
        </div>

        {/* Feature 3: Max Students Per Group */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Study Group Cap</h3>
              <p className={styles.cardDesc}>Maximum number of students permitted in your hosted study groups.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <input 
              type="number" 
              name="maxStudentsPerGroup"
              className={styles.numInput} 
              value={localSettings.maxStudentsPerGroup} 
              onChange={handleInputChange} 
              min="1" 
            />
          </div>
        </div>

        {/* Feature 4: Syllabus Visibility */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Public Syllabus Default</h3>
              <p className={styles.cardDesc}>Make newly created course syllabi visible to all students by default.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.syllabusPublicDefault || false} 
              onChange={() => handleToggle('syllabusPublicDefault', 'Public Syllabus')} 
            />
          </div>
        </div>

        {/* Feature 5: Share Reading Progress */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Share Reading Progress</h3>
              <p className={styles.cardDesc}>Allow enrolled students to see your reading progress on syllabus materials.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.facultyShareProgress || false} 
              onChange={() => handleToggle('facultyShareProgress', 'Share Progress')} 
            />
          </div>
        </div>

        {/* Feature 6: Anonymous Feedback */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Anonymous Feedback</h3>
              <p className={styles.cardDesc}>Allow students to submit anonymous feedback on your recommended reading lists.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.allowAnonFeedback || false} 
              onChange={() => handleToggle('allowAnonFeedback', 'Anonymous Feedback')} 
            />
          </div>
        </div>

        {/* Feature 7: Auto-Approve Group Requests */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Auto-Approve Students</h3>
              <p className={styles.cardDesc}>Automatically approve student join requests for your hosted study groups.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.autoApproveGroups || false} 
              onChange={() => handleToggle('autoApproveGroups', 'Auto-Approve Groups')} 
            />
          </div>
        </div>

        {/* Feature 8: Auto-renew Books */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Auto-Renew Assets</h3>
              <p className={styles.cardDesc}>Automatically attempt to renew your faculty loans 1 day before due date.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.facultyAutoRenew || false} 
              onChange={() => handleToggle('facultyAutoRenew', 'Auto-Renew')} 
            />
          </div>
        </div>

        {/* Feature 9: Notification Method */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Email Forwarding</h3>
              <p className={styles.cardDesc}>Forward Nexus Comm-Link notifications to your external academic email address.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.facultyEmailForwarding || false} 
              onChange={() => handleToggle('facultyEmailForwarding', 'Email Forwarding')} 
            />
          </div>
        </div>

        {/* Feature 10: Bibliography Auto-Sync */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Bibliography Auto-Sync</h3>
              <p className={styles.cardDesc}>Automatically synchronize your Nexus bibliography with external citation managers.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.bibAutoSync || false} 
              onChange={() => handleToggle('bibAutoSync', 'Auto-Sync')} 
            />
          </div>
        </div>

        {/* Feature 11: Auto-Archive Syllabi */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Auto-Archive Materials</h3>
              <p className={styles.cardDesc}>Automatically archive course materials at the end of each academic cycle.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.autoArchiveMaterials || false} 
              onChange={() => handleToggle('autoArchiveMaterials', 'Auto-Archive')} 
            />
          </div>
        </div>

        {/* Feature 13: Research Portal */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Research Portal Access</h3>
              <p className={styles.cardDesc}>Enable access to the advanced research and publication tracking portal.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.facultyResearchPortalAccess || false} 
              onChange={() => handleToggle('facultyResearchPortalAccess', 'Research Portal')} 
            />
          </div>
        </div>

        {/* Feature 14: Grant Management */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Grant Tracking</h3>
              <p className={styles.cardDesc}>Enable integrated grant budget and resource allocation tracking.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.facultyGrantManagement || false} 
              onChange={() => handleToggle('facultyGrantManagement', 'Grant Management')} 
            />
          </div>
        </div>

        {/* Feature 15: Collaborative Annotations */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Collaborative Annotations</h3>
              <p className={styles.cardDesc}>Allow faculty-wide shared annotations on core research materials.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.facultyCollaborativeAnnotating || false} 
              onChange={() => handleToggle('facultyCollaborativeAnnotating', 'Collaborative Annotations')} 
            />
          </div>
        </div>

        {/* Feature 16: Priority Queuing */}
        <div className={styles.settingCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Priority Waitlist</h3>
              <p className={styles.cardDesc}>Automatically move faculty to the front of book reservation queues.</p>
            </div>
          </div>
          <div className={styles.controlWrap}>
            <NexusToggle 
              isChecked={settings.facultyPriorityQueuing || false} 
              onChange={() => handleToggle('facultyPriorityQueuing', 'Priority Queuing')} 
            />
          </div>
        </div>

      </div>

      <div className={styles.saveBtnWrap}>
        <button className="btn btn-primary" onClick={saveSettings}>
          Apply Preferences
        </button>
      </div>
    </div>
  );
}
