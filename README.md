# GPS Fleet Tracker

A real-time GPS tracking system with interactive map visualization built with React, TypeScript, and Leaflet.

## Live Demo

🌐 **[View Live Demo](https://embedded-systems-project.vercel.app)**

## Features

- 🗺️ **Real-time Map** - Interactive OpenStreetMap with live tracker positions
- 📍 **Multiple Trackers** - Track multiple vehicles/assets simultaneously
- 🛤️ **Trail History** - Visual path trails showing movement history
- 📊 **Fleet Overview** - Dashboard with active/idle/offline status
- 🎯 **Click to Select** - Click trackers on map or sidebar to focus
- ⏯️ **Play/Pause** - Control the simulation
- 📱 **Responsive** - Works on desktop and mobile

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Maps**: Leaflet, React-Leaflet
- **Styling**: Custom CSS with CSS Variables
- **Deployment**: Vercel

## Project Structure

```
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── data/          # GPS data utilities
│   │   ├── App.tsx        # Main app
│   │   └── index.css      # Styles
│   └── package.json
├── python/                 # Signal processing demos
├── c_embedded/            # Embedded C examples
└── vhdl/                  # VHDL examples
```

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

## Deployment

The frontend is configured for Vercel deployment:
1. Connect repo to Vercel
2. Set root directory to `frontend`
3. Deploy!

## Skills Demonstrated

- React with TypeScript
- Real-time data visualization
- Map integration with Leaflet
- State management with hooks
- Responsive CSS design
