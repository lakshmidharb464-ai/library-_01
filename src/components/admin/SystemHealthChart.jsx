import React from 'react';
import styles from './SystemHealthChart.module.css';

export default function SystemHealthChart({ data, label, color = '#00ffc8' }) {
  const maxValue = Math.max(...data, 10);
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (val / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.current} style={{ color }}>{data[data.length - 1]}%</span>
      </div>
      <div className={styles.chartWrapper}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.svg}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
            className={styles.line}
          />
          <polygon
            fill="url(#chartGradient)"
            points={`0,100 ${points} 100,100`}
          />
        </svg>
        <div className={styles.grid}>
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
        </div>
      </div>
      <div className={styles.footer}>
        <span>T-7cycles</span>
        <span>MARK: OPTIMAL</span>
        <span>REAL-TIME</span>
      </div>
    </div>
  );
}
