# GeoDraw - Interactive Map Drawing Application

A modern web mapping application built with React, TypeScript, MapLibre GL, and Terra Draw for drawing shapes and performing geospatial measurements.

## Features

- **Interactive Drawing Tools**
  - Polygon drawing with snapping
  - Polyline/LineString drawing
  - Circle drawing
  - Selection and editing mode

- **Advanced Editing Capabilities**
  - Vertex manipulation (drag, add, delete)
  - Midpoint editing
  - Shape rotation and scaling (polygons)
  - Snapping to nearby features (30px threshold)
  - Validation (prevents self-intersecting polygons)

- **Measurements**
  - Polygon areas in hectares and square meters
  - LineString distances in kilometers and meters
  - Circle areas in hectares and square meters
  - Real-time measurement display via popups

- **Map Controls**
  - Zoom in/out
  - Pan
  - Navigation controls
  - Clear all drawings

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **MapLibre GL JS** - Map rendering
- **Terra Draw** - Drawing and editing toolkit
- **Turf.js** - Geospatial analysis and measurements

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

1. Start the development server:

```bash
npm run dev
```

1. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Select Mode** - Click to select and edit existing shapes
   - Drag vertices to move them
   - Drag midpoints to add new vertices
   - Click vertices to delete them
   - Drag entire shapes to reposition
   - Rotate and scale polygons

2. **Polygon Mode** - Click to add vertices, double-click or click first vertex to finish
   - Auto-validates against self-intersections
   - Snapping enabled

3. **Line Mode** - Click to add vertices, double-click to finish
   - Snapping enabled

4. **Circle Mode** - Click center, then click to set radius
   - Snapping enabled

5. **Clear** - Remove all drawings from the map

## Project Structure

```
src/
├── components/
│   ├── MapView.tsx          # Main map component with Terra Draw integration
│   ├── MapView.css          # Map styling
│   ├── DrawToolbar.tsx      # Drawing mode toolbar
│   └── DrawToolbar.css      # Toolbar styling
├── App.tsx                  # Root component
├── App.css                  # App styling
├── main.tsx                 # Entry point
└── index.css                # Global styles
```

## License

MIT
