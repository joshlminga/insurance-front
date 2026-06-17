import { FieldGroup } from '@/components/ui/field'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import type { PaymentFormValues } from '@/types/schema'

export const PaypalTabPage: React.FC = () => {
    const { watch } = useFormContext<PaymentFormValues>()
    const amount = watch('amount')
    const formattedAmount = Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    return (
        <div className="w-full">
            <div className="mx-auto">
                <FieldGroup>
                    <div className="w-full rounded-sm border border-black/20 bg-white p-3">
                        <span className="text-xs text-black/70">You will Pay:</span>
                        <h1 className="font-bold text-lg sm:text-xl text-[#BF162E]">
                            Ksh {formattedAmount}
                        </h1>
                    </div>

                    <div className="mt-4 rounded-lg border border-black/20 bg-white p-3 text-sm text-black/80">
                        You’ll be redirected to PayPal to complete payment.
                    </div>
                </FieldGroup>
            </div>
        </div>
    )
}

