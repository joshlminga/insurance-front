import { ReusableStepper } from '@/dev/core'
import { EMARINESTEPS} from '@/utils/steps-config'
import { usePurchaseStepper } from '@/hooks/use-purchase-stepper'

export const MarineStepPage: React.FC = () => {
    const { currentStep, setCurrentStep } = usePurchaseStepper('marine')
    return (
        <ReusableStepper
            steps={EMARINESTEPS}
            value={currentStep}
            onValueChange={setCurrentStep}
        />
    )
}
