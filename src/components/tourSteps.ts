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
    description: 'Use these tools to draw on the map. Select mode lets you edit existing shapes, while polygon, line, and circle modes create new shapes. Double-click to finish drawing polygons and lines.',
    position: 'right'
  },
  {
    target: '.assumption-controls',
    title: 'Energy Assumptions',
    description: 'Configure renewable energy capacity assumptions here. Adjust MW per hectare values for solar and wind farms to match your planning scenarios.',
    position: 'left'
  },
  {
    target: '.map-container',
    title: 'Interactive Map',
    description: 'Click and drag to draw shapes on the map. Each shape will show area measurements and estimated renewable energy capacity based on your assumptions.',
    position: 'top'
  },
  {
    target: '.draw-toolbar',
    title: 'Getting Started',
    description: 'Ready to begin! Select a drawing tool from the toolbar, click on the map to start drawing, and view instant calculations in the popup. Happy planning!',
    position: 'right'
  }
];
