/* eslint-disable react-hooks/exhaustive-deps */
import { QUOTATION_MOTOR_MODULES } from '@/auth/module-keys'
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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { VehicleUseInput } from '@/app/customer/motor/steppers/components/vehicle-use-input'
import {
    Button,
    ReusableCheckboxGrid,
    ReusableSelect,
    ReusableSingleSelectApiInput,
    ReuseableInput,
} from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { cn } from '@/lib/utils'
import { UseAuth } from '@/stores/auth-store'
import { AdminMotorQuotationSchema } from '@/types/form-schema'
import type { AdminMotorQuotationFormValues } from '@/types/schema'
import type { SubmitResponse, VehicleClassItem } from '@/types/types'
import { EROUTES, PROFFESIONALVALUATIONCHECKBOX } from '@/utils/enums'
import { EMETHODS, MOTOR_QUOTE_SESSION_STORAGE_KEY, OWNERSHIPOPTIONS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    ArrowRightCircle,
    Bus,
    Car,
    Container,
    Loader2,
    Truck,
    type LucideIcon,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Controller,
    FormProvider,
    useForm,
    useFormContext,
    useWatch,
} from 'react-hook-form'
import {
    resolveDialCode,
    type CountryGeoMeta,
} from './admin-phone-input'
import { CustomerDetailsSection } from './customer-details-section'
import {
    motorCheckboxLabelAccentClassName,
    motorCheckboxLabelClassName,
    motorFormFieldStyles,
    motorInputClassName,
} from './motor-field-styles'
import { buildMotorQuotationPayload } from './motor-quotation-payload'
import { OrganizationLocationInput } from './organization-location-input'
import { OfficeCountrySelect } from './office-country-select'
import { persistAdminMotorCustomerContact } from './admin-motor-session'

type ProfileCountry = {
    id?: number | string
    name?: string
    slug?: string | null
}

type UserSearchProfile = {
    id?: number | string
    country?: ProfileCountry | null
}

type MotorClassTab = {
    value: string
    label: string
    slug: string
}

function canonicalizeMotorClassKey(input: string | null | undefined): string {
    const normalized = String(input ?? '')
        .trim()
        .toLowerCase()
        .replace(/[\s\-_]+/g, '')
        .replace(/[^a-z0-9]/g, '')

    if (!normalized) return ''

    const alias: Record<string, string> = {
        priv: 'private',
        personal: 'private',
        comm: 'commercial',
        commercialvehicle: 'commercial',
        commercialmotor: 'commercial',
        psvvehicle: 'psv',
        publicservicevehicle: 'psv',
        publicservice: 'psv',
        special: 'specialvehicle',
        specialvehicles: 'specialvehicle',
        specialmotor: 'specialvehicle',
    }

    return alias[normalized] ?? normalized
}

const SLUG_ICON: Record<string, LucideIcon> = {
    private: Car,
    commercial: Truck,
    psv: Bus,
    specialvehicle: Container,
}

const VehicleDetailsBox: React.FC = () => {
    const { control } = useFormContext<AdminMotorQuotationFormValues>()

    return (
        <>
            <div className="flex flex-col gap-0.5 pb-3">
                <h3 className="text-sm font-semibold sm:text-base">Vehicle Details</h3>
                <p className="text-xs text-muted-foreground">
                    Provide vehicle related details.
                </p>
            </div>

            <div className="rounded-2xl border border-[#ADABAB]/35 p-3 sm:p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <ReuseableInput
                        className={cn(motorInputClassName, 'uppercase')}
                        control={control}
                        name="vehicle_registration_number"
                        label="Vehicle Registration Number"
                        type="text"
                        required
                        placeholder="e.g. KAA 123A"
                    />
                    <ReuseableInput
                        className={motorInputClassName}
                        control={control}
                        name="vehicle_value"
                        label="Vehicle Value"
                        type="text"
                        thousandsSeparator
                        placeholder="vehicle value"
                    />
                    <VehicleUseInput />
                </div>
                <div className="mt-5 overflow-x-auto">
                    <ReusableCheckboxGrid
                        className="text-[#C20C0C]"
                        options={PROFFESIONALVALUATIONCHECKBOX}
                        columns={1}
                        name="valued_by_professional"
                    />
                </div>
            </div>
        </>
    )
}

