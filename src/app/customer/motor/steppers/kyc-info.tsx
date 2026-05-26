/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button, ReusableSelect, ReuseableInput, ReuseableSingleSelectNationalityInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { MotorKycSchema } from '@/types/form-schema'
import type { MotorKycFormValues } from '@/types/schema'
import type { CustomerVerificationDetailsProps, SubmitResponse } from '@/types/types'
import { EMETHODS, IDTYPES, INVOICE_SESSION_STORAGE_KEY, PURCHASE_SESSION_STORAGE_KEY, VEHICLE_DETAILS_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

type VehicleDetails = Record<string, unknown>

const EMPTY_VEHICLE_VALUE = "Not available"

type ReadOnlyVehicleFieldProps = {
    label: string
    value: string
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

export const KycInfo: React.FC<CustomerVerificationDetailsProps> = ({ goToPrevStep, goToNextStep }) => {
    const [purchaseSessionId, setPurchaseSessionId] = useState<string | null>(null)
    const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null)

    const form = useForm<MotorKycFormValues>({
        resolver: zodResolver(MotorKycSchema),
        defaultValues: {
            nationality_id: "",
            id_type: "",
            id_number: "",
            tax_pin: "",
            logbook: undefined,
            tax_certificate: undefined,
            id_document: undefined,
        },
    })

    useEffect(() => {
        const storedPurchaseKey = sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY)
        const storedVehicleDetails = sessionStorage.getItem(VEHICLE_DETAILS_SESSION_STORAGE_KEY)

        setPurchaseSessionId(storedPurchaseKey)

        if (!storedVehicleDetails) {
            setVehicleDetails(null)
            return
        }

        try {
            setVehicleDetails(JSON.parse(storedVehicleDetails))
        } catch {
            setVehicleDetails(null)
        }
    }, [])

    const fileFields = new Set(["logbook", "tax_certificate", "id_document"])
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
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["vehicle_make", "vehicle_make_name", "make", "make_name"])),
        },
        {
            label: "Model",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["vehicle_model", "vehicle_model_name", "model", "model_name"])),
        },
        {
            label: "Body Type",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["bodytype", "body_type", "bodytype_name", "body_type_name", "vehicle_body_type"])),
        },
        {
            label: "Registration Year",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["registrationYear", "registration_year", "year", "yom"])),
        },
        {
            label: "Color",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["color", "vehicle_color", "vehicle_color_name"])),
        },
        {
            label: "Registration Number",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["registration_number", "vehicle_registration_number"])),
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
            label: "Cubic Capacity",
            value: showVehicleValue(getVehicleValue(vehicleDetails, ["cubicCapacity", "cubic_capacity", "engine_cc", "cc", "engine_capacity"])),
        },
    ]

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto bg-transparent">
            <div className='items-center justify-center border p-3 sm:p-4'>
                <div className="w-full py-3">
                    <h1 className="text-xl sm:text-2xl font-bold leading-none mb-4">KYC Info</h1>
                </div>
                <Separator className='my-4' />
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
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
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="id_number"
                        placeholder='Enter passport or ID number'
                        label="Passport/ID Number"
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="tax_pin"
                        label="Personal Tax Pin"
                        placeholder="Enter Personal Tax Pin"
                    />
                </div>

                <Separator className='my-4' />
                <div className="space-y-3">
                    <div>
                        <h2 className="text-base font-semibold">Vehicle Details</h2>
                        <p className="text-sm text-muted-foreground">
                            These vehicle details are read-only and come from the selected quotation.
                        </p>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
                        {vehicleSummaryFields.map((field) => (
                            <ReadOnlyVehicleField
                                key={field.label}
                                label={field.label}
                                value={field.value}
                            />
                        ))}
                    </div>
                </div>

                <Separator className='my-4' />
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        type='file'
                        name="logbook"
                        accept=".pdf,.jpg,.jpeg,.png"
                        label="Attach Logbook"
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        type='file'
                        accept=".pdf,.jpg,.jpeg,.png"
                        name="tax_certificate"
                        label="Attach Tax Certificate"
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] sm:col-span-2 lg:col-span-1"
                        control={form.control}
                        type='file'
                        name="id_document"
                        accept=".pdf,.jpg,.jpeg,.png"
                        label="Attach ID/Passport"
                    />
                </div>
            </div>
            <CardFooter className="w-full flex flex-col sm:flex-row justify-between gap-3 mt-3 px-0">
                <Button
                    type="button"
                    className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                    leftIcon={<ArrowLeftCircle />}
                    onClick={() => goToPrevStep?.()}>
                    Previous
                </Button>
                <Button
                    type="submit"
                    className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                    rightIcon={<ArrowRightCircle />}
                    loading={submitMutation.isPending}>
                    Invoice Cover Quotation
                </Button>
            </CardFooter>
        </form>
    )
}
