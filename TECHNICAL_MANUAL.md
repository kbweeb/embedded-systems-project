# GPS Phone Tracker System - Complete Technical Manual

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Backend Server](#4-backend-server)
5. [Frontend Dashboard](#5-frontend-dashboard)
6. [Progressive Web App (PWA) Tracker](#6-progressive-web-app-pwa-tracker)
7. [Android Native Application](#7-android-native-application)
8. [Geolocation Technology](#8-geolocation-technology)
9. [Real-Time Communication](#9-real-time-communication)
10. [Security Considerations](#10-security-considerations)
11. [Deployment Guide](#11-deployment-guide)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Project Overview

### 1.1 What This Project Does

This project is a real-time GPS phone tracking system that allows you to:
- Track the location of multiple mobile devices simultaneously
- View device locations on an interactive map with trail history
- Monitor device status (active, idle, offline)
- Register devices with custom names

### 1.2 The Embedded Systems Connection

While this project evolved into a software-based tracking solution, it demonstrates core embedded systems concepts:

| Embedded Systems Concept | Implementation in This Project |
|-------------------------|-------------------------------|
| **Sensors** | GPS/GNSS sensors in mobile devices |
| **Data Acquisition** | Geolocation API reads sensor data |
| **Real-time Processing** | Continuous location updates every 5-10 seconds |
| **Communication Protocols** | WebSocket for bidirectional real-time data |
| **Power Management** | Android foreground service with battery optimization |
| **Firmware/Software** | Native Android app running as background service |

### 1.3 Project Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        SYSTEM OVERVIEW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐         ┌──────────────┐                    │
│   │   Android    │         │     PWA      │                    │
│   │     App      │         │   Tracker    │                    │
│   │  (Mobile)    │         │  (Browser)   │                    │
│   └──────┬───────┘         └──────┬───────┘                    │
│          │                        │                            │
│          │    WebSocket Connection                             │
│          │    (Real-time, Bidirectional)                       │
│          ▼                        ▼                            │
│   ┌─────────────────────────────────────────┐                  │
│   │           BACKEND SERVER                │                  │
│   │         (Node.js + Express)             │                  │
│   │                                         │                  │
│   │  • WebSocket Server (ws library)        │                  │
│   │  • Device Registry (In-memory Map)      │                  │
│   │  • Static File Server (PWA files)       │                  │
│   │  • REST API (/api/devices)              │                  │
│   └─────────────────┬───────────────────────┘                  │
│                     │                                          │
│                     │ WebSocket Connection                     │
│                     ▼                                          │
│   ┌─────────────────────────────────────────┐                  │
│   │         FRONTEND DASHBOARD              │                  │
│   │        (React + TypeScript)             │                  │
│   │                                         │                  │
│   │  • Interactive Map (Leaflet)            │                  │
│   │  • Device List & Status                 │                  │
│   │  • Trail Visualization                  │                  │
│   └─────────────────────────────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. System Architecture

### 2.1 Client-Server Model

This project uses a **client-server architecture** with three types of clients:

1. **Tracker Clients** (Android App or PWA)
   - Send location data TO the server
   - Maintain persistent WebSocket connection
   - Reconnect automatically if disconnected

2. **Dashboard Clients** (Web Browser)
   - Receive location data FROM the server
   - Display real-time updates on map
   - No location sharing, only viewing

3. **Backend Server** (Node.js)
   - Receives data from tracker clients
   - Broadcasts to dashboard clients
   - Maintains device registry

### 2.2 Data Flow

```
Step 1: Device Registration
┌──────────┐                           ┌──────────┐
│  Mobile  │ ──── WebSocket Connect ──▶│  Server  │
│  Device  │◀── {type:'registered'} ───│          │
└──────────┘                           └──────────┘

Step 2: Location Updates
┌──────────┐                           ┌──────────┐
│  Mobile  │ ── {type:'location',...} ▶│  Server  │
│  Device  │                           │          │
└──────────┘                           └────┬─────┘
                                            │
Step 3: Broadcast to Dashboard              │
┌──────────┐                                │
│Dashboard │◀── {type:'devices',[...]} ─────┘
│  Client  │
└──────────┘
```

### 2.3 Why This Architecture?

| Design Decision | Reason |
|----------------|--------|
| **WebSocket over HTTP Polling** | Lower latency, reduced bandwidth, real-time updates |
| **Centralized Server** | Single source of truth for all device data |
| **In-Memory Storage** | Fast access, no database complexity for MVP |
| **Separate Tracker/Dashboard** | Security: trackers can't see other devices |

---

## 3. Technology Stack

### 3.1 Backend Technologies

#### Node.js
**What it is:** JavaScript runtime built on Chrome's V8 engine

**Why we chose it:**
- Non-blocking I/O perfect for real-time applications
- Same language (JavaScript) as frontend
- Excellent WebSocket library support
- Easy deployment on free platforms (Render, Heroku)

#### Express.js
**What it is:** Minimal web framework for Node.js

**Why we chose it:**
- Industry standard for Node.js web servers
- Simple routing and middleware system
- Serves static files (PWA tracker page)
- Easy to add REST API endpoints

#### ws (WebSocket Library)
**What it is:** Simple, fast WebSocket implementation for Node.js

**Why we chose it:**
- Lightweight (no dependencies)
- Full WebSocket protocol support
- Works with Node.js HTTP server
- Better performance than Socket.io for simple use cases

### 3.2 Frontend Technologies

#### React
**What it is:** JavaScript library for building user interfaces

**Why we chose it:**
- Component-based architecture
- Efficient DOM updates with Virtual DOM
- Large ecosystem and community
- Easy state management with hooks

#### TypeScript
**What it is:** Typed superset of JavaScript

**Why we chose it:**
- Catches errors at compile time
- Better IDE support and autocomplete
- Self-documenting code with types
- Interfaces define data structures clearly

#### Leaflet + React-Leaflet
**What it is:** Open-source JavaScript library for interactive maps

**Why we chose it:**
- Free and open-source (no API key required)
- Uses OpenStreetMap tiles (free)
- Lightweight compared to Google Maps
- Easy React integration with react-leaflet

#### Vite
**What it is:** Modern frontend build tool

**Why we chose it:**
- Extremely fast hot module replacement
- Native ES modules support
- Simple configuration
- Built-in TypeScript support

### 3.3 Android Technologies

#### Java
**What it is:** Object-oriented programming language

**Why we chose it:**
- Native Android development language
- Full access to Android APIs
- Background service support
- Mature ecosystem

#### Google Play Services Location
**What it is:** Google's location API for Android

**Why we chose it:**
- More accurate than raw GPS
- Fused location provider (GPS + WiFi + Cell)
- Battery-efficient location updates
- Easy-to-use API

#### Java-WebSocket
**What it is:** WebSocket client library for Java

**Why we chose it:**
- Pure Java implementation
- Works on Android
- Simple API
- Automatic reconnection support

---

## 4. Backend Server

### 4.1 File Structure

```
backend/
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
├── package-lock.json   # Locked dependency versions
└── tracker/            # PWA tracker files
    ├── index.html      # Tracker page
    ├── manifest.json   # PWA manifest
    └── sw.js           # Service worker
```

### 4.2 Server.js Explained

#### Imports and Setup

```javascript
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
```

**Why each import:**
- `express`: Web server framework
- `createServer`: Creates HTTP server that WebSocket attaches to
- `WebSocketServer`: WebSocket server from 'ws' library
- `cors`: Allows cross-origin requests (frontend on different domain)
- `uuidv4`: Generates unique device IDs
- `path`, `fileURLToPath`: Handle file paths for ES modules

#### Device Storage

```javascript
const devices = new Map();
const dashboardClients = new Set();
```

**Why Map and Set:**
- `Map`: Key-value storage for devices (deviceId → deviceData)
  - O(1) lookup time
  - Easy iteration
  - Keys can be any type
  
- `Set`: Collection of unique dashboard WebSocket connections
  - O(1) add/delete/check operations
  - Automatically handles duplicates

#### Device Data Structure

```javascript
{
  id: 'uuid-string',           // Unique identifier
  name: 'John Phone',          // User-provided name
  status: 'active',            // 'active', 'idle', or 'offline'
  position: {                  // Current location
    lat: 40.7128,
    lng: -74.0060,
    timestamp: 1703318400000,
    speed: 5.2,
    heading: 180,
    accuracy: 10
  },
  history: [...],              // Array of past positions (max 100)
  color: '#3b82f6',           // Display color on map
  lastSeen: 1703318400000     // Last update timestamp
}
```

#### WebSocket Connection Handling

```javascript
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const type = url.searchParams.get('type');
```

**How it works:**
1. Client connects with URL parameters: `?type=tracker&deviceId=xxx&name=xxx`
2. Server parses URL to determine client type
3. Different logic for 'dashboard' vs 'tracker' clients

#### Tracker Client Logic

```javascript
if (deviceId && devices.has(deviceId)) {
  // Existing device - update name if provided
  const device = devices.get(deviceId);
  if (deviceName) {
    device.name = decodeURIComponent(deviceName);
  }
  device.status = 'active';
  device.lastSeen = Date.now();
} else {
  // New device - create entry
  devices.set(deviceId, { ... });
}
```

**Why this logic:**
- Prevents duplicate registrations
- Allows name updates on reconnection
- Preserves history across reconnections

#### Broadcasting Updates

```javascript
function broadcastToClients() {
  const deviceList = Array.from(devices.values()).map(d => ({
    id: d.id,
    name: d.name,
    status: d.status,
    position: d.position,
    history: d.history,
    color: d.color,
    icon: '📱',
    lastSeen: d.lastSeen
  }));
  
  const message = JSON.stringify({ type: 'devices', data: deviceList });
  dashboardClients.forEach(client => {
    if (client.readyState === 1) {  // 1 = OPEN
      client.send(message);
    }
  });
}
```

**Why broadcast pattern:**
- All dashboards receive same data
- Single transformation, multiple sends
- Check connection state before sending

#### Idle Detection

```javascript
setInterval(() => {
  const now = Date.now();
  devices.forEach(device => {
    if (device.status === 'active' && now - device.lastSeen > 30000) {
      device.status = 'idle';
      broadcastToClients();
    }
  });
}, 10000);
```

**Why 30-second threshold:**
- Location updates every 10 seconds
- 30 seconds = 3 missed updates
- Balances responsiveness with network tolerance

---

## 5. Frontend Dashboard

### 5.1 File Structure

```
frontend/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles
│   ├── components/
│   │   ├── TrackerMap.tsx   # Map visualization
│   │   └── TrackerSidebar.tsx # Device list sidebar
│   └── data/
│       └── gpsData.ts       # Type definitions and utilities
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

### 5.2 App.tsx Explained

#### WebSocket Connection

```typescript
const BACKEND_WS = import.meta.env.VITE_BACKEND_WS || 'wss://...';
const BACKEND_HTTP = import.meta.env.VITE_BACKEND_HTTP || 'https://...';
```

**Why environment variables:**
- Different URLs for development vs production
- `VITE_` prefix required for Vite to expose to client
- Fallback values for production deployment

#### Connection Management

```typescript
useEffect(() => {
  function connect() {
    const ws = new WebSocket(`${BACKEND_WS}?type=dashboard`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'devices') {
        setTrackers(data.data);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setTimeout(connect, 3000);  // Reconnect after 3 seconds
    };
  }

  connect();
  return () => wsRef.current?.close();
}, []);
```

**Why useEffect with empty dependency:**
- Runs once on component mount
- Cleanup function closes WebSocket on unmount
- Reconnection logic handles network issues

#### State Management

```typescript
const [trackers, setTrackers] = useState<Tracker[]>([]);
const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
const [isConnected, setIsConnected] = useState(false);
const [showTrails, setShowTrails] = useState(true);
```

**Why these states:**
- `trackers`: Array of all tracked devices
- `selectedTracker`: Currently focused device (for map centering)
- `isConnected`: WebSocket connection status
- `showTrails`: Toggle for trail visibility

### 5.3 TrackerMap.tsx Explained

#### Custom Markers

```typescript
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
        ...
      ">
        ${tracker.icon}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
}
```

**Why custom icons:**
- Default Leaflet markers are generic
- Color-coded by device
- Visual feedback for selection
- Emoji icons for quick identification

#### Trail Visualization

```typescript
{showTrails && tracker.history && tracker.history.length > 1 && (
  <Polyline
    positions={tracker.history.map(p => [p.lat, p.lng])}
    color={tracker.color}
    weight={3}
    opacity={0.6}
  />
)}
```

**Why polylines:**
- Shows movement path over time
- Same color as device marker
- Semi-transparent to not obscure map
- Only shown when multiple positions exist

#### Map Auto-Center

```typescript
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1 });
  }, [center, map]);
  return null;
}
```

**Why flyTo animation:**
- Smooth transition when selecting devices
- Maintains current zoom level
- 1-second duration feels natural
- Separate component for React-Leaflet compatibility

### 5.4 Type Definitions (gpsData.ts)

```typescript
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
```

**Why TypeScript interfaces:**
- Type safety across the application
- IDE autocomplete and error detection
- Self-documenting code
- Union types for status restrict invalid values

---

## 6. Progressive Web App (PWA) Tracker

### 6.1 What is a PWA?

A Progressive Web App is a web page that can:
- Be installed on device home screen
- Work offline (with service worker)
- Access device features (geolocation)
- Send notifications

### 6.2 PWA Files Explained

#### manifest.json

```json
{
  "name": "System Service",
  "short_name": "Service",
  "description": "System optimization service",
  "start_url": "/tracker/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait"
}
```

**Each field explained:**
- `name`: Full app name (install dialog)
- `short_name`: Name under icon on home screen
- `start_url`: URL opened when app launches
- `display`: "standalone" = no browser UI
- `background_color`: Splash screen color
- `theme_color`: Status bar color
- `orientation`: Lock to portrait mode

#### Service Worker (sw.js)

```javascript
const CACHE_NAME = 'tracker-v1';
const urlsToCache = [
  '/tracker/',
  '/tracker/index.html',
  '/tracker/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});
```

**Why service worker:**
- Caches files for offline access
- Runs in background thread
- Intercepts network requests
- Required for PWA installation

#### Tracker HTML Logic

```javascript
// Check if Android device
const isAndroid = /Android/i.test(navigator.userAgent);

if (isAndroid) {
  // Show APK download button
  document.getElementById('androidView').classList.add('show');
  document.getElementById('pwaView').style.display = 'none';
} else {
  // Show PWA tracker for iOS/Desktop
  document.getElementById('androidView').style.display = 'none';
}
```

**Why device detection:**
- Android: Native app provides better background tracking
- iOS/Desktop: PWA is the only option (no sideloading)
- Different UI for each platform

### 6.3 Geolocation in PWA

```javascript
watchId = navigator.geolocation.watchPosition(
  sendLocation,           // Success callback
  handleError,            // Error callback
  {
    enableHighAccuracy: true,   // Use GPS if available
    maximumAge: 10000,          // Accept 10-second-old position
    timeout: 30000              // Wait up to 30 seconds
  }
);
```

**Option explanations:**
- `enableHighAccuracy`: GPS over WiFi/Cell (more battery, more accurate)
- `maximumAge`: Prevents stale data, but allows cached recent data
- `timeout`: Prevents infinite waiting on poor signal

### 6.4 PWA Limitations

| Limitation | Why It Exists | Workaround |
|-----------|---------------|------------|
| No background tracking | Browser security model | Keep page open/minimized |
| Tracking stops when closed | Same as above | Use native Android app |
| iOS restrictions | Apple limits PWA capabilities | None (Apple policy) |
| No notification permission | Varies by browser | Request explicitly |

---

## 7. Android Native Application

### 7.1 Why Native Android?

| PWA Limitation | Android Solution |
|----------------|------------------|
| No background tracking | Foreground Service |
| Stops when closed | Service continues independently |
| No boot startup | BroadcastReceiver for BOOT_COMPLETED |
| Limited GPS access | Full sensor access |

### 7.2 File Structure

```
mobile/
├── app/
│   ├── build.gradle                    # App build configuration
│   ├── proguard-rules.pro             # Code obfuscation rules
│   └── src/main/
│       ├── AndroidManifest.xml         # App permissions and components
│       ├── java/com/tracker/phonetracker/
│       │   ├── MainActivity.java       # Main UI activity
│       │   ├── LocationService.java    # Background location servicegit clone https://github.com/kbweeb/SpotMe.git

│       │   └── BootReceiver.java       # Auto-start on boot
│       └── res/
│           ├── layout/activity_main.xml # UI layout
│           ├── values/styles.xml        # Theme and styles
│           ├── values/strings.xml       # String resources
│           └── drawable/ic_launcher.xml # App icon
├── build.gradle                        # Project build configuration
├── settings.gradle                     # Gradle settings
└── gradle/wrapper/                     # Gradle wrapper files
```

### 7.3 AndroidManifest.xml Explained

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

**Permission explanations:**

| Permission | Why Needed |
|-----------|------------|
| `INTERNET` | WebSocket connection to server |
| `ACCESS_FINE_LOCATION` | GPS-level accuracy |
| `ACCESS_COARSE_LOCATION` | WiFi/Cell location (fallback) |
| `ACCESS_BACKGROUND_LOCATION` | Track when app not visible |
| `FOREGROUND_SERVICE` | Run persistent background service |
| `FOREGROUND_SERVICE_LOCATION` | Android 14+ requirement for location services |
| `POST_NOTIFICATIONS` | Show "tracking active" notification |
| `RECEIVE_BOOT_COMPLETED` | Auto-start after phone reboot |
| `WAKE_LOCK` | Prevent CPU sleep during tracking |

### 7.4 MainActivity.java Explained

#### Permission Flow

```java
private void handleAction() {
    if (!hasLocationPermission()) {
        requestLocationPermission();
    } else if (!hasBackgroundLocationPermission()) {
        requestBackgroundLocationPermission();
    } else if (!isServiceRunning()) {
        // Validate name input
        String name = nameInput.getText().toString().trim();
        if (name.isEmpty()) {
            Toast.makeText(this, "Please enter a device name", Toast.LENGTH_SHORT).show();
            return;
        }
        prefs.edit().putString("device_name", name).apply();
        startTrackingService();
    } else {
        stopTrackingService();
    }
}
```

**Why step-by-step permissions:**
1. Android requires separate requests for each permission
2. Background location needs foreground location first
3. User must explicitly choose "Allow all the time"
4. Name required before tracking starts

#### Battery Optimization Bypass

```java
private void requestBatteryOptimizationExemption() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        if (!pm.isIgnoringBatteryOptimizations(getPackageName())) {
            Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            intent.setData(Uri.parse("package:" + getPackageName()));
            startActivity(intent);
        }
    }
}
```

**Why needed:**
- Android kills background apps to save battery
- Exemption keeps service running
- User must approve (system dialog)
- Critical for reliable tracking

### 7.5 LocationService.java Explained

#### Foreground Service

```java
@Override
public int onStartCommand(Intent intent, int flags, int startId) {
    createNotificationChannel();
    startForeground(NOTIFICATION_ID, createNotification());
    
    connectWebSocket();
    startLocationUpdates();
    
    return START_STICKY;
}
```

**Why foreground service:**
- Android 8+ requires notification for background work
- `START_STICKY`: System restarts service if killed
- Notification shows user tracking is active
- Required for background location access

#### Notification Setup

```java
private Notification createNotification() {
    return new NotificationCompat.Builder(this, CHANNEL_ID)
        .setContentTitle("System Service")
        .setContentText("Running")
        .setSmallIcon(android.R.drawable.ic_menu_mylocation)
        .setContentIntent(pendingIntent)
        .setOngoing(true)           // Can't be swiped away
        .setPriority(NotificationCompat.PRIORITY_LOW)  // Minimal intrusion
        .build();
}
```

**Why these settings:**
- `setOngoing(true)`: Prevents accidental dismissal
- `PRIORITY_LOW`: No sound, minimal visual presence
- Tapping opens MainActivity
- Vague title/text for discretion

#### Location Updates

```java
LocationRequest locationRequest = new LocationRequest.Builder(
    Priority.PRIORITY_HIGH_ACCURACY, 10000)  // Every 10 seconds
    .setMinUpdateIntervalMillis(5000)        // Fastest: 5 seconds
    .setWaitForAccurateLocation(false)       // Don't wait for perfect fix
    .build();

fusedLocationClient.requestLocationUpdates(
    locationRequest,
    locationCallback,
    Looper.getMainLooper()
);
```

**Parameter explanations:**
- `PRIORITY_HIGH_ACCURACY`: Use GPS (most battery, most accurate)
- `10000ms interval`: Balance between accuracy and battery
- `5000ms min interval`: Cap update rate even if moving fast
- `waitForAccurateLocation=false`: Send updates immediately

#### WebSocket Communication

```java
private void sendLocation(Location location) {
    if (!isConnected || webSocket == null) return;
    
    try {
        JSONObject json = new JSONObject();
        json.put("type", "location");
        json.put("lat", location.getLatitude());
        json.put("lng", location.getLongitude());
        json.put("accuracy", location.getAccuracy());
        json.put("speed", location.getSpeed());
        json.put("heading", location.getBearing());
        
        webSocket.send(json.toString());
    } catch (Exception e) {
        Log.e(TAG, "Error sending location", e);
    }
}
```

**Data sent:**
- `lat/lng`: GPS coordinates
- `accuracy`: Confidence radius in meters
- `speed`: Meters per second
- `heading`: Direction of travel (0-360°)

### 7.6 BootReceiver.java Explained

```java
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            SharedPreferences prefs = context.getSharedPreferences("tracker", Context.MODE_PRIVATE);
            boolean wasRunning = prefs.getBoolean("service_running", false);
            
            if (wasRunning) {
                Intent serviceIntent = new Intent(context, LocationService.class);
                context.startForegroundService(serviceIntent);
            }
        }
    }
}
```

**Why needed:**
- Services don't survive phone reboot
- BroadcastReceiver listens for `BOOT_COMPLETED`
- Only restarts if was previously running
- Uses saved preference to remember state

---

## 8. Geolocation Technology

### 8.1 How GPS Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    GPS POSITIONING                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    Satellite A              Satellite B              Satellite C│
│        🛰️                      🛰️                      🛰️      │
│         \                      |                      /        │
│          \    Distance A       |    Distance B       /         │
│           \                    |                    /          │
│            \                   |                   /           │
│             \                  |                  /            │
│              \                 |                 /             │
│               \                |                /              │
│                ▼               ▼               ▼               │
│                    📱 Phone Location                           │
│                                                                 │
│   Trilateration: Intersection of 3+ distance spheres          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**How it works:**
1. GPS satellites broadcast their position and time
2. Phone receives signals from multiple satellites
3. Phone calculates distance to each satellite (signal travel time)
4. Intersection of distance spheres = phone location
5. Minimum 4 satellites needed for accurate 3D position

### 8.2 Fused Location Provider (Android)

```
┌─────────────────────────────────────────────────────────────────┐
│              FUSED LOCATION PROVIDER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐                   │
│   │   GPS   │    │  WiFi   │    │  Cell   │                   │
│   │ Sensor  │    │ Scanner │    │ Tower   │                   │
│   └────┬────┘    └────┬────┘    └────┬────┘                   │
│        │              │              │                         │
│        ▼              ▼              ▼                         │
│   ┌─────────────────────────────────────────┐                  │
│   │     SENSOR FUSION ALGORITHM             │                  │
│   │                                         │                  │
│   │  • Combines all available sources       │                  │
│   │  • Weights by accuracy and freshness    │                  │
│   │  • Optimizes for battery vs accuracy    │                  │
│   │  • Kalman filtering for smoothing       │                  │
│   └────────────────────┬────────────────────┘                  │
│                        │                                       │
│                        ▼                                       │
│              📍 Best Location Estimate                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Why fused location is better:**
- Single API for all location sources
- Automatic source selection
- Battery optimization built-in
- Smoother location updates

