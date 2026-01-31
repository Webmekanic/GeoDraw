export interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export const tourSteps: TourStep[] = [
  {
    target: '.draw-toolbar',
    title: 'Drawing Tools',
    description: 'Use these tools to draw on the map. Select mode lets you edit existing shapes, while polygon, line, and circle modes create new shapes. Double-click to finish drawing polygons and lines. Use the trash icon to clear all drawings.',
    position: 'right'
  },
  {
    target: '.assumption-controls',
    title: 'Energy Assumptions',
    description: 'Configure renewable energy capacity assumptions here. Adjust MW per hectare values for solar and wind farms to match your planning scenarios. All capacity estimates update automatically when you change these values.',
    position: 'left'
  },
  {
    target: '.map-container',
    title: 'Map Layers & Constraints',
    description: 'Notice the purple grid infrastructure lines and semi-transparent restricted zones (protected areas, settlements, floodplains). These represent real-world planning constraints that affect site viability.',
    position: 'top'
  },
  {
    target: '.map-container',
    title: 'Understanding Results',
    description: 'When you draw a polygon or circle, a popup shows: area in hectares, distance to nearest grid line (🔌), overlap warnings with restricted zones (⚠️), and solar/wind capacity estimates in MW. Click the 📍 pin marker to reopen the popup.',
    position: 'top'
  },
  {
    target: '.draw-toolbar',
    title: 'Ready to Explore!',
    description: 'Start by selecting a drawing tool, click on the map to draw a land parcel, and see instant renewable energy feasibility insights. Adjust assumptions to explore different scenarios. Happy planning!',
    position: 'right'
  }
];
