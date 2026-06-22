import { FieldGroup } from '@/components/ui/field'
import { ReuseableInput } from '@/dev/core'
import type { PaymentFormInput } from '@/types/schema'
import { CircleAlert } from 'lucide-react'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { PaymentAmountSummary } from './payment-amount-summary'

export const PesapalTabPage: React.FC = () => {
    const { control } = useFormContext<PaymentFormInput>()

    return (
        <div className="w-full">
            <div className="mx-auto">
                <FieldGroup>
                    <div className="w-full rounded-lg border border-black/20 bg-white shadow-sm p-3">
                        <PaymentAmountSummary label="Total to Pay:" />

                        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <ReuseableInput
                                className="w-full h-10 rounded-sm border border-black/30 bg-white text-black"
                                control={control}
                                name="phone_number"
                                label="Mobile Number"
                                type="tel"
                                placeholder="0712345678"
                            />
                            <ReuseableInput
                                className="w-full h-10 rounded-sm border border-black/30 bg-white text-black"
                                control={control}
                                name="pesapal_email"
                                label="Email Address"
                                type="email"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="mt-4 flex items-start gap-3 rounded-md border border-black/20 bg-white p-3">
                            <div className="mt-1 text-[#BF162E]">
                                <CircleAlert className="h-4 w-4" />
                            </div>
                            <span className="text-xs sm:text-sm text-black/80 leading-relaxed">
                                Provide at least a phone number or email address. You will be
                                redirected to Pesapal to pay with M-Pesa, card, or other supported
                                methods.
                            </span>
                        </div>
                    </div>
                </FieldGroup>
            </div>
        </div>
    )
}
