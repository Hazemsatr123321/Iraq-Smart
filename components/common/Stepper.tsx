
import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-center w-full mb-12">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center text-center w-24">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 border-2 ${
                  isActive ? 'bg-brand-accent text-brand-primary border-brand-accent' : isCompleted ? 'bg-green-600 text-white border-green-600' : 'bg-brand-secondary text-brand-text-secondary border-gray-600'
                }`}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>
              <p className={`mt-2 text-sm font-medium transition-colors duration-300 ${isActive ? 'text-brand-accent' : 'text-brand-text-secondary'}`}>{step}</p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-auto border-t-2 transition-colors duration-300 mx-4 ${isCompleted ? 'border-green-600' : 'border-gray-700'}`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};