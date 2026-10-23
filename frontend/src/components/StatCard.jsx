import React from 'react';

export default function StatCard({ title, value, icon, color = 'var(--primary)', subtitle }) {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{title}</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {value}
          </div>
          {subtitle && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{subtitle}</span>
          )}
        </div>
        {icon && (
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
