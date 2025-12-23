import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Tracker, formatCoordinate, formatSpeed } from '../data/gpsData';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface TrackerMapProps {
  trackers: Tracker[];
  selectedTracker: Tracker | null;
  onSelectTracker: (tracker: Tracker) => void;
  showTrails: boolean;
}

function createCustomIcon(tracker: Tracker, isSelected: boolean) {
  const size = isSelected ? 40 : 32;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${tracker.color};
        border: 3px solid ${isSelected ? 'white' : 'rgba(255,255,255,0.5)'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? '20px' : '16px'};
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
      ">
        ${tracker.icon}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1 });
  }, [center, map]);
  return null;
}

export function TrackerMap({ trackers, selectedTracker, onSelectTracker, showTrails }: TrackerMapProps) {
  const validTrackers = trackers.filter(t => t.position);
  
  const center: [number, number] = selectedTracker?.position
    ? [selectedTracker.position.lat, selectedTracker.position.lng]
    : validTrackers[0]?.position 
      ? [validTrackers[0].position.lat, validTrackers[0].position.lng]
      : [40.7128, -74.0060];
  
  if (validTrackers.length === 0) {
    return (
      <div className="empty-state">
        <h2>No Devices Being Tracked</h2>
        <p>Share the tracker link with devices you want to track.<br/>They need to open the link and grant location permission.</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {selectedTracker && <MapUpdater center={center} />}
      
      {validTrackers.map((tracker) => (
        <div key={tracker.id}>
          {showTrails && tracker.history && tracker.history.length > 1 && (
            <Polyline
              positions={tracker.history.map(p => [p.lat, p.lng])}
              color={tracker.color}
              weight={3}
              opacity={0.6}
            />
          )}
          
          <Marker
            position={[tracker.position.lat, tracker.position.lng]}
            icon={createCustomIcon(tracker, selectedTracker?.id === tracker.id)}
            eventHandlers={{
              click: () => onSelectTracker(tracker),
            }}
          >
            <Popup>
              <div style={{ minWidth: '150px' }}>
                <strong>{tracker.icon} {tracker.name}</strong>
                <br />
                <small>Status: {tracker.status}</small>
                <br />
                <small>Speed: {formatSpeed(tracker.position.speed)}</small>
                <br />
                <small>Lat: {formatCoordinate(tracker.position.lat, 'lat')}</small>
                <br />
                <small>Lng: {formatCoordinate(tracker.position.lng, 'lng')}</small>
              </div>
            </Popup>
          </Marker>
        </div>
      ))}
    </MapContainer>
  );
}
