import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { UseApiQuery } from '@/hooks/hooks'
import { cn } from '@/lib/utils'
import type { SubmitResponse } from '@/types/types'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { normalizeLocalPhoneDigits } from './customer-lookup-utils'
import { motorAutofillHighlightClassName } from './motor-field-styles'

export type CountryGeoMeta = {
    id?: number | string
    name?: string
    country_code?: string
    country_dial_code?: string
    meta?: {
        country_code?: string
        country_dial_code?: string
    }
}

type AdminPhoneInputProps<T extends FieldValues> = {
    control: Control<T>
    name: Path<T>
    countryId: string
    label?: string
    required?: boolean
    disabled?: boolean
    /** Visual state when values came from customer lookup. */
    autofilled?: boolean
    className?: string
    onBlur?: () => void
}

export function resolveDialCode(country: CountryGeoMeta | undefined): string {
    return (
        country?.country_dial_code ??
        country?.meta?.country_dial_code ??
        ''
    )
}

function resolveCountryCode(country: CountryGeoMeta | undefined): string {
    return (
        country?.country_code ??
        country?.meta?.country_code ??
        ''
    ).toUpperCase()
}

/** Example local number placeholder (without country code). */
function buildPhonePlaceholder(country: CountryGeoMeta | undefined): string {
    const code = resolveCountryCode(country)
    const dial = resolveDialCode(country)

    if (code === 'KE' || dial === '+254') {
        return '7xx xxx xxx'
    }

    return 'Phone number'
}

/** Max digits for local part (no country code). */
function buildMaxLocalDigits(country: CountryGeoMeta | undefined): number {
    const code = resolveCountryCode(country)
    const dial = resolveDialCode(country)

    if (code === 'KE' || dial === '+254') {
        return 9
    }

    return 15
}

export function AdminPhoneInput<T extends FieldValues>({
    control,
    name,
    countryId,
    label = 'Mobile Number',
    required = false,
    disabled = false,
    autofilled = false,
    className,
    onBlur,
}: AdminPhoneInputProps<T>) {
    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: 'taxonomies/geo/country',
        params: { country_id: countryId },
        queryOptions: { enabled: Boolean(countryId) },
    })

    const country = (data?.data ?? [])[0] as CountryGeoMeta | undefined
    const dialCode = resolveDialCode(country)
    const placeholder = buildPhonePlaceholder(country)
    const maxDigits = buildMaxLocalDigits(country)

    const dialDisplay = useMemo(() => {
        if (!countryId) return '—'
        if (isLoading) return '…'
        return dialCode || '—'
    }, [countryId, isLoading, dialCode])

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className={className}>
                    <FieldLabel>
                        {label}
                        {required && (
                            <span className="ml-1 text-red-500">*</span>
                        )}
                    </FieldLabel>

                    <div
                        className={cn(
                            'flex h-10 w-full overflow-hidden rounded-[5px] border border-[#ADABAB] bg-white',
                            fieldState.invalid && 'border-red-500',
                            autofilled && motorAutofillHighlightClassName,
                            !autofilled && (disabled || !countryId) && 'opacity-70'
                        )}
                    >
                        <span
                            className={cn(
                                'flex shrink-0 items-center border-r border-[#ADABAB] px-3 text-xs font-medium text-muted-foreground',
                                autofilled ? 'bg-[#C20C0C]/[0.06]' : 'bg-neutral-50'
                            )}
                            aria-hidden
                        >
                            {isLoading && countryId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                dialDisplay
                            )}
                        </span>
                        <Input
                            {...field}
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            placeholder={countryId ? placeholder : 'Select country first'}
                            disabled={disabled || !countryId || isLoading}
                            aria-invalid={fieldState.invalid}
                            className={cn(
                                'h-full min-w-0 flex-1 rounded-none border-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
                                fieldState.invalid && 'focus-visible:ring-red-500'
                            )}
                            value={field.value ?? ''}
                            onChange={(e) => {
                                const digits = normalizeLocalPhoneDigits(
                                    e.target.value.replace(/\D/g, '')
                                )
                                field.onChange(digits.slice(0, maxDigits))
                            }}
                            onBlur={() => {
                                field.onBlur()
                                onBlur?.()
                            }}
                        />
                    </div>

                    <p className="mt-1 text-xs italic text-muted-foreground">
                        Phone number without country code
                    </p>

                    {fieldState.invalid && fieldState.error && (
                        <FieldError className="text-red-500 text-sm mt-1">
                            {fieldState.error.message}
                        </FieldError>
                    )}
                </Field>
            )}
        />
    )
}
