import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import type { PaymentFormValues } from '@/types/schema'

export const MpesaPageTab: React.FC = () => {
    const { control } = useFormContext<PaymentFormValues>()
    
    // Format phone number for Kenyan format
    const formatPhoneNumber = (value: string): string => {
        // Remove non-digits
        const digits = value.replace(/\D/g, '')
        
        // If starts with 254, keep as is
        if (digits.startsWith('254')) {
            return digits.slice(0, 12)
        }
        // If starts with 0, keep as is
        if (digits.startsWith('0')) {
            return digits.slice(0, 10)
        }
        // Otherwise, assume it's without prefix
        return digits.slice(0, 9)
    }

    return (
        <div className='w-full flex justify-center items-center'>
            <div className="w-full max-w-5xl mx-auto">
                <FieldGroup>
                    {/* Payment Amount Display */}
                    <div className="w-full p-4 h-auto min-h-[74px] rounded-[20px] border border-[#ADABAB]/70 bg-white">
                        <span className="text-sm text-muted-foreground">You will Pay:</span>
                        <h1 className='text-[#0CC258] font-bold text-xl sm:text-2xl'>Kshs 904,090</h1>
                    </div>
                    
                    {/* Phone Number Input */}
                    <Controller
                        name="phone_number"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="mt-4">
                                <FieldLabel className="text-sm sm:text-base">Please Enter Your Mobile Number Below to Pay:</FieldLabel>
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
                    
                    <span className="block mt-3 text-xs sm:text-sm">
                        You will shortly receive an M-pesa prompt on your phone requesting you to enter your M-PESA PIN to complete your payment
                    </span>
                    
                    {/* Instructions Card */}
                    <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium text-sm sm:text-base">You can also pay using Lipa na Mpesa by using the following Instructions:</span>
                        <ol className="list-decimal list-inside space-y-1 sm:space-y-2 font-poppins text-xs sm:text-sm text-black mt-2">
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