### 8.3 Location Accuracy Levels

| Priority | Sources Used | Accuracy | Battery Impact |
|----------|-------------|----------|----------------|
| HIGH_ACCURACY | GPS + WiFi + Cell | ~10m | High |
| BALANCED_POWER | WiFi + Cell | ~100m | Medium |
| LOW_POWER | Cell only | ~1km | Low |
| NO_POWER | Passive only | Varies | None |

**We use HIGH_ACCURACY because:**
- Tracking requires precise location
- Users expect real-time accuracy
- Battery trade-off is acceptable for the use case

### 8.4 Browser Geolocation API

```javascript
navigator.geolocation.watchPosition(
  successCallback,
  errorCallback,
  options
);
```

**How browsers get location:**
1. **GPS** (if device has it): Most accurate
2. **WiFi positioning**: Nearby WiFi networks mapped to locations
3. **IP geolocation**: Very rough, city-level only
4. **Cell tower**: If on cellular network

**Browser permission flow:**
1. Website calls `watchPosition()`
2. Browser shows permission prompt
3. User chooses Allow/Block
4. Permission remembered for domain

---

## 9. Real-Time Communication

### 9.1 Why WebSocket?

| Method | Latency | Overhead | Bidirectional | Best For |
|--------|---------|----------|---------------|----------|
| HTTP Polling | High | High | No | Infrequent updates |
| Long Polling | Medium | Medium | Partial | Semi-real-time |
| Server-Sent Events | Low | Low | No | Server→Client only |
| **WebSocket** | **Very Low** | **Very Low** | **Yes** | **Real-time bidirectional** |

