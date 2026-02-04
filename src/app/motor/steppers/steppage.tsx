import { ReusableStepper } from '@/dev/core'
import { ESTEPS } from '@/utils/enums'

export const StepPage: React.FC = () => {
    return (
        <ReusableStepper
            defaultStep={1}
           steps={ESTEPS}
        />
    )
}
