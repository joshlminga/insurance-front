import type { PaymentFormInput } from '@/types/schema'
import React from 'react'
import { useFormContext } from 'react-hook-form'

type PaymentAmountSummaryProps = {
    label?: string
}

export const PaymentAmountSummary: React.FC<PaymentAmountSummaryProps> = ({
    label = 'You will Pay:',
}) => {
    const { watch } = useFormContext<PaymentFormInput>()
    const amount = watch('amount')
    const formattedAmount = Number(amount || 0).toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    return (
        <div className="w-full sm:w-1/2">
            <span className="text-xs text-black/70">{label}</span>
            <h1 className="font-bold text-lg sm:text-xl text-[#BF162E]">
                Ksh {formattedAmount}
            </h1>
        </div>
    )
}
