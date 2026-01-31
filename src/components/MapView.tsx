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
import { renderAreaMeasurement, renderDistanceMeasurement } from './MeasurementPopup';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapView.css';
import DrawToolbar from './DrawToolbar.tsx';
import AssumptionControls from './AssumptionControls';

type DrawMode = 'select' | 'polygon' | 'linestring' | 'circle' | null;

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<TerraDraw | null>(null);
  const [currentMode, setCurrentMode] = useState<DrawMode>(null);
  const [isAssumptionExpanded, setIsAssumptionExpanded] = useState(false);
  
  // Adjustable renewable energy assumptions
  const [solarMwPerHa, setSolarMwPerHa] = useState(0.5); // 1 MW ≈ 2 hectares
  const [windMwPerHa, setWindMwPerHa] = useState(0.1); // Conservative estimate for wind farms

  // Store popup references for updates
  const popupsRef = useRef<Map<string | number, { popup: maplibregl.Popup; feature: any }>>(new Map());

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

      // Close assumption controls when clicking on map
      map.current.on('click', () => {
        setIsAssumptionExpanded(false);
      });

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
            
            // Calculate renewable energy potential
            const solarCapacityMW = hectares * solarMwPerHa;
            const windCapacityMW = hectares * windMwPerHa;
            
            measurement = renderAreaMeasurement({
              hectares,
              areaM2: area,
              solarMW: solarCapacityMW,
              windMW: windCapacityMW,
              title: 'Land Area'
            });
          } else if (feature.geometry.type === 'LineString') {
            const line = turf.lineString(feature.geometry.coordinates);
            const lengthKm = turf.length(line, { units: 'kilometers' });
            const lengthM = turf.length(line, { units: 'meters' });
            measurement = renderDistanceMeasurement({ lengthKm, lengthM });
          } else if (feature.geometry.type === 'Point' && feature.properties?.mode === 'circle') {
            // Handle circle measurement with renewable potential
            const radiusMeters = (feature.properties.radiusMeters as number) || 0;
            const area = Math.PI * radiusMeters * radiusMeters;
            const hectares = area / 10000;
            
            const solarCapacityMW = hectares * solarMwPerHa;
            const windCapacityMW = hectares * windMwPerHa;
            
            measurement = renderAreaMeasurement({
              hectares,
              areaM2: area,
              solarMW: solarCapacityMW,
              windMW: windCapacityMW,
              title: 'Circle Area'
            });
          }

          if (measurement) {
            // Get center of feature for popup
            const center = feature.geometry.type === 'Point'
              ? feature.geometry.coordinates
              : turf.center(feature as any).geometry.coordinates;

            const popup = new maplibregl.Popup({ 
              maxWidth: '320px',
              anchor: 'left',
              offset: 25
            })
              .setLngLat(center as [number, number])
              .setHTML(measurement)
              .addTo(map.current);

            // Store popup reference for later updates
            popupsRef.current.set(id, { popup, feature });

            // Remove from map when popup is closed
            popup.on('close', () => {
              popupsRef.current.delete(id);
            });
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

  // Recalculate all popup measurements with new assumptions
  const recalculatePopups = () => {
    popupsRef.current.forEach(({ popup, feature }) => {
      let measurement = '';

      if (feature.geometry.type === 'Polygon') {
        const polygon = turf.polygon(feature.geometry.coordinates);
        const area = turf.area(polygon);
        const hectares = area / 10000;
        const solarCapacityMW = hectares * solarMwPerHa;
        const windCapacityMW = hectares * windMwPerHa;
        
        measurement = renderAreaMeasurement({
          hectares,
          areaM2: area,
          solarMW: solarCapacityMW,
          windMW: windCapacityMW,
          title: 'Land Area'
        });
      } else if (feature.geometry.type === 'LineString') {
        const line = turf.lineString(feature.geometry.coordinates);
        const lengthKm = turf.length(line, { units: 'kilometers' });
        const lengthM = turf.length(line, { units: 'meters' });
        measurement = renderDistanceMeasurement({ lengthKm, lengthM });
      } else if (feature.geometry.type === 'Point' && feature.properties?.mode === 'circle') {
        const radiusMeters = (feature.properties.radiusMeters as number) || 0;
        const area = Math.PI * radiusMeters * radiusMeters;
        const hectares = area / 10000;
        const solarCapacityMW = hectares * solarMwPerHa;
        const windCapacityMW = hectares * windMwPerHa;
        
        measurement = renderAreaMeasurement({
          hectares,
          areaM2: area,
          solarMW: solarCapacityMW,
          windMW: windCapacityMW,
          title: 'Circle Area'
        });
      }

      if (measurement) {
        popup.setHTML(measurement);
      }
    });
  };

  // Auto-recalculate when assumptions change
  useEffect(() => {
    recalculatePopups();
  }, [solarMwPerHa, windMwPerHa]);

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
      <AssumptionControls
        solarMwPerHa={solarMwPerHa}
        windMwPerHa={windMwPerHa}
        onSolarChange={setSolarMwPerHa}
        onWindChange={setWindMwPerHa}
        isExpanded={isAssumptionExpanded}
        onToggle={setIsAssumptionExpanded}
      />
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