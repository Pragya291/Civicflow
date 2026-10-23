import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ComplaintCard({ complaint }) {
  if (!complaint) return null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1.25rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
            {complaint.complaint_id}
          </span>
          <span className={`status-badge ${complaint.status.toLowerCase().replace(' ', '-')}`}>
            {complaint.status}
          </span>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1rem', lineHeight: 1.4 }}>
          {complaint.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} /> {complaint.location_name}
          </div>
          {complaint.created_at && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} /> {complaint.created_at}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', background: '#fafbfd' }}>
        <Link 
          to={`/track?id=${encodeURIComponent(complaint.complaint_id)}`}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Track Progress <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
