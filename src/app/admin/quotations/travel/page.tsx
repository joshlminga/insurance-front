/* eslint-disable react-hooks/exhaustive-deps */
import { MODULES } from '@/auth/module-keys'
import { useCan } from '@/auth/useCan'
import { PageHeader } from '@/components/shared'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
    TravelTripProgressiveFields,
    blankTraveler,
    useTravelTripProgress,
} from '@/app/customer/travel/steppers/traveller-details'
import { Button, ReuseableInput } from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { cn } from '@/lib/utils'
import { UseAuth } from '@/stores/auth-store'
import { AdminTravelQuotationSchema } from '@/types/form-schema'
import type { AdminTravelQuotationFormValues } from '@/types/schema'
import type { SubmitResponse, TravelQuoteSessionStartData } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { TRAVEL_QUOTATION_FORM_SESSION_KEY } from '@/utils/travel-enums'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRightCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    Controller,
    FormProvider,
    useForm,
    useWatch,
    type Path,
} from 'react-hook-form'
import {
    resolveDialCode,
    type CountryGeoMeta,
} from '@/app/admin/quotations/motor/admin-phone-input'
import {
    motorCheckboxLabelAccentClassName,
    motorCheckboxLabelClassName,
    motorFormFieldStyles,
    motorInputClassName,
} from '@/app/admin/quotations/motor/motor-field-styles'
import { OrganizationLocationInput } from '@/app/admin/quotations/motor/organization-location-input'
import { OfficeCountrySelect } from '@/app/admin/quotations/motor/office-country-select'
import { TravelCustomerDetailsSection } from './customer-details-section'
import { buildTravelQuotationPayload } from './travel-quotation-payload'
import {
    contactFromUser,
    persistAdminTravelCustomerContact,
    persistAdminTravelQuoteSession,
} from './admin-travel-session'

type ProfileCountry = {
    id?: number | string
    name?: string
    slug?: string | null
}

type UserSearchProfile = {
    id?: number | string
    country?: ProfileCountry | null
}

