import '../styles/DrawToolbar.css';

interface DrawToolbarProps {
  currentMode: string | null;
  onModeChange: (mode: 'select' | 'polygon' | 'linestring' | 'circle') => void;
  onClear: () => void;
}

const DrawToolbar = ({ currentMode, onModeChange, onClear }: DrawToolbarProps) => {
  return (
    <div className="draw-toolbar">
      <button
        className={`toolbar-btn ${currentMode === 'select' ? 'active' : ''}`}
        onClick={() => onModeChange('select')}
        data-tooltip="Select & Edit"
      >
        <svg width="20" height="20" viewBox="0 0 20 20">
          <path d="M2 2 L2 18 L6 14 L9 20 L11 19 L8 13 L14 13 Z" fill="currentColor" />
        </svg>
        <span>Select</span>
      </button>

      <button
        className={`toolbar-btn ${currentMode === 'polygon' ? 'active' : ''}`}
        onClick={() => onModeChange('polygon')}
        data-tooltip="Draw Polygon"
      >
        <svg width="20" height="20" viewBox="0 0 20 20">
          <polygon points="10,2 18,7 16,17 4,17 2,7" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>Polygon</span>
      </button>

      <button
        className={`toolbar-btn ${currentMode === 'linestring' ? 'active' : ''}`}
        onClick={() => onModeChange('linestring')}
        data-tooltip="Draw Line"
      >
        <svg width="20" height="20" viewBox="0 0 20 20">
          <polyline points="2,16 7,8 13,12 18,4" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>Line</span>
      </button>

      <button
        className={`toolbar-btn ${currentMode === 'circle' ? 'active' : ''}`}
        onClick={() => onModeChange('circle')}
        data-tooltip="Draw Circle"
      >
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>Circle</span>
      </button>

      <div className="toolbar-divider"></div>

      <button
        className="toolbar-btn clear-btn"
        onClick={onClear}
        data-tooltip="Clear All"
      >
        <svg width="20" height="20" viewBox="0 0 20 20">
          <path
            d="M6 6 L14 14 M14 6 L6 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span>Clear</span>
      </button>
    </div>
  );
};

export default DrawToolbar;
