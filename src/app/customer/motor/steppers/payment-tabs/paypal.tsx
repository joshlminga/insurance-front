import { FieldGroup } from '@/components/ui/field'
import { ReuseableInput } from '@/dev/core'
import type { PaymentFormInput } from '@/types/schema'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { PaymentAmountSummary } from './payment-amount-summary'

export const PaypalTabPage: React.FC = () => {
    const { control } = useFormContext<PaymentFormInput>()

    return (
        <div className="w-full">
            <div className="mx-auto">
                <FieldGroup>
                    <PaymentAmountSummary />

                    <div className="mt-4 w-full sm:w-1/2 lg:w-3/12">
                        <ReuseableInput
                            className="w-full h-10 rounded-sm border border-black/30 bg-white text-black"
                            control={control}
                            name="paypal_email"
                            label="PayPal Email Account"
                            type="email"
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <p className="mt-1.5 text-xs text-black/60 sm:text-sm">
                        You&apos;ll be redirected to PayPal to complete payment.
                    </p>
                </FieldGroup>
            </div>
        </div>
    )
}
