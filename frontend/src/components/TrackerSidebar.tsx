import { Tracker, formatCoordinate, formatSpeed, formatTime, getTotalDistance } from '../data/gpsData';

interface TrackerSidebarProps {
  trackers: Tracker[];
  selectedTracker: Tracker | null;
  onSelectTracker: (tracker: Tracker) => void;
}

export function TrackerSidebar({ trackers, selectedTracker, onSelectTracker }: TrackerSidebarProps) {
  const activeCount = trackers.filter(t => t.status === 'active').length;
  const totalDistance = selectedTracker 
    ? getTotalDistance(selectedTracker.history)
    : trackers.reduce((sum, t) => sum + getTotalDistance(t.history), 0);

  return (
    <div className="sidebar">
      <div className="card">
        <div className="card-title">Fleet Overview</div>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{trackers.length}</div>
            <div className="stat-label">Total Trackers</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#22c55e' }}>{activeCount}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              {trackers.filter(t => t.status === 'idle').length}
            </div>
            <div className="stat-label">Idle</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {trackers.filter(t => t.status === 'offline').length}
            </div>
            <div className="stat-label">Offline</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Trackers</div>
        <div className="tracker-list">
          {trackers.map((tracker) => (
            <div
              key={tracker.id}
              className={`tracker-item ${selectedTracker?.id === tracker.id ? 'selected' : ''}`}
              onClick={() => onSelectTracker(tracker)}
            >
              <div className="tracker-header">
                <span className="tracker-name">{tracker.icon} {tracker.name}</span>
                <span className={`tracker-status status-${tracker.status}`}>
                  {tracker.status}
                </span>
              </div>
              <div className="tracker-info">
                <span>📍 {tracker.position.lat.toFixed(4)}</span>
                <span>🚀 {formatSpeed(tracker.position.speed)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTracker && (
        <div className="card">
          <div className="card-title">Selected: {selectedTracker.name}</div>
          
          <div className="coordinates">
            <div className="coord-row">
              <span className="coord-label">Latitude:</span>
              <span className="coord-value">{formatCoordinate(selectedTracker.position.lat, 'lat')}</span>
            </div>
            <div className="coord-row">
              <span className="coord-label">Longitude:</span>
              <span className="coord-value">{formatCoordinate(selectedTracker.position.lng, 'lng')}</span>
            </div>
            <div className="coord-row">
              <span className="coord-label">Heading:</span>
              <span className="coord-value">{selectedTracker.position.heading.toFixed(0)}°</span>
            </div>
            <div className="coord-row">
              <span className="coord-label">Accuracy:</span>
              <span className="coord-value">±{selectedTracker.position.accuracy.toFixed(1)}m</span>
            </div>
          </div>

          <div className="speed-indicator">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Speed</span>
            <div className="speed-bar">
              <div 
                className="speed-fill" 
                style={{ width: `${Math.min(selectedTracker.position.speed / 80 * 100, 100)}%` }}
              />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {formatSpeed(selectedTracker.position.speed)}
            </span>
          </div>

          <div style={{ marginTop: '15px' }}>
            <div className="card-title">Recent History</div>
            <div className="history-list">
              {selectedTracker.history.slice(-5).reverse().map((pos, idx) => (
                <div key={idx} className="history-item">
                  <div>{formatCoordinate(pos.lat, 'lat')}, {formatCoordinate(pos.lng, 'lng')}</div>
                  <div className="history-time">{formatTime(pos.timestamp)} - {formatSpeed(pos.speed)}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Total Distance: <strong style={{ color: 'var(--accent)' }}>{totalDistance.toFixed(2)} km</strong>
          </div>
        </div>
      )}
    </div>
  );
}
