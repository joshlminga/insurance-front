import { ReusableStepper } from '@/dev/core'
import { getMotorSteps } from '@/utils/steps-config'
import { useStepperContext } from '@/hooks/stepper-context'
import { UseAuth } from '@/components/auth-provider'
import { useEffect, useRef } from 'react'

export const StepPage: React.FC = () => {
    const { isAuthenticated } = UseAuth();
    const { currentStep, setCurrentStep } = useStepperContext();
    const steps = getMotorSteps(isAuthenticated);
    const prevIsAuthenticated = useRef(isAuthenticated)
    useEffect(() => {
        // #region agent log
        fetch('http://127.0.0.1:7869/ingest/6b26b564-2b2f-4d86-86d4-491e7f1525ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1b90db'},body:JSON.stringify({sessionId:'1b90db',runId:'pre-fix',hypothesisId:'H1',location:'src/app/customer/motor/steppers/steppage.tsx:14',message:'StepPage effect (auth/step/steps.length)',data:{isAuthenticated, currentStep, stepsLength: steps.length},timestamp:Date.now()})}).catch(()=>{});
        // #endregion agent log
        if (!prevIsAuthenticated.current && isAuthenticated) {
            // #region agent log
            fetch('http://127.0.0.1:7869/ingest/6b26b564-2b2f-4d86-86d4-491e7f1525ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1b90db'},body:JSON.stringify({sessionId:'1b90db',runId:'post-fix',hypothesisId:'H1',location:'src/app/customer/motor/steppers/steppage.tsx:19',message:'Auth transitioned false->true; resetting stepper to first authenticated step',data:{fromStep: currentStep, toStep: 1, stepsLength: steps.length},timestamp:Date.now()})}).catch(()=>{});
            // #endregion agent log
            setCurrentStep(1)
        }
        if (isAuthenticated && currentStep > steps.length) {
            setCurrentStep(1)
        }
        prevIsAuthenticated.current = isAuthenticated
    }, [isAuthenticated, currentStep, steps.length, setCurrentStep])

    return (
        <ReusableStepper
            steps={steps}
            value={currentStep}
            onValueChange={setCurrentStep}
        />
    )
}
