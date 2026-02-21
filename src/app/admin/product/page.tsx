import { PageHeader } from '@/components/shared'
import { Plus } from 'lucide-react'
import React from 'react'

export const ProductPage = () => {
    return (
        <div>
            <PageHeader
                title="Products"
                description="Manage products, their details, and associated products"
                actions={[
                    {
                        icon: Plus,
                        label: 'Add Product',
                        variant: 'default',
                        onClick: () => {
                            // handleDialogContextSwitch({
                            //     componentProps: { refetch },
                            //     Component: CreateUserModal,
                            // })
                        },
                    },
                ]}
            />
        </div>
    )
}
