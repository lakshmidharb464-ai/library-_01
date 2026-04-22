import { useRef, useEffect, useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import ParticleCanvas from './ParticleCanvas';
import NexusSearch from './NexusSearch';
import styles from './PageShell.module.css';
import { useLibrary } from '../../contexts/LibraryContext';

export default function PageShell({ role, children }) {
  const { settings } = useLibrary();
  const videoRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [searchOpen, setSearchOpen] = useState(false);
  const [telemetry, setTelemetry] = useState({ latency: 14, system: 'NOMINAL', core: 'ACTIVE' });

  // Apply global classes to body
  useEffect(() => {
    const classes = [
      `theme-${settings.accentTheme || 'emerald'}`,
      settings.uiCompact ? 'ui-compact' : ''
    ].filter(Boolean);
    
    document.body.className = classes.join(' ');
  }, [settings.accentTheme, settings.uiCompact]);

  // Theme-matched background videos
  const THEME_VIDEOS = {
    emerald: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-connection-background-27202-large.mp4',
    cyber: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-digital-data-background-274-large.mp4',
    amber: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-animation-of-neon-shapes-tunnel-12521-large.mp4',
    ruby: 'https://assets.mixkit.co/videos/preview/mixkit-floating-blue-particles-in-the-dark-12501-large.mp4',
  };

  const activeVideo = settings.accentTheme ? THEME_VIDEOS[settings.accentTheme] : settings.ambientTheme;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.error("Global bg video autoplay issue:", e));
    }
  }, [activeVideo]);

  // Global Ctrl+K shortcut for NexusSearch
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Simulate dynamic telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry({
        latency: Math.floor(Math.random() * 20) + 5,
        system: Math.random() > 0.95 ? 'SYNCING...' : 'NOMINAL',
        core: Math.random() > 0.98 ? 'OVERLOAD' : 'ACTIVE'
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    setMousePos({ x, y });
  };

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <div 
      className={`${styles.shell} ${!settings.animations ? 'no-animations' : ''}`} 
      onMouseMove={handleMouseMove}
      style={{ '--mouse-x': mousePos.x, '--mouse-y': mousePos.y }}
    >
      {/* 10000x Extrema: The Edge HUD frames the space natively */}
      <div className={styles.edgeHUD}>
        <div className={styles.telemetryTopLeft}>
          <div className={styles.tLine}>SEC_CORE: <span className={styles.tValue}>{telemetry.core}</span></div>
          <div className={styles.tLine}>NET_LATENCY: <span className={styles.tValue}>{telemetry.latency}ms</span></div>
        </div>
        <div className={styles.telemetryTopRight}>
          <div className={styles.tLine}>SYS_INTEGRITY: <span className={styles.tValue}>{telemetry.system}</span></div>
          <div className={styles.tLine}>NEXUS_SYNC: <span className={styles.tValue}>STABLE</span></div>
        </div>
        <div className={styles.telemetryBottomLeft}>
          <div className={styles.tLine}>LOC_TIME: <span className={styles.tValue}>{new Date().toLocaleTimeString()}</span></div>
        </div>
      </div>
      
      {/* 10000x Extrema: The Cursor Glow dynamically follows the mouse */}
      <div className={styles.cursorGlow} />

      {/* Conditional Overlays */}
      {settings.scanlines && <div className={styles.scanlines} />}
      {settings.noiseOverlay && <div className={styles.noiseOverlay} />}

      {activeVideo && (
        <div className={styles.globalVideoWrap} style={{ filter: settings.accentTheme === 'ruby' ? 'hue-rotate(280deg) saturate(1.5)' : undefined }}>
          <video ref={videoRef} src={activeVideo} autoPlay loop muted playsInline className={styles.bgVideo} />
          <div className={styles.videoOverlay} />
        </div>
      )}
      <ParticleCanvas />
      <Sidebar role={role} />
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </main>

      {/* Global Nexus Search Command Palette */}
      <NexusSearch isOpen={searchOpen} onClose={closeSearch} />
    </div>
  );
}