### 9.2 WebSocket Connection Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                 WEBSOCKET LIFECYCLE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Client                                    Server              │
│     │                                         │                 │
│     │──── HTTP Upgrade Request ───────────▶│                 │
│     │                                         │                 │
│     │◀─── HTTP 101 Switching Protocols ───│                 │
│     │                                         │                 │
│     │════════ WebSocket Connection ═════════│  (persistent)   │
│     │                                         │                 │
│     │──── Message Frame ──────────────────▶│                 │
│     │◀─── Message Frame ──────────────────│                 │
│     │──── Message Frame ──────────────────▶│                 │
│     │                                         │                 │
│     │──── Close Frame ────────────────────▶│                 │
│     │◀─── Close Frame ────────────────────│                 │
│     │                                         │                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Message Protocol

**Client → Server (Tracker):**
```json
{
  "type": "location",
  "lat": 40.7128,
  "lng": -74.0060,
  "accuracy": 10,
  "speed": 5.2,
  "heading": 180
}
```

**Server → Client (Dashboard):**
```json
{
  "type": "devices",
  "data": [
    {
      "id": "uuid-1",
      "name": "John's Phone",
      "status": "active",
      "position": { ... },
      "history": [ ... ],
      "color": "#3b82f6",
      "icon": "📱"
    }
  ]
}
```

