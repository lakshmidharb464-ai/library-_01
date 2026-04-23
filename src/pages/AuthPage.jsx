import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLibrary } from '../contexts/LibraryContext';
import styles from './AuthPage.module.css';

const DUMMY_ACCOUNTS = [
  { role: 'admin', email: 'admin@lib.edu', pass: 'demo123', icon: '🛡️', label: 'Admin Nexus' },
  { role: 'custodian', email: 'rohan@lib.edu', pass: 'demo123', icon: '📚', label: 'Custodian Hub' },
  { role: 'student', email: 'aarav@lib.edu', pass: 'demo123', icon: '🎓', label: 'Student Portal' },
  { role: 'faculty', email: 'teacher@lib.edu', pass: 'demo123', icon: '🧠', label: 'Faculty Overmind' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, verify2fa, addToast, settings } = useLibrary();
  
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');
  
  // 2FA Simulation states
  const [is2faRequired, setIs2faRequired] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qRole = params.get('role');
    const qTab = params.get('tab');
    const qMode = params.get('mode');

    if (qRole) setRole(qRole);
    if (qTab === 'register') setActiveTab('register');
    if (qMode === 'recovery') setIsRecoveryMode(true);
  }, [location.search]);
  const [pulseCode, setPulseCode] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [tempUser, setTempUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: 'aarav@lib.edu',
    password: 'demo123',
    department: ''
  });

  const handleQuickLogin = (acc) => {
    setFormData({ ...formData, email: acc.email, password: acc.pass });
    setActiveTab('login');
    setRole(acc.role);
    addToast(`Credentials loaded for ${acc.label}`, 'info');
  };

  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast(`Recovery Pulse emitted to ${recoveryEmail}. Check your authorized terminal.`, 'success');
      setIsRecoveryMode(false);
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const loginResult = await login({ email: formData.email, password: formData.password });
        if (loginResult) {
          if (loginResult.twoFactorRequired) {
            setIs2faRequired(true);
            setTempUser(loginResult.data);
            addToast('Identity verification required: Nexus Pulse triggered', 'warning');
          } else {
            addToast('Access Granted. Entering Nexus...', 'success');
            navigate(`/${loginResult.role || loginResult.data?.role}`);
          }
        }
      } else {
        const success = await register({ ...formData, role });
        if (success) {
          addToast('Account created successfully! Waiting for admin approval.', 'success');
          setActiveTab('login');
        }
      }
    } catch (err) {
      addToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handle2faVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const verifiedUser = await verify2fa(tempUser.id, pulseCode);
      if (verifiedUser) {
        navigate(`/${verifiedUser.role}`);
      }
    } catch (err) {
      // Toast already handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      {loading && (
        <div className={styles.preloader}>
          <div className={styles.cyberLoader}>
            <div className={styles.glitchText} data-text="AUTHORIZING ACCESS">AUTHORIZING ACCESS</div>
            <div className={styles.cyberBar}>
              <div className={styles.cyberFill}></div>
            </div>
            <div className={styles.cyberDetails}>
              <span>SYS.VER: 4.9.2</span>
              <span>AUTH: PENDING</span>
              <span>NODE: SECURE</span>
            </div>
          </div>
        </div>
      )}
      <div className={styles.authBackdrop} />
      
      <div className={styles.authGrid}>
        {/* Left Side: Dummy Data Helper */}
        <div className={styles.helperPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.badge}>DUMMY_CREDENTIALS_V1.0</div>
            <h3>Quick Access Matrix</h3>
            <p>Use these credentials to explore the system's role-based features.</p>
          </div>
          
          <div className={styles.accList}>
            {DUMMY_ACCOUNTS.map(acc => (
              <button 
                key={acc.role} 
                className={styles.accCard}
                onClick={() => handleQuickLogin(acc)}
              >
                <span className={styles.accIcon}>{acc.icon}</span>
                <div className={styles.accInfo}>
                  <div className={styles.accLabel}>{acc.label}</div>
                  <div className={styles.accData}>{acc.email} // {acc.pass}</div>
                </div>
              </button>
            ))}
          </div>
          
          <div className={styles.panelFooter}>
            <div className={styles.statusLine}>
              <span className={styles.pulse} /> All Portals Optimal
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className={styles.authBox}>
          {is2faRequired ? (
            <div className={styles.twoFactorView}>
              <div className={styles.authHeader}>
                <div className={styles.logo}>🛡️</div>
                <h2>Nexus Pulse Verification</h2>
                <p className={styles.twoFactorDesc}>
                  Enter the 6-digit pulse code sent to your authorized terminal or biometric sync device.
                </p>
              </div>

              <form onSubmit={handle2faVerify} className={styles.form}>
                <div className={styles.field}>
                  <label>VERIFICATION CODE (SIMULATED: 123456)</label>
                  <input 
                    type="text" 
                    placeholder="0 0 0 0 0 0" 
                    maxLength={6}
                    required
                    style={{ textAlign: 'center', letterSpacing: '12px', fontSize: '1.5rem', fontFamily: 'Orbitron' }}
                    value={pulseCode}
                    onChange={e => setPulseCode(e.target.value)}
                  />
                </div>
                <button type="submit" className={styles.submitBtn}>
                  VERIFY PULSE
                </button>
              </form>

              <button className={styles.backBtn} onClick={() => setIs2faRequired(false)}>
                ← ABORT VERIFICATION
              </button>
            </div>
          ) : isRecoveryMode ? (
            <div className={styles.recoveryView}>
              <div className={styles.authHeader}>
                <div className={styles.logo}>📡</div>
                <h2>Recovery Pulse</h2>
                <p className={styles.twoFactorDesc}>
                  Enter your encrypted email to initiate a security pulse for account restoration.
                </p>
              </div>

              <div className={styles.pulseScanner}>
                <div className={styles.scannerLine} />
                <div className={styles.scannerGrid} />
                <div className={styles.scannerStatus}>INITIATING_BIO_SYNC...</div>
              </div>

              <form onSubmit={handleRecoverySubmit} className={styles.form}>
                <div className={styles.field}>
                  <label>AUTHORIZED EMAIL</label>
                  <input 
                    type="email" 
                    placeholder="name@university.edu" 
                    required
                    value={recoveryEmail}
                    onChange={e => setRecoveryEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className={styles.submitBtn}>
                  EMIT RECOVERY PULSE
                </button>
              </form>

              <button className={styles.backBtn} onClick={() => setIsRecoveryMode(false)}>
                ← RETURN TO LOGIN
              </button>
            </div>
          ) : (
            <>
              <div className={styles.authHeader}>
                <div className={styles.logo}>LN</div>
                <h2>{activeTab === 'login' ? 'Nexus Authorization' : 'Nexus Enrollment'}</h2>
                <div className={styles.tabs}>
                  <button 
                    className={activeTab === 'login' ? styles.activeTab : ''} 
                    onClick={() => setActiveTab('login')}
                  >LOGIN</button>
                  <button 
                    className={activeTab === 'register' ? styles.activeTab : ''} 
                    onClick={() => {
                      setActiveTab('register');
                      if (role !== 'student' && role !== 'faculty' && role !== 'custodian') {
                        setRole('student');
                      }
                    }}
                  >SIGN UP</button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                {activeTab === 'register' && (
                  <div className={styles.field}>
                    <label>FULL NAME</label>
                    <input 
                      id="register-name"
                      type="text" 
                      placeholder="Enter your name" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                )}

                <div className={styles.field}>
                  <label>SECURE EMAIL</label>
                  <input 
                    id="auth-email"
                    type="email" 
                    placeholder="name@university.edu" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className={styles.field}>
                  <label>PASSWORD</label>
                  <input 
                    id="auth-password"
                    type="password" 
                    placeholder="••••••••" 
                    required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                  {activeTab === 'login' && (
                    <button 
                      id="forgot-password-trigger"
                      type="button" 
                      className={styles.forgotLink}
                      onClick={() => setIsRecoveryMode(true)}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>

                {activeTab === 'register' && (
                  <>
                    <div className={styles.field}>
                      <label>SELECT ROLE</label>
                      <div className={styles.roleGrid}>
                        <button 
                          id="role-student-select"
                          type="button"
                          className={`${styles.roleCard} ${role === 'student' ? styles.activeRole : ''}`}
                          onClick={() => setRole('student')}
                        >
                          <span className={styles.roleIcon}>🎓</span>
                          <div className={styles.roleMeta}>
                            <div className={styles.roleName}>Student</div>
                            <div className={styles.roleDesc}>Access archives & dispatches</div>
                          </div>
                        </button>
                        <button 
                          id="role-faculty-select"
                          type="button"
                          className={`${styles.roleCard} ${role === 'faculty' ? styles.activeRole : ''}`}
                          onClick={() => setRole('faculty')}
                        >
                          <span className={styles.roleIcon}>🧠</span>
                          <div className={styles.roleMeta}>
                            <div className={styles.roleName}>Faculty</div>
                            <div className={styles.roleDesc}>Oversee overmind & research</div>
                          </div>
                        </button>
                        <button 
                          id="role-custodian-select"
                          type="button"
                          className={`${styles.roleCard} ${role === 'custodian' ? styles.activeRole : ''}`}
                          onClick={() => setRole('custodian')}
                        >
                          <span className={styles.roleIcon}>📚</span>
                          <div className={styles.roleMeta}>
                            <div className={styles.roleName}>Custodian</div>
                            <div className={styles.roleDesc}>Manage archives & users</div>
                          </div>
                        </button>
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label>DEPARTMENT</label>
                      <input 
                        id="register-department"
                        type="text" 
                        placeholder="e.g. Computer Science" 
                        value={formData.department}
                        onChange={e => setFormData({...formData, department: e.target.value})}
                      />
                    </div>
                  </>
                )}

                <button id="auth-submit-btn" type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? (
                    <span className={styles.submitBtnContent}>
                      <span className={styles.spinner}></span> PROCESSING...
                    </span>
                  ) : activeTab === 'login' ? 'AUTHORIZE ACCESS' : 'INITIALIZE ACCOUNT'}
                </button>
              </form>

              {activeTab === 'login' ? (
                <div className={styles.authFooter}>
                  <span>New to the Nexus?</span>
                  <button id="create-account-shortcut" onClick={() => setActiveTab('register')}>CREATE NEW ACCOUNT</button>
                </div>
              ) : (
                <div className={styles.authFooter}>
                  <span>Already have an account?</span>
                  <button id="login-shortcut" onClick={() => setActiveTab('login')}>LOGIN TO NEXUS</button>
                </div>
              )}

              <button className={styles.backBtn} onClick={() => navigate('/')}>
                ← RETURN TO LANDING
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
