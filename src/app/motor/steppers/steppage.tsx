import { ReusableStepper } from '@/dev/core'
import { CustomerVerificationDetails } from './capture-details'

export const StepPage = () => {
    return (
        <ReusableStepper
            defaultStep={1}
            steps={[
                {
                    title: "Customer Details",
                    content: <CustomerVerificationDetails />,
                },
            ]}
        />
    )
}
