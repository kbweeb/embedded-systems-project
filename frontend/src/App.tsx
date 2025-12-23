import { useState, useEffect, useCallback } from 'react';
import { TrackerMap } from './components/TrackerMap';
import { TrackerSidebar } from './components/TrackerSidebar';
import { createInitialTrackers, updateTrackerPosition, Tracker } from './data/gpsData';

function App() {
  const [trackers, setTrackers] = useState<Tracker[]>(() => createInitialTrackers());
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  const [isTracking, setIsTracking] = useState(true);
  const [showTrails, setShowTrails] = useState(true);

  // Update tracker positions
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      setTrackers(prev => prev.map(tracker => updateTrackerPosition(tracker)));
    }, 2000);

    return () => clearInterval(interval);
  }, [isTracking]);

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

  const handleReset = () => {
    setTrackers(createInitialTrackers());
    setSelectedTracker(null);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🛰️ GPS Fleet Tracker</h1>
        <div className="header-actions">
          <button 
            className={`btn ${showTrails ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowTrails(!showTrails)}
          >
            {showTrails ? '📍 Trails On' : '📍 Trails Off'}
          </button>
          <button 
            className={`btn ${isTracking ? 'btn-success' : 'btn-danger'}`}
            onClick={() => setIsTracking(!isTracking)}
          >
            {isTracking ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            🔄 Reset
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
