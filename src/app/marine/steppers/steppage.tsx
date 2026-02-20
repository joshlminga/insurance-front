import { ReusableStepper } from '@/dev/core'
import { EMARINESTEPS} from '@/utils/steps-config'
import { useStepperContext } from '@/hooks/stepper-context'

export const MarineStepPage: React.FC = () => {
    const { currentStep, setCurrentStep } = useStepperContext()
    return (
        <ReusableStepper
            steps={EMARINESTEPS}
            value={currentStep}
            onValueChange={setCurrentStep}
        />
    )
}
