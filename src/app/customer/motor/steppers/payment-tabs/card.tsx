import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import type { PaymentFormInput } from '@/types/schema'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { PaymentAmountSummary } from './payment-amount-summary'

const CARD_PROVIDERS = [
    { value: 'paystack', label: 'PayStack', image: '/paystack.png' },
    { value: 'pesapal', label: 'PesaPal', image: '/pesapal.png' },
    { value: 'dpo', label: 'DPO', image: '/dpo.png' },
] as const

export const CardsTabPage: React.FC = () => {
    const { control } = useFormContext<PaymentFormInput>()

    return (
        <div className="w-full">
            <div className="mx-auto">
                <FieldGroup>
                    <PaymentAmountSummary />

                    <div className="mt-4">
                        <p className="text-xs font-semibold text-black">
                            Choose a payment provider
                        </p>
                        <Controller
                            name="card_provider"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="mt-2.5">
                                    <RadioGroup
                                        value={field.value ?? 'paystack'}
                                        onValueChange={field.onChange}
                                        className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
                                    >
                                        {CARD_PROVIDERS.map((provider) => {
                                            const inputId = `card-provider-${provider.value}`
                                            const isSelected = field.value === provider.value
                                            return (
                                                <div key={provider.value} className="relative">
                                                    <RadioGroupItem
                                                        value={provider.value}
                                                        id={inputId}
                                                        className="sr-only"
                                                    />
                                                    <Label
                                                        htmlFor={inputId}
                                                        className={cn(
                                                            'flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-black/20 bg-white p-0 shadow-sm transition hover:border-[#BF162E] hover:shadow-md min-h-24 aspect-[4/3]',
                                                            isSelected && 'border-[#BF162E] shadow-md'
                                                        )}
                                                    >
                                                        <img
                                                            src={provider.image}
                                                            alt={provider.label}
                                                            className="h-full w-full object-contain p-2"
                                                        />
                                                    </Label>
                                                </div>
                                            )
                                        })}
                                    </RadioGroup>
                                    {fieldState.error && (
                                        <FieldError className="mt-2 text-xs text-[#BF162E]">
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