const CoverDetailsBox: React.FC = () => {
    const { control } = useFormContext<AdminMotorQuotationFormValues>()

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Controller
                control={control}
                name="covertype_id"
                render={({ field }) => (
                    <ReusableSingleSelectApiInput
                        url="motor/general-tools/covertype"
                        value={field.value}
                        onChange={field.onChange}
                        label="Type of Cover"
                        required
                        placeholder="Select type of Cover..."
                    />
                )}
            />

            <Controller
                control={control}
                name="covering_id"
                render={({ field }) => (
                    <ReusableSingleSelectApiInput
                        url="motor/general-tools/covercovering"
                        value={field.value}
                        onChange={field.onChange}
                        label="Cover covering Options"
                        required
                        placeholder="Select Cover covering..."
                    />
                )}
            />

            <ReusableSelect
                control={control}
                name="ownership"
                label="ownership"
                placeholder="Select ownership"
                options={OWNERSHIPOPTIONS}
            />
        </div>
    )
}

type AnimatedSectionProps = {
    show: boolean
    children: React.ReactNode
    className?: string
}

function isCustomerContactMissing(data: AdminMotorQuotationFormValues): boolean {
    if (String(data.user_id ?? '').trim()) return false

    const email = String(data.email ?? '').trim()
    const phoneDigits = String(data.phone ?? '').replace(/\D/g, '')

    return !email && !phoneDigits
}

function AnimatedSection({ show, children, className }: AnimatedSectionProps) {
    return (
        <div
            data-state={show ? 'open' : 'closed'}
            className={cn(
                'transition-all duration-300 ease-out',
                show
                    ? 'opacity-100 translate-y-0 max-h-500'
                    : 'pointer-events-none opacity-0 -translate-y-1 max-h-0 overflow-hidden',
                className
            )}
        >
            {children}
        </div>
    )
}

