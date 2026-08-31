import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import type { PaymentFormInput } from '@/types/schema'
import { ReuseableInput } from '@/dev/core'
import { PESAPAL_PAYMENT_ENABLED } from '@/utils/constatnts'
import { CircleAlert } from 'lucide-react'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { PaymentAmountSummary } from './payment-amount-summary'

export const CARD_PROVIDERS = [
    { value: 'paystack', label: 'PayStack', image: '/paystack.png' },
    { value: 'pesapal', label: 'PesaPal', image: '/pesapal.png' },
] as const

export const visibleCardProviders = CARD_PROVIDERS.filter(
    (provider) => provider.value !== 'pesapal' || PESAPAL_PAYMENT_ENABLED,
)

export const CardsTabPage: React.FC = () => {
    const { control, watch, setValue } = useFormContext<PaymentFormInput>()
    const cardProvider = watch('card_provider') ?? 'paystack'

    React.useEffect(() => {
        if (!PESAPAL_PAYMENT_ENABLED && cardProvider === 'pesapal') {
            setValue('card_provider', 'paystack')
        }
    }, [cardProvider, setValue])

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
                                        className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
                                    >
                                        {visibleCardProviders.map((provider) => {
                                            const inputId = `card-provider-${provider.value}`
                                            const isSelected = field.value === provider.value
                                            return (
                                                <div key={provider.value} className="relative w-full">
                                                    <RadioGroupItem
                                                        value={provider.value}
                                                        id={inputId}
                                                        className="sr-only"
                                                    />
                                                    <Label
                                                        htmlFor={inputId}
                                                        className={cn(
                                                            'flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-black/20 bg-white p-1 shadow-sm transition hover:border-[#BF162E] hover:shadow-md',
                                                            isSelected && 'border-[#BF162E] shadow-md'
                                                        )}
                                                    >
                                                        <img
                                                            src={provider.image}
                                                            alt={provider.label}
                                                            className="h-auto w-20 object-contain"
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

                    {cardProvider === 'paystack' ? (
                        <div className="mt-4 rounded-lg border border-black/20 bg-white p-3 shadow-sm">
                            <ReuseableInput
                                className="w-full h-10 rounded-sm border border-black/30 bg-white text-black"
                                control={control}
                                name="paystack_email"
                                label="Email Address"
                                type="email"
                                placeholder="name@example.com"
                            />
                            <div className="mt-3 flex items-start gap-3 rounded-md border border-black/20 bg-white p-3">
                                <div className="mt-1 text-[#BF162E]">
                                    <CircleAlert className="h-4 w-4" />
                                </div>
                                <span className="text-xs sm:text-sm text-black/80 leading-relaxed">
                                    Paystack will open a card checkout. If the popup is blocked, we
                                    send you to Paystack&apos;s payment page instead.
                                </span>
                            </div>
                        </div>
                    ) : null}

                    {PESAPAL_PAYMENT_ENABLED && cardProvider === 'pesapal' ? (
                        <div className="mt-4 rounded-lg border border-black/20 bg-white p-3 shadow-sm">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                    ) : null}
                </FieldGroup>
            </div>
        </div>
    )
}
