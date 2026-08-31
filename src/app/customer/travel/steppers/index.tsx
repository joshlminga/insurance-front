import { ReusableStepper } from '@/dev/core';
import { usePurchaseStepper } from '@/hooks/use-purchase-stepper';
import { UseAuth } from '@/stores/auth-store';
import { getTravelSteps } from '@/utils/steps-config';
import React, { useEffect, useRef } from 'react'

export const TravelStepPage: React.FC = () => {
    const { isAuthenticated } = UseAuth()
    const { currentStep, setCurrentStep, } = usePurchaseStepper('travel')
    const steps = getTravelSteps(isAuthenticated)
    const prevIsAuthenticated = useRef(isAuthenticated)

    useEffect(() => {
        if (!prevIsAuthenticated.current && isAuthenticated) {
            setCurrentStep(1)
        }
        if (isAuthenticated && currentStep > steps.length) {
            setCurrentStep(1)
        }
        prevIsAuthenticated.current = isAuthenticated
    }, [
        isAuthenticated,
        currentStep,
        steps.length,
        setCurrentStep,
    ])

    return (
        <ReusableStepper
            steps={steps}
            value={currentStep}
            onValueChange={setCurrentStep}
        />
    )
}