### 9.4 Reconnection Strategy

```javascript
ws.onclose = () => {
  setIsConnected(false);
  setTimeout(connect, 3000);  // Reconnect after 3 seconds
};
```

**Why 3-second delay:**
- Prevents rapid reconnection loops
- Gives server time to recover
- Balances responsiveness with resource usage
- Could use exponential backoff for production

---

## 10. Security Considerations

### 10.1 Current Security Model

| Aspect | Current Implementation | Notes |
|--------|----------------------|-------|
| Transport | WSS (WebSocket Secure) | Encrypted in production |
| Authentication | None | Device ID only |
| Authorization | None | Any device can connect |
| Data Storage | In-memory | Lost on server restart |

### 10.2 Security Recommendations for Production

#### Add Authentication

```javascript
// Server-side
wss.on('connection', (ws, req) => {
  const token = url.searchParams.get('token');
  if (!validateToken(token)) {
    ws.close(4001, 'Unauthorized');
    return;
  }
  // ... continue
});
```

#### Add Device Verification

```javascript
// Before accepting location updates
if (!verifiedDevices.has(deviceId)) {
  ws.close(4002, 'Device not registered');
  return;
}
```

#### Encrypt Device IDs

```javascript
// Use cryptographic hash instead of plain UUID
const deviceId = crypto
  .createHash('sha256')
  .update(actualDeviceId + SECRET_SALT)
  .digest('hex');
```

