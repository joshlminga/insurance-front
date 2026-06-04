/* eslint-disable react-hooks/exhaustive-deps */
import { PageHeader } from '@/components/shared'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldGroup } from '@/components/ui/field'
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
import { UseApiQuery } from '@/hooks/hooks'
import { cn } from '@/lib/utils'
import { UseAuth } from '@/stores/auth-store'
import { AdminMotorQuotationSchema } from '@/types/form-schema'
import type { AdminMotorQuotationFormValues } from '@/types/schema'
import type { SubmitResponse, VehicleClassItem } from '@/types/types'
import { PROFFESIONALVALUATIONCHECKBOX } from '@/utils/enums'
import { OWNERSHIPOPTIONS } from '@/utils/constatnts'
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
import {
    Controller,
    FormProvider,
    useForm,
    useFormContext,
    useWatch,
} from 'react-hook-form'
import { AdminPhoneInput } from './admin-phone-input'
import { OrganizationLocationInput } from './organization-location-input'
import { OfficeCountrySelect } from './office-country-select'

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

            <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] uppercase"
                        control={control}
                        name="vehicle_registration_number"
                        label="Vehicle Registration Number"
                        type="text"
                        required
                        placeholder="e.g. KAA 123A"
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
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

function AnimatedSection({ show, children, className }: AnimatedSectionProps) {
    return (
        <div
            data-state={show ? 'open' : 'closed'}
            className={cn(
                'transition-all duration-300 ease-out',
                show
                    ? 'opacity-100 translate-y-0 max-h-[2000px]'
                    : 'pointer-events-none opacity-0 -translate-y-1 max-h-0 overflow-hidden',
                className
            )}
        >
            {children}
        </div>
    )
}

