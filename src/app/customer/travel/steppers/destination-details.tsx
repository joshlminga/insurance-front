import { ReusableTabComponent } from '@/dev/core'
import { TravvelerDestinationDetailsTabs } from '@/dev/tabs'
import { ETRAVELLERDESTINATION } from '@/types/enums'
import { CustomerVerificationDetailsProps } from '@/types/types'
import React from 'react'

export const TravellerDestinationDetailsPage: React.FC = ({
    goToNextStep,
    goToPrevStep,
}: CustomerVerificationDetailsProps) => {
    return (
        <div className="w-full min-w-0 max-w-full mx-auto items-center justify-center px-1 sm:px-2 lg:px-6">
            <div className="space-y-6 sm:space-y-8">
                <ReusableTabComponent
                    tabs={TravvelerDestinationDetailsTabs}
                    defaultTab={ETRAVELLERDESTINATION.OUTBOUND}
                    tabProps={{
                        goToNextStep,
                        goToPrevStep
                    }}
                />
            </div>
        </div>
    )
}
