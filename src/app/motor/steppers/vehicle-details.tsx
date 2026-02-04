import { ReusableTabs } from '@/dev/core'
import { Car, Truck, Van } from 'lucide-react'
import React from 'react'
import { MotorPrivatePage } from './tabs/motor-private'
import { MotorCommercialPage } from './tabs/motor-commercial'
import { MotorPsvPage } from './tabs/motor-psv'

export const VehicleDetailsPage: React.FC = () => {
    return (
        <div>
            <ReusableTabs
                tabs={
                    [
                    {
                        value: "private",
                        label: "Private",
                        icon: <Car size={16} />,
                        component: <MotorPrivatePage/>,
                    },
                    {
                        value: "commercial",
                        label: "Commercial",
                        icon: <Truck size={16} />,
                        component: <MotorCommercialPage/>,
                    },
                    {
                        value: "psv",
                        label: "PSV",
                        icon: <Van size={16} />,
                        component: <MotorPsvPage/>,
                    },
                ]
            }
            />
        </div>
    )
}
