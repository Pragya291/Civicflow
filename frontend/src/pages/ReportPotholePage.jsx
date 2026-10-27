import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { 
  Upload, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  ArrowRight, 
  Crosshair,
  Image as ImageIcon
} from 'lucide-react';
import { complaintService } from '../services/api';
import { createCustomMarker, MIRA_BHAYANDAR_CENTER } from '../utils/leafletIcons';

// Subcomponent to listen to map clicks and update position
function MapClickHandler({ position, setPosition, setLocationName }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
    },
  });

  return position ? (
    <Marker position={position} icon={createCustomMarker('Pending')} />
  ) : null;
}

export default function ReportPotholePage({ user }) {
  const [formData, setFormData] = useState({
    description: '',
    severity: 'Medium',
    location_name: '',
  });
  const [position, setPosition] = useState(MIRA_BHAYANDAR_CENTER);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Submission success state
  const [submittedComplaint, setSubmittedComplaint] = useState(null);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  // Handle preset locations in Mira-Bhayandar for quick testing
  const presets = [
    { label: 'Mira Road Station (E)', lat: 19.2815, lng: 72.8558, name: 'Near Railway Station East, Mira Road' },
    { label: 'Beverly Park, Kanakia', lat: 19.2894, lng: 72.8625, name: 'Beverly Park Main Road, Mira Road' },
    { label: 'Silver Park Signal', lat: 19.2945, lng: 72.8590, name: 'Silver Park Junction, Mira-Bhayandar Road' },
    { label: 'Bhayandar (W) Flyover', lat: 19.3082, lng: 72.8521, name: 'Station Flyover, Bhayandar West' },
    { label: 'Kashimira Naka', lat: 19.2680, lng: 72.8795, name: 'Kashimira Junction, Western Express Hwy' }
  ];

  const handlePresetSelect = (p) => {
    setPosition([p.lat, p.lng]);
    setFormData(prev => ({ ...prev, location_name: p.name }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition([lat, lng]);
          if (!formData.location_name) {
            setFormData(prev => ({ ...prev, location_name: `Device GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
          }
        },
        (err) => {
          alert('Could not access current location. Please select on the map.');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.description.trim()) {
      setError('Please provide a description of the road damage.');
      return;
    }

    if (!position || !position[0] || !position[1]) {
      setError('Please select the pothole location on the map.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('description', formData.description);
      payload.append('severity', formData.severity);
      payload.append('location_name', formData.location_name || `Coordinates: ${position[0].toFixed(4)}, ${position[1].toFixed(4)}`);
      payload.append('latitude', position[0]);
      payload.append('longitude', position[1]);
      
      if (user && user.id) {
        payload.append('user_id', user.id);
      }

      if (photoFile) {
        payload.append('photo', photoFile);
      }

      const res = await complaintService.submitComplaint(payload);
      setSubmittedComplaint(res.complaint);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (submittedComplaint) {
      navigator.clipboard.writeText(submittedComplaint.complaint_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If already submitted, display Confirmation Card with generated ID
  if (submittedComplaint) {
    return (
      <div className="page-container" style={{ maxWidth: '650px', paddingTop: '3rem' }}>
        <div className="card" style={{ borderTop: '5px solid #2E7D32', textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', background: '#E8F5E9', color: '#2E7D32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Pothole Complaint Registered!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Your grievance has been officially logged with Mira-Bhayandar Municipal Corporation and queued for engineering inspection.
          </p>

          <div style={{ background: '#F5F7FA', border: '2px dashed #90CAF9', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
              Official Complaint Reference ID
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                {submittedComplaint.complaint_id}
              </span>
              <button 
                onClick={handleCopyId} 
                className="btn btn-secondary btn-sm"
                title="Copy Complaint ID"
              >
                <Copy size={16} /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.5rem' }}>
              Please save this ID to track municipal repair progress anytime.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to={`/track?id=${submittedComplaint.complaint_id}`} className="btn btn-primary">
              Track Status Now <ArrowRight size={17} />
            </Link>
            <button 
              onClick={() => {
                setSubmittedComplaint(null);
                setFormData({ description: '', severity: 'Medium', location_name: '' });
                setPhotoFile(null);
                setPhotoPreview(null);
              }} 
              className="btn btn-secondary"
            >
              Report Another Pothole
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Report Road Damage / Pothole</h2>
        <p>Submit photographic proof and pinpoint road coordinates to notify MBMC engineers.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          
          {/* Left Column: Form Fields & Photo */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Complaint Details</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Pothole Description *</label>
                <textarea
                  required
                  rows={4}
                  className="form-textarea"
                  placeholder="Describe the severity, road condition, depth, and any immediate hazard to vehicles..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Severity Level *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {['Low', 'Medium', 'High'].map((sev) => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setFormData({ ...formData, severity: sev })}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: formData.severity === sev ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: formData.severity === sev ? 'var(--primary-light)' : 'white',
                        color: formData.severity === sev ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {sev === 'High' && '🚨 '}
                      {sev === 'Medium' && '⚠️ '}
                      {sev === 'Low' && 'ℹ️ '}
                      {sev}
                    </button>
                  ))}
                </div>
                <div className="form-help">High severity indicates deep craters or immediate collision risks.</div>
              </div>

              <div className="form-group">
                <label className="form-label">Photograph Upload</label>
                <div 
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => document.getElementById('photo-upload-input').click()}
                >
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoChange}
                  />

                  {photoPreview ? (
                    <div>
                      <img 
                        src={photoPreview} 
                        alt="Pothole preview" 
                        style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
                      />
                      <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                        Click to change photograph
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ width: '44px', height: '44px', background: 'white', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', color: 'var(--text-muted)' }}>
                        <Upload size={20} />
                      </div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>Upload Pothole Photo</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>PNG, JPG or WEBP up to 16MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Street / Landmark Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Near Kanakia Police Station, Mira Road (E)"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-accent btn-lg"
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {submitting ? 'Submitting Report...' : 'Submit Pothole Complaint'}
              </button>
            </div>
          </div>

          {/* Right Column: Leaflet Map & Location Picker */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Geospatial Coordinates</h3>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="btn btn-outline btn-sm"
              >
                <Crosshair size={14} /> My GPS
              </button>
            </div>
            <div className="card-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                <MapPin size={14} style={{ display: 'inline', color: '#D32F2F' }} /> Click anywhere on the map to pin the exact pothole spot:
              </p>

              {/* Quick Presets for Demo */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', alignSelf: 'center' }}>Presets:</span>
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem' }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Leaflet Map Picker */}
              <div style={{ height: '360px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <MapContainer
                  center={position}
                  zoom={13}
                  scrollWheelZoom={true}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler
                    position={position}
                    setPosition={setPosition}
                    setLocationName={(name) => setFormData(prev => ({ ...prev, location_name: name }))}
                  />
                </MapContainer>
              </div>

              {/* Selected Lat / Lng Display */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    readOnly
                    className="form-control"
                    value={position[0]}
                    style={{ background: '#f8fafc', fontWeight: 600 }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    readOnly
                    className="form-control"
                    value={position[1]}
                    style={{ background: '#f8fafc', fontWeight: 600 }}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
