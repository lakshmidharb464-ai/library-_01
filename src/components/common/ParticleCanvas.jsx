import { useEffect, useRef } from 'react';

export default function ParticleCanvas({ className }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const COLORS = ['#00ffc8', '#7b2fff', '#00b4d8', '#ffd700', '#ff4d6d'];
    const NUM_PARTICLES = 120;
    const NUM_STARS = 200;
    const NEBULA_BLOBS = 5;

    /* ── Stars ──────────────────────────────── */
    const stars = Array.from({ length: NUM_STARS }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.005 + 0.001,
    }));

    /* ── Nebula blobs ───────────────────────── */
    const blobs = Array.from({ length: NEBULA_BLOBS }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      rx: 300 + Math.random() * 200,
      ry: 200 + Math.random() * 150,
      color: COLORS[i % COLORS.length],
      alpha: 0.04 + Math.random() * 0.04,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));

    /* ── Particles ──────────────────────────── */
    const particles = Array.from({ length: NUM_PARTICLES }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2.5 + 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    /* ── Grid lines ─────────────────────────── */
    const GRID_SIZE = 80;

    let mouseX = w / 2, mouseY = h / 2;
    const onMouse = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('mousemove', onMouse);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      /* Background gradient */
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
      grad.addColorStop(0, '#0a0f24');
      grad.addColorStop(1, '#050a1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      /* Nebula blobs */
      blobs.forEach(b => {
        b.x += b.vx; b.y += b.vy;
        if (b.x < -b.rx) b.x = w + b.rx;
        if (b.x > w + b.rx) b.x = -b.rx;
        if (b.y < -b.ry) b.y = h + b.ry;
        if (b.y > h + b.ry) b.y = -b.ry;

        const eg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.rx);
        eg.addColorStop(0, `${b.color}${Math.round(b.alpha * 255).toString(16).padStart(2, '0')}`);
        eg.addColorStop(1, 'transparent');
        ctx.save();
        ctx.scale(1, b.ry / b.rx);
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.arc(b.x, b.y * (b.rx / b.ry), b.rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      /* Grid */
      ctx.strokeStyle = 'rgba(0,255,200,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      /* Stars */
      stars.forEach(s => {
        s.alpha += s.speed * (Math.random() > 0.5 ? 1 : -1);
        s.alpha = Math.max(0.1, Math.min(1, s.alpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
      });

      /* Particles + connections */
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        p.pulse += 0.02;

        /* Mouse attraction */
        const dx = mouseX - p.x, dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.vx += (dx / dist) * 0.008;
          p.vy += (dy / dist) * 0.008;
        }
        /* Speed limit */
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.5) { p.vx = (p.vx / speed) * 1.5; p.vy = (p.vy / speed) * 1.5; }

        const pa = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
        /* Glow */
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        glow.addColorStop(0, `${p.color}60`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();

        /* Core dot */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.round(pa * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        /* Connections */
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0,255,200,${0.12 * (1 - d / 100)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