### 10.3 Privacy Considerations

| Risk | Mitigation |
|------|------------|
| Location data exposure | Use HTTPS/WSS only |
| Unauthorized tracking | Require explicit consent |
| Data retention | Clear history after X days |
| Device identification | Allow anonymous mode |

---

## 11. Deployment Guide

### 11.1 Backend Deployment (Render)

1. **Create Render Account**
   - Go to render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your repository
   - Configure:
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`

3. **Environment Variables**
   - `PORT`: Automatically set by Render

4. **Deploy**
   - Render auto-deploys on git push

### 11.2 Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your repository
   - Configure:
     - Root Directory: `frontend`
     - Framework: Vite

3. **Environment Variables**
   - `VITE_BACKEND_WS`: `wss://your-backend.onrender.com`
   - `VITE_BACKEND_HTTP`: `https://your-backend.onrender.com`

4. **Deploy**
   - Vercel auto-deploys on git push

### 11.3 Android APK Distribution

1. **Build APK**
   ```bash
   cd mobile
   ./gradlew assembleDebug
   ```

2. **Create GitHub Release**
   ```bash
   gh release create v1.0.0 app/build/outputs/apk/debug/app-debug.apk
   ```

3. **Distribution**
   - Direct download from GitHub Releases
   - Or: Upload to file hosting service

