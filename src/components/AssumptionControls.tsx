import '../styles/AssumptionControls.css';

interface AssumptionControlsProps {
  solarMwPerHa: number;
  windMwPerHa: number;
  onSolarChange: (value: number) => void;
  onWindChange: (value: number) => void;
  isExpanded: boolean;
  onToggle: (expanded: boolean) => void;
}

const AssumptionControls = ({ 
  solarMwPerHa, 
  windMwPerHa, 
  onSolarChange, 
  onWindChange,
  isExpanded,
  onToggle,
}: AssumptionControlsProps) => {

  return (
    <div className="assumption-controls">
      <button 
        className="assumption-toggle"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(!isExpanded);
        }}
        title="Planning Assumptions"
      >
        <span className="toggle-icon">⚙️</span>
        <span className="toggle-text">Settings</span>
        <span className={`toggle-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </button>
      
      {isExpanded && (
        <div className="assumption-panel">
          <div className="assumption-header">
            <h3>Planning Assumptions</h3>
            <p>Adjust renewable energy capacity factors</p>
          </div>
          
          <div className="assumption-control">
            <label htmlFor="solar-density">
              <span className="control-icon">☀️</span>
              Solar Density (MW/ha)
            </label>
            <input
              id="solar-density"
              type="number"
              min="0.1"
              max="2.0"
              step="0.1"
              value={solarMwPerHa}
              onChange={(e) => onSolarChange(parseFloat(e.target.value) || 0.5)}
            />
            <span className="control-note">
              Default: 0.5 (1 MW per 2 ha)
            </span>
          </div>
          
          <div className="assumption-control">
            <label htmlFor="wind-density">
              <span className="control-icon">💨</span>
              Wind Density (MW/ha)
            </label>
            <input
              id="wind-density"
              type="number"
              min="0.05"
              max="0.5"
              step="0.05"
              value={windMwPerHa}
              onChange={(e) => onWindChange(parseFloat(e.target.value) || 0.1)}
            />
            <span className="control-note">
              Conservative farm density
            </span>
          </div>
          
          <div className="assumption-footer">
            <button 
              className="reset-button"
              onClick={() => {
                onSolarChange(0.5);
                onWindChange(0.1);
              }}
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssumptionControls;
