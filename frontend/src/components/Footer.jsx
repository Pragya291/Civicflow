import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PhoneCall, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '28px', height: '28px', background: '#2563eb', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <ShieldCheck size={18} />
            </div>
            <h4 style={{ margin: 0 }}>Mira-Bhayandar Municipal Corporation</h4>
          </div>
          <p>
            Official Smart Urban Governance Portal for rapid detection, tracking, and resolving road potholes across Mira Road & Bhayandar municipal zones.
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1.25rem', fontSize: '0.82rem', color: '#94a3b8' }}>
            <span><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> MBMC HQ, Bhayandar (W)</span>
            <span><PhoneCall size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Helpline: 1800-22-3112</span>
          </div>
        </div>

        <div className="footer-col">
          <h5>Quick Portals</h5>
          <ul>
            <li><Link to="/report">Report a Pothole</Link></li>
            <li><Link to="/track">Track Complaint Status</Link></li>
            <li><Link to="/map">Live GIS Pothole Map</Link></li>
            <li><Link to="/login">Citizen / Admin Sign-in</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>MBMC Departments</h5>
          <ul>
            <li>Road Construction & Maintenance</li>
            <li>Municipal Engineering Department</li>
            <li>Ward 4 Infrastructure Unit</li>
            <li>Drainage & Pavement Cell</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Mira-Bhayandar Municipal Corporation (MBMC) &bull; College Capstone Prototype &bull; Developed with React, Flask & SQLite</p>
      </div>
    </footer>
  );
}