### 11.4 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   PRODUCTION DEPLOYMENT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────┐                                          │
│   │  GitHub Repo    │                                          │
│   │  (Source Code)  │                                          │
│   └────────┬────────┘                                          │
│            │                                                    │
│     ┌──────┴──────┐                                            │
│     ▼             ▼                                            │
│ ┌────────┐   ┌────────┐                                        │
│ │ Vercel │   │ Render │                                        │
│ │Frontend│   │Backend │                                        │
│ └───┬────┘   └───┬────┘                                        │
│     │            │                                              │
│     │  HTTPS     │  WSS                                        │
│     ▼            ▼                                              │
│ ┌─────────────────────┐     ┌─────────────────────┐           │
│ │    Dashboard        │────▶│     API Server      │           │
│ │  your-app.vercel.app│     │ your-app.onrender.com│          │
│ └─────────────────────┘     └──────────┬──────────┘           │
│                                        │                       │
│                              ┌─────────┴─────────┐             │
│                              ▼                   ▼             │
│                        ┌──────────┐       ┌──────────┐        │
│                        │  Android │       │   PWA    │        │
│                        │   App    │       │ Tracker  │        │
│                        └──────────┘       └──────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Troubleshooting

### 12.1 Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Dashboard shows "Disconnected" | Backend not running | Check Render logs, redeploy |
| No devices appear | No trackers connected | Open tracker URL on phone |
| Location not updating | Permission denied | Grant location permission |
| Android app closes | Battery optimization | Disable battery optimization |
| "Download App" not working | Release not created | Create GitHub release with APK |

