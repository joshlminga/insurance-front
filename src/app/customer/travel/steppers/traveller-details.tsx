/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/dev/core'
import {
    ReusableSelect,
    ReusableSingleSelectApiInput,
    ReuseableInput,
} from '@/dev/core'
import { DdMmYyyyDateInput } from '@/components/dd-mm-yyyy-date-input'
import { CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { UseApiMutation } from '@/hooks/hooks'
import { cn } from '@/lib/utils'
import {
    TravelQuotationSchema,
    travelAddDaysIso,
    travelLocalIsoDate,
} from '@/types/form-schema'
import type { TravelQuotationFormValues } from '@/types/schema'
import type {
    CustomerVerificationDetailsProps,
    SubmitResponse,
    TravelQuoteSessionStartData,
} from '@/types/types'
import { UseAuth } from '@/stores/auth-store'
import { TravelerNationalitySelect } from '@/app/customer/travel/steppers/traveler-nationality-select'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import {
    TRAVEL_AS,
    TRAVEL_AS_OPTIONS,
    TRAVEL_BOUND,
    TRAVEL_BOUND_OPTIONS,
    TRAVEL_QUOTATION_FORM_SESSION_KEY,
    TRAVEL_QUOTE_SESSION_STORAGE_KEY,
    TRAVEL_TRIP_OPTIONS,
    type TravelBoundValue,
} from '@/utils/travel-enums'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    ArrowLeftCircle,
    ArrowRightCircle,
    PlaneLanding,
    PlaneTakeoff,
    PlusCircle,
    X,
    type LucideIcon,
} from 'lucide-react'
import React, { useEffect, useMemo } from 'react'
import {
    Controller,
    FormProvider,
    useFieldArray,
    useForm,
    useFormContext,
    useWatch,
    type Path,
} from 'react-hook-form'

/** Customer travel start — form fields plus guest flag for the API. */
type TravelQuoteStartPayload = TravelQuotationFormValues & {
    is_guest: true
}

type ServerFieldError = {
    name: Path<TravelQuotationFormValues>
    message: string
}

const formatServerErrorValue = (value: unknown): string | null => {
    if (Array.isArray(value)) {
        return value.filter(Boolean).join('\n')
    }
    if (typeof value === 'string') {
        return value
    }
    return null
}

/**
 * Map Laravel 422 `errors` object onto RHF paths.
 * Nested keys like `travelers.1.first_name` keep field-array rows mounted.
 */
const extractServerFieldErrors = (error: any): ServerFieldError[] => {
    const errors = error?.response?.data?.errors
    if (!errors || typeof errors !== 'object' || Array.isArray(errors)) {
        return []
    }

    return Object.entries(errors)
        .map(([name, value]) => ({
            name: name as Path<TravelQuotationFormValues>,
            message: formatServerErrorValue(value),
        }))
        .filter((fieldError): fieldError is ServerFieldError =>
            Boolean(fieldError.message)
        )
}

const inputClassName =
    'w-full min-w-0 h-11 sm:h-10 rounded-[5px] border border-[#ADABAB]'

const BOUND_ICON: Record<TravelBoundValue, LucideIcon> = {
    [TRAVEL_BOUND.Inbound]: PlaneLanding,
    [TRAVEL_BOUND.Outbound]: PlaneTakeoff,
}

const blankTraveler = (): TravelQuotationFormValues['travelers'][number] => ({
    first_name: '',
    middle_name: '',
    surname: '',
    date_of_birth: '',
    email: '',
    phone: '',
    nationality: '',
})

