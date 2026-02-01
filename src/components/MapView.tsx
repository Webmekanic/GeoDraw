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
import { restrictedZones } from '../data/restrictedZones';
import { gridInfrastructure } from '../data/gridInfrastructure';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/MapView.css';
import DrawToolbar from './DrawToolbar.tsx';
import AssumptionControls from './AssumptionControls';
import Tour from './Tour';

type DrawMode = 'select' | 'polygon' | 'linestring' | 'circle' | null;

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<TerraDraw | null>(null);
  const [currentMode, setCurrentMode] = useState<DrawMode>(null);
  const [isAssumptionExpanded, setIsAssumptionExpanded] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [solarMwPerHa, setSolarMwPerHa] = useState(0.5); 
  const [windMwPerHa, setWindMwPerHa] = useState(0.1);

  const popupsRef = useRef<Map<string | number, { popup: maplibregl.Popup; feature: any; marker?: maplibregl.Marker }>>(new Map());

  useEffect(() => {
    const tourCompleted = localStorage.getItem('tourCompleted');
    if (!tourCompleted) {
      setTimeout(() => setIsTourOpen(true), 500);
    }
  }, []);

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

      setTimeout(() => {
        if (map.current) {
          map.current.resize();
        }
      }, 200);

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      map.current.on('click', () => {
        setIsAssumptionExpanded(false);
      });

      map.current.on('load', () => {
        if (!map.current) return;

        // Add restricted zones to map
        map.current.addSource('restricted-zones', {
          type: 'geojson',
          data: restrictedZones
        });

        map.current.addLayer({
          id: 'restricted-zones-fill',
          type: 'fill',
          source: 'restricted-zones',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.2
          }
        });

        map.current.addLayer({
          id: 'restricted-zones-outline',
          type: 'line',
          source: 'restricted-zones',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 2,
            'line-dasharray': [2, 2]
          }
        });

        // Add grid infrastructure to map
        map.current.addSource('grid-infrastructure', {
          type: 'geojson',
          data: gridInfrastructure
        });

        map.current.addLayer({
          id: 'grid-lines',
          type: 'line',
          source: 'grid-infrastructure',
          paint: {
            'line-color': '#8b5cf6',
            'line-width': 3,
            'line-opacity': 0.8
          }
        });

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
        
      draw.current.on('select', (id) => {
        const existingEntry = popupsRef.current.get(id);
        if (existingEntry) {
          existingEntry.popup.remove();
          if (existingEntry.marker) {
            existingEntry.marker.remove();
          }
          popupsRef.current.delete(id);
        }
      });

      // Handle feature creation and measurement
      draw.current.on('finish', (id) => {
        const snapshot = draw.current?.getSnapshot();
        const feature = snapshot?.find((f) => f.id === id);

        if (feature && map.current) {
          const existingEntry = popupsRef.current.get(id);
          if (existingEntry) {
            existingEntry.popup.remove();
            if (existingEntry.marker) {
              existingEntry.marker.remove();
            }
            popupsRef.current.delete(id);
          }

          let measurement = '';
          let overlapWarnings: Array<{zoneName: string; overlapPercent: number; zoneType: string}> = [];

          // Check for overlaps with restricted zones (only for Polygon and Circle)
          if (feature.geometry.type === 'Polygon' || 
              (feature.geometry.type === 'Point' && feature.properties?.mode === 'circle')) {
            
            let drawnFeature;
            if (feature.geometry.type === 'Polygon') {
              drawnFeature = turf.polygon(feature.geometry.coordinates);
            } else {
              const radiusMeters = (feature.properties.radiusMeters as number) || 0;
              const center = feature.geometry.coordinates;
              drawnFeature = turf.circle(center, radiusMeters / 1000, { units: 'kilometers' });
            }

            const drawnArea = turf.area(drawnFeature);

            // Check each restricted zone
            restrictedZones.features.forEach((zone) => {
              try {
                const zonePolygon = turf.polygon(zone.geometry.coordinates);
                
                if (turf.booleanIntersects(drawnFeature, zonePolygon)) {
                  const intersection = turf.intersect(
                    turf.featureCollection([drawnFeature, zonePolygon])
                  );
                  
                  if (intersection) {
                    const intersectionArea = turf.area(intersection);
                    const overlapPercent = (intersectionArea / drawnArea) * 100;
                    
                    if (overlapPercent > 0.1) {
                      overlapWarnings.push({
                        zoneName: zone.properties.name,
                        overlapPercent,
                        zoneType: zone.properties.type
                      });
                    }
                  }
                }
              } catch (error) {
                console.warn('Error checking overlap:', error);
              }
            });
          }

          // Calculate distance to nearest grid line for Polygon and Circle
          let gridDistance: number | undefined;
          if (feature.geometry.type === 'Polygon' || 
              (feature.geometry.type === 'Point' && feature.properties?.mode === 'circle')) {
            
            let siteCenter;
            if (feature.geometry.type === 'Polygon') {
              siteCenter = turf.center(turf.polygon(feature.geometry.coordinates));
            } else {
              siteCenter = turf.point(feature.geometry.coordinates);
            }

            // Calculate distance to each grid line and find the nearest
            let minDistance = Infinity;
            gridInfrastructure.features.forEach((gridLine) => {
              const line = turf.lineString(gridLine.geometry.coordinates);
              const distance = turf.pointToLineDistance(siteCenter, line, { units: 'kilometers' });
              if (distance < minDistance) {
                minDistance = distance;
              }
            });

            gridDistance = minDistance !== Infinity ? minDistance : undefined;
          }

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
              title: 'Land Area',
              overlapWarnings: overlapWarnings.length > 0 ? overlapWarnings : undefined,
              gridDistance
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
              title: 'Circle Area',
              overlapWarnings: overlapWarnings.length > 0 ? overlapWarnings : undefined,
              gridDistance
            });
          }

          if (measurement) {
            const center = feature.geometry.type === 'Point'
              ? feature.geometry.coordinates
              : turf.center(feature as any).geometry.coordinates;

            const markerEl = document.createElement('div');
            markerEl.className = 'center-marker';
            markerEl.innerHTML = '📍';
            const marker = new maplibregl.Marker({ element: markerEl })
              .setLngLat(center as [number, number])
              .addTo(map.current);

            const popup = new maplibregl.Popup({ 
              maxWidth: '320px',
              anchor: 'left',
              offset: 25
            })
              .setLngLat(center as [number, number])
              .setHTML(measurement)
              .addTo(map.current);

            popupsRef.current.set(id, { popup, feature, marker });

            popup.on('close', () => {
              const entry = popupsRef.current.get(id);
              if (entry?.marker) {
                entry.marker.remove();
              }
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

    // Clear all popups and markers
    popupsRef.current.forEach(({ popup, marker }) => {
      popup.remove();
      if (marker) {
        marker.remove();
      }
    });
    popupsRef.current.clear();
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
      <Tour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
};

export default MapView;