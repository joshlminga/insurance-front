import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import React, { useRef } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import type { PaymentFormValues } from '@/types/schema'

export const CardsTabPage: React.FC = () => {
    const { control } = useFormContext<PaymentFormValues>()
    const expiryRef = useRef<HTMLInputElement>(null)
    const cvvRef = useRef<HTMLInputElement>(null)

    const formatCardNumber = (value: string): string => {
        const digits = value.replace(/\D/g, '').slice(0, 16)
        return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
    }

    const formatExpiryDate = (value: string): string => {
        const digits = value.replace(/\D/g, '').slice(0, 4)
        if (digits.length >= 2) {
            return `${digits.slice(0, 2)}/${digits.slice(2)}`
        }
        return digits
    }
    const handleCardNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        onChange: (value: string) => void
    ) => {
        const formatted = formatCardNumber(e.target.value)
        onChange(formatted)
        const digitsOnly = formatted.replace(/\s/g, '')
        if (digitsOnly.length === 16) {
            expiryRef.current?.focus()
        }
    }

    const handleExpiryChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        onChange: (value: string) => void
    ) => {
        const formatted = formatExpiryDate(e.target.value)
        onChange(formatted)
        if (formatted.length === 5) {
            cvvRef.current?.focus()
        }
    }

    const handleCvvChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        onChange: (value: string) => void
    ) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
        onChange(digits)
    }

    return (
        <div className='justify-center items-center'>
            <div className="justify-between">
                <FieldGroup>
                    <div className="w-full p-4 h-[74px] rounded-[20px] border border-[#ADABAB]/70 bg-white">
                        <span>You will Pay:</span>
                        <h1 className='text-[#0CC258] font-bold text-xl'>Kshs 904,090</h1>
                    </div>
                    <div className='grid grid-cols-2 gap-4 mt-4'>
                        <div className="col-span-2">
                            <Controller
                                name="card_number"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Card Number</FieldLabel>
                                        <Input
                                            {...field}
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="0000 0000 0000 0000"
                                            autoComplete="cc-number"
                                            maxLength={19}
                                            className={`w-full h-[51px] rounded-[5px] border border-[#ADABAB] ${
                                                fieldState.invalid ? 'border-red-500 focus-visible:ring-red-500' : ''
                                            }`}
                                            onChange={(e) => handleCardNumberChange(e, field.onChange)}
                                        />
                                        {fieldState.error && (
                                            <FieldError className="text-red-500 text-sm mt-1">
                                                {fieldState.error.message}
                                            </FieldError>
                                        )}
                                    </Field>
                                )}
                            />
                        </div>
                        <Controller
                            name="expiry_date"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Expiry Date</FieldLabel>
                                    <Input
                                        {...field}
                                        ref={expiryRef}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="MM/YY"
                                        autoComplete="cc-exp"
                                        maxLength={5}
                                        className={`w-full h-[51px] rounded-[5px] border border-[#ADABAB] ${
                                            fieldState.invalid ? 'border-red-500 focus-visible:ring-red-500' : ''
                                        }`}
                                        onChange={(e) => handleExpiryChange(e, field.onChange)}
                                    />
                                    {fieldState.error && (
                                        <FieldError className="text-red-500 text-sm mt-1">
                                            {fieldState.error.message}
                                        </FieldError>
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="cvv"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>CVV</FieldLabel>
                                    <Input
                                        {...field}
                                        ref={cvvRef}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="123"
                                        autoComplete="cc-csc"
                                        maxLength={4}
                                        className={`w-full h-[51px] rounded-[5px] border border-[#ADABAB] ${
                                            fieldState.invalid ? 'border-red-500 focus-visible:ring-red-500' : ''
                                        }`}
                                        onChange={(e) => handleCvvChange(e, field.onChange)}
                                    />
                                    {fieldState.error && (
                                        <FieldError className="text-red-500 text-sm mt-1">
                                            {fieldState.error.message}
                                        </FieldError>
                                    )}
                                </Field>
                            )}
                        />
                    </div>
                </FieldGroup>
            </div>
        </div>
    )
}
