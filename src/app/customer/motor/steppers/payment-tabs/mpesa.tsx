import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import type { PaymentFormInput } from '@/types/schema'
import { CircleAlert } from 'lucide-react'
import { PaymentAmountSummary } from './payment-amount-summary'

export const MpesaPageTab: React.FC = () => {
    const { control, watch } = useFormContext<PaymentFormInput>()
    const amount = watch('amount')
    const formattedAmount = Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const formatPhoneNumber = (value: string): string => {
        const digits = value.replace(/\D/g, '')
        if (digits.startsWith('254')) {
            return digits.slice(0, 12)
        }
        if (digits.startsWith('0')) {
            return digits.slice(0, 10)
        }
        return digits.slice(0, 9)
    }

    return (
        <div className='w-full mx-auto p-1'>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="w-full rounded-lg border border-black/20 bg-white shadow-sm p-3">
                    <FieldGroup>
                        <PaymentAmountSummary label="Total to Pay:" />
                        <Controller
                            name="phone_number"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="w-full">
                                    <div className="flex flex-row items-center gap-3">
                                        <FieldLabel className="mb-0 shrink-0 whitespace-nowrap text-sm font-semibold sm:text-base">
                                            Mobile Number
                                        </FieldLabel>
                                        <div className="min-w-0 flex-1">
                                            <Input
                                                {...field}
                                                type="tel"
                                                inputMode="numeric"
                                                placeholder="0712345678"
                                                autoComplete='off'
                                                className={`w-full h-10 rounded-sm border border-black/30 text-black ${fieldState.invalid ? 'border-[#BF162E] ring-1 ring-[#BF162E]' : 'focus:ring-[#BF162E]'
                                                    }`}
                                                onChange={(e) => {
                                                    const formatted = formatPhoneNumber(e.target.value)
                                                    field.onChange(formatted)
                                                }}
                                            />
                                            {fieldState.error && (
                                                <FieldError className="text-[#BF162E] text-xs mt-1 italic">
                                                    {fieldState.error.message}
                                                </FieldError>
                                            )}
                                        </div>
                                    </div>
                                </Field>
                            )}
                        />
                        <div className="mt-4 flex items-start gap-3 rounded-md border border-black/20 bg-white p-3">
                            <div className="mt-1 text-[#BF162E]">
                                <CircleAlert />
                            </div>
                            <span className="text-xs sm:text-sm text-black/80 leading-relaxed">
                                You will receive an M-Pesa prompt on your phone to enter your PIN and complete payment.
                            </span>
                        </div>
                    </FieldGroup>
                </div>
                
                <div className="w-full rounded-lg border border-dashed border-black/30 bg-white p-4">
                    <span className="font-bold text-black/80 text-sm sm:text-base block mb-4 underline decoration-[#BF162E] underline-offset-4">
                        Option 2: Pay via Lipa na M-Pesa
                    </span>
                    <ol className="list-decimal list-inside space-y-3 font-poppins text-xs sm:text-sm text-black/80">
                        <li className="pl-2">Go to the <span className="font-semibold">M-PESA menu</span></li>
                        <li className="pl-2">Select <span className="font-semibold">Lipa na M-PESA</span></li>
                        <li className="pl-2">Select <span className="font-semibold">Paybill</span></li>
                        <li className="pl-2">Enter Business No. <span className="font-bold text-[#BF162E]">******</span></li>
                        <li className="pl-2">Enter Account No. <span className="font-bold text-[#BF162E]">*******</span></li>
                        <li className="pl-2">Enter Amount: <span className="font-bold text-[#BF162E]">Ksh {formattedAmount}</span></li>
                        <li className="pl-2">Enter your <span className="font-semibold">PIN</span> and press OK</li>
                        <li className="pl-2">Wait for the confirmation SMS</li>
                    </ol>

                    <Controller
                        name="mpesa_transaction_code"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="mt-4 w-full">
                                <FieldLabel className="text-sm font-semibold mb-1">
                                    M-Pesa Transaction Code
                                </FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    placeholder="e.g. QGH1A2B3C4"
                                    autoComplete="off"
                                    className={`w-full h-10 rounded-sm border border-black/30 text-black ${fieldState.invalid ? 'border-[#BF162E] ring-1 ring-[#BF162E]' : 'focus:ring-[#BF162E]'
                                        }`}
                                />
                                {fieldState.error && (
                                    <FieldError className="text-[#BF162E] text-xs mt-1 italic">
                                        {fieldState.error.message}
                                    </FieldError>
                                )}
                            </Field>
                        )}
                    />
                </div>

            </div>
        </div>
    )
}
