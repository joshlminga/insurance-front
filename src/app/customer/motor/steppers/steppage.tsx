import { ReusableStepper } from '@/dev/core'
import { getMotorSteps } from '@/utils/steps-config'
import { useStepperContext } from '@/hooks/stepper-context'
import { UseAuth } from '@/components/auth-provider'
import { useEffect } from 'react'

export const StepPage: React.FC = () => {
    const { isAuthenticated } = UseAuth();
    const { currentStep, setCurrentStep } = useStepperContext();
    const steps = getMotorSteps(isAuthenticated);
    useEffect(() => {
        if (isAuthenticated && currentStep > steps.length) {
            setCurrentStep(1)
        }
    }, [isAuthenticated, currentStep, steps.length, setCurrentStep])

    return (
        <ReusableStepper
            steps={steps}
            value={currentStep}
            onValueChange={setCurrentStep}
        />
    )
}
