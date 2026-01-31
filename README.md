# ⚡ EnergySite Explorer

> A MapLibre + Terra Draw–powered geospatial planning tool that turns drawn land parcels into transparent, assumption-driven renewable energy capacity estimates.

![MapLibre GL](https://img.shields.io/badge/MapLibre%20GL-4.0.0-blue)
![Terra Draw](https://img.shields.io/badge/Terra%20Draw-1.23.3-green)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178c6)

---

## 🎯 Problem Statement

Renewable energy site planning requires balancing multiple spatial constraints—available land, environmental restrictions, grid proximity, and capacity potential. Traditional GIS tools are powerful but inaccessible to non-specialists. Simple mapping apps lack the domain-specific intelligence to translate geometries into actionable energy insights.

**EnergySite Explorer bridges this gap:** Draw a polygon, instantly see solar/wind potential in MW, detect overlaps with restricted zones, and calculate distance to grid infrastructure—all in your browser, with transparent assumptions you can adjust in real-time.

---

## ✨ Features

### 🎨 **Interactive Drawing Tools**
- **Polygon Mode** - Define land parcels with vertex snapping
- **Circle Mode** - Radial site planning with draggable radius
- **Line Mode** - Route planning for transmission lines
- **Select Mode** - Full vertex editing (drag, add midpoints, delete, rotate, scale)
- **📍 Center Markers** - Visual pins at polygon/circle centroids

### 📏 **Intelligent Measurements**
- **Area Calculations** - Hectares and square meters for land parcels
- **Distance Measurements** - Kilometers and meters for transmission routes
- **Real-time Popups** - Instant feedback on every drawn feature

### ⚡ **Renewable Energy Planning**
- **Solar Capacity Estimates** - MW potential based on land area and configurable MW/ha assumptions
- **Wind Capacity Estimates** - MW potential with adjustable density factors
- **Live Assumption Controls** - Top-right panel to modify solar/wind MW/ha ratios
- **Transparent Calculations** - All capacity estimates recalculate when assumptions change

### 🚨 **Constraint Validation**
- **Restricted Zone Detection** - Automatic overlap analysis with:
  - 🌳 Protected areas (e.g., national park buffers)
  - 🏘️ Settlement zones (residential/urban areas)
  - 🌊 Floodplains (environmental constraints)
- **Visual Overlays** - Semi-transparent constraint layers with color-coded boundaries
- **Overlap Warnings** - Percentage-based alerts in measurement popups

### 🔌 **Grid Infrastructure Analysis**
- **Distance to Grid** - Calculate proximity to nearest transmission/distribution lines
- **Visual Grid Lines** - Purple map overlay showing 132kV, 220kV, and 33kV infrastructure
- **Real-world Context** - Demonstrates that capacity without grid access is meaningless

### 🧭 **User Experience**
- **Vertical Icon Toolbar** - Space-efficient tool selector with hover tooltips
- **Interactive Tour** - 4-step guided walkthrough for first-time users
- **Viewport-Aware UI** - Tour tooltips auto-reposition to stay on screen
- **Responsive Design** - Works on desktop and tablet screens

---

## 🛠️ Tech Stack

- **React 18.2.0** - Modern UI framework with hooks
- **TypeScript 5.2.2** - Type-safe development
- **Vite 5.0.8** - Lightning-fast build tool and HMR dev server
- **MapLibre GL JS 4.0.0** - Open-source map rendering engine
- **Terra Draw 1.23.3** - Feature-rich drawing and editing library
- **Turf.js 7.3.0** - Advanced geospatial analysis (area, distance, intersection, point-to-line)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16+ (recommended: v18 or v20)
- **npm** 

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/energysite-explorer.git
cd energysite-explorer

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output: `dist/` directory ready for deployment

### Preview Production Build

```bash
npm run preview
```

---

## 📖 Usage Guide

### Drawing Tools

1. **🖱️ Select Mode** (Default)
   - Click shapes to select
   - Drag vertices to reposition
   - Drag midpoints (◆) to add new vertices
   - Click vertices to delete
   - Drag shapes to move
   - Use handles to rotate/scale polygons

2. **▢ Polygon Mode**
   - Click to place vertices
   - Double-click or click first vertex to close
   - Auto-validates against self-intersections

3. **─ Line Mode**
   - Click to place vertices
   - Double-click to finish
   - Useful for transmission line planning

4. **○ Circle Mode**
   - Click to set center
   - Click again to set radius
   - Drag to reposition

5. **⚙️ Assumption Controls** (Top-right gear icon)
   - Adjust Solar MW/ha (default: 0.5)
   - Adjust Wind MW/ha (default: 0.1)
   - All capacity estimates update live

6. **🗑️ Clear All**
   - Removes all drawings from map

### Reading the Popups

When you draw a polygon or circle, the popup shows:

```
Land Area
25.34 ha (253400.00 m²)

🔌 Distance to grid: ~3.2 km

⚠️ 15.3% overlaps Nairobi River Floodplain

☀️ Solar Potential
~12.67 MW

🌬️ Wind Potential
~2.53 MW
```

- **Area** - Calculated using Turf.js geodesic area
- **Grid Distance** - Nearest transmission/distribution line
- **Overlap Warnings** - % overlap with restricted zones
- **Capacity** - Based on your assumption settings

---

## 🏗️ Project Structure

```
src/
├── components/
│   ├── MapView.tsx              # Main map + Terra Draw orchestration
│   ├── MapView.css              # Map and marker styling
│   ├── DrawToolbar.tsx          # Vertical tool selector
│   ├── DrawToolbar.css          # Toolbar styling
│   ├── AssumptionControls.tsx   # MW/ha settings panel
│   ├── AssumptionControls.css   # Settings panel styling
│   ├── MeasurementPopup.tsx     # Popup React components
│   ├── MeasurementPopup.css     # Popup styling
│   ├── Tour.tsx                 # First-time user guide
│   ├── Tour.css                 # Tour overlay styling
│   └── tourSteps.ts             # Tour step configuration
├── data/
│   ├── restrictedZones.ts       # Mock constraint GeoJSON
│   └── gridInfrastructure.ts    # Mock grid line GeoJSON
├── App.tsx                      # Root component
├── App.css                      # Global app styling
├── main.tsx                     # React entry point
└── index.css                    # CSS reset and globals
```

---

## 🎓 Key Concepts

### Why Capacity Calculations Matter

This tool demonstrates **systems thinking** in renewable energy planning:

- **Not just geometry** - MW estimates show economic feasibility
- **Transparent assumptions** - Users see and control MW/ha ratios
- **Real constraints** - Restricted zones and grid distance reflect planning reality
- **Interactive learning** - Adjust assumptions to see impact immediately

### Constraint Types

| Zone Type | Color | Meaning |
|-----------|-------|---------|
| 🌳 Protected Area | Green | National parks, wildlife buffers |
| 🏘️ Settlement | Red | Urban/residential zones |
| 🌊 Floodplain | Blue | Environmental flood risk areas |

### Grid Infrastructure

- **132kV Transmission** - Regional power evacuation
- **220kV Transmission** - High-capacity backbone
- **33kV Distribution** - Local delivery network

Distance to grid affects project economics—longer distances require costly new transmission infrastructure.

---

## 🌍 Example Use Cases

- **🌞 Solar Farm Siting** - Find suitable land with low environmental impact and grid proximity
- **💨 Wind Farm Planning** - Assess MW potential and constraint conflicts
- **🔌 Transmission Route Design** - Plan new lines to connect generation sites
- **📊 Early-Stage Feasibility** - Quick capacity estimates before GIS analysis
- **🎓 Educational Tool** - Teach renewable energy planning principles
- **🗺️ Spatial Awareness** - Understand how constraints shape project viability

---

## 🔮 Future Enhancements

- [ ] Export GeoJSON/Shapefile for GIS integration
- [ ] Import existing site boundaries
- [ ] Multi-user collaboration with cloud storage
- [ ] Real grid infrastructure data via OpenStreetMap
- [ ] Elevation analysis for terrain impact
- [ ] Solar irradiance layer integration
- [ ] Wind resource map overlay
- [ ] Cost estimation models
- [ ] Project comparison dashboard

---

## 📚 Learn More

- [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js/docs/)
- [Terra Draw Documentation](https://github.com/JamesLMilner/terra-draw)
- [Turf.js Documentation](https://turfjs.org/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **OpenStreetMap** contributors for base map tiles
- **Terra Draw** by James Milner for the drawing toolkit
- **MapLibre** community for the open map rendering engine
- **Turf.js** for powerful geospatial algorithms

---

<div align="center">

**Built with ⚡ for renewable energy planning**

</div>