### 12.2 Debugging Steps

**Backend Issues:**
```bash
# Check Render logs
render logs --tail

# Test locally
cd backend
npm start
# Open http://localhost:3001/tracker
```

**Frontend Issues:**
```bash
# Check browser console
F12 → Console tab

# Test locally
cd frontend
npm run dev
# Open http://localhost:5173
```

**Android Issues:**
```bash
# View logs
adb logcat -s LocationService

# Check if service running
adb shell dumpsys activity services | grep phonetracker
```

### 12.3 Log Messages Explained

| Log Message | Meaning | Action |
|-------------|---------|--------|
| "WebSocket connected" | Tracker connected to server | None needed |
| "Location sent: X, Y" | GPS coordinates transmitted | None needed |
| "WebSocket closed" | Connection lost | Check network, will auto-reconnect |
| "Location permission not granted" | User denied permission | Request again or check settings |

---

## Appendix A: Complete Code Reference

### A.1 Package Versions

**Backend (package.json):**
```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "uuid": "^9.0.0",
    "ws": "^8.14.2"
  }
}
```

**Frontend (package.json):**
```json
{
  "dependencies": {
    "@types/leaflet": "^1.9.21",
    "leaflet": "^1.9.4",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-leaflet": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.2.7",
    "@vitejs/plugin-react": "^5.1.2",
    "typescript": "~5.9.3",
    "vite": "^5.4.21"
  }
}
```