export const MotorQuotationPage = () => {
    const { user } = UseAuth()
    const [selectedTabValue, setSelectedTabValue] = useState<string>('')
    const [adminOrganizationOverride, setAdminOrganizationOverride] = useState(false)

    const { data: userProfileData, isLoading: isUserProfileLoading } =
        UseApiQuery<SubmitResponse>({
            url: 'user/search',
            params: { user_id: user?.id },
            queryOptions: { enabled: user?.id != null },
        })

    const userProfile = (userProfileData?.data ?? null) as UserSearchProfile | null
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
            organization_location_id: '',
            referral_code: '',
            covertype_id: '',
            covering_id: '',
            ownership: '',
            vehicle_class_id: '',
            used_for_id: '',
            registration_number: '',
            vehicle_registration_number: '',
            vehicle_value: '',
            valued_by_professional: false,
        },
    })

    const formCountryId = useWatch({ control: form.control, name: 'country_id' })

    const effectiveCountryId = useMemo(() => {
        if (formCountryId) return formCountryId
        if (profileCountry?.id != null && profileCountry.id !== '') {
            return String(profileCountry.id)
        }
        return ''
    }, [formCountryId, profileCountry?.id])

    const selectedCountryName = useMemo(() => {
        if (formCountryId && String(formCountryId) === String(profileCountry?.id)) {
            return profileCountry?.name ?? 'selected country'
        }
        if (!formCountryId && profileCountry?.name) {
            return profileCountry.name
        }
        return profileCountry?.name ?? 'selected country'
    }, [formCountryId, profileCountry])

    const canLoadOrganizations = Boolean(effectiveCountryId)
    const hasSelectedClass = Boolean(selectedTabValue)
    const isClassTabsLoading = isVehicleClassesLoading

    const handleClassChange = (value: string) => {
        setSelectedTabValue(value)
        form.setValue('vehicle_class_id', value, {
            shouldValidate: true,
            shouldDirty: true,
        })
    }

    const handleCountryChange = (value: string) => {
        form.setValue('country_id', value, { shouldValidate: true, shouldDirty: true })
        form.setValue('organization_location_id', '', { shouldValidate: true })
        form.setValue('phone', '', { shouldValidate: true })
    }

    const onSubmit = (data: AdminMotorQuotationFormValues) => {
        const valuedByProfessional =
            data.valued_by_professional === true ||
            String(data.valued_by_professional).toLowerCase() === 'true'

        const payload = {
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            country_id: data.country_id || (profileCountry?.id != null ? String(profileCountry.id) : null),
            organization_location_id: data.organization_location_id,
            referral_code: data.referral_code?.trim() || null,
            user_id: data.user_id,
            valued_by_professional: valuedByProfessional,
            covertype_id: data.covertype_id,
            covering_id: data.covering_id,
            ownership: data.ownership,
            vehicle_registration_number: data.vehicle_registration_number,
            vehicle_value: data.vehicle_value,
            vehicle_class_id: data.vehicle_class_id,
            used_for_id: data.used_for_id,
            registration_number: null,
            vehicle_model: null,
            vehicle_make: null,
            yom: null,
            insurance_type: null,
            vehicle_make_id: null,
            vehicle_model_id: null,
            bodytype_id: null,
            year: null,
            number_of_passengers: null,
            tonnage: null,
            coverfor_id: null,
        }

        console.log('Form data:', payload)
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
                    className="space-y-6"
                >
                    <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6">
                        <div className="w-full pb-4">
                            <h2 className="text-lg font-bold leading-tight tracking-tight sm:text-xl">
                                Customer{' '}
                                <span className="text-[#C20C0C]">details</span>
                            </h2>
                            <p className="mt-1.5 max-w-2xl text-xs text-muted-foreground sm:text-sm">
                                Enter customer contact information for this quotation.
                            </p>
                        </div>
                        <FieldGroup className="[&_label]:text-sm [&_input]:text-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <ReuseableInput
                                    className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                    control={form.control}
                                    name="email"
                                    label="Email"
                                    type="email"
                                />
                                <AdminPhoneInput
                                    control={form.control}
                                    name="phone"
                                    countryId={effectiveCountryId}
                                    label="Mobile Number"
                                />
                                <ReuseableInput
                                    className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                    control={form.control}
                                    name="full_name"
                                    label="Full Name"
                                />
                            </div>
                        </FieldGroup>
                    </div>

                    <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6">
                        <div className="w-full pb-4">
                            <h2 className="text-lg font-bold leading-tight tracking-tight sm:text-xl">
                                Office{' '}
                                <span className="text-[#C20C0C]">use</span>
                            </h2>
                            <p className="mt-1.5 max-w-2xl text-xs text-muted-foreground sm:text-sm">
                                Country, organization, and referral details for internal processing.
                            </p>
                        </div>
                        <div className="space-y-4 [&_label]:text-sm [&_input]:text-sm [&_button]:text-sm">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Controller
                                    control={form.control}
                                    name="country_id"
                                    render={({ field }) => (
                                        <OfficeCountrySelect
                                            value={field.value}
                                            onChange={handleCountryChange}
                                            defaultCountryName={profileCountry?.name}
                                            label="Country"
                                            disabled={isUserProfileLoading}
                                        />
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="organization_location_id"
                                    render={({ field }) => (
                                        <OrganizationLocationInput
                                            countryId={effectiveCountryId}
                                            override={adminOrganizationOverride}
                                            value={field.value}
                                            onChange={field.onChange}
                                            label="Organization"
                                            required
                                            disabled={!canLoadOrganizations}
                                        />
                                    )}
                                />

                                <ReuseableInput
                                    className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                    control={form.control}
                                    name="referral_code"
                                    label="Referral Code"
                                    type="text"
                                    placeholder="Optional"
                                />
                            </div>

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
                                        'text-xs font-medium leading-snug sm:text-sm',
                                        !canLoadOrganizations && 'cursor-not-allowed opacity-70'
                                    )}
                                >
                                    Admin Override: Pull all Organization in{' '}
                                    {selectedCountryName}
                                </label>
                            </div>

                            <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5">
                                <p className="text-xs font-semibold text-[#C20C0C]">Office Use:</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    If you&apos;re applying for organization not in the list
                                    select &apos;Acentria admin override&apos;
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6 [&_label]:text-sm [&_input]:text-sm [&_button]:text-sm">
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

                                    <div className="mt-5 rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5">
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
                                disabled={
                                    isClassTabsLoading ||
                                    motoTabs.length === 0 ||
                                    !selectedTabValue
                                }
                            >
                                Start Quotation
                            </Button>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}
