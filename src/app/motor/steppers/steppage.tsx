import { ReusableStepper } from '@/dev/core'
import React from 'react'
import { CaptureDetails } from './capture-details'

export const StepPage = () => {
    return (
        <ReusableStepper
            defaultStep={1}
            steps={[
                {
                    title: "Customer Details",
                    content: <CaptureDetails />,
                },
            ]}
        />
    )
}
