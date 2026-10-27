import L from 'leaflet';

// Fix for default Leaflet icon paths in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored SVG pin markers for Pothole statuses:
// Green #2E7D32 for Resolved, Amber #F9A825 for Pending, Blue #1565C0 for In Progress, Red #D32F2F for Critical
export const createCustomMarker = (status = 'Pending', severity = '') => {
  let color = '#F9A825'; // Warning/Pending: Amber #F9A825

  if (
    status === 'Critical' || 
    severity === 'High' || 
    severity === 'Critical' || 
    status === 'high_severity'
  ) {
    color = '#D32F2F'; // Error/Critical: Red #D32F2F
  } else if (status === 'In Progress' || status === 'in_progress') {
    color = '#1565C0'; // In Progress: Deep Blue #1565C0
  } else if (status === 'Resolved' || status === 'resolved') {
    color = '#2E7D32'; // Success/Resolved: Green #2E7D32
  } else if (status === 'Pending' || status === 'pending') {
    color = '#F9A825'; // Warning/Pending: Amber #F9A825
  }

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path fill="${color}" stroke="#ffffff" stroke-width="1.8" filter="url(#shadow)" d="M16,1 C7.7,1 1,7.7 1,16 C1,27.2 16,43 16,43 C16,43 31,27.2 31,16 C31,7.7 24.3,1 16,1 Z"/>
      <circle cx="16" cy="16" r="6" fill="#ffffff"/>
      <circle cx="16" cy="16" r="3.5" fill="${color}"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-pothole-pin',
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -40],
  });
};

export const MIRA_BHAYANDAR_CENTER = [19.2952, 72.8544];
export const DEFAULT_ZOOM = 13;
