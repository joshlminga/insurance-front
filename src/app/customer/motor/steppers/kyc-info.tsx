/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CardFooter } from '@/components/ui/card'
import { Button, ReusableSelect, ReusableSingleSelectApiInput, ReuseableInput, ReuseableSingleSelectNationalityInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { MotorKycSchema } from '@/types/form-schema'
import type { MotorKycFormValues } from '@/types/schema'
import type { CustomerVerificationDetailsProps, SubmitResponse } from '@/types/types'
import { EMETHODS, IDTYPES, INVOICE_SESSION_STORAGE_KEY, PURCHASE_SESSION_STORAGE_KEY, VEHICLE_DETAILS_SESSION_STORAGE_KEY, VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

type VehicleDetails = Record<string, unknown>

const EMPTY_VEHICLE_VALUE = "Not available"
const COMPANY_OWNED = "Company Owned"
const AKI_REGISTRATION_WARNING = "This vehicle as issue in AKI registration, we will verify before issuing cover"

type ReadOnlyVehicleFieldProps = {
    label: string
    value: string
}

type BoxHeaderProps = {
    title: string
    description?: string
}

const formatVehicleValue = (value: unknown): string | null => {
    if (value === null || value === undefined) return null
    if (typeof value === "string") return value.trim() || null
    if (typeof value === "number" || typeof value === "boolean") return String(value)

    if (typeof value === "object") {
        const record = value as Record<string, unknown>
        const readableKeys = ["name", "title", "label", "value", "description"]

        for (const key of readableKeys) {
            const formattedValue = formatVehicleValue(record[key])
            if (formattedValue) return formattedValue
        }
    }

    return null
}

const getVehicleValue = (details: VehicleDetails | null, keys: string[]) => {
    if (!details) return null

    for (const key of keys) {
        const formattedValue = formatVehicleValue(details[key])
        if (formattedValue) return formattedValue
    }

    return null
}

const showVehicleValue = (value: string | null) => value ?? EMPTY_VEHICLE_VALUE

const redactVehicleNumber = (value: string | null) => {
    if (!value) return EMPTY_VEHICLE_VALUE
    if (value.length <= 5) return value

    return `${value.slice(0, 3)}***${value.slice(-2)}`
}

const readSessionValue = (key: string) => {
    if (typeof window === "undefined") return null

    return sessionStorage.getItem(key)
}

const readVehicleDetails = () => {
    const storedVehicleDetails = readSessionValue(VEHICLE_DETAILS_SESSION_STORAGE_KEY)
    if (!storedVehicleDetails) return null

    try {
        return JSON.parse(storedVehicleDetails) as VehicleDetails
    } catch {
        return null
    }
}

const ReadOnlyVehicleField = ({ label, value }: ReadOnlyVehicleFieldProps) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <input
            type="text"
            value={value}
            readOnly
            disabled
            className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] bg-gray-100 px-3 text-sm text-gray-600 opacity-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600"
        />
    </div>
)

const BoxHeader = ({ title, description }: BoxHeaderProps) => (
    <div className="flex flex-col gap-0.5 pb-3">
        <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
        {description ? (
            <p className="text-xs text-muted-foreground sm:text-sm">
                {description}
            </p>
        ) : null}
    </div>
)

