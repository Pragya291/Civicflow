import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { createCustomMarker, MIRA_BHAYANDAR_CENTER, DEFAULT_ZOOM } from '../utils/leafletIcons';

export default function MapView({ 
  markers = [], 
  center = MIRA_BHAYANDAR_CENTER, 
  zoom = DEFAULT_ZOOM,
  height = '420px',
  onMarkerClick
}) {
  return (
    <div style={{ height, width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker
            key={marker.id || marker.complaint_id}
            position={[marker.latitude, marker.longitude]}
            icon={createCustomMarker(marker.status, marker.severity)}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(marker)
            }}
          >
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                  {marker.complaint_id}
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '6px' }}>
                  {marker.description}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Status: <strong>{marker.status}</strong>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
