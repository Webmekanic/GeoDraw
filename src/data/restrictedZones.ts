import { FeatureCollection, Polygon } from 'geojson';

export interface RestrictedZone {
  type: 'protected' | 'settlement' | 'floodplain';
  name: string;
  color: string;
}

export const restrictedZones: FeatureCollection<Polygon, RestrictedZone> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        type: 'protected',
        name: 'Nairobi National Park Buffer',
        color: '#10b981'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [36.85, -1.35],
          [36.90, -1.35],
          [36.90, -1.40],
          [36.85, -1.40],
          [36.85, -1.35]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        type: 'settlement',
        name: 'Urban Settlement Buffer (500m)',
        color: '#ef4444'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [36.80, -1.28],
          [36.83, -1.28],
          [36.83, -1.30],
          [36.80, -1.30],
          [36.80, -1.28]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        type: 'floodplain',
        name: 'Nairobi River Floodplain',
        color: '#3b82f6'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [36.81, -1.29],
          [36.84, -1.29],
          [36.84, -1.295],
          [36.81, -1.295],
          [36.81, -1.29]
        ]]
      }
    }
  ]
};
