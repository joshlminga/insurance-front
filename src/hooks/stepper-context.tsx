/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import type { StepperContextType, StepperProviderProps } from '@/types/types';
import React, { createContext, useContext, useState, useEffect } from 'react';


const StepperContext = createContext<StepperContextType | undefined>(undefined);

export const useStepperContext = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepperContext must be used within a MotorProvider');
  }
  return context;
};


const STORAGE_KEY = 'stepper_current_step';

export const StepperProvider: React.FC<StepperProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStepState] = useState<number>(1);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedStep = localStorage.getItem(STORAGE_KEY);
    if (savedStep) {
      setCurrentStepState(parseInt(savedStep, 10));
    }
    setIsInitialized(true);
  }, []);

  const setCurrentStep = (step: number) => {
    setCurrentStepState(step);
    localStorage.setItem(STORAGE_KEY, step.toString());
  };

  const goToNextStep = () => setCurrentStep(currentStep + 1);
  const goToPrevStep = () => setCurrentStep(currentStep - 1);

  if (!isInitialized) {
    return null;
  }

  return (
    <StepperContext.Provider value={{ currentStep, setCurrentStep, goToNextStep, goToPrevStep }}>
      {children}
    </StepperContext.Provider>
  );
};
