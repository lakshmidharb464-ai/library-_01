import { useRef, useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import NexusToggle from '../common/NexusToggle';
import styles from './PortalSettings.module.css';

const ACCENTS = [
  { id: 'emerald', label: 'NEBULA EMERALD', color: '#00ffc8' },
  { id: 'cyber', label: 'CYBER PULSE', color: '#7b2fff' },
  { id: 'amber', label: 'AMBER TITAN', color: '#ffbe0b' },
  { id: 'ruby', label: 'RUBY MATRIX', color: '#ff4d6d' },
];

const ATMOSPHERES = [
  { id: 'tech', label: 'Neural Network', src: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-connection-background-27202-large.mp4' },
  { id: 'galaxy', label: 'Nebula Drift', src: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1610-large.mp4' },
  { id: 'cyber', label: 'Cyber Grid', src: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-digital-data-background-274-large.mp4' },
  { id: 'particles', label: 'Quantum Particles', src: 'https://assets.mixkit.co/videos/preview/mixkit-floating-blue-particles-in-the-dark-12501-large.mp4' },
  { id: 'hologram', label: 'Holo Scanner', src: 'https://assets.mixkit.co/videos/preview/mixkit-3d-animation-of-a-geometric-shape-31853-large.mp4' },
  { id: 'warp', label: 'Warp Speed', src: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-animation-of-neon-shapes-tunnel-12521-large.mp4' }
];

// Helper for 3D Tilt Interaction Physics
function TiltElement({ children, className, ...props }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation limits (-10deg to 10deg)
    const rotateX = ((rect.height / 2 - y) / rect.height) * 15;
    const rotateY = ((x - rect.width / 2) / rect.width) * 15;
    
    setStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'rotateX(0) rotateY(0) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease-out'
    });
  };

  return (
    <div className={`${styles.tiltWrapper} ${className || ''}`} {...props}>
      <div 
        ref={ref}
        className={styles.tiltInner}
        style={style}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * PortalSettings - Reimagined Nexus Calibration HUD.
 * Provides extreme high-fidelity visual orchestration with 3D physical interactions.
 */
export default function PortalSettings() {
  const { settings, dispatch, addToast } = useLibrary();

  const toggleSetting = (key, label) => {
    const newValue = !settings[key];
    dispatch({ type: 'UPDATE_SETTINGS', settings: { [key]: newValue } });
    addToast(`${label} preference ${newValue ? 'engaged' : 'deactivated'}`, 'success');
  };

  const setAccent = (id) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { accentTheme: id } });
    addToast(`Nexus Accent calibrated: ${id.toUpperCase()}`, 'info');
  };

  const setAtmosphere = (src, label) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { ambientTheme: src } });
    addToast(`Atmospheric Mapping synchronized: ${label}`, 'success');
  };

  return (
    <div className={styles.settingsPage}>
      {/* 1000x Diagnostic HUD Wrapper */}
      <div className={styles.calibrationFrame} />

      <header className={styles.pageHeader}>
        <div className={styles.headerGlow} />
        <h1 className={styles.mainTitle}>Nexus Control Center</h1>
        <p className={styles.mainSubtitle}>Global system orchestration and interface calibration.</p>
        
        {/* Dynamic Status Indicator */}
        <div className={styles.statusGaugeContainer}>
          <div className={styles.gaugePulse} />
          <span className={styles.gaugeText}>SYSTEM INTEGRITY: 99.98% // BASELINE NOMINAL</span>
        </div>
      </header>

      <div className={styles.settingsGrid}>
        
        {/* Section: Nexus Accent Mapping */}
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h3 className={styles.sectionTitle}>Nexus Accent Mapping</h3>
            <span className={styles.sectionTag}>[ SPECTRUM_SYNC ]</span>
          </div>
          <div className={styles.accentGrid}>
            {ACCENTS.map(a => (
              <TiltElement key={a.id}>
                <button 
                  className={`${styles.accentCard} ${settings.accentTheme === a.id ? styles.accentActive : ''}`}
                  onClick={() => setAccent(a.id)}
                  style={{ '--accent-color': a.color, width: '100%', height: '100%' }}
                >
                  <div className={styles.accentPreview} />
                  <span className={styles.accentLabel}>{a.label}</span>
                  {settings.accentTheme === a.id && <div className={styles.activeIndicator} />}
                </button>
              </TiltElement>
            ))}
          </div>
        </section>

        {/* Section: Atmospheric Mapping */}
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h3 className={styles.sectionTitle}>Atmospheric Mapping</h3>
            <span className={styles.sectionTag}>[ AMBIENT_ENGINE ]</span>
          </div>
          <div className={styles.atmosphereGrid}>
            {ATMOSPHERES.map(t => (
              <TiltElement key={t.id}>
                <button 
                  className={`${styles.atmosphereCard} ${settings.ambientTheme === t.src ? styles.atmoActive : ''}`}
                  onClick={() => setAtmosphere(t.src, t.label)}
                  style={{ width: '100%', height: '100%' }}
                >
                  <div className={styles.atmoPreview}>
                    <video src={t.src} muted loop onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                    <div className={styles.atmoOverlay} />
                    
                    {/* 1000x Telemetry Overlays */}
                    <div className={styles.atmoTelemetry}>
                      <div className={styles.telemetryBar} />
                      <div className={styles.telemetryBar} />
                      <div className={styles.telemetryBar} />
                      <div className={styles.telemetryBar} />
                      <div className={styles.telemetryBar} />
                    </div>
                    <div className={styles.telemetryCode}>ASSET_ID: {t.id.toUpperCase()}</div>
                  </div>
                  <span className={styles.atmoLabel}>{t.label}</span>
                </button>
              </TiltElement>
            ))}
          </div>
        </section>

        {/* Section: System Optimization */}
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h3 className={styles.sectionTitle}>System Optimization</h3>
            <span className={styles.sectionTag}>[ UI_PERFORMANCE ]</span>
          </div>
          <div className={styles.controlsRow}>
            <div className={styles.controlCard}>
              <div className={styles.controlInfo}>
                <span className={styles.controlLabel}>Cinematic Motion</span>
                <span className={styles.controlDesc}>HUD overlays and transitions.</span>
              </div>
              <NexusToggle 
                isChecked={settings.cinematicAnimations} 
                onChange={() => toggleSetting('cinematicAnimations', 'Motion')} 
              />
            </div>

            <div className={styles.controlCard}>
              <div className={styles.controlInfo}>
                <span className={styles.controlLabel}>Quantum Density</span>
                <span className={styles.controlDesc}>Compact interface orchestration.</span>
              </div>
              <NexusToggle 
                isChecked={settings.uiCompact} 
                onChange={() => toggleSetting('uiCompact', 'Density')} 
              />
            </div>

            <div className={styles.controlCard}>
              <div className={styles.controlInfo}>
                <span className={styles.controlLabel}>Haptic Feedback</span>
                <span className={styles.controlDesc}>Tactile simulation responses.</span>
              </div>
              <NexusToggle 
                isChecked={settings.hapticFeedback} 
                onChange={() => toggleSetting('hapticFeedback', 'Haptics')} 
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
