import { useState, useEffect, useCallback, useRef } from 'react';
import { TrackerMap } from './components/TrackerMap';
import { TrackerSidebar } from './components/TrackerSidebar';
import { Tracker } from './data/gpsData';

const BACKEND_WS = import.meta.env.VITE_BACKEND_WS || 'wss://embedded-systems-project-60lg.onrender.com';
const BACKEND_HTTP = import.meta.env.VITE_BACKEND_HTTP || 'https://embedded-systems-project-60lg.onrender.com';

function App() {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showTrails, setShowTrails] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket backend
  useEffect(() => {
    function connect() {
      const ws = new WebSocket(`${BACKEND_WS}?type=dashboard`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'devices') {
          setTrackers(data.data);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Keep selected tracker in sync
  useEffect(() => {
    if (selectedTracker) {
      const updated = trackers.find(t => t.id === selectedTracker.id);
      if (updated) {
        setSelectedTracker(updated);
      }
    }
  }, [trackers, selectedTracker?.id]);

  const handleSelectTracker = useCallback((tracker: Tracker) => {
    setSelectedTracker(prev => prev?.id === tracker.id ? null : tracker);
  }, []);

  const trackerLink = `${BACKEND_HTTP}/tracker`;

  return (
    <div className="app">
      <header className="header">
        <h1>📱 Phone Tracker</h1>
        <div className="header-actions">
          <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </span>
          <button 
            className={`btn ${showTrails ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowTrails(!showTrails)}
          >
            {showTrails ? '📍 Trails On' : '📍 Trails Off'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigator.clipboard.writeText(trackerLink)}
          >
            📋 Copy Tracker Link
          </button>
        </div>
      </header>

      <TrackerSidebar
        trackers={trackers}
        selectedTracker={selectedTracker}
        onSelectTracker={handleSelectTracker}
      />

      <div className="map-container">
        <TrackerMap
          trackers={trackers}
          selectedTracker={selectedTracker}
          onSelectTracker={handleSelectTracker}
          showTrails={showTrails}
        />
      </div>
    </div>
  );
}

export default App;
