import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import {
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawLineStringMode,
  TerraDrawCircleMode,
  TerraDrawSelectMode,
} from 'terra-draw';
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter';
import * as turf from '@turf/turf';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapView.css';
import DrawToolbar from './DrawToolbar.tsx';

type DrawMode = 'select' | 'polygon' | 'linestring' | 'circle' | null;

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<TerraDraw | null>(null);
  const [currentMode, setCurrentMode] = useState<DrawMode>(null);

  useEffect(() => {
    if (!mapContainer.current) {
      console.error('Map container ref is null');
      return;
    }
    
    if (map.current) {
      return;
    }

    try {
      // Initialize MapLibre GL map
      const mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
          glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        },
        center: [36.817223, -1.286389],
        zoom: 13,
        attributionControl: false,
      });

      map.current = mapInstance;

      // Force resize
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
        }
      }, 200);

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        if (!map.current) return;

        // Initialize Terra Draw
        draw.current = new TerraDraw({
          adapter: new TerraDrawMapLibreGLAdapter({
            map: map.current,
            coordinatePrecision: 9,
          }),
          modes: [
            new TerraDrawSelectMode({
            flags: {
              arbitary: {
                feature: {},
              },
              polygon: {
                feature: {
                  draggable: true,
                  rotateable: true,
                  scaleable: true,
                  coordinates: {
                    midpoints: true,
                    draggable: true,
                    deletable: true,
                  },
                },
              },
              linestring: {
                feature: {
                  draggable: true,
                  coordinates: {
                    midpoints: true,
                    draggable: true,
                    deletable: true,
                  },
                },
              },
              circle: {
                feature: {
                  draggable: true,
                },
              },
            },
          }),
          new TerraDrawPolygonMode({
            pointerDistance: 30,
          }),
          new TerraDrawLineStringMode({
            pointerDistance: 30,
          }),
          new TerraDrawCircleMode({
            pointerDistance: 30,
          }),
        ],
      });

      draw.current.start();
      draw.current.setMode('select');

      // Handle feature creation and measurement
      draw.current.on('finish', (id) => {
        const snapshot = draw.current?.getSnapshot();
        const feature = snapshot?.find((f) => f.id === id);

        if (feature && map.current) {
          let measurement = '';

          if (feature.geometry.type === 'Polygon') {
            const polygon = turf.polygon(feature.geometry.coordinates);
            const area = turf.area(polygon);
            const hectares = area / 10000;
            measurement = `Area: ${hectares.toFixed(2)} ha (${area.toFixed(2)} m²)`;
          } else if (feature.geometry.type === 'LineString') {
            const line = turf.lineString(feature.geometry.coordinates);
            const lengthKm = turf.length(line, { units: 'kilometers' });
            const lengthM = turf.length(line, { units: 'meters' });
            measurement = `Distance: ${lengthKm.toFixed(2)} km (${lengthM.toFixed(2)} m)`;
          } else if (feature.geometry.type === 'Point' && feature.properties?.mode === 'circle') {
            // Handle circle measurement
            const radiusMeters = (feature.properties.radiusMeters as number) || 0;
            const area = Math.PI * radiusMeters * radiusMeters;
            const hectares = area / 10000;
            measurement = `Circle Area: ${hectares.toFixed(2)} ha (${area.toFixed(2)} m²)`;
          }

          if (measurement) {
            // Get center of feature for popup
            const center = feature.geometry.type === 'Point'
              ? feature.geometry.coordinates
              : turf.center(feature as any).geometry.coordinates;

            new maplibregl.Popup()
              .setLngLat(center as [number, number])
              .setHTML(`<div style="padding: 5px; font-weight: bold;">${measurement}</div>`)
              .addTo(map.current);
          }
        }
      });
    });

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      draw.current?.stop();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const handleModeChange = (mode: DrawMode) => {
    if (draw.current && mode) {
      draw.current.setMode(mode);
      setCurrentMode(mode);
    }
  };

  const handleClear = () => {
    if (draw.current) {
      draw.current.clear();
    }
  };

  return (
    <div className="map-view">
      <DrawToolbar
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onClear={handleClear}
      />
      {(currentMode === 'polygon' || currentMode === 'linestring') && (
        <div className="draw-instructions">
          Click to add points • Double-click to finish
        </div>
      )}
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default MapView;