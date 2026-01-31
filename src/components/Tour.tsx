import { useEffect, useState } from 'react';
import { tourSteps } from './tourSteps';
import '../styles/Tour.css';

interface TourProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tour = ({ isOpen, onClose }: TourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && currentStep < tourSteps.length) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        updateTooltipPosition();
      }, 100);
      
      window.addEventListener('resize', updateTooltipPosition);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateTooltipPosition);
      };
    }
  }, [isOpen, currentStep]);

  const updateTooltipPosition = () => {
    if (currentStep >= tourSteps.length) return;
    
    const step = tourSteps[currentStep];
    const targetElement = document.querySelector(step.target);
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const tooltipWidth = 360;
      const tooltipHeight = 250;
      const padding = 20;
      
      let top = 0;
      let left = 0;

      switch (step.position) {
        case 'right':
          top = rect.top + rect.height / 2;
            left = rect.right + padding;
              
          if (left + tooltipWidth > window.innerWidth) {
            left = window.innerWidth - tooltipWidth - padding;
          }
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - tooltipWidth - padding;

          if (left < padding) {
            left = rect.right + padding;
          }
          break;
        case 'top':
          top = rect.top - tooltipHeight - padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
              
          if (top < padding) {
            top = rect.bottom + padding;
          }
          break;
        case 'bottom':
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
      }

      if (left < padding) {
        left = padding;
      } else if (left + tooltipWidth > window.innerWidth - padding) {
        left = window.innerWidth - tooltipWidth - padding;
      }

      if (top < padding) {
        top = padding;
      } else if (top + tooltipHeight > window.innerHeight - padding) {
        top = window.innerHeight - tooltipHeight - padding;
      }

      setTooltipPosition({ top, left });
    }
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    localStorage.setItem('tourCompleted', 'true');
    onClose();
  };

  if (!isOpen) return null;

  if (currentStep >= tourSteps.length) {
    handleClose();
    return null;
  }

  const step = tourSteps[currentStep];
  const targetElement = document.querySelector(step.target);

  if (!targetElement) {
    console.warn(`Tour target not found: ${step.target}`);
    return (
      <>
        <div className="tour-overlay" onClick={handleClose} />
        <div 
          className="tour-tooltip tour-tooltip-right"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="tour-header">
            <h3>Loading...</h3>
            <button className="tour-close" onClick={handleClose}>×</button>
          </div>
          <p className="tour-description">Waiting for elements to load...</p>
          <div className="tour-footer">
            <div className="tour-progress">
              Step {currentStep + 1} of {tourSteps.length}
            </div>
            <div className="tour-actions">
              {currentStep > 0 && (
                <button className="tour-btn tour-btn-back" onClick={handleBack}>
                  Back
                </button>
              )}
              <button className="tour-btn tour-btn-next" onClick={handleNext}>
                {currentStep < tourSteps.length - 1 ? 'Next' : 'Finish'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const rect = targetElement.getBoundingClientRect();
  
  if (!rect || rect.width === 0 || rect.height === 0) {
    console.warn(`Tour target has invalid dimensions:`, step.target, rect);
    return null;
  }

  return (
    <>
      <div className="tour-overlay" onClick={handleClose} />
      
      <div 
        className="tour-highlight"
        style={{
          top: `${Math.max(0, rect.top - 8)}px`,
          left: `${Math.max(0, rect.left - 8)}px`,
          width: `${rect.width + 16}px`,
          height: `${rect.height + 16}px`,
        }}
      />
      
      <div 
        className={`tour-tooltip tour-tooltip-${step.position}`}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
            <div className="tour-header">
              <h3>{step.title}</h3>
              <button className="tour-close" onClick={handleClose}>×</button>
            </div>
            
            <p className="tour-description">{step.description}</p>
            
            <div className="tour-footer">
              <div className="tour-progress">
                Step {currentStep + 1} of {tourSteps.length}
              </div>
              
              <div className="tour-actions">
                {currentStep > 0 && (
                  <button className="tour-btn tour-btn-back" onClick={handleBack}>
                    Back
                  </button>
                )}
                <button className="tour-btn tour-btn-next" onClick={handleNext}>
                  {currentStep < tourSteps.length - 1 ? 'Next' : 'Finish'}
                </button>
              </div>
            </div>
          </div>
    </>
  );
};

export default Tour;