export const KycInfo: React.FC<CustomerVerificationDetailsProps> = ({ goToPrevStep, goToNextStep }) => {
    const [purchaseSessionId] = useState(() => readSessionValue(PURCHASE_SESSION_STORAGE_KEY))
    const [vehicleDetails] = useState<VehicleDetails | null>(() => readVehicleDetails())
    const [vehicleOwnership] = useState(() => readSessionValue(VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY))
    const [akiDialogOpen, setAkiDialogOpen] = useState(false)

    const form = useForm<MotorKycFormValues>({
        resolver: zodResolver(MotorKycSchema),
        shouldUnregister: true,
        defaultValues: {
            nationality_id: "",
            id_type: "",
            id_number: "",
            date_of_birth: "",
            occupation: "",
            company_name: "",
            incorporated_in: "",
            industry_category: "",
            coi_number: "",
            tax_pin: "",
            logbook: undefined,
            tax_certificate: undefined,
            id_document: undefined,
            coi_certificate: undefined,
        },
    })

    const isCompanyOwned = vehicleOwnership === COMPANY_OWNED
    const generalDetailsTitle = isCompanyOwned ? "Company Info" : "Personal Info"
    const fileFields = new Set(["logbook", "tax_certificate", "id_document", "coi_certificate"])

    const submitMutation = UseApiMutation<SubmitResponse, FormData>({
        url: `purchase/motor/${purchaseSessionId}/kyc`,
        method: EMETHODS.POST,
        config: {
            headers: { "Content-Type": "multipart/form-data" },
        },
        mutationOptions: {
            onSuccess: (data) => {
                sessionStorage.setItem(INVOICE_SESSION_STORAGE_KEY, String(data?.data?.purchase_id))
                goToNextStep?.()
                ShowToast.success(data.message || "Submitted successfully!")
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Submission failed!")
            },
        },
    })

    const onSubmit = (data: MotorKycFormValues) => {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) return
            if (fileFields.has(key)) {
                if (value instanceof File) formData.append(key, value)
            } else {
                formData.append(key, String(value))
            }
        })
        submitMutation.mutate(formData)
    }

    const chassisNumber = getVehicleValue(vehicleDetails, ["chassisNumber", "chassis_number", "vehicle_chassis_number"])
    const engineNumber = getVehicleValue(vehicleDetails, ["engineNumber", "engine_number", "vehicle_engine_number"])

    const vehicleSummaryFields = [
        {
            label: "Vehicle Make",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["make", "vehicleMake", "vehicle_make", "vehicle_make_name", "make_name"])),
        },
        {
            label: "Model",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["model", "vehicleModel", "vehicle_model", "vehicle_model_name", "model_name"])),
        },
        {
            label: "Body Type",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["bodyType", "bodytype", "body_type", "bodytype_name", "body_type_name", "vehicle_body_type"])),
        },
        {
            label: "Registration Year",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["registrationYear", "registration_year", "year", "yom"])),
        },
        {
            label: "Color",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["vehicleColor", "color", "vehicle_color", "vehicle_color_name"])),
        },
        {
            label: "Registration Number",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["registrationNumber", "registration_number", "vehicle_registration_number"])),
        },
        {
            label: "Chassis Number",
            value: redactVehicleNumber(chassisNumber),
        },
        {
            label: "Engine Number",
            value: redactVehicleNumber(engineNumber),
        },
        {
            label: "Vehicle Tonnage",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["vehicleTonnage", "vehicle_tonnage", "tonnage", "tonage", "tonage_capacity", "tonnage_capacity"])),
        },
        {
            label: "Number of Passenger",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["passengerCapacity"])),
        },
        {
            label: "Engine CC",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["cubicCapacity", "cubic_capacity", "engine_cc", "cc", "engine_capacity"])),
        },
    ]

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto bg-transparent">
            <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6">
                <div className="w-full pb-2">
                    <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                        KYC <span className="text-[#C20C0C]">Info</span>
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                        Complete the customer details and upload the documents needed for this vehicle ownership type.
                    </p>
                </div>

                <div className="mt-5 space-y-5">
                    <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5">
                        <BoxHeader
                            title={generalDetailsTitle}
                            description={
                                isCompanyOwned
                                    ? "Provide the registered company details for this company-owned vehicle."
                                    : "Provide the personal details for this personally owned vehicle."
                            }
                        />
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5'>
                            {isCompanyOwned ? (
                                <>
                                    <ReuseableInput
                                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                        control={form.control}
                                        name="company_name"
                                        label="Company Name"
                                        required
                                        placeholder="Enter company name"
                                    />
                                    <Controller
                                        control={form.control}
                                        name="incorporated_in"
                                        render={({ field }) => (
                                            <ReusableSingleSelectApiInput
                                                url="/taxonomies/geo/country"
                                                queryParams={{
                                                    sort_by: "name",
                                                    direction: "asc",
                                                }}
                                                value={field.value}
                                                onChange={field.onChange}
                                                label="Incorporated In"
                                                required
                                                placeholder="Select country..."
                                            />
                                        )}
                                    />
                                    <ReuseableInput
                                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                        control={form.control}
                                        name="industry_category"
                                        label="Industry Category"
                                        placeholder="Enter industry category"
                                    />
                                    <ReuseableInput
                                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                        control={form.control}
                                        name="coi_number"
                                        label="Certificate of Incorporation Number"
                                        placeholder="Enter certificate number"
                                    />
                                </>
                            ) : (
                                <>
                                    <Controller
                                        control={form.control}
                                        name="nationality_id"
                                        render={({ field }) => (
                                            <ReuseableSingleSelectNationalityInput
                                                label="Nationality"
                                                required
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <ReusableSelect
                                        control={form.control}
                                        name="id_type"
                                        label="ID Types"
                                        placeholder="Select ID Type"
                                        options={IDTYPES}
                                        required
                                    />
                                    <ReuseableInput
                                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                        control={form.control}
                                        name="id_number"
                                        placeholder='Enter passport or ID number'
                                        label="Passport/ID Number"
                                        required
                                    />
                                    <ReuseableInput
                                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                        control={form.control}
                                        type="date"
                                        name="date_of_birth"
                                        label="Date of Birth"
                                        required
                                    />
                                    <ReuseableInput
                                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                        control={form.control}
                                        name="occupation"
                                        label="Occupation"
                                        placeholder="Enter occupation"
                                    />
                                </>
                            )}
                            <ReuseableInput
                                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                name="tax_pin"
                                label="Tax PIN"
                                required
                                placeholder="Enter tax PIN"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5">
                        <BoxHeader
                            title="Vehicle Details"
                            description="These vehicle details are read-only and come from the selected quotation."
                        />
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5'>
                            {vehicleSummaryFields.map((field) => (
                                <ReadOnlyVehicleField
                                    key={field.label}
                                    label={field.label}
                                    value={field.value}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5">
                        <BoxHeader
                            title="Documents"
                            description="Upload the supporting documents for this KYC submission."
                        />
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5'>
                            {isCompanyOwned ? (
                                <ReuseableInput
                                    className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                    control={form.control}
                                    type='file'
                                    name="coi_certificate"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    label="Attach Certificate of Incorporation"
                                />
                            ) : (
                                <ReuseableInput
                                    className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                    control={form.control}
                                    type='file'
                                    name="id_document"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    label="Attach ID/Passport"
                                    required
                                />
                            )}
                            <ReuseableInput
                                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                type='file'
                                name="logbook"
                                accept=".pdf,.jpg,.jpeg,.png"
                                label="Attach Logbook"
                                required
                            />
                            <ReuseableInput
                                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                type='file'
                                accept=".pdf,.jpg,.jpeg,.png"
                                name="tax_certificate"
                                label="Attach Tax Certificate"
                                required
                            />
                        </div>
                    </div>
                </div>
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
                    type="button"
                    className="w-full rounded-full bg-[#C20C0C]/90 hover:bg-[#C20C0C] sm:w-auto"
                    rightIcon={<ArrowRightCircle />}
                    loading={submitMutation.isPending}
                    onClick={() => setAkiDialogOpen(true)}>
                    Invoice Cover Quotation
                </Button>
            </CardFooter>
            <AlertDialog open={akiDialogOpen} onOpenChange={setAkiDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>AKI Registration Notice</AlertDialogTitle>
                        <AlertDialogDescription>
                            {AKI_REGISTRATION_WARNING}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            className="bg-[#C20C0C]/90 hover:bg-[#C20C0C]"
                            onClick={form.handleSubmit(onSubmit)}
                        >
                            I understand Procceed
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </form>
    )
}
