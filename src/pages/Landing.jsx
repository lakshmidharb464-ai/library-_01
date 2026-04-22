import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../contexts/LibraryContext';
import ParticleCanvas from '../components/common/ParticleCanvas';
import styles from './Landing.module.css';

// --- Helper for Animated Radial Stats ---
function RadialStat({ end, duration = 2000, suffix = '', label, color, pct = 100 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [inView, end, duration]);

  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className={styles.statBox} ref={ref}>
      <svg width="110" height="110" className={styles.ring}>
        <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
        <circle cx="55" cy="55" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={inView ? dashOffset : circumference}
          style={{ transition: inView ? 'stroke-dashoffset 2s ease-out' : 'none', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}/>
      </svg>
      <div className={styles.statNum} style={{ color, marginTop: -62 }}>{count.toLocaleString()}{suffix}</div>
      <div className={styles.statLabel} style={{ marginTop: 4 }}>{label}</div>
    </div>
  );
}

const FEATURES = [
  { icon: 'target', title: 'Reading Goals', desc: 'Set and track personal reading targets with visual progress and milestones.', color: '#00ffc8', status: 'available' },
  { icon: 'timer', title: 'Study Timer', desc: 'Built-in Pomodoro focus tools with integrated session logging.', color: '#ffbe0b', status: 'available' },
  { icon: 'book', title: 'Auto-Bibliography', desc: 'Generate quick citations in APA, MLA, and Chicago formats.', color: '#7b2fff', status: 'available' },
  { icon: 'pin', title: 'Smart Holds', desc: 'Reserve unavailable books and get notified the moment they return.', color: '#00b4d8', status: 'coming-soon' },
  { icon: 'check', title: 'Condition Tracking', desc: 'Monitor the physical health of every volume in the database.', color: '#ff4d6d', status: 'coming-soon' },
  { icon: 'dollar', title: 'Fines Engine', desc: 'Automated overdue fine tracking and unified transaction ledgers.', color: '#ffd700', status: 'available' },
];

const FEAT_SVGS = {
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="4"/></svg>`,
  timer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 3"/><line x1="9" y1="3" x2="15" y2="3"/><line x1="12" y1="5" x2="12" y2="3"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  dollar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 010 7H6"/></svg>`,
};

