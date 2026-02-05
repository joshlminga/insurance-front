import { ReusableStepper } from '@/dev/core'
import { ESTEPS } from '@/utils/steps-config'

export const StepPage: React.FC = () => {
    return (
        <ReusableStepper
            defaultStep={1}
           steps={ESTEPS}
        />
    )
}
