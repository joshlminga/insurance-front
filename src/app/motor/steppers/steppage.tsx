import { ReusableStepper } from '@/dev/core'
import { ESTEPS } from '@/utils/steps-config'
import { useStepperContext } from '@/hooks/stepper-context'

export const StepPage: React.FC = () => {
    const { currentStep, setCurrentStep } = useStepperContext()
    return (
        <ReusableStepper
            steps={ESTEPS}
            value={currentStep}
            onValueChange={setCurrentStep}
        />
    )
}