/** Prefill traveler 1 from session user (name split on first space). */
export function travelerFromAuthUser(
    user?: { name?: string | null; email?: string | null; phone?: string | null } | null
): TravelQuotationFormValues['travelers'][number] {
    if (!user) {
        return blankTraveler()
    }

    const trimmedName = String(user.name ?? '').trim()
    const spaceIdx = trimmedName.indexOf(' ')
    const first_name =
        spaceIdx === -1 ? trimmedName : trimmedName.slice(0, spaceIdx)
    const surname =
        spaceIdx === -1 ? '' : trimmedName.slice(spaceIdx + 1).trim()

    return {
        first_name,
        middle_name: '',
        surname,
        date_of_birth: '',
        email: String(user.email ?? ''),
        phone: user.phone ?? '',
        nationality: '',
    }
}

type AnimatedSectionProps = {
    show: boolean
    children: React.ReactNode
    className?: string
}

/** Same progressive reveal pattern as motor vehicle-details */
function AnimatedSection({ show, children, className }: AnimatedSectionProps) {
    return (
        <div
            data-state={show ? 'open' : 'closed'}
            className={cn(
                'transition-all duration-300 ease-out',
                show
                    ? 'opacity-100 translate-y-0 max-h-[9999px] overflow-visible'
                    : 'pointer-events-none opacity-0 -translate-y-1 max-h-0 overflow-hidden',
                className
            )}
        >
            {children}
        </div>
    )
}