export const MotorQuotationPage = () => {
    const navigate = useNavigate()
    const { user } = UseAuth()
    const { canModuleAction } = useCan()
    const canMotorOverride = QUOTATION_MOTOR_MODULES.some((module) =>
        canModuleAction(module, 'override')
    )
    const [selectedTabValue, setSelectedTabValue] = useState<string>('')
    const [adminOrganizationOverride, setAdminOrganizationOverride] = useState(false)
    const [showSelfCoverSubmitWarning, setShowSelfCoverSubmitWarning] = useState(false)
    const [pendingSubmitData, setPendingSubmitData] =
        useState<AdminMotorQuotationFormValues | null>(null)

    const { data: adminProfileData, isLoading: isAdminProfileLoading } =
        UseApiQuery<SubmitResponse>({
            url: 'user/search',
            params: { user_id: user?.id },
            queryOptions: { enabled: user?.id != null },
        })

    const userProfile = (adminProfileData?.data ?? null) as UserSearchProfile | null
    const profileCountry = userProfile?.country ?? null

    const { data: vehicleClassesData, isLoading: isVehicleClassesLoading } =
        UseApiQuery<SubmitResponse>({
            url: 'motor/general-tools/vehicle_classes',
            queryOptions: { enabled: true },
        })

    const vehicleClasses = (vehicleClassesData?.data ?? []) as VehicleClassItem[]
    const activeVehicleClasses = useMemo(
        () => vehicleClasses.filter((item) => item.is_active),
        [vehicleClasses]
    )

    const motoTabs = useMemo<MotorClassTab[]>(() => {
        return activeVehicleClasses.map((item) => {
            const cleanedSlug =
                canonicalizeMotorClassKey(item.slug) ||
                canonicalizeMotorClassKey(item.name)

            return {
                value: String(item.id),
                label: item.name,
                slug: cleanedSlug,
            }
        })
    }, [activeVehicleClasses])

    const form = useForm<AdminMotorQuotationFormValues>({
        resolver: zodResolver(AdminMotorQuotationSchema),
        defaultValues: {
            full_name: '',
            email: '',
            phone: '',
            user_id: '',
            country_id: '',
            processed_by_organization_id: '',
            agency_id: '',
            referral_id: '',
            covertype_id: '',
            covering_id: '',
            ownership: '',
            vehicle_class_id: '',
            used_for_id: '',
            registration_number: '',
            vehicle_registration_number: '',
            vehicle_value: '',
            valued_by_professional: false,
            create_customer_account: false,
        },
    })

    const formCountryId = useWatch({ control: form.control, name: 'country_id' })

    // const effectiveCountryId = useMemo(() => {
    //     if (formCountryId) return formCountryId
    //     if (profileCountry?.id != null && profileCountry.id !== '') {
    //         return String(profileCountry.id)
    //     }
    //     return ''
    // }, [formCountryId, profileCountry?.id])

    const effectiveCountryId = (() => {
        if (formCountryId) return formCountryId;
        if (profileCountry?.id != null && profileCountry.id !== '') {
            return String(profileCountry.id);
        }
        return '';
    })();

    const { data: selectedCountryGeoData } = UseApiQuery<SubmitResponse>({
        url: 'taxonomies/geo/country',
        params: { country_id: effectiveCountryId },
        queryOptions: { enabled: Boolean(effectiveCountryId) },
    })

    const selectedCountryGeo = (selectedCountryGeoData?.data ?? [])[0] as
        | CountryGeoMeta
        | undefined
    const dialCode = resolveDialCode(selectedCountryGeo)

    // const selectedCountryName = useMemo(() => {
    //     if (selectedCountryGeo?.name) return selectedCountryGeo.name
    //     if (!formCountryId && profileCountry?.name) return profileCountry.name
    //     return 'selected country'
    // }, [selectedCountryGeo?.name, formCountryId, profileCountry?.name])

    const selectedCountryName = (() => {
        if (selectedCountryGeo?.name) return selectedCountryGeo.name;
        if (!formCountryId && profileCountry?.name) return profileCountry.name;
        return 'selected country';
    })();

    const canLoadOrganizations = Boolean(effectiveCountryId)
    const hasSelectedClass = Boolean(selectedTabValue)
    const isClassTabsLoading = isVehicleClassesLoading
    const effectiveAdminOrganizationOverride =
        canMotorOverride && adminOrganizationOverride

    const handleClassChange = (value: string) => {
        setSelectedTabValue(value)
        form.setValue('vehicle_class_id', value, {
            shouldValidate: true,
            shouldDirty: true,
        })
    }

    const handleCountryChange = (value: string) => {
        form.setValue('country_id', value, { shouldValidate: true, shouldDirty: true })
        form.setValue('processed_by_organization_id', '', { shouldValidate: true })
        form.setValue('agency_id', '', { shouldValidate: true })
        form.setValue('phone', '', { shouldValidate: true })
    }

    const submitMutation = UseApiMutation<
        SubmitResponse,
        ReturnType<typeof buildMotorQuotationPayload>
    >({
        url: 'auto/quotation/motor',
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (response) => {
                const quoteSessionId = Number(response?.data?.id)
                if (!Number.isFinite(quoteSessionId) || quoteSessionId <= 0) {
                    ShowToast.error(
                        'Quote session could not be initialized. Please try again.'
                    )
                    return
                }
                sessionStorage.setItem(
                    MOTOR_QUOTE_SESSION_STORAGE_KEY,
                    String(quoteSessionId)
                )
                ShowToast.success(
                    response?.message || 'Quotation started successfully.'
                )
                navigate(EROUTES.MOTOR_QUOTATION_RESULTS)
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

    const loggedInUserName =
        user?.name?.trim() || user?.email?.trim() || 'your account'

    const submitQuotation = (data: AdminMotorQuotationFormValues) => {
        persistAdminMotorCustomerContact({
            email: data.email?.trim() || undefined,
            name: data.full_name?.trim() || undefined,
            phone: data.phone?.trim() || undefined,
        })
        const payload = buildMotorQuotationPayload({
            data,
            profileCountryId: profileCountry?.id,
            dialCode,
        })
        submitMutation.mutate(payload)
    }

    const onSubmit = (data: AdminMotorQuotationFormValues) => {
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
                    title="Motor Quotations"
                    description="Manage motor Quotations for comprehensive or 3rd party"
                />
            </div>

            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className={cn('space-y-6', motorFormFieldStyles)}>
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

                                <Controller
                                    control={form.control}
                                    name="processed_by_organization_id"
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

                                <Controller
                                    control={form.control}
                                    name="agency_id"
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

                            {canMotorOverride && (
                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id="admin-organization-override"
                                        checked={adminOrganizationOverride}
                                        onCheckedChange={(checked) =>
                                            setAdminOrganizationOverride(Boolean(checked))
                                        }
                                        disabled={!canLoadOrganizations}
                                        className="w-3.75 h-3.75 rounded-[3px] border border-[#D9D9D9] data-[state=checked]:bg-[#C20C0C] data-[state=checked]:border-[#C20C0C]"
                                    />
                                    <label
                                        htmlFor="admin-organization-override"
                                        className={cn(
                                            motorCheckboxLabelClassName,
                                            !canLoadOrganizations &&
                                            'cursor-not-allowed opacity-70'
                                        )} >
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

                            {canMotorOverride && (
                                <div className="rounded-2xl border border-[#ADABAB]/35 p-3 sm:p-5">
                                    <p className="text-xs font-semibold text-[#C20C0C]">Office Use:</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        If the on-behalf organization is not in the list, enable admin
                                        override. Your Agency is always limited to your Agent and
                                        Organization locations.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <CustomerDetailsSection countryId={effectiveCountryId} />

                    <div className="rounded-2xl border border-[#ADABAB]/50 p-4 shadow-sm sm:p-6 [&_label]:text-sm [&_input]:text-sm [&_button]:text-sm">
                        <div className="w-full pb-2">
                            <h2 className="text-lg font-bold leading-tight tracking-tight sm:text-xl">
                                Vehicle{' '}
                                <span className="text-[#C20C0C]">details</span>
                            </h2>
                            <p className="mt-1.5 max-w-2xl text-xs text-muted-foreground sm:text-sm">
                                Choose the class that best describes the vehicle. The right
                                fields appear next.
                            </p>
                        </div>

                        <div className="mt-5">
                            <Label className="text-sm font-semibold text-foreground">
                                Vehicle class
                            </Label>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Tap one option — only one class applies.
                            </p>

                            {isClassTabsLoading ? (
                                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading vehicle classes…
                                </div>
                            ) : motoTabs.length === 0 ? (
                                <div className="mt-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-8 text-center text-xs text-muted-foreground">
                                    No active vehicle classes found.
                                </div>
                            ) : (
                                <>
                                    <RadioGroup
                                        value={selectedTabValue}
                                        onValueChange={handleClassChange}
                                        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                                    >
                                        {motoTabs.map((tab) => {
                                            const Icon = SLUG_ICON[tab.slug] ?? Car
                                            const inputId = `admin-vehicle-class-${tab.value}`
                                            const isSelected =
                                                selectedTabValue === tab.value
                                            return (
                                                <div key={tab.value} className="relative">
                                                    <RadioGroupItem
                                                        value={tab.value}
                                                        id={inputId}
                                                        className="sr-only"
                                                    />
                                                    <Label
                                                        htmlFor={inputId}
                                                        className={cn(
                                                            'flex min-h-30 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 px-3 py-5 text-center transition-all',
                                                            'shadow-sm outline-none hover:border-[#C20C0C]/45',
                                                            'focus-within:ring-2 focus-within:ring-[#C20C0C]/25',
                                                            isSelected
                                                                ? 'border-[#C20C0C] bg-[#C20C0C]/[0.07] ring-2 ring-[#C20C0C]/20'
                                                                : 'border-[#E5E5E5]'
                                                        )}>
                                                        <span
                                                            className={cn(
                                                                'flex h-12 w-12 items-center justify-center rounded-xl border transition-colors',
                                                                isSelected
                                                                    ? 'border-[#C20C0C]/40 bg-[#C20C0C]/10 text-[#C20C0C]'
                                                                    : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                                                            )}>
                                                            <Icon
                                                                className="h-6 w-6"
                                                                strokeWidth={1.75}
                                                            />
                                                        </span>
                                                        <span className="text-[11px] font-semibold leading-snug sm:text-xs">
                                                            {tab.label}
                                                        </span>
                                                    </Label>
                                                </div>
                                            )
                                        })}
                                    </RadioGroup>

                                    <div className="mt-5 rounded-2xl border border-[#ADABAB]/35 p-3 sm:p-5">
                                        <CoverDetailsBox />
                                    </div>
                                </>
                            )}
                        </div>

                        {!isClassTabsLoading && motoTabs.length > 0 ? (
                            <div className="mt-8 space-y-3">
                                <AnimatedSection show={hasSelectedClass}>
                                    <VehicleDetailsBox />
                                </AnimatedSection>
                            </div>
                        ) : null}

                        <div className="mt-8 flex w-full justify-end border-t border-[#ADABAB]/30 pt-6 pb-2">
                            <Button
                                type="submit"
                                className="w-full rounded-full bg-[#C20C0C]/90 text-sm hover:bg-[#C20C0C] sm:w-auto"
                                rightIcon={<ArrowRightCircle />}
                                loading={submitMutation.isPending}
                                disabled={
                                    isClassTabsLoading ||
                                    motoTabs.length === 0 ||
                                    !selectedTabValue ||
                                    submitMutation.isPending
                                }>
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
                }}>
                <AlertDialogContent size="sm" className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>No customer contact details</AlertDialogTitle>
                        <AlertDialogDescription>
                            Email and phone were not provided. The system will process this
                            cover as belonging to{' '}
                            <span className="font-semibold text-foreground">
                                {loggedInUserName}
                            </span>
                            . Do you want to continue?
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
