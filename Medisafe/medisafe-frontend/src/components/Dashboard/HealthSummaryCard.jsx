import React from 'react';

export default function HealthSummaryCard({ title, count, icon, color, onClick }) {
  return (
    <div style={{ ...styles.card, borderLeft: `4px solid ${color}` }} onClick={onClick}>
      <div style={styles.iconWrapper}>
        <span style={styles.icon}>{icon}</span>
      </div>
      <div style={styles.content}>
        <p style={styles.title}>{title}</p>
        <p style={{ ...styles.count, color }}>
          {count !== null ? count : '→'}
        </p>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#f7fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: '24px' },
  content: { flex: 1 },
  title: { margin: 0, color: '#718096', fontSize: '14px' },
  count: { margin: 0, fontSize: '28px', fontWeight: 'bold' }
};