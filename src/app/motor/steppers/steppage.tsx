import { ReusableStepper } from '@/dev/core'
import { CustomerVerificationDetails } from './capture-details'
import OTPVerificationPage from './otp-verification'

export const StepPage = () => {
    return (
        <ReusableStepper
            defaultStep={1}
            steps={[
                {
                    title: "",
                    content: <CustomerVerificationDetails />,
                },
                {
                    title: "",
                    content: <OTPVerificationPage />,
                },
            ]}
        />
    )
}