export default function Landing() {
  const navigate = useNavigate();
  const { books, users, dispatch, addToast } = useLibrary();
  const [showUserPicker, setShowUserPicker] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCreds, setAdminCreds] = useState({ email: '', password: '' });
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState('');

  const marqueeBooks = [...books, ...books, ...books];

  const handleScan = (book) => {
    setSelectedAsset(book);
    setIsScanning(true);
    // Simulate holographic scan delay
    setTimeout(() => setIsScanning(false), 2400);
  };

  // ... (dynamicRoles unchanged)
  const dynamicRoles = [
    {
      id: 'admin', icon: 'shield', label: 'Admin Nexus',
      desc: 'Full system telemetry, user management, and global configuration.',
      color: '#ff4d6d',
      users: users.filter(u => u.role === 'admin'),
      features: ['User Management', 'Audit Logs', 'System Config', 'Analytics'],
    },
    {
      id: 'librarian', icon: 'book', label: 'Librarian Hub',
      desc: 'Manage reservations, book conditions, fines, and library events.',
      color: '#00ffc8',
      users: users.filter(u => u.role === 'librarian'),
      features: ['Issue & Return', 'Reservations', 'Fine Management', 'Events'],
    },
    {
      id: 'faculty', icon: 'brain', label: 'Faculty Overmind',
      desc: 'Extended borrowing limits, bibliography tools, and reading analytics.',
      color: '#7b2fff',
      users: users.filter(u => u.role === 'faculty'),
      features: ['Bibliography', 'Syllabus Builder', 'Reading Progress', 'Acquisitions'],
    },
    {
      id: 'student', icon: 'grad', label: 'Student Portal',
      desc: 'Set reading goals, track progress, and manage book reservations.',
      color: '#00b4d8',
      users: users.filter(u => u.role === 'student'),
      features: ['My Books', 'Study Timer', 'Reading Goals', 'Peer Groups'],
    },
  ];

  const ROLE_SVGS = {
    shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z"/></svg>`,
    brain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 00-3 3c0 1.5.5 2 1 3s1 2 1 3.5a3 3 0 006 0"/><path d="M12 5a3 3 0 013 3c0 1.5-.5 2-1 3s-1 2-1 3.5a3 3 0 01-6 0"/><path d="M12 5v14"/><path d="M8 9H5M19 9h-3M8 13H5M19 13h-3"/></svg>`,
    grad: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  };

  useEffect(() => {
    // Simulate cinematic boot sequence
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loginAs = (role, user) => {
    dispatch({ type: 'SET_ROLE', role: role.id, user });
    addToast(`Welcome, ${user.name}! Entering ${role.label}…`, 'success');
    navigate(`/${role.id}`);
  };

  const handleRoleSelect = (role) => {
    navigate(`/auth?role=${role.id}`);
  };

  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (adminCreds.email === 'admin@gmail.com' && adminCreds.password === 'admin') {
      setShowAdminLogin(false);
      const adminUser = users.find(u => u.role === 'admin') || { name: 'System Admin', role: 'admin' };
      loginAs(dynamicRoles.find(r => r.id === 'admin'), adminUser);
    } else {
      addToast('Invalid Admin credentials.', 'danger');
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setNewsletterError('');
    setNewsletterSuccess('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }
    setNewsletterSuccess("You're in. Standby for transmissions.");
    setNewsletterEmail('');
  };

  // Duplicate books for seamless infinite marquee
  // (marqueeBooks is already declared at line 86)

  if (loading) {
    return (
      <div className={styles.preloader}>
        <button className={styles.skipBtn} onClick={() => setLoading(false)}>
          SKIP INTRO
        </button>
        <div className={styles.loaderLogo}>
          <svg viewBox="0 0 100 100" className={styles.logoSvg}>
            <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="none" stroke="url(#loaderGlow)" strokeWidth="2"/>
            <text x="50" y="55" textAnchor="middle" fill="#00ffc8" fontFamily="Orbitron" fontSize="24" fontWeight="800">LN</text>
            <defs>
              <linearGradient id="loaderGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ffc8" />
                <stop offset="100%" stopColor="#7b2fff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className={styles.loaderText}>INITIALIZING NEXUS CORE...</div>
        <div className={styles.loaderBar}><div className={styles.loaderFill} /></div>
      </div>
    );
  }

  return (
    <div className={styles.landing}>
      {/* Abstract Background Video */}
      <video autoPlay loop muted playsInline className={styles.bgVideo}>
        <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-connection-background-27202-large.mp4" type="video/mp4" />
      </video>
      <div className={styles.videoOverlay} />

      {/* Sticky Navbar */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navLogo}>
          <span className={styles.logoMark}>LN</span> LibraNova
        </div>
        <div className={`${styles.navLinks} ${menuOpen ? styles.navOpen : ''}`}>
          <a href="#catalog" onClick={() => setMenuOpen(false)}>Catalog</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#stats" onClick={() => setMenuOpen(false)}>Impact</a>
          <a href="#roles" onClick={() => setMenuOpen(false)}>Portals</a>
          <a href="#roles" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Sign In</a>
        </div>
        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.open : ''}`} />
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.open : ''}`} />
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.open : ''}`} />
        </button>
      </nav>
      {menuOpen && <div className={styles.mobileOverlay} onClick={() => setMenuOpen(false)} />}

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.canvasWrap}><ParticleCanvas /></div>

        {/* Floating Cards */}
        <div className={`${styles.floatingCard} ${styles.float1}`}>
          <span>📖</span> System Prompting <span className="badge badge-success">Available</span>
        </div>
        <div className={`${styles.floatingCard} ${styles.float2}`}>
          <span>⚡</span> Clean Architecture <span className="badge badge-warning">Due Soon</span>
        </div>
        <div className={`${styles.floatingCard} ${styles.float3}`}>
          <span>🎯</span> Reading Goal <span className="badge badge-purple">75%</span>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.badgeLabel}>Now in General Release</div>
          <h1 className={styles.heroTitle}>The Next-Gen Library <br /> Management <span className={styles.textGlow}>Nexus</span></h1>
          <p className={styles.heroSubtitle}>
            A fully integrated, role-based academic platform featuring smart holds,
            reading tracking, automated fines, and high-fidelity telemetry.
          </p>
          <div className={styles.heroActions}>
            <a href="#roles" className="btn btn-cinematic btn-lg">Choose Your Portal →</a>
            <a href="#features" className="btn btn-outline btn-lg">Explore Features</a>
          </div>
        </div>
        <div className={styles.scrollIndicator}>
          <span className={styles.scrollText}>SCROLL TO EXPLORE</span>
          <div className={styles.scrollArrow}>↓</div>
        </div>
      </section>

      {/* Digital Asset Vault Catalog */}
      <section id="catalog" className={styles.vaultSection}>
        <div className={styles.digitalDust} />
        <div className={styles.sectionHeader}>
          <h2>Digital Asset Vault</h2>
          <p>Real-time telemetry and availability status for curated volumes.</p>
        </div>
        <div className={styles.vaultContainer}>
          <div className={styles.vaultTrack} style={{ '--count': marqueeBooks.length }}>
            {marqueeBooks.map((book, i) => {
              const uniqueKey = `book-${book.id || i}-${i}`;
              return (
                <div 
                  key={uniqueKey} 
                  className={styles.vaultCard}
                  onClick={() => handleScan(book)}
                >
                  <div className={styles.cardGlow} />
                  <div className={styles.scanline} />
                  <div className={styles.cardHeader}>
                    <span className={styles.assetTag}>ID // {book.isbn ? book.isbn.slice(-4) : '0000'}</span>
                    <span className={`${styles.statusBadge} ${book.available > 0 ? styles.statusAvail : styles.statusReserved}`}>
                      {book.available > 0 ? 'AVAILABLE' : 'IN_USE'}
                    </span>
                  </div>
                  <div className={styles.vCover} style={{ '--c': book.coverColor || '#ccc' }}>
                    <div className={styles.coverInner}>📖</div>
                    <div className={styles.coverTelemetry}>
                      <span>SYS_ACCESS_GRANTED</span>
                      <span>VERIFIED_VOLUME</span>
                    </div>
                  </div>
                  <div className={styles.vInfo}>
                    <div className={styles.vTitle}>{book.title}</div>
                    <div className={styles.vAuthor}>{book.author}</div>
                    <div className={styles.vMeta}>
                      <span>{book.category}</span>
                      <span>{book.year}</span>
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <div className={styles.availability}>
                      <div className={styles.availBar} style={{ '--p': `${(book.available / (book.copies || 1)) * 100}%` }} />
                      <span>{book.available} / {book.copies} UNITS</span>
                    </div>
                    <button className={styles.scanBtn} onClick={(e) => { e.stopPropagation(); handleScan(book); }}>SCAN ASSET</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Global Research Impact</h2>
            <p>Real-time telemetry from across the academic ecosystem.</p>
          </div>
          <div className={styles.statsGrid}>
            <RadialStat end={12000} suffix="+" label="Digital & Physical Assets" color="#00ffc8" pct={85} />
            <RadialStat end={3400} suffix="+" label="Active Researchers" color="#7b2fff" pct={70} />
            <RadialStat end={85} suffix="k" label="Transactions Processed" color="#ffbe0b" pct={92} />
            <RadialStat end={99} suffix="%" label="System Uptime" color="#ff4d6d" pct={99} />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className={styles.featureSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Powerful Academic Tools</h2>
            <p>Designed specifically to empower students, faculty, and administrators.</p>
          </div>
          <div className={styles.featureGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard} style={{ '--feat-color': f.color }}>
                <div className={styles.featStatus}>
                  <span className={styles.statusDot} />
                  <span>MODULE_ACTIVE // 0{i+1}</span>
                </div>
                <div className={styles.fIcon} style={{ color: f.color }} dangerouslySetInnerHTML={{ __html: FEAT_SVGS[f.icon] }} />
                <h3 className={styles.fTitle}>{f.title}</h3>
                <p className={styles.fDesc}>{f.desc}</p>
                <div className={styles.featFooter}>
                  <div className={styles.fLine} />
                  <span className={styles.fTag}>{f.category || 'CORE_SYSTEM'}</span>
                </div>
                <div className={styles.fGlow} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Showcase */}
      <section id="roles" className={styles.roleSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Enter the Nexus</h2>
            <p>Choose your portal to access personalized tools and dashboards.</p>
          </div>
          <div className={styles.roleGrid}>
            {dynamicRoles.map(role => (
              <button
                key={role.id}
                className={styles.roleCard}
                style={{ '--c': role.color }}
                onClick={() => handleRoleSelect(role)}
              >
                <div className={styles.rIcon} style={{ color: role.color }} dangerouslySetInnerHTML={{ __html: ROLE_SVGS[role.icon] }} />
                <h3 className={styles.rTitle}>{role.label}</h3>
                <p className={styles.rDesc}>{role.desc}</p>
                <div className={styles.rFeatures}>
                  {role.features.map((feat, fi) => (
                    <span key={fi} className={styles.rFeatTag}>{feat}</span>
                  ))}
                </div>
                <div className={styles.rFooter}>
                  <span>Access Portal →</span>
                  <span className={styles.rCount}>{role.users.length} Users</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Portal */}
      <section className={styles.ctaPortalSection}>
        <div className={styles.ctaPortalWrap}>
          <div className={styles.portalDataLine} />
          <div className={styles.ctaBox}>
            <div className={styles.ctaBadge}>SYSTEM_ACCESS_POINT</div>
            <h2 className={styles.ctaTitle}>Ready to elevate your academic workflow?</h2>
            <p className={styles.ctaSubtitle}>Join thousands of researchers utilizing LibraNova daily.</p>
            <div className={styles.ctaBtnWrap}>
              <a href="#roles" className="btn btn-primary btn-lg btn-cinematic">
                <span className={styles.btnText}>GET STARTED NOW</span>
                <div className={styles.btnGlow} />
              </a>
            </div>
          </div>
          <div className={styles.portalDataLineBottom} />
        </div>
      </section>

      {/* Mega Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerColBrand}>
              <div className={styles.navLogo} style={{ marginBottom: 16 }}>
                <span className={styles.logoMark}>LN</span> LibraNova
              </div>
              <p className={styles.footerDesc}>
                The ultimate academic OS bridging physical libraries and digital ecosystems with cinematic 3D telemetry.
              </p>
              <div className={styles.socialGrid}>
                <a href="#" aria-label="GitHub" className={styles.socialLink}><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.02c-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.33 3.3 1.23a11.5 11.5 0 013 0c2.28-1.56 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"/></svg></a>
                <a href="#" aria-label="X / Twitter" className={styles.socialLink}><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
                <a href="#" aria-label="Discord" className={styles.socialLink}><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.014.043.029.056a19.9 19.9 0 005.993 3.03.077.077 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg></a>
                <a href="#" aria-label="Bluesky" className={styles.socialLink}><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266 1.174 1.565c-.388.3-.713.714-.963 1.229C.097 3.21 0 3.645 0 4c0 3.859 1.553 6.883 2.605 8.685.346.593.672 1.002.966 1.304.001-.001.003-.001.004-.001.292-.28.586-.591.88-.942 1.332-1.586 2.406-3.624 2.406-5.695 0-1.685-.59-2.531-1.323-2.531-.731 0-1.825 1.049-1.825 2.531 0 1.686 1.324 2.531 1.324 2.531.624 0 1.12-.492 1.12-1.24 0-.748-.496-1.24-1.12-1.24-.443 0-.785.32-.926.726a.46.46 0 01-.172.174c-.103.06-.287.09-.457.09-.624 0-1.049-.492-1.049-1.24 0-.747.425-1.24 1.049-1.24 1.04 0 1.731 1.295 2.54 2.699.71 1.247 1.492 2.757 2.47 4.09 2.044 2.788 3.686 3.794 4.511 3.794.458 0 .89-.246 1.113-.621.195-.33.323-.774.323-1.285 0-.747-.425-1.24-1.049-1.24-.443 0-.785.32-.926.726a.46.46 0 01-.172.174c-.103.06-.287.09-.457.09C11.17 9.6 10.1 8.9 10.1 7.4c0-1.685.59-2.531 1.323-2.531.732 0 1.825 1.049 1.825 2.531 0 1.686-1.324 2.531-1.324 2.531-.624 0-1.12-.492-1.12-1.24 0-.748.496-1.24 1.12-1.24.443 0 .785.32.926.726a.46.46 0 01.172.174c.103.06.287.09.457.09.625 0 1.049.492 1.049 1.24 0 .747-.425 1.24-1.049 1.24-.732 0-1.73-1.295-2.54-2.699-.71-1.247-1.492-2.757-2.47-4.09-.933-1.272-1.929-2.384-2.958-3.209C5.325 2.304 3.145 2.097 1.928 4.075c0 0 7.12 3.13 10.072 8.725z"/></svg></a>
              </div>
            </div>

            <div className={styles.footerCol}>
              <h4>Navigation</h4>
              <a href="#catalog">Catalog</a>
              <a href="#features">Features</a>
              <a href="#stats">Impact Stats</a>
              <a href="#roles">Portals</a>
            </div>

            <div className={styles.footerCol}>
              <h4>Support & Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Security Overviews</a>
              <a href="#">Help Center</a>
            </div>

            <div className={styles.footerColNewsletter}>
              <h4>Stay Updated</h4>
              <p>Receive system status alerts and new acquisition notifications.</p>
              <form className={styles.newsletterInput} onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  placeholder="name@university.edu"
                  value={newsletterEmail}
                  onChange={e => { setNewsletterEmail(e.target.value); setNewsletterError(''); setNewsletterSuccess(''); }}
                />
                <button type="submit">→</button>
              </form>
              {newsletterError && <div className={styles.newsletterError}>{newsletterError}</div>}
              {newsletterSuccess && <div className={styles.newsletterSuccess}>{newsletterSuccess}</div>}
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>© 2026 LibraNova Nexus. System fully operational.</p>
            <div className={styles.footerStatus}>
              <span className={styles.statusDot} /> All systems nominal
            </div>
          </div>
        </div>
      </footer>

      {/* User Picker Modal */}
      {showUserPicker && (
        <div className={styles.pickerOverlay} onClick={() => setShowUserPicker(null)}>
          <div className={styles.picker} onClick={e => e.stopPropagation()}>
            <h3 className={styles.pickerTitle} style={{ color: showUserPicker.color }}>
              {showUserPicker.icon} Select {showUserPicker.label} Account
            </h3>
            <div className={styles.pickerList}>
              {showUserPicker.users.map(user => (
                <button
                  key={user.id}
                  className={styles.pickerItem}
                  style={{ '--role-color': showUserPicker.color }}
                  onClick={() => { setShowUserPicker(null); loginAs(showUserPicker, user); }}
                >
                  <div className={styles.pickerAvatar} style={{ background: showUserPicker.color }}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className={styles.pickerName}>{user.name}</div>
                    <div className={styles.pickerDept}>{user.department}</div>
                  </div>
                  <span className={styles.pickerArrow}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Secure Admin Auth Modal */}
      {showAdminLogin && (
        <div className={styles.pickerOverlay} onClick={() => setShowAdminLogin(false)}>
          <div className={styles.picker} onClick={e => e.stopPropagation()} style={{ background: 'rgba(255, 77, 109, 0.05)', border: '1px solid rgba(255, 77, 109, 0.2)' }}>
            <h3 className={styles.pickerTitle} style={{ color: '#ff4d6d' }}>
              🛡️ Admin Authorization Required
            </h3>
            <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#ff4d6d' }}>Secure Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  autoFocus
                  style={{ borderColor: 'rgba(255,77,109,0.3)', background: 'rgba(0,0,0,0.5)' }}
                  required 
                  placeholder="admin@gmail.com"
                  value={adminCreds.email}
                  onChange={e => setAdminCreds(c => ({...c, email: e.target.value}))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#ff4d6d' }}>Encrypted Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  style={{ borderColor: 'rgba(255,77,109,0.3)', background: 'rgba(0,0,0,0.5)' }}
                  required 
                  placeholder="••••••••"
                  value={adminCreds.password} 
                  onChange={e => setAdminCreds(c => ({...c, password: e.target.value}))} 
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdminLogin(false)}>Abort</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#ff4d6d', borderColor: '#ff4d6d', color: '#fff' }}>Authenticate</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Holographic Scan Overlay */}
      {selectedAsset && (
        <div className={`${styles.scanOverlay} ${isScanning ? styles.scanning : ''}`}>
          <div className={styles.scanBackdrop} onClick={() => setSelectedAsset(null)} />
          <div className={styles.scanContent}>
            <div className={styles.scanHeader}>
              <div className={styles.scanLabel}>ASSET_RECONSTRUCTION_IN_PROGRESS</div>
              <button className={styles.closeScan} onClick={() => setSelectedAsset(null)}>×</button>
            </div>
            
            <div className={styles.scanGrid}>
              <div className={styles.scanVisual}>
                <div className={styles.hologramBase}>
                  <div className={styles.hologramPulse} />
                  <div className={styles.hologramBook} style={{ '--c': selectedAsset.coverColor }}>📖</div>
                </div>
                {isScanning && (
                  <div className={styles.scanBeam}>
                    <div className={styles.beamLine} />
                  </div>
                )}
              </div>
              
              <div className={styles.scanData}>
                <div className={styles.dataPoint}>
                  <label>TITLE</label>
                  <span>{selectedAsset.title}</span>
                </div>
                <div className={styles.dataPoint}>
                  <label>AUTHOR</label>
                  <span>{selectedAsset.author}</span>
                </div>
                <div className={styles.dataPoint}>
                  <label>SYSTEM_ID</label>
                  <span>{selectedAsset.isbn}</span>
                </div>
                <div className={styles.dataRow}>
                  <div className={styles.dataPoint}>
                    <label>TELEMETRY_RATING</label>
                    <span style={{ color: '#ffbe0b' }}>{selectedAsset.rating} / 5.0</span>
                  </div>
                  <div className={styles.dataPoint}>
                    <label>CURATED_YEAR</label>
                    <span>{selectedAsset.year}</span>
                  </div>
                </div>
                <div className={styles.dataPoint}>
                  <label>AVAILABILITY_STATE</label>
                  <div className={styles.availStatus}>
                    <span className={selectedAsset.available > 0 ? styles.textAvail : styles.textReserved}>
                      {selectedAsset.available > 0 ? 'NOMINAL' : 'IN_USE'}
                    </span>
                    <div className={styles.smallAvailBar}>
                      <div className={styles.smallFill} style={{ '--p': `${(selectedAsset.available / selectedAsset.copies) * 100}%` }} />
                    </div>
                  </div>
                </div>
                
                <button className={styles.accessBtn} onClick={() => navigate('/catalog')}>
                  ACCESS FULL VOLUME data
                </button>
              </div>
            </div>
            
            <div className={styles.scanFooter}>
              <div className={styles.footerLog}>
                {isScanning ? '> INITIALIZING_OPTICAL_SCAN...' : '> SCAN_COMPLETE. ASSET_READY.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
