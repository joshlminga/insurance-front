import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import type { PaymentFormValues } from '@/types/schema'

export const MpesaPageTab: React.FC = () => {
    const { control } = useFormContext<PaymentFormValues>()
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
        <div className='justify-center items-center'>
            <div className="justify-between">
                <FieldGroup>
                    <div className="w-full p-4 h-[74px] rounded-[20px] border border-[#ADABAB]/70 bg-white">
                        <span>You will Pay:</span>
                        <h1 className='text-[#0CC258] font-bold text-xl'>Kshs 904,090</h1>
                    </div>
                    
                    <Controller
                        name="phone_number"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="mt-4">
                                <FieldLabel>Please Enter Your Mobile Number Below to Pay:</FieldLabel>
                                <Input
                                    {...field}
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="0712345678 or 254712345678"
                                    autoComplete="tel"
                                    className={`w-full h-[51px] rounded-full border border-[#ADABAB] ${
                                        fieldState.invalid ? 'border-red-500 focus-visible:ring-red-500' : ''
                                    }`}
                                    onChange={(e) => {
                                        const formatted = formatPhoneNumber(e.target.value)
                                        field.onChange(formatted)
                                    }}
                                />
                                {fieldState.error && (
                                    <FieldError className="text-red-500 text-sm mt-1">
                                        {fieldState.error.message}
                                    </FieldError>
                                )}
                            </Field>
                        )}
                    />
                    
                    <span className="block mt-3 text-sm">
                        You will shortly receive an M-pesa prompt on your phone requesting you to enter your M-PESA PIN to complete your payment
                    </span>
                    
                    <div className="mt-4">
                        <span className="font-medium">You can also pay using Lipa na Mpesa by using the following Instructions:</span>
                        <ol className="list-decimal list-inside space-y-2 font-poppins text-sm text-black mt-2">
                            <li>Go to the M-PESA menu</li>
                            <li>Select Lipa na M-PESA.</li>
                            <li>Select the Paybill option.</li>
                            <li>Enter business number ******</li>
                            <li>Enter account number *******</li>
                            <li>Enter the amount Ksh. 904,090.</li>
                            <li>Enter your PIN and press OK to send.</li>
                            <li>You will receive a confirmation SMS with your payment reference number.</li>
                        </ol>
                    </div>
                </FieldGroup>
            </div>
        </div>
    )
}
