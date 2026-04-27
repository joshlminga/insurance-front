import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import type { PaymentFormValues } from '@/types/schema'
import { CircleAlert } from 'lucide-react'

export const MpesaPageTab: React.FC = () => {
    const { control, watch } = useFormContext<PaymentFormValues>()
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
        <div className='w-full max-w- mx-auto p-1'>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="w-full rounded-[20px] border border-[#ADABAB]/30 bg-white shadow-sm p-3">
                    <FieldGroup>
                        <div className="mb-6 p-4 h-auto min-h-8.5 rounded-[15px] border border-[#ADABAB]/70 bg-green-50/30">
                            <span className="text-sm text-muted-foreground uppercase tracking-wider">Total to Pay:</span>
                            <h1 className='text-[#0CC258] font-bold text-2xl sm:text-2xl'>Ksh {formattedAmount}</h1>
                        </div>
                        <Controller
                            name="phone_number"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-sm sm:text-base font-semibold mb-1">
                                        Mobile Number
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder="0712345678"
                                        autoComplete='off'
                                        className={`w-full h-12 rounded-xl border border-[#ADABAB] ${fieldState.invalid ? 'border-red-500 ring-1 ring-red-500' : 'focus:ring-[#0CC258]'
                                            }`}
                                        onChange={(e) => {
                                            const formatted = formatPhoneNumber(e.target.value)
                                            field.onChange(formatted)
                                        }}
                                    />
                                    {fieldState.error && (
                                        <FieldError className="text-red-500 text-xs mt-1 italic">
                                            {fieldState.error.message}
                                        </FieldError>
                                    )}
                                </Field>
                            )}
                        />
                        <div className="mt-6 flex items-start gap-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="mt-1 text-blue-500">
                                <CircleAlert />
                            </div>
                            <span className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                                You will receive an M-Pesa prompt on your phone to enter your PIN and complete payment.
                            </span>
                        </div>
                    </FieldGroup>
                </div>
                
                <div className="w-full p-6 bg-gray-50 rounded-[20px] border border-dashed border-[#ADABAB]">
                    <span className="font-bold text-gray-700 text-sm sm:text-base block mb-4 underline decoration-[#0CC258] underline-offset-4">
                        Option 2: Pay via Lipa na M-Pesa
                    </span>
                    <ol className="list-decimal list-inside space-y-3 font-poppins text-xs sm:text-sm text-gray-700">
                        <li className="pl-2">Go to the <span className="font-semibold">M-PESA menu</span></li>
                        <li className="pl-2">Select <span className="font-semibold">Lipa na M-PESA</span></li>
                        <li className="pl-2">Select <span className="font-semibold">Paybill</span></li>
                        <li className="pl-2">Enter Business No. <span className="font-bold text-[#0CC258]">******</span></li>
                        <li className="pl-2">Enter Account No. <span className="font-bold text-[#0CC258]">*******</span></li>
                        <li className="pl-2">Enter Amount: <span className="font-bold text-[#0CC258]">Ksh {formattedAmount}</span></li>
                        <li className="pl-2">Enter your <span className="font-semibold">PIN</span> and press OK</li>
                        <li className="pl-2">Wait for the confirmation SMS</li>
                    </ol>
                </div>

            </div>
        </div>
    )
}
