import { FeatureCollection, LineString } from 'geojson';

export interface GridLine {
  name: string;
  voltage: string;
  type: 'transmission' | 'distribution';
}

export const gridInfrastructure: FeatureCollection<LineString, GridLine> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Nairobi-Thika Transmission Line',
        voltage: '132kV',
        type: 'transmission'
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [36.82, -1.25],
          [36.84, -1.27],
          [36.86, -1.29],
          [36.88, -1.31]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Central Nairobi Grid',
        voltage: '220kV',
        type: 'transmission'
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [36.80, -1.30],
          [36.82, -1.30],
          [36.84, -1.32],
          [36.86, -1.34]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Local Distribution Line',
        voltage: '33kV',
        type: 'distribution'
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [36.81, -1.28],
          [36.825, -1.285],
          [36.83, -1.29],
          [36.835, -1.295]
        ]
      }
    }
  ]
};