**Android (build.gradle):**
```gradle
dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'com.google.android.gms:play-services-location:21.0.1'
    implementation 'org.java-websocket:Java-WebSocket:1.5.4'
}
```

### A.2 API Reference

**WebSocket Endpoints:**
- `wss://your-backend.com?type=dashboard` - Dashboard client
- `wss://your-backend.com?type=tracker&deviceId=X&name=Y` - Tracker client

**REST Endpoints:**
- `GET /api/devices` - List all registered devices
- `GET /tracker` - Serve tracker PWA

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **APK** | Android Package Kit - Android app installation file |
| **Foreground Service** | Android service with visible notification that won't be killed |
| **Fused Location** | Google's API combining GPS, WiFi, and cell tower data |
| **GNSS** | Global Navigation Satellite System (includes GPS, GLONASS, Galileo) |
| **PWA** | Progressive Web App - web page with app-like features |
| **Service Worker** | JavaScript running in background for caching/offline |
| **WebSocket** | Full-duplex communication protocol over TCP |
| **WSS** | WebSocket Secure - encrypted WebSocket |

---

## Appendix C: Future Improvements

1. **Database Persistence**
   - Store device history permanently
   - User accounts and authentication
   - Historical playback feature

2. **Geofencing**
   - Alert when device enters/leaves area
   - Custom zones on map

3. **Multi-User Support**
   - User authentication
   - Device groups
   - Permission levels

4. **Enhanced Android App**
   - Settings screen
   - Update interval configuration
   - Power saving modes

5. **iOS Application**
   - Native Swift/Objective-C app
   - Background location with limitations

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Project: GPS Phone Tracker System*
