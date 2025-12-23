export interface GPSPosition {
  lat: number;
  lng: number;
  timestamp: number;
  speed: number;
  heading: number;
  accuracy: number;
}

export interface Tracker {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline';
  position: GPSPosition;
  history: GPSPosition[];
  color: string;
  icon: string;
}

// Sample locations around a city (can be customized)
const baseLocations = [
  { lat: 40.7128, lng: -74.0060, name: 'New York' },
  { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
  { lat: 51.5074, lng: -0.1278, name: 'London' },
  { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
];

const trackerNames = [
  'Vehicle Alpha',
  'Delivery Van 01',
  'Fleet Truck 03',
  'Courier Bike',
  'Service Van',
];

const trackerColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
const trackerIcons = ['🚗', '🚐', '🚚', '🚲', '🚙'];

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generatePosition(baseLat: number, baseLng: number, radius: number = 0.05): GPSPosition {
  return {
    lat: baseLat + randomInRange(-radius, radius),
    lng: baseLng + randomInRange(-radius, radius),
    timestamp: Date.now(),
    speed: randomInRange(0, 80),
    heading: randomInRange(0, 360),
    accuracy: randomInRange(3, 15),
  };
}

export function createInitialTrackers(): Tracker[] {
  const base = baseLocations[0]; // Use New York as default
  
  return trackerNames.map((name, index) => {
    const position = generatePosition(base.lat, base.lng, 0.03);
    return {
      id: `tracker-${index + 1}`,
      name,
      status: index < 3 ? 'active' : (index === 3 ? 'idle' : 'offline'),
      position,
      history: [position],
      color: trackerColors[index],
      icon: trackerIcons[index],
    };
  });
}

export function updateTrackerPosition(tracker: Tracker): Tracker {
  if (tracker.status === 'offline') return tracker;
  
  const lastPos = tracker.position;
  const moveAmount = tracker.status === 'active' ? 0.001 : 0.0002;
  
  // Move in current heading direction with some randomness
  const headingRad = (lastPos.heading + randomInRange(-30, 30)) * (Math.PI / 180);
  const newLat = lastPos.lat + Math.cos(headingRad) * moveAmount;
  const newLng = lastPos.lng + Math.sin(headingRad) * moveAmount;
  
  const newPosition: GPSPosition = {
    lat: newLat,
    lng: newLng,
    timestamp: Date.now(),
    speed: tracker.status === 'active' ? randomInRange(20, 60) : randomInRange(0, 5),
    heading: (lastPos.heading + randomInRange(-20, 20) + 360) % 360,
    accuracy: randomInRange(3, 10),
  };
  
  // Keep last 50 positions in history
  const history = [...tracker.history, newPosition].slice(-50);
  
  return {
    ...tracker,
    position: newPosition,
    history,
  };
}

export function formatCoordinate(value: number, type: 'lat' | 'lng'): string {
  const direction = type === 'lat' 
    ? (value >= 0 ? 'N' : 'S')
    : (value >= 0 ? 'E' : 'W');
  return `${Math.abs(value).toFixed(6)}° ${direction}`;
}

export function formatSpeed(speed: number): string {
  return `${speed.toFixed(1)} km/h`;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export function calculateDistance(pos1: GPSPosition, pos2: GPSPosition): number {
  const R = 6371; // Earth's radius in km
  const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
  const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function getTotalDistance(history: GPSPosition[]): number {
  let total = 0;
  for (let i = 1; i < history.length; i++) {
    total += calculateDistance(history[i-1], history[i]);
  }
  return total;
}
