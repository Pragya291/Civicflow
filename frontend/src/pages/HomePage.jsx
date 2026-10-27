import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  PlusCircle, 
  Users, 
  HardHat, 
  Send, 
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { complaintService } from '../services/api';

const DEFAULT_RECENT_INCIDENTS = [
  {
    id: 8,
    complaint_id: 'MBMC-PTH-008',
    severity: 'High',
    status: 'Resolved',
    description: 'Severe crater near station auto stand causing traffic bottleneck',
    location_name: 'Coordinates: 19.2952, 72.8544',
    created_at: '2026-10-23 10:20:22'
  },
  {
    id: 7,
    complaint_id: 'MBMC-PTH-007',
    severity: 'Low',
    status: 'Pending',
    description: 'Loose stones and bumpy road depression in front of Maxus Mall Bhayandar West.',
    location_name: 'Near Maxus Mall, Bhayandar West',
    created_at: '2026-10-02 04:13:07'
  },
  {
    id: 6,
    complaint_id: 'MBMC-PTH-006',
    severity: 'High',
    status: 'Pending',
    description: 'Hazardous edge excavation and pothole on Kashimira junction bypass heading towards Ghodbunder Road.',
    location_name: 'Kashimira Naka Junction, Western Express Hwy',
    created_at: '2026-10-01 19:13:07'
  }
];

export default function HomePage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    high_severity: 0
  });
  const [quickTrackId, setQuickTrackId] = useState('');
  const [recentComplaints, setRecentComplaints] = useState(DEFAULT_RECENT_INCIDENTS);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [statsData, complaintsData] = await Promise.all([
        complaintService.getDashboardStats(),
        complaintService.getComplaints()
      ]);
      setStats(statsData);
      if (complaintsData.complaints && complaintsData.complaints.length > 0) {
        setRecentComplaints(complaintsData.complaints.slice(0, 3));
      } else {
        setRecentComplaints(DEFAULT_RECENT_INCIDENTS);
      }
    } catch (err) {
      console.error('Error fetching home statistics:', err);
      setRecentComplaints(DEFAULT_RECENT_INCIDENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      navigate(`/track?id=${encodeURIComponent(quickTrackId.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-container">
          <div>
            <div className="hero-tag">
              <ShieldAlert size={15} /> Official Smart Urban Governance System
            </div>
            <h1 className="hero-title">
              Mira-Bhayandar <br />
              <span className="hero-highlight">Pothole Management Portal</span>
            </h1>
            <p className="hero-description">
              A centralized civic platform empowering citizens of Mira Road and Bhayandar to report road damage, pinpoint geospatial coordinates, and assist municipal engineers in fast-tracking road repairs.
            </p>

            <div className="hero-actions">
              <Link to="/report" className="btn btn-accent btn-lg">
                <PlusCircle size={20} /> Report a Pothole
              </Link>
              <Link to="/track" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                <Search size={20} /> Track Complaint
              </Link>
            </div>
          </div>

          <div>
            <div className="hero-quick-card">
              <h3>Quick Complaint Search</h3>
              <p>Have an existing complaint reference? Check live municipal action and repair status immediately.</p>
              
              <form onSubmit={handleQuickTrack}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter ID e.g. MBMC-PTH-001"
                    value={quickTrackId}
                    onChange={(e) => setQuickTrackId(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.95)', fontSize: '1rem', padding: '0.8rem 1rem' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                  <Search size={18} /> Search Status
                </button>
              </form>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '0.82rem', color: '#cbd5e1' }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Coverage: Mira Road (E/W), Bhayandar (E/W), Kashimira, Ghodbunder Link
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <div className="page-container" style={{ paddingBottom: 0 }}>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <AlertTriangle />
            </div>
            <div className="stat-details">
              <h4>{loading ? '...' : stats.total}</h4>
              <p>Total Reports</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock />
            </div>
            <div className="stat-details">
              <h4>{loading ? '...' : stats.pending}</h4>
              <p>Pending Review</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon progress">
              <HardHat />
            </div>
            <div className="stat-details">
              <h4>{loading ? '...' : stats.in_progress}</h4>
              <p>In Progress</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon resolved">
              <CheckCircle2 />
            </div>
            <div className="stat-details">
              <h4>{loading ? '...' : stats.resolved}</h4>
              <p>Roads Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Workflow Section */}
      <section className="workflow-section">
        <div className="page-container" style={{ padding: '0 1.5rem' }}>
          <div className="workflow-header">
            <h3>How The System Works</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.05rem' }}>
              A closed-loop civic governance workflow ensuring transparent accountability from citizen report to asphalt restoration.
            </p>
          </div>

          <div className="workflow-steps-grid">
            <div className="step-card">
              <span className="step-badge">Step 1</span>
              <div className="step-icon-wrap">
                <Send size={26} />
              </div>
              <h5>1. Report</h5>
              <p>Citizen snaps a photo of the damaged road and describes severity.</p>
            </div>

            <div className="step-card">
              <span className="step-badge">Step 2</span>
              <div className="step-icon-wrap">
                <MapPin size={26} />
              </div>
              <h5>2. Locate</h5>
              <p>Pick exact spot on the Leaflet map or use instant GPS geolocation.</p>
            </div>

            <div className="step-card">
              <span className="step-badge">Step 3</span>
              <div className="step-icon-wrap">
                <Users size={26} />
              </div>
              <h5>3. Assign</h5>
              <p>MBMC Admin delegates repair task to Road or Engineering Department.</p>
            </div>

            <div className="step-card">
              <span className="step-badge">Step 4</span>
              <div className="step-icon-wrap">
                <Clock size={26} />
              </div>
              <h5>4. Track</h5>
              <p>Real-time timeline tracking with unique ID like MBMC-PTH-001.</p>
            </div>

            <div className="step-card">
              <span className="step-badge">Step 5</span>
              <div className="step-icon-wrap">
                <CheckCircle2 size={26} />
              </div>
              <h5>5. Resolve</h5>
              <p>Field team fills pothole, verifies bitumen quality, and marks resolved.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Incident Reports in Mira-Bhayandar Section */}
      <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
              Recent Incident Reports in Mira-Bhayandar
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
              Live civic complaints submitted by residents
            </p>
          </div>
          <Link to="/map" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            View Live GIS Map <ArrowRight size={15} />
          </Link>
        </div>

        <div className="incident-reports-grid">
          {recentComplaints.slice(0, 3).map((c) => (
            <div key={c.id || c.complaint_id} className="incident-card">
              {/* Header: Incident ID & Badges */}
              <div className="incident-card-header">
                <span className="incident-card-id">
                  {c.complaint_id}
                </span>
                <div className="incident-card-badges">
                  <span className={`badge badge-priority-${c.severity.toLowerCase()}`}>
                    {c.severity}
                  </span>
                  <span className={`badge badge-status-${c.status.toLowerCase().replace(' ', '-')}`}>
                    {c.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="incident-card-desc">
                {c.description}
              </p>

              {/* Location Row */}
              <div className="incident-card-location">
                <MapPin size={15} />
                <span>{c.location_name}</span>
              </div>

              {/* Horizontal Divider */}
              <hr className="incident-card-divider" />

              {/* Footer: Date & Track Updates Link */}
              <div className="incident-card-footer">
                <span className="incident-card-date">
                  <Calendar size={14} />
                  <span>{c.created_at}</span>
                </span>
                <Link to={`/track?id=${encodeURIComponent(c.complaint_id)}`} className="incident-card-link">
                  Track Updates <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
