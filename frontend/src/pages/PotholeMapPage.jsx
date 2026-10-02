import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { 
  Filter, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  ExternalLink,
  Layers,
  CheckCircle2,
  Clock,
  HardHat
} from 'lucide-react';
import { complaintService } from '../services/api';
import { createCustomMarker, MIRA_BHAYANDAR_CENTER, DEFAULT_ZOOM } from '../utils/leafletIcons';

export default function PotholeMapPage() {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  useEffect(() => {
    loadMapMarkers();
  }, []);

  const loadMapMarkers = async () => {
    try {
      const res = await complaintService.getMapMarkers();
      setMarkers(res.markers || []);
    } catch (err) {
      console.error('Error fetching map markers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkers = markers.filter((m) => {
    const statusMatch = statusFilter === 'All' || m.status === statusFilter;
    const severityMatch = severityFilter === 'All' || m.severity === severityFilter;
    return statusMatch && severityMatch;
  });

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Mira-Bhayandar GIS Pothole Map</h2>
          <p>Interactive spatial mapping of reported road hazards across municipal zones.</p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.8rem', background: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.82rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Status Legend:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }} /> Pending
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} /> In Progress
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Resolved
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
              <Filter size={16} /> Filters:
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Status:</label>
              <select
                className="form-select"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem', width: 'auto' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Severity:</label>
              <select
                className="form-select"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem', width: 'auto' }}
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="All">All Severities</option>
                <option value="High">High Severity</option>
                <option value="Medium">Medium Severity</option>
                <option value="Low">Low Severity</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{filteredMarkers.length}</span> of {markers.length} potholes
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="map-wrapper">
        <MapContainer
          center={MIRA_BHAYANDAR_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &bull; MBMC GIS'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.latitude, marker.longitude]}
              icon={createCustomMarker(marker.status)}
            >
              <Popup>
                <div className="map-popup-card">
                  <div className="map-popup-header">
                    <span className="map-popup-title">{marker.complaint_id}</span>
                    <span className={`badge badge-status-${marker.status.toLowerCase().replace(' ', '-')}`}>
                      {marker.status}
                    </span>
                  </div>

                  {marker.photo && (
                    <img 
                      src={`/uploads/${marker.photo}`} 
                      alt={marker.complaint_id} 
                      className="map-popup-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}

                  <p className="map-popup-desc">
                    {marker.description}
                  </p>

                  <div style={{ marginBottom: '0.4rem', fontSize: '0.78rem', color: '#334155' }}>
                    <MapPin size={13} style={{ display: 'inline', color: '#dc2626', marginRight: '3px' }} />
                    <strong>{marker.location_name}</strong>
                  </div>

                  <div className="map-popup-meta">
                    <span className={`badge badge-sev-${marker.severity.toLowerCase()}`}>
                      {marker.severity}
                    </span>
                    <span>
                      <Calendar size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {marker.created_at}
                    </span>
                  </div>

                  <div style={{ marginTop: '0.6rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem' }}>
                    <Link
                      to={`/track?id=${marker.complaint_id}`}
                      style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      Track & View Full Details <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

    </div>
  );
}
