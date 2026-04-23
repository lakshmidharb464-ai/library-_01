import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../contexts/LibraryContext';
import styles from './ProfileSettings.module.css';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { currentUser, currentRole, changePassword, addToast, settings, updateSettings, auditLogs } = useLibrary();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Password state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return addToast('Passwords do not match', 'error');
    }
    
    setLoading(true);
    try {
      await changePassword(passData.currentPassword, passData.newPassword);
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'profile', label: 'General Profile', icon: '👤' },
    { id: 'security', label: 'Security & Access', icon: '🛡️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '✨' },
  ];

  return (
    <div className={styles.settingsPage}>
      <div className={styles.settingsContainer}>
        
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back to Dashboard
          </button>
          <h2 className={styles.sidebarTitle}>Settings</h2>
          <nav>
            {navItems.map(item => (
              <button 
                key={item.id}
                className={`${styles.navItem} ${activeSection === item.id ? styles.activeNavItem : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className={styles.contentArea}>
          {activeSection === 'security' && (
            <div className={styles.securitySection}>
              <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle}>Security & Access</h1>
                <p className={styles.sectionDesc}>Manage your authentication methods and account protection.</p>
              </div>

              <div className={styles.securityGrid}>
                {/* Password Change */}
                <div className={styles.subSection}>
                  <h4>Change Password</h4>
                  <form onSubmit={handlePasswordChange} className={styles.stackedForm}>
                    <div className={styles.field}>
                      <label>Current Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        required
                        value={passData.currentPassword}
                        onChange={e => setPassData({...passData, currentPassword: e.target.value})}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        required
                        value={passData.newPassword}
                        onChange={e => setPassData({...passData, newPassword: e.target.value})}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        required
                        value={passData.confirmPassword}
                        onChange={e => setPassData({...passData, confirmPassword: e.target.value})}
                      />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading ? 'Updating Credentials...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                {/* Account Controls */}
                <div className={styles.subSection}>
                  <h4>Account Controls</h4>
                  <div className={styles.controlGrid}>
                    <div className={styles.controlRow}>
                      <div className={styles.controlInfo}>
                        <span className={styles.controlLabel}>Public Profile</span>
                        <span className={styles.controlDesc}>Allow others to see your library activity</span>
                      </div>
                      <label className={styles.switch}>
                        <input 
                          type="checkbox" 
                          checked={settings.publicProfile ?? false} 
                          onChange={(e) => updateSettings({ publicProfile: e.target.checked })}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 2FA Integration */}
                <div className={styles.subSection}>
                  <div className={styles.flexHeader}>
                    <h4>Two-Factor Authentication</h4>
                    {settings.twoFactorEnabled && <span className={styles.secureBadge}>🛡️ SECURED</span>}
                  </div>
                  <div className={styles.placeholderBox}>
                    <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{settings.twoFactorEnabled ? '🔓' : '🔐'}</span>
                    <p className={styles.placeholderText}>
                      {settings.twoFactorEnabled 
                        ? 'Multi-factor authentication is active on your Nexus account. This provides maximum protection against unauthorized access.'
                        : 'Multi-factor authentication adds an extra layer of security to your Nexus account by requiring a secondary biometric or token pulse.'
                      }
                    </p>
                    <button 
                      className={`${styles.submitBtn} ${settings.twoFactorEnabled ? styles.dangerBtn : ''}`} 
                      onClick={() => updateSettings({ twoFactorEnabled: !settings.twoFactorEnabled })}
                    >
                      {settings.twoFactorEnabled ? 'Deactivate 2FA Pulse' : 'Initialize 2FA Pulse'}
                    </button>
                  </div>
                </div>

                {/* Recent Security Activity */}
                <div className={styles.subSection} style={{ gridColumn: 'span 2' }}>
                  <h4>Recent Security Activity</h4>
                  <div className={styles.activityList}>
                    {auditLogs
                      .filter(log => log.user === currentUser?.name || log.details.includes(currentUser?.email))
                      .slice(0, 5)
                      .map(log => (
                        <div key={log.id} className={styles.activityItem}>
                          <div className={styles.activityIcon}>
                            {log.action === 'LOGIN' ? '🔌' : log.action === 'SECURITY' ? '🔑' : '🛡️'}
                          </div>
                          <div className={styles.activityInfo}>
                            <div className={styles.activityAction}>{log.action}: {log.details}</div>
                            <div className={styles.activityTime}>{new Date(log.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    }
                    {auditLogs.filter(log => log.user === currentUser?.name || log.details.includes(currentUser?.email)).length === 0 && (
                      <div className={styles.emptyActivity}>No recent security logs found for this sector.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div>
              <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle}>General Profile</h1>
                <p className={styles.sectionDesc}>Information about your account and identity.</p>
              </div>
              <div className={styles.formGroup}>
                <div className={styles.field}>
                  <label>Full Name</label>
                  <input type="text" value={currentUser?.name || ''} readOnly />
                </div>
                <div className={styles.field}>
                  <label>Email Address</label>
                  <input type="email" value={currentUser?.email || ''} readOnly />
                </div>
                <div className={styles.field}>
                  <label>University ID</label>
                  <input type="text" value={currentUser?.universityId || 'N/A'} readOnly />
                </div>
                <div className={styles.field}>
                  <label>Assigned Role</label>
                  <input type="text" value={currentRole || ''} readOnly style={{ textTransform: 'capitalize' }} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div>
              <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle}>Notifications</h1>
                <p className={styles.sectionDesc}>Control how and when you receive system notifications.</p>
              </div>
              
              <div className={styles.controlGrid}>
                <div className={styles.controlRow}>
                  <div className={styles.controlInfo}>
                    <span className={styles.controlLabel}>Email Notifications</span>
                    <span className={styles.controlDesc}>Receive book due dates and fine notifications via email</span>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={settings.emailNotifications} 
                      onChange={(e) => updateSettings({ emailNotifications: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <div className={styles.controlRow}>
                  <div className={styles.controlInfo}>
                    <span className={styles.controlLabel}>Push Notifications</span>
                    <span className={styles.controlDesc}>Real-time system updates on this device</span>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={settings.pushNotifications ?? true} 
                      onChange={(e) => updateSettings({ pushNotifications: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <div className={styles.controlRow}>
                  <div className={styles.controlInfo}>
                    <span className={styles.controlLabel}>Comm-Link Pings</span>
                    <span className={styles.controlDesc}>Direct message notifications from administrators</span>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={settings.commLinkPings ?? true} 
                      onChange={(e) => updateSettings({ commLinkPings: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div>
              <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle}>Appearance</h1>
                <p className={styles.sectionDesc}>Customize the cinematic visual experience of the Nexus.</p>
              </div>

              <div className={styles.subSection}>
                <h4>Visual Effects</h4>
                <div className={styles.controlGrid}>
                  <div className={styles.controlRow}>
                    <div className={styles.controlInfo}>
                      <span className={styles.controlLabel}>CRT Scanlines</span>
                      <span className={styles.controlDesc}>Retro-futuristic interface overlay</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={settings.scanlines} 
                        onChange={(e) => updateSettings({ scanlines: e.target.checked })}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                  <div className={styles.controlRow}>
                    <div className={styles.controlInfo}>
                      <span className={styles.controlLabel}>Film Grain & Noise</span>
                      <span className={styles.controlDesc}>Adds cinematic texture to the background</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={settings.noiseOverlay} 
                        onChange={(e) => updateSettings({ noiseOverlay: e.target.checked })}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                  <div className={styles.controlRow}>
                    <div className={styles.controlInfo}>
                      <span className={styles.controlLabel}>Motion & Animations</span>
                      <span className={styles.controlDesc}>Fluid transitions and hover effects</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={settings.animations} 
                        onChange={(e) => updateSettings({ animations: e.target.checked })}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                  <div className={styles.controlRow}>
                    <div className={styles.controlInfo}>
                      <span className={styles.controlLabel}>Haptic Feedback</span>
                      <span className={styles.controlDesc}>Subtle pulses on interaction</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={settings.haptic} 
                        onChange={(e) => updateSettings({ haptic: e.target.checked })}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.subSection}>
                <h4>Accent Color</h4>
                <div className={styles.themeGrid}>
                  {[
                    { id: 'emerald', color: '#00ffc8' },
                    { id: 'nebula',  color: '#7b2fff' },
                    { id: 'ocean',   color: '#00b4d8' },
                    { id: 'rose',    color: '#ff4d6d' },
                    { id: 'amber',   color: '#ffbe0b' }
                  ].map(theme => (
                    <div 
                      key={theme.id}
                      className={`${styles.themeOption} ${settings.accentTheme === theme.id ? styles.themeActive : ''}`}
                      onClick={() => updateSettings({ accentTheme: theme.id })}
                    >
                      <div className={styles.themePreview} style={{ background: theme.color, boxShadow: `0 0 15px ${theme.color}44` }} />
                      <span className={styles.themeName}>{theme.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
