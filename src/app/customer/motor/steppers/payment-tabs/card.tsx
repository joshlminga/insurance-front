import { FieldGroup } from '@/components/ui/field'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import type { PaymentFormValues } from '@/types/schema'

export const CardsTabPage: React.FC = () => {
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

                    <div className="mt-4">
                        <p className="text-xs font-semibold text-black">
                            Choose a payment provider
                        </p>
                        <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                            <button
                                type="button"
                                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-black/20 bg-white p-3 shadow-sm transition hover:border-[#BF162E] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#BF162E]/50"
                            >
                                <img
                                    src="/paystack.png"
                                    alt="PayStack"
                                    className="h-8 w-auto max-w-full object-contain"
                                />
                                <span className="text-xs text-black/70">Redirect payment</span>
                            </button>

                            <button
                                type="button"
                                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-black/20 bg-white p-3 shadow-sm transition hover:border-[#BF162E] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#BF162E]/50"
                            >
                                <img
                                    src="/pesapal.png"
                                    alt="PesaPal"
                                    className="h-8 w-auto max-w-full object-contain"
                                />
                                <span className="text-xs text-black/70">Card & wallet</span>
                            </button>

                            <button
                                type="button"
                                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-black/20 bg-white p-3 shadow-sm transition hover:border-[#BF162E] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#BF162E]/50"
                            >
                                <img
                                    src="/dpo.png"
                                    alt="DPO"
                                    className="h-8 w-auto max-w-full object-contain"
                                />
                                <span className="text-xs text-black/70">Secure checkout</span>
                            </button>
                        </div>
                    </div>
                </FieldGroup>
            </div>
        </div>
    )
}
