import { renderToString } from 'react-dom/server';
import './MeasurementPopup.css';

interface AreaMeasurementProps {
  hectares: number;
  areaM2: number;
  solarMW: number;
  windMW: number;
  title?: string;
  overlapWarnings?: Array<{
    zoneName: string;
    overlapPercent: number;
    zoneType: string;
  }>;
  gridDistance?: number;
}

interface DistanceMeasurementProps {
  lengthKm: number;
  lengthM: number;
}

const AreaMeasurement = ({ hectares, areaM2, solarMW, windMW, title = 'Land Area', overlapWarnings, gridDistance }: AreaMeasurementProps) => (
  <div className="measurement-popup">
    <div className="measurement-title">
      {title}
    </div>
    <div className="measurement-value">
      <strong>{hectares.toFixed(2)} ha</strong> ({areaM2.toFixed(2)} m²)
    </div>
    
    {gridDistance !== undefined && (
      <div className="grid-distance">
        <div className="grid-distance-icon">🔌</div>
        <div className="grid-distance-text">
          Distance to grid: <strong>~{gridDistance.toFixed(1)} km</strong>
        </div>
      </div>
    )}
    
    {overlapWarnings && overlapWarnings.length > 0 && (
      <div className="overlap-warnings">
        {overlapWarnings.map((warning, index) => (
          <div key={index} className={`overlap-warning overlap-${warning.zoneType}`}>
            <div className="overlap-icon">⚠️</div>
            <div className="overlap-text">
              <strong>{warning.overlapPercent.toFixed(1)}%</strong> overlaps {warning.zoneName}
            </div>
          </div>
        ))}
      </div>
    )}
    
    <div className="measurement-section">
      <div className="measurement-section-title">
        ☀️ Solar Potential
      </div>
      <div className="measurement-capacity solar">
        ~{solarMW.toFixed(2)} MW
      </div>
      <div className="measurement-note">
        Based on 1 MW per 2 hectares
      </div>
    </div>
    
    <div className="measurement-section">
      <div className="measurement-section-title">
        💨 Wind Potential
      </div>
      <div className="measurement-capacity wind">
        ~{windMW.toFixed(2)} MW
      </div>
      <div className="measurement-note">
        Estimate for wind farm density
      </div>
    </div>
  </div>
);

const DistanceMeasurement = ({ lengthKm, lengthM }: DistanceMeasurementProps) => (
  <div className="distance-measurement">
    <div className="distance-title">
      Distance
    </div>
    <div className="distance-value">
      <strong>{lengthKm.toFixed(2)} km</strong> ({lengthM.toFixed(2)} m)
    </div>
  </div>
);

// Export functions that return HTML strings for MapLibre popups
export const renderAreaMeasurement = (props: AreaMeasurementProps): string => {
  return renderToString(<AreaMeasurement {...props} />);
};

export const renderDistanceMeasurement = (props: DistanceMeasurementProps): string => {
  return renderToString(<DistanceMeasurement {...props} />);
};