type ServerFieldError = {
    name: Path<AdminTravelQuotationFormValues>
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

const extractServerFieldErrors = (error: unknown): ServerFieldError[] => {
    const errors = (error as { response?: { data?: { errors?: Record<string, unknown> } } })
        ?.response?.data?.errors
    if (!errors || typeof errors !== 'object' || Array.isArray(errors)) {
        return []
    }

    return Object.entries(errors)
        .map(([name, value]) => ({
            name: name as Path<AdminTravelQuotationFormValues>,
            message: formatServerErrorValue(value),
        }))
        .filter((fieldError): fieldError is ServerFieldError =>
            Boolean(fieldError.message)
        )
}

function isCustomerContactMissing(data: AdminTravelQuotationFormValues): boolean {
    if (String(data.user_id ?? '').trim()) return false

    const email = String(data.email ?? '').trim()
    const phoneDigits = String(data.phone ?? '').replace(/\D/g, '')

    return !email && !phoneDigits
}

/** Travel create-account requires Your Agency (agency_id). */
function isCreateAccountAgencyMissing(data: AdminTravelQuotationFormValues): boolean {
    if (isCustomerContactMissing(data)) return false
    if (!data.create_customer_account) return false
    return !String(data.agency_id ?? '').trim()
}

export const TravelQuotationPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = UseAuth()
    const { canModuleAction } = useCan()
    const canTravelOverride = canModuleAction(MODULES.QUOTATION_TRAVEL, 'override')
    const [adminOrganizationOverride, setAdminOrganizationOverride] = useState(false)
    const [showSelfCoverSubmitWarning, setShowSelfCoverSubmitWarning] = useState(false)
    const [pendingSubmitData, setPendingSubmitData] =
        useState<AdminTravelQuotationFormValues | null>(null)

    const { data: adminProfileData, isLoading: isAdminProfileLoading } =
        UseApiQuery<SubmitResponse>({
            url: 'user/search',
            params: { user_id: user?.id },
            queryOptions: { enabled: user?.id != null },
        })

    const userProfile = (adminProfileData?.data ?? null) as UserSearchProfile | null
    const profileCountry = userProfile?.country ?? null

    const form = useForm<AdminTravelQuotationFormValues>({
        resolver: zodResolver(AdminTravelQuotationSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            full_name: '',
            email: '',
            phone: '',
            user_id: '',
            country_id: '',
            // Travel: Your Agency → agency_id (required)
            agency_id: '',
            // Travel: On behalf → processed_by_organization_id (optional)
            processed_by_organization_id: '',
            referral_id: '',
            create_customer_account: false,
            bound: undefined as unknown as AdminTravelQuotationFormValues['bound'],
            country_of_departure: '',
            country_of_arrival: '',
            travel_as: undefined as unknown as AdminTravelQuotationFormValues['travel_as'],
            date_of_departure: '',
            date_of_return: '',
            type_of_trip: undefined as unknown as AdminTravelQuotationFormValues['type_of_trip'],
            reason_for_travel: '',
            travelers: [blankTraveler()],
        },
    })

    const formCountryId = useWatch({ control: form.control, name: 'country_id' })
    const { bound, hasRouteRow, hasScheduleRow } = useTravelTripProgress(form.control)

    // Profile country shows in the UI but is not written into RHF until the user
    // touches the Country field — sync so payloads include country_id for guests.
    useEffect(() => {
        if (formCountryId) return
        if (profileCountry?.id == null || profileCountry.id === '') return
        form.setValue('country_id', String(profileCountry.id), {
            shouldValidate: true,
        })
    }, [form, formCountryId, profileCountry?.id])

    const effectiveCountryId = (() => {
        if (formCountryId) return formCountryId
        if (profileCountry?.id != null && profileCountry.id !== '') {
            return String(profileCountry.id)
        }
        return ''
    })()

    const { data: selectedCountryGeoData } = UseApiQuery<SubmitResponse>({
        url: 'taxonomies/geo/country',
        params: { country_id: effectiveCountryId },
        queryOptions: { enabled: Boolean(effectiveCountryId) },
    })

    const selectedCountryGeo = (selectedCountryGeoData?.data ?? [])[0] as
        | CountryGeoMeta
        | undefined
    const dialCode = resolveDialCode(selectedCountryGeo)

    const selectedCountryName = (() => {
        if (selectedCountryGeo?.name) return selectedCountryGeo.name
        if (!formCountryId && profileCountry?.name) return profileCountry.name
        return 'selected country'
    })()

    const canLoadOrganizations = Boolean(effectiveCountryId)
    const effectiveAdminOrganizationOverride =
        canTravelOverride && adminOrganizationOverride

    const handleCountryChange = (value: string) => {
        form.setValue('country_id', value, { shouldValidate: true, shouldDirty: true })
        form.setValue('agency_id', '', { shouldValidate: true })
        form.setValue('processed_by_organization_id', '', { shouldValidate: true })
        form.setValue('phone', '', { shouldValidate: true })
    }

    const submitMutation = UseApiMutation<
        SubmitResponse & { data: TravelQuoteSessionStartData },
        ReturnType<typeof buildTravelQuotationPayload>
    >({
        url: 'quotation/travel',
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
                persistAdminTravelQuoteSession({
                    ...session,
                    id: quoteSessionId,
                })
                ShowToast.success(
                    response?.message || 'Travel quotation started successfully.'
                )
                navigate(EROUTES.TRAVEL_QUOTATION_RESULTS)
            },
            onError: (error: unknown) => {
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

    const loggedInUserName =
        user?.name?.trim() || user?.email?.trim() || 'your account'

    const submitQuotation = (data: AdminTravelQuotationFormValues) => {
        if (isCreateAccountAgencyMissing(data)) {
            ShowToast.error(
                'Select Your Agency before creating a customer account for this quotation.'
            )
            return
        }

        persistAdminTravelCustomerContact(
            isCustomerContactMissing(data)
                ? contactFromUser(user)
                : {
                    email: data.email?.trim() || undefined,
                    name: data.full_name?.trim() || undefined,
                    phone: data.phone?.trim() || undefined,
                }
        )

        // KYC later reads trip/travelers from this key
        try {
            sessionStorage.setItem(
                TRAVEL_QUOTATION_FORM_SESSION_KEY,
                JSON.stringify({
                    bound: data.bound,
                    country_of_departure: data.country_of_departure,
                    country_of_arrival: data.country_of_arrival,
                    travel_as: data.travel_as,
                    date_of_departure: data.date_of_departure,
                    date_of_return: data.date_of_return,
                    type_of_trip: data.type_of_trip,
                    reason_for_travel: data.reason_for_travel,
                    travelers: data.travelers,
                })
            )
        } catch {
            ShowToast.error('Could not save travel details. Please try again.')
            return
        }

        const payload = buildTravelQuotationPayload({ data, dialCode })
        submitMutation.mutate(payload)
    }

    const onSubmit = (data: AdminTravelQuotationFormValues) => {
        if (isCustomerContactMissing(data)) {
            setPendingSubmitData(data)
            setShowSelfCoverSubmitWarning(true)
            return
        }
        submitQuotation(data)
    }

    const handleConfirmSelfCoverSubmit = (event: React.MouseEvent) => {
        event.preventDefault()
        const data = pendingSubmitData
        if (!data) return
        setPendingSubmitData(null)
        setShowSelfCoverSubmitWarning(false)
        submitQuotation(data)
    }

    const handleCancelSelfCoverSubmit = () => {
        setPendingSubmitData(null)
        setShowSelfCoverSubmitWarning(false)
    }

    return (
        <div className="space-y-6 text-sm pb-[max(5vh,4.5rem)] mb-[5vh]">
            <div className="[&_h1]:text-lg [&_h1]:leading-7 [&_p]:text-sm [&_p]:leading-5">
                <PageHeader
                    title="Travel Quotations"
                    description="Start a travel quotation for a member or guest traveler."
                />
            </div>

            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className={cn('space-y-6', motorFormFieldStyles)}
                >
                    {/* Office use — Travel API mapping differs from Motor */}
                    <div className="rounded-2xl border border-[#ADABAB]/50 p-4 shadow-sm sm:p-6">
                        <div className="w-full pb-4">
                            <h2 className="text-lg font-bold leading-tight tracking-tight sm:text-xl">
                                Office{' '}
                                <span className="text-[#C20C0C]">use</span>
                            </h2>
                            <p className="mt-1.5 max-w-2xl text-xs text-muted-foreground sm:text-sm">
                                Country, your agency, optional on-behalf organization, and referral
                                details for internal processing.
                            </p>
                        </div>
                        <div className="space-y-4 [&_label]:text-sm [&_input]:text-sm [&_button]:text-sm">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <Controller
                                    control={form.control}
                                    name="country_id"
                                    render={({ field }) => (
                                        <OfficeCountrySelect
                                            value={field.value}
                                            onChange={handleCountryChange}
                                            defaultCountryName={profileCountry?.name}
                                            label="Country"
                                            required
                                            disabled={isAdminProfileLoading}
                                        />
                                    )}
                                />

                                {/* Travel: Your Agency → agency_id */}
                                <Controller
                                    control={form.control}
                                    name="agency_id"
                                    render={({ field }) => (
                                        <OrganizationLocationInput
                                            variant="agency"
                                            countryId={effectiveCountryId}
                                            value={field.value}
                                            onChange={field.onChange}
                                            label="Your Agency"
                                            required
                                            disabled={!canLoadOrganizations}
                                        />
                                    )}
                                />

                                {/* Travel: On behalf → processed_by_organization_id */}
                                <Controller
                                    control={form.control}
                                    name="processed_by_organization_id"
                                    render={({ field }) => (
                                        <OrganizationLocationInput
                                            variant="onBehalf"
                                            countryId={effectiveCountryId}
                                            override={effectiveAdminOrganizationOverride}
                                            value={field.value}
                                            onChange={field.onChange}
                                            label="On behalf of"
                                            required={false}
                                            disabled={!canLoadOrganizations}
                                        />
                                    )}
                                />

                                <ReuseableInput
                                    className={motorInputClassName}
                                    control={form.control}
                                    name="referral_id"
                                    label="Referral Code"
                                    type="text"
                                    placeholder="Optional"
                                />
                            </div>

                            {canTravelOverride && (
                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id="admin-travel-organization-override"
                                        checked={adminOrganizationOverride}
                                        onCheckedChange={(checked) =>
                                            setAdminOrganizationOverride(Boolean(checked))
                                        }
                                        disabled={!canLoadOrganizations}
                                        className="w-3.75 h-3.75 rounded-[3px] border border-[#D9D9D9] data-[state=checked]:bg-[#C20C0C] data-[state=checked]:border-[#C20C0C]"
                                    />
                                    <label
                                        htmlFor="admin-travel-organization-override"
                                        className={cn(
                                            motorCheckboxLabelClassName,
                                            !canLoadOrganizations &&
                                            'cursor-not-allowed opacity-70'
                                        )}
                                    >
                                        <span className={motorCheckboxLabelAccentClassName}>
                                            Admin Override
                                        </span>{' '}
                                        (On behalf of): Pull all organizations in{' '}
                                        <span className={motorCheckboxLabelAccentClassName}>
                                            {selectedCountryName}
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    <TravelCustomerDetailsSection countryId={effectiveCountryId} />

                    <div className="rounded-2xl border border-[#ADABAB]/50 p-4 shadow-sm sm:p-6 [&_label]:text-sm [&_input]:text-sm [&_button]:text-sm">
                        <div className="w-full pb-2">
                            <h2 className="text-lg font-bold leading-tight tracking-tight sm:text-xl">
                                Trip{' '}
                                <span className="text-[#C20C0C]">details</span>
                            </h2>
                            <p className="mt-1.5 max-w-2xl text-xs text-muted-foreground sm:text-sm">
                                Choose inbound or outbound first. Fields unlock as you complete each
                                row.
                            </p>
                        </div>

                        <TravelTripProgressiveFields
                            bound={bound}
                            hasRouteRow={hasRouteRow}
                            hasScheduleRow={hasScheduleRow}
                            idPrefix="admin-travel"
                        />

                        <div className="mt-8 flex w-full justify-end border-t border-[#ADABAB]/30 pt-6 pb-2">
                            <Button
                                type="submit"
                                className="w-full rounded-full bg-[#C20C0C]/90 text-sm hover:bg-[#C20C0C] sm:w-auto"
                                rightIcon={<ArrowRightCircle />}
                                loading={submitMutation.isPending}
                                disabled={
                                    !form.formState.isValid || submitMutation.isPending
                                }
                            >
                                Start Quotation
                            </Button>
                        </div>
                    </div>
                </form>
            </FormProvider>

            <AlertDialog
                open={showSelfCoverSubmitWarning}
                onOpenChange={(open) => {
                    if (!open) handleCancelSelfCoverSubmit()
                }}
            >
                <AlertDialogContent size="sm" className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>No customer contact details</AlertDialogTitle>
                        <AlertDialogDescription>
                            Email and phone were not provided. No guest record will be
                            created - this quotation will be tied to your agent account (
                            <span className="font-semibold text-foreground">
                                {loggedInUserName}
                            </span>
                            ). Do you want to continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelSelfCoverSubmit}>
                            Go back
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="rounded-full bg-[#C20C0C] hover:bg-[#C20C0C]/90"
                            onClick={handleConfirmSelfCoverSubmit}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
