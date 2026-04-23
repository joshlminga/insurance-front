/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/dev/core'
import {
    ReusableCheckboxGrid,
    ReusableSelect,
    ReusableSingleSelectApiInput,
    ReuseableInput,
} from '@/dev/core'
import React, { useEffect, useMemo, useState } from 'react'
import type {
    CustomerVerificationDetailsProps,
    SubmitResponse,
    TTabItem,
    VehicleClassItem
} from '@/types/types'
import { CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    ArrowLeftCircle,
    ArrowRightCircle,
    Bus,
    Car,
    Container,
    Loader2,
    Truck,
    type LucideIcon,
} from 'lucide-react'
import { Controller, useForm, FormProvider, useFormContext, useWatch } from 'react-hook-form'
import type { VehicleFormValues } from '@/types/schema'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { VehicleDetailsSchema } from '@/types/form-schema'
import { EMETHODS, MOTOR_QUOTE_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { ShowToast } from '@/utils/utils'
import { UseAuth } from '@/stores/auth-store'
import { extractErrorMessage } from '@/utils/helpers'
import { cn } from '@/lib/utils'
import { OWNERSHIPOPTIONS } from '@/utils/constatnts'
import { PROFFESIONALVALUATIONCHECKBOX } from '@/utils/enums'
import { MotorCommercialPage } from './tabs/motor-commercial'
import { MotorPrivatePage } from './tabs/motor-private'
import { MotorPsvPage } from './tabs/motor-psv'
import { MotorSpecialVehicle } from './tabs/motor-special-vehicle'
import { YearOfManufactureInput } from './components/year-of-manufacture-input'

type MotorClassTab = TTabItem & { slug: string }

function canonicalizeMotorClassKey(input: string | null | undefined): string {
    const normalized = String(input ?? '')
        .trim()
        .toLowerCase()
        .replace(/[\s\-_]+/g, '')
        .replace(/[^a-z0-9]/g, '')

    if (!normalized) return ''

    // Aliases for common API variations
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
    const { control, setValue } = useFormContext<VehicleFormValues>()
    const selectedMakeId = useWatch({ control, name: 'vehicle_make_id' })
    const selectedCoverTypeId = useWatch({ control, name: 'covertype_id' })
    const canFetchModels = Boolean(selectedMakeId)

    useEffect(() => {
        setValue('vehicle_model_id', '')
    }, [selectedMakeId, setValue])

    return (
        <>
            <div className="flex flex-col gap-0.5 pb-3">
                <h3 className="text-base font-semibold sm:text-lg">Vehicle Details</h3>
                <p className="text-xs text-muted-foreground sm:text-sm">
                    Provide vehicle related details.
                </p>
            </div>

            <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Controller
                        control={control}
                        name="vehicle_make_id"
                        render={({ field }) => (
                            <ReusableSingleSelectApiInput
                                url="taxonomies/vehicle/makes"
                                value={field.value}
                                onChange={field.onChange}
                                label="Vehicle Make"
                                required
                                placeholder="Select make..."
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="vehicle_model_id"
                        render={({ field }) => (
                            <ReusableSingleSelectApiInput
                                url={canFetchModels ? 'taxonomies/vehicle/models' : ''}
                                queryParams={
                                    canFetchModels
                                        ? {
                                              make_id: selectedMakeId,
                                          }
                                        : {}
                                }
                                value={field.value}
                                onChange={field.onChange}
                                label="Vehicle Model"
                                required
                                disabled={!canFetchModels}
                                placeholder={canFetchModels ? 'Select model...' : 'Select make first'}
                            />
                        )}
                    />

                    <YearOfManufactureInput<VehicleFormValues>
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={control}
                        covertypeId={selectedCoverTypeId}
                        name="year"
                        comprehensiveId="1384"
                    />

                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
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
    const { control } = useFormContext<VehicleFormValues>()

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

export const VehicleDetailsPage: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const [selectedTabValue, setSelectedTabValue] = useState<string>("");

    const { user, alpha } = UseAuth();
    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: 'motor/general-tools/vehicle_classes',
        queryOptions: {
            enabled: true,
        },
    })
    const vehicleClasses = (data?.data ?? []) as VehicleClassItem[];

    const activeVehicleClasses = useMemo(
        () => vehicleClasses.filter((item) => item.is_active),
        [vehicleClasses]
    )

    const motoTabs = useMemo<MotorClassTab[]>(() => {
        const componentBySlug = {
            private: MotorPrivatePage,
            commercial: MotorCommercialPage,
            psv: MotorPsvPage,
            specialvehicle: MotorSpecialVehicle,
        }
        return activeVehicleClasses.map((item) => {
            const cleanedSlug =
                canonicalizeMotorClassKey(item.slug) ||
                canonicalizeMotorClassKey(item.name)

            return {
                value: String(item.id),
                label: item.name,
                slug: cleanedSlug,
                component:
                    componentBySlug[cleanedSlug as keyof typeof componentBySlug] ??
                    MotorPrivatePage,
            }
        })
    }, [activeVehicleClasses])
    const isClassTabsLoading = isLoading

    const activeTab = useMemo(
        () => motoTabs.find((t) => t.value === selectedTabValue),
        [motoTabs, selectedTabValue]
    )
    const ActiveFormPanel = activeTab?.component

    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(VehicleDetailsSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            user_id: user?.id ?? "",
            country_id: alpha || "KE",
            covertype_id: "",
            covering_id: "",
            ownership: "",
            vehicle_make_id: "",
            vehicle_model_id: "",
            vehicle_class_id: "",
            used_for_id: "",
            bodytype_id: "",
            registration_number: "",
            vehicle_registration_number: "",
            vehicle_model: "",
            year: "",
            valued_by_professional: false
        },
    })

    useEffect(() => {
        form.setValue("country_id", alpha || "KE")
    }, [alpha, form])

    const vehicleMakeId = useWatch({ control: form.control, name: 'vehicle_make_id' })
    const vehicleModelId = useWatch({ control: form.control, name: 'vehicle_model_id' })
    const year = useWatch({ control: form.control, name: 'year' })
    const vehicleRegistrationNumber = useWatch({ control: form.control, name: 'vehicle_registration_number' })

    const hasSelectedClass = Boolean(selectedTabValue)
    const hasCompletedVehicleDetails =
        Boolean(String(vehicleMakeId ?? '').trim()) &&
        Boolean(String(vehicleModelId ?? '').trim()) &&
        Boolean(String(year ?? '').trim()) &&
        Boolean(String(vehicleRegistrationNumber ?? '').trim())

    const submitMutation = UseApiMutation<SubmitResponse, Record<string, any>>({
        url: "quotation/motor",
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                const quoteSessionId = Number(data?.data?.id)
                if (!Number.isFinite(quoteSessionId) || quoteSessionId <= 0) {
                    ShowToast.error("Quote session could not be initialized. Please try again.")
                    return
                }
                sessionStorage.setItem(MOTOR_QUOTE_SESSION_STORAGE_KEY, String(quoteSessionId))
                goToNextStep?.()
                ShowToast.success(data.message || "Submitted successfully!")
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Submission failed!")
            },
        },
    })
    const onSubmit = (data: VehicleFormValues) => {
        const valuedByProfessional =
            data.valued_by_professional === true ||
            String(data.valued_by_professional).toLowerCase() === "true"

        submitMutation.mutate({
            ...data,
            country_id: String(data.country_id ?? "").trim() || alpha || "KE",
            coverfor_id: data.vehicle_class_id,
            valued_by_professional: valuedByProfessional,
        })
    }

    const handleClassChange = (value: string) => {
        setSelectedTabValue(value)
        form.setValue("vehicle_class_id", value, { shouldValidate: true, shouldDirty: true })
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto bg-transparent">
                <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6">
                    <div className="w-full pb-2">
                        <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                            Add your{' '}
                            <span className="text-[#C20C0C]">vehicle details</span>
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                            Choose the class that best describes your vehicle. We&apos;ll show the right fields next.
                        </p>
                    </div>

                    <div className="mt-5">
                        <Label className="text-base font-semibold text-foreground">
                            Vehicle class
                        </Label>
                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                            Tap one option — only one class applies.
                        </p>

                        {isClassTabsLoading ? (
                            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading vehicle classes…
                            </div>
                        ) : motoTabs.length === 0 ? (
                            <div className="mt-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                                No active vehicle classes found.
                            </div>
                        ) : (
                            <>
                                <RadioGroup
                                    value={selectedTabValue}
                                    onValueChange={handleClassChange}
                                    className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {motoTabs.map((tab) => {
                                        const Icon = SLUG_ICON[tab.slug] ?? Car
                                        const inputId = `vehicle-class-${tab.value}`
                                        const isSelected = selectedTabValue === tab.value
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
                                                        <Icon className="h-6 w-6" strokeWidth={1.75} />
                                                    </span>
                                                    <span className="text-xs font-semibold leading-snug sm:text-sm">
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

                            <AnimatedSection show={hasSelectedClass && hasCompletedVehicleDetails}>
                            <div className="flex flex-col gap-0.5 pb-3">
                                    <h2 className="text-base font-semibold sm:text-lg">
                                        Details for {activeTab?.label}
                                    </h2>
                                    <p className="text-xs text-muted-foreground sm:text-sm">
                                        Complete the fields below, then continue.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5">
                                    {ActiveFormPanel ? <ActiveFormPanel /> : null}
                                </div>
                            </AnimatedSection>
                        </div>
                    ) : null}
                </div>
                <CardFooter className="mt-4 w-full flex flex-col gap-3 px-0 sm:flex-row sm:justify-between">
                    <Button
                        type="button"
                        className="w-full rounded-full border border-[#C20C0C] bg-transparent text-[#C20C0C] hover:bg-[#C20C0C]/10 sm:w-auto"
                        leftIcon={<ArrowLeftCircle />}
                        onClick={() => goToPrevStep?.()}>
                        Previous
                    </Button>
                    <Button
                        type="submit"
                        className="w-full rounded-full bg-[#C20C0C]/90 hover:bg-[#C20C0C] sm:w-auto"
                        rightIcon={<ArrowRightCircle />}
                        loading={submitMutation.isPending}
                        disabled={
                            isClassTabsLoading ||
                            motoTabs.length === 0 ||
                            !selectedTabValue
                        }>
                        Next
                    </Button>
                </CardFooter>
            </form>
        </FormProvider>
    )
}
