import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use('/tracker', express.static(path.join(__dirname, 'tracker')));

// Store tracked devices
const devices = new Map();
const dashboardClients = new Set();

// Device colors for display
const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
let colorIndex = 0;

function getNextColor() {
  const color = colors[colorIndex % colors.length];
  colorIndex++;
  return color;
}

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
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// WebSocket handling
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const type = url.searchParams.get('type');
  
  if (type === 'dashboard') {
    dashboardClients.add(ws);
    broadcastToClients();
    
    ws.on('close', () => {
      dashboardClients.delete(ws);
    });
  } else if (type === 'tracker') {
    let deviceId = url.searchParams.get('deviceId');
    
    if (!deviceId || !devices.has(deviceId)) {
      deviceId = uuidv4();
      devices.set(deviceId, {
        id: deviceId,
        name: `Device ${devices.size + 1}`,
        status: 'active',
        position: null,
        history: [],
        color: getNextColor(),
        lastSeen: Date.now()
      });
    }
    
    ws.send(JSON.stringify({ type: 'registered', deviceId }));
    
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        
        if (msg.type === 'location') {
          const device = devices.get(deviceId);
          if (device) {
            const position = {
              lat: msg.lat,
              lng: msg.lng,
              timestamp: Date.now(),
              speed: msg.speed || 0,
              heading: msg.heading || 0,
              accuracy: msg.accuracy || 10
            };
            
            device.position = position;
            device.history.push(position);
            if (device.history.length > 100) {
              device.history = device.history.slice(-100);
            }
            device.status = 'active';
            device.lastSeen = Date.now();
            
            broadcastToClients();
          }
        }
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    });
    
    ws.on('close', () => {
      const device = devices.get(deviceId);
      if (device) {
        device.status = 'offline';
        broadcastToClients();
      }
    });
  }
});

// Mark devices as idle if no update for 30 seconds
setInterval(() => {
  const now = Date.now();
  devices.forEach(device => {
    if (device.status === 'active' && now - device.lastSeen > 30000) {
      device.status = 'idle';
      broadcastToClients();
    }
  });
}, 10000);

// API endpoint to get all devices
app.get('/api/devices', (req, res) => {
  const deviceList = Array.from(devices.values());
  res.json(deviceList);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Tracker PWA: http://localhost:${PORT}/tracker`);
  console.log(`Dashboard connects via WebSocket`);
});
