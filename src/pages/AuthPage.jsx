import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLibrary } from '../contexts/LibraryContext';
import styles from './AuthPage.module.css';

const DUMMY_ACCOUNTS = [
  { role: 'admin', email: 'admin@lib.edu', pass: 'demo123', icon: '🛡️', label: 'Admin Nexus' },
  { role: 'librarian', email: 'rohan@lib.edu', pass: 'demo123', icon: '📚', label: 'Librarian Hub' },
  { role: 'student', email: 'aarav@lib.edu', pass: 'demo123', icon: '🎓', label: 'Student Portal' },
  { role: 'faculty', email: 'teacher@lib.edu', pass: 'demo123', icon: '🧠', label: 'Faculty Overmind' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, addToast } = useLibrary();
  
  const queryRole = new URLSearchParams(location.search).get('role') || 'student';
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(queryRole);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const loggedInUser = await login({ email: formData.email, password: formData.password });
        if (loggedInUser) {
          addToast('Access Granted. Entering Nexus...', 'success');
          // Use the role from the server response rather than local state
          navigate(`/${loggedInUser.role}`);
        }
      } else {
        const success = await register({ ...formData, role });
        if (success) {
          addToast('Account created successfully!', 'success');
          setActiveTab('login');
        }
      }
    } catch (err) {
      addToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
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
          <div className={styles.authHeader}>
            <div className={styles.logo}>LN</div>
            <h2>{activeTab === 'login' ? 'Authentication' : 'Registration'}</h2>
            <div className={styles.tabs}>
              <button 
                className={activeTab === 'login' ? styles.activeTab : ''} 
                onClick={() => setActiveTab('login')}
              >LOGIN</button>
              <button 
                className={activeTab === 'register' ? styles.activeTab : ''} 
                onClick={() => {
                  setActiveTab('register');
                  if (role !== 'student' && role !== 'faculty') {
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
                type="password" 
                placeholder="••••••••" 
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {activeTab === 'register' && (
              <>
                <div className={styles.field}>
                  <label>ROLE</label>
                  <select value={role} onChange={e => setRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty / Teacher</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>DEPARTMENT</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Computer Science" 
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'PROCESSING...' : activeTab === 'login' ? 'AUTHORIZE ACCESS' : 'INITIALIZE ACCOUNT'}
            </button>
          </form>

          <button className={styles.backBtn} onClick={() => navigate('/')}>
            ← RETURN TO LANDING
          </button>
        </div>
      </div>
    </div>
  );
}
