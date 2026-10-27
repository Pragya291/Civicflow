import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  HardHat, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Building2,
  Image as ImageIcon
} from 'lucide-react';
import { complaintService } from '../services/api';

export default function TrackComplaintPage({ user }) {
  const [searchParams] = useSearchParams();
  const [complaintIdInput, setComplaintIdInput] = useState(searchParams.get('id') || '');
  const [complaint, setComplaint] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const idFromQuery = searchParams.get('id');
    if (idFromQuery) {
      setComplaintIdInput(idFromQuery);
      fetchComplaint(idFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    // If logged in as citizen, load their recent complaints for 1-click tracking
    if (user && user.id) {
      loadUserComplaints();
    }
  }, [user]);

  const loadUserComplaints = async () => {
    try {
      const res = await complaintService.getComplaints({ user_id: user.id });
      setMyComplaints(res.complaints || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComplaint = async (idToSearch) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError('');
    setComplaint(null);

    try {
      const res = await complaintService.getComplaintById(idToSearch.trim());
      setComplaint(res.complaint);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || `Complaint with ID "${idToSearch}" was not found. Please verify the reference.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaint(complaintIdInput);
  };

  // Helper for Stepper State
  const getStepStatus = (currentStatus, stepName) => {
    const sequence = ['Pending', 'In Progress', 'Resolved'];
    const currentIndex = sequence.indexOf(currentStatus);
    const stepIndex = sequence.indexOf(stepName);

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'upcoming';
  };

  const calculateProgressWidth = (status) => {
    if (status === 'Pending') return '0%';
    if (status === 'In Progress') return '50%';
    if (status === 'Resolved') return '100%';
    return '0%';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Track Municipal Complaint</h2>
        <p>Monitor live resolution steps, assigned engineering teams, and repair verification.</p>
      </div>

      {/* Search Input Box */}
      <div className="card" style={{ maxWidth: '640px', margin: '0 auto 2.5rem' }}>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Complaint ID (e.g. MBMC-PTH-001)"
                value={complaintIdInput}
                onChange={(e) => setComplaintIdInput(e.target.value)}
                style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <Search size={18} /> {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {/* Quick Shortcuts for Demo or Logged-In Citizens */}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Try Demo IDs:</span>
            {['MBMC-PTH-001', 'MBMC-PTH-002', 'MBMC-PTH-003', 'MBMC-PTH-004'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setComplaintIdInput(id);
                  fetchComplaint(id);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.76rem', padding: '0.2rem 0.5rem' }}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ maxWidth: '640px', margin: '0 auto 2rem' }}>
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Complaint Details Card */}
      {complaint && (
        <div className="card" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Grievance Reference
              </span>
              <h3 style={{ fontSize: '1.45rem', color: 'var(--primary)', margin: 0 }}>
                {complaint.complaint_id}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className={`badge badge-sev-${complaint.severity.toLowerCase()}`}>
                Severity: {complaint.severity}
              </span>
              <span className={`badge badge-status-${complaint.status.toLowerCase().replace(' ', '-')}`}>
                Status: {complaint.status}
              </span>
            </div>
          </div>

          <div className="card-body">
            {/* Visual Workflow Stepper: Pending -> In Progress -> Resolved */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h5 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1rem' }}>
                Resolution Workflow Progress
              </h5>
              
              <div className="timeline-stepper">
                <div 
                  className="timeline-progress-bar"
                  style={{ width: calculateProgressWidth(complaint.status) }}
                />

                {/* Step 1: Pending */}
                <div className={`timeline-step ${getStepStatus(complaint.status, 'Pending')}`}>
                  <div className="step-node">
                    {getStepStatus(complaint.status, 'Pending') === 'completed' ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <Clock size={20} />
                    )}
                  </div>
                  <div className="step-title">1. Pending</div>
                  <div className="step-subtitle">Logged in System</div>
                </div>

                {/* Step 2: In Progress */}
                <div className={`timeline-step ${getStepStatus(complaint.status, 'In Progress')}`}>
                  <div className="step-node">
                    {getStepStatus(complaint.status, 'In Progress') === 'completed' ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <HardHat size={20} />
                    )}
                  </div>
                  <div className="step-title">2. In Progress</div>
                  <div className="step-subtitle">Assigned & Inspection</div>
                </div>

                {/* Step 3: Resolved */}
                <div className={`timeline-step ${getStepStatus(complaint.status, 'Resolved')}`}>
                  <div className="step-node">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="step-title">3. Resolved</div>
                  <div className="step-subtitle">Repaired & Verified</div>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              
              {/* Photo Preview if any */}
              {complaint.photo && (
                <div>
                  <h5 style={{ fontSize: '0.92rem', marginBottom: '0.5rem', color: '#475569' }}>
                    <ImageIcon size={15} style={{ display: 'inline', marginRight: '4px' }} /> Uploaded Photographic Proof
                  </h5>
                  <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', background: '#0f172a' }}>
                    <img 
                      src={`/uploads/${complaint.photo}`} 
                      alt="Pothole"
                      style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Data details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Description
                  </h5>
                  <p style={{ fontSize: '0.95rem', color: '#1e293b', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                    {complaint.description}
                  </p>
                </div>

                <div>
                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Location & Coordinates
                  </h5>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.92rem', color: '#334155' }}>
                    <MapPin size={16} style={{ color: '#1565C0', flexShrink: 0 }} />
                    <span>{complaint.location_name}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '1.4rem' }}>
                    Lat: {complaint.latitude?.toFixed(4)}, Lng: {complaint.longitude?.toFixed(4)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Assigned Department
                    </h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, color: complaint.assigned_department === 'Not Assigned' ? '#F9A825' : '#1565C0' }}>
                      <Building2 size={16} />
                      <span>{complaint.assigned_department}</span>
                    </div>
                  </div>

                  <div>
                    <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Date Reported
                    </h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: '#334155' }}>
                      <Calendar size={16} />
                      <span>{complaint.created_at}</span>
                    </div>
                  </div>
                </div>

                {complaint.updated_at && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    Last Status Update: {complaint.updated_at}
                  </div>
                )}
              </div>

            </div>

            {/* Department Assignment Notes Timeline */}
            {complaint.assignment_history && complaint.assignment_history.length > 0 && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <h5 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#334155' }}>
                  Department Action Log
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {complaint.assignment_history.map((a) => (
                    <div key={a.id} style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.86rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{a.department_name}</span>
                        <span style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}>{a.assigned_at}</span>
                      </div>
                      <p style={{ color: '#475569', margin: 0 }}>{a.notes || 'Dispatched field engineering inspection unit.'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Logged in Citizen's Complaints Quick List */}
      {user && myComplaints.length > 0 && (
        <div style={{ maxWidth: '850px', margin: '3rem auto 0' }}>
          <h4 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: '#334155' }}>
            My Submitted Complaints ({myComplaints.length})
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {myComplaints.map((c) => (
              <div 
                key={c.id} 
                onClick={() => {
                  setComplaintIdInput(c.complaint_id);
                  fetchComplaint(c.complaint_id);
                }}
                className="card"
                style={{ padding: '1rem', cursor: 'pointer', borderLeft: '4px solid var(--primary)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>{c.complaint_id}</span>
                  <span className={`badge badge-status-${c.status.toLowerCase().replace(' ', '-')}`}>{c.status}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {c.description}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                  {c.created_at}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