/** Departure, Arrival, Travel As — always visible on one row */
const TripRouteBox: React.FC = () => {
    const { control } = useFormContext<TravelQuotationFormValues>()

    return (
        <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Controller
                    control={control}
                    name="country_of_departure"
                    render={({ field }) => (
                        <ReusableSingleSelectApiInput
                            url="taxonomies/general/countries"
                            value={field.value}
                            onChange={field.onChange}
                            label="Country of Departure"
                            required
                            placeholder="Select departure country..."
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="country_of_arrival"
                    render={({ field }) => (
                        <ReusableSingleSelectApiInput
                            url="taxonomies/general/countries"
                            value={field.value}
                            onChange={field.onChange}
                            label="Country of Arrival"
                            required
                            placeholder="Select arrival country..."
                        />
                    )}
                />
                <ReusableSelect
                    control={control}
                    name="travel_as"
                    label="Travel As"
                    placeholder="Select travel as..."
                    options={TRAVEL_AS_OPTIONS}
                    required
                />
            </div>
        </div>
    )
}

/** Dates + trip type + reason — unlocks when route row is complete */
const TripScheduleBox: React.FC = () => {
    const { control } = useFormContext<TravelQuotationFormValues>()
    const dateOfDeparture = useWatch({ control, name: 'date_of_departure' })
    const today = travelLocalIsoDate()
    const minReturn = dateOfDeparture
        ? travelAddDaysIso(dateOfDeparture, 1)
        : travelAddDaysIso(today, 1)

    return (
        <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ReuseableInput
                    className={inputClassName}
                    control={control}
                    name="date_of_departure"
                    label="Date of Departure"
                    type="date"
                    required
                    min={today}
                />
                <ReuseableInput
                    className={inputClassName}
                    control={control}
                    name="date_of_return"
                    label="Date of Return"
                    type="date"
                    required
                    min={minReturn}
                />
                <ReusableSelect
                    control={control}
                    name="type_of_trip"
                    label="Type of Trip"
                    placeholder="Select trip type..."
                    options={TRAVEL_TRIP_OPTIONS}
                    required
                />
                <Controller
                    control={control}
                    name="reason_for_travel"
                    render={({ field }) => (
                        <ReusableSingleSelectApiInput
                            url="taxonomies/general/travel-plans"
                            value={field.value}
                            onChange={field.onChange}
                            label="Reason for Travel"
                            required
                            placeholder="Select reason..."
                        />
                    )}
                />
            </div>
        </div>
    )
}

/** Multi-traveler field array — unlocks when schedule row is complete */
const TravelersBox: React.FC = () => {
    const { control, getValues } = useFormContext<TravelQuotationFormValues>()
    const travelAs = useWatch({ control, name: 'travel_as' })
    // Only Individual is single-traveler; Family/Group/Student/Corporate can add more
    const isIndividual = travelAs === TRAVEL_AS.Individual
    const canAddTravelers =
        travelAs === TRAVEL_AS.Family ||
        travelAs === TRAVEL_AS.Group ||
        travelAs === TRAVEL_AS.Student ||
        travelAs === TRAVEL_AS.Corporate
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'travelers',
    })

    // Individual cover is one person — drop extras if Travel As changes
    useEffect(() => {
        if (!isIndividual || fields.length <= 1) {
            return
        }
        const travelers = getValues('travelers')
        const first = travelers[0]
        if (!first) {
            return
        }
        replace([first])
    }, [isIndividual, fields.length, getValues, replace])

    return (
        <>
            <div className="flex flex-col gap-0.5 pb-3">
                <h3 className="text-base font-semibold sm:text-lg">Traveler Details</h3>
                <p className="text-xs text-muted-foreground sm:text-sm">
                    {isIndividual
                        ? 'Individual cover includes one traveler.'
                        : 'Add everyone who will be covered on this trip.'}
                </p>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        className="relative rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5"
                    >
                        {canAddTravelers && fields.length > 1 ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 h-8 w-8 text-[#C20C0C] hover:bg-[#C20C0C]/10 hover:text-[#C20C0C]"
                                aria-label={`Remove traveler ${index + 1}`}
                                onClick={() => remove(index)}
                            >
                                <X className="h-5 w-5" strokeWidth={2.75} />
                            </Button>
                        ) : null}

                        <p className="mb-3 text-sm font-medium text-muted-foreground">
                            Traveler {index + 1}
                        </p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <ReuseableInput
                                className={inputClassName}
                                control={control}
                                name={`travelers.${index}.first_name`}
                                label="First Name"
                                required
                            />
                            <ReuseableInput
                                className={inputClassName}
                                control={control}
                                name={`travelers.${index}.middle_name`}
                                label="Middle Name"
                            />
                            <ReuseableInput
                                className={inputClassName}
                                control={control}
                                name={`travelers.${index}.surname`}
                                label="Surname"
                                required
                            />
                            <Controller
                                control={control}
                                name={`travelers.${index}.date_of_birth`}
                                render={({ field: dobField, fieldState }) => (
                                    <DdMmYyyyDateInput
                                        id={`traveler-${index}-dob`}
                                        label="Date of Birth"
                                        required
                                        value={dobField.value}
                                        onChange={dobField.onChange}
                                        maxIso={travelLocalIsoDate()}
                                        invalid={fieldState.invalid}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name={`travelers.${index}.nationality`}
                                render={({ field: nationalityField }) => (
                                    <TravelerNationalitySelect
                                        instanceId={`traveler-${index}`}
                                        value={nationalityField.value}
                                        onChange={nationalityField.onChange}
                                        label="Nationality"
                                        required
                                        placeholder="Select nationality..."
                                    />
                                )}
                            />
                            <ReuseableInput
                                className={inputClassName}
                                control={control}
                                name={`travelers.${index}.email`}
                                label="Email"
                                type="email"
                                required
                            />
                            <ReuseableInput
                                className={inputClassName}
                                control={control}
                                name={`travelers.${index}.phone`}
                                label="Phone"
                                type="tel"
                                required
                            />
                        </div>
                    </div>
                ))}
            </div>

            {canAddTravelers ? (
                <div className="mt-4">
                    <Button
                        type="button"
                        className="rounded-full bg-black text-sm text-white hover:bg-black/90 hover:text-white"
                        leftIcon={<PlusCircle className="h-4 w-4" />}
                        onClick={() => append(blankTraveler())}
                    >
                        Add traveler
                    </Button>
                </div>
            ) : null}
        </>
    )
}

export const TravellerDetailsPage: React.FC<CustomerVerificationDetailsProps> = ({
    goToNextStep,
    goToPrevStep,
}) => {
    const { user } = UseAuth()

    const form = useForm<TravelQuotationFormValues>({
        resolver: zodResolver(TravelQuotationSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            bound: undefined as unknown as TravelBoundValue,
            country_of_departure: '',
            country_of_arrival: '',
            travel_as: undefined as unknown as TravelQuotationFormValues['travel_as'],
            date_of_departure: '',
            date_of_return: '',
            type_of_trip: undefined as unknown as TravelQuotationFormValues['type_of_trip'],
            reason_for_travel: '',
            // Prefill traveler 1 from session; extra travelers stay blank
            travelers: [travelerFromAuthUser(user)],
        },
    })

    const bound = useWatch({ control: form.control, name: 'bound' })
    const countryOfDeparture = useWatch({
        control: form.control,
        name: 'country_of_departure',
    })
    const countryOfArrival = useWatch({
        control: form.control,
        name: 'country_of_arrival',
    })
    const travelAs = useWatch({ control: form.control, name: 'travel_as' })
    const dateOfDeparture = useWatch({
        control: form.control,
        name: 'date_of_departure',
    })
    const dateOfReturn = useWatch({ control: form.control, name: 'date_of_return' })
    const typeOfTrip = useWatch({ control: form.control, name: 'type_of_trip' })
    const reasonForTravel = useWatch({
        control: form.control,
        name: 'reason_for_travel',
    })

    const hasBound = Boolean(bound)
    const hasRouteRow = useMemo(
        () =>
            Boolean(
                hasBound &&
                    String(countryOfDeparture ?? '').trim() &&
                    String(countryOfArrival ?? '').trim() &&
                    travelAs
            ),
        [hasBound, countryOfDeparture, countryOfArrival, travelAs]
    )
    const hasScheduleRow = useMemo(
        () =>
            Boolean(
                hasRouteRow &&
                    String(dateOfDeparture ?? '').trim() &&
                    String(dateOfReturn ?? '').trim() &&
                    typeOfTrip &&
                    String(reasonForTravel ?? '').trim()
            ),
        [hasRouteRow, dateOfDeparture, dateOfReturn, typeOfTrip, reasonForTravel]
    )

    const submitMutation = UseApiMutation<
        SubmitResponse & { data: TravelQuoteSessionStartData },
        TravelQuoteStartPayload
    >({
        url: 'auto/quotation/travel',
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (response) => {
                const session = response?.data as TravelQuoteSessionStartData | undefined
                const quoteSessionId = Number(session?.id)
                if (!Number.isFinite(quoteSessionId) || quoteSessionId <= 0) {
                    ShowToast.error(
                        'Quote session could not be initialized. Please try again.'
                    )
                    return
                }

                try {
                    sessionStorage.setItem(
                        TRAVEL_QUOTE_SESSION_STORAGE_KEY,
                        String(quoteSessionId)
                    )
                } catch {
                    ShowToast.error('Could not save quote session. Please try again.')
                    return
                }

                goToNextStep?.()
                ShowToast.success(
                    response?.message || 'Travel quotation started successfully.'
                )
            },
            onError: (error: any) => {
                // Apply 422 field errors without remounting — traveler boxes stay
                const fieldErrors = extractServerFieldErrors(error)
                fieldErrors.forEach(({ name, message }) => {
                    form.setError(name, { type: 'server', message })
                })

                const message =
                    fieldErrors.length > 0
                        ? 'Please check the highlighted fields.'
                        : extractErrorMessage(error)
                ShowToast.error(message || 'Submission failed!')
            },
        },
    })

    const onSubmit = (data: TravelQuotationFormValues) => {
        form.clearErrors()

        // Keep local form stash for later steps; API owns the quote session
        try {
            sessionStorage.setItem(
                TRAVEL_QUOTATION_FORM_SESSION_KEY,
                JSON.stringify(data)
            )
        } catch {
            ShowToast.error('Could not save travel details. Please try again.')
            return
        }

        submitMutation.mutate({
            ...data,
            is_guest: true,
        })
    }

    const handleBoundChange = (value: string) => {
        form.setValue('bound', value as TravelBoundValue, {
            shouldValidate: true,
            shouldDirty: true,
        })
    }

    const isSubmitting = submitMutation.isPending

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full mx-auto bg-transparent"
            >
                <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6">
                    <div className="w-full pb-2">
                        <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                            Add your{' '}
                            <span className="text-[#C20C0C]">travel details</span>
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                            Choose inbound or outbound first. We&apos;ll unlock the next
                            fields as you go.
                        </p>
                    </div>

                    <div className="mt-5">
                        <Label className="text-base font-semibold text-foreground">
                            Bound
                        </Label>
                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                            Tap one option — only one bound applies.
                        </p>

                        <RadioGroup
                            value={bound ?? ''}
                            onValueChange={handleBoundChange}
                            className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
                        >
                            {TRAVEL_BOUND_OPTIONS.map((option) => {
                                const Icon = BOUND_ICON[option.value]
                                const inputId = `travel-bound-${option.value}`
                                const isSelected = bound === option.value
                                return (
                                    <div key={option.value} className="relative">
                                        <RadioGroupItem
                                            value={option.value}
                                            id={inputId}
                                            className="sr-only"
                                        />
                                        <Label
                                            htmlFor={inputId}
                                            className={cn(
                                                'flex min-h-30 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 px-3 py-5 text-center transition-all sm:gap-3',
                                                'shadow-sm outline-none hover:border-[#C20C0C]/45 hover:bg-white',
                                                'focus-within:ring-2 focus-within:ring-[#C20C0C]/25',
                                                isSelected
                                                    ? 'border-[#C20C0C] bg-[#C20C0C]/[0.07] ring-2 ring-[#C20C0C]/20'
                                                    : 'border-[#E5E5E5] bg-white/90'
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'flex h-12 w-12 items-center justify-center rounded-xl border transition-colors',
                                                    isSelected
                                                        ? 'border-[#C20C0C]/40 bg-[#C20C0C]/10 text-[#C20C0C]'
                                                        : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                                                )}
                                            >
                                                <Icon className="h-6 w-6" strokeWidth={1.75} />
                                            </span>
                                            <span className="text-xs font-semibold leading-snug sm:text-sm">
                                                {option.label}
                                            </span>
                                            <span className="w-full px-1 text-[11px] leading-snug text-muted-foreground whitespace-nowrap sm:text-xs">
                                                {option.summary}
                                            </span>
                                        </Label>
                                    </div>
                                )
                            })}
                        </RadioGroup>
                    </div>

                    <div className="mt-8 space-y-6">
                        <TripRouteBox />

                        <AnimatedSection show={hasRouteRow}>
                            <TripScheduleBox />
                        </AnimatedSection>

                        <AnimatedSection show={hasScheduleRow}>
                            <TravelersBox />
                        </AnimatedSection>
                    </div>
                </div>

                <CardFooter className="mt-4 w-full flex flex-col gap-3 px-0 sm:flex-row sm:justify-between">
                    <Button
                        type="button"
                        className="w-full rounded-full border border-[#C20C0C] bg-transparent text-[#C20C0C] hover:bg-[#C20C0C]/10 sm:w-auto"
                        leftIcon={<ArrowLeftCircle />}
                        onClick={() => goToPrevStep?.()}
                        disabled={isSubmitting}
                    >
                        Previous
                    </Button>
                    <Button
                        type="submit"
                        className="w-full rounded-full bg-[#C20C0C]/90 hover:bg-[#C20C0C] sm:w-auto"
                        rightIcon={<ArrowRightCircle />}
                        disabled={!form.formState.isValid || isSubmitting}
                    >
                        {isSubmitting ? 'Submitting…' : 'Next'}
                    </Button>
                </CardFooter>
            </form>
        </FormProvider>
    )
}
