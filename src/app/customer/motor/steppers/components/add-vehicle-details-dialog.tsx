import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { AddVehicleSchema } from '@/types/form-schema'
import type { AddVehicleFormValues } from '@/types/schema'
import type {
    AddVehicleApiPayload,
    SubmitResponse,
    VehiclePreview,
} from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { cn } from '@/lib/utils'

const addVehicleInputClassName =
    'w-full h-10 rounded-[5px] border border-[#ADABAB]'

const fourColGridClassName =
    'grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

const threeColGridClassName =
    'grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3'

type AddVehicleDetailsDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    registrationNumber: string
    preview: VehiclePreview | null
    /** Admin: fill engine/cc/chassis from preview. Customer: leave those three blank. */
    autofillSensitiveFields: boolean
    /** After the vehicle is saved, retry the original quote start request. */
    onAdded: () => void
}

function previewToString(value: unknown): string {
    if (value == null || value === '') return ''
    return String(value)
}

function toFormNumber(value: string): number {
    return Number(String(value).replace(/,/g, '').trim())
}

/** Empty optional text → null so the API can store null instead of "". */
function optionalTrimmedString(value: string | undefined): string | null {
    const trimmed = (value ?? '').trim()
    return trimmed === '' ? null : trimmed
}

/** Empty optional number → null (avoids sending 0 for a blank field). */
function optionalFormNumber(value: string | undefined): number | null {
    const trimmed = (value ?? '').replace(/,/g, '').trim()
    if (trimmed === '') return null
    return Number(trimmed)
}

function buildAddVehiclePayload(data: AddVehicleFormValues): AddVehicleApiPayload {
    return {
        registration_number: data.registration_number.trim().toUpperCase(),
        make: data.make.trim(),
        model: data.model.trim(),
        manufacture_year: toFormNumber(data.manufacture_year),
        body_type: data.body_type.trim(),
        color: optionalTrimmedString(data.color),
        number_of_passengers: optionalFormNumber(data.number_of_passengers),
        tonnage: toFormNumber(data.tonnage),
        engine_number: optionalTrimmedString(data.engine_number),
        cubic_capacity: optionalFormNumber(data.cubic_capacity),
        chassis_number: data.chassis_number.trim(),
    }
}

function buildDefaultValues(
    registrationNumber: string,
    preview: VehiclePreview | null,
    autofillSensitiveFields: boolean
): AddVehicleFormValues {
    return {
        registration_number: registrationNumber.trim().toUpperCase(),
        make: previewToString(preview?.make),
        model: previewToString(preview?.model),
        manufacture_year: previewToString(preview?.year),
        body_type: previewToString(preview?.body_type),
        color: previewToString(preview?.color),
        number_of_passengers: previewToString(preview?.number_of_passengers),
        tonnage: previewToString(preview?.tonnage),
        engine_number: autofillSensitiveFields
            ? previewToString(preview?.engine_number)
            : '',
        cubic_capacity: autofillSensitiveFields
            ? previewToString(preview?.cubic_capacity)
            : '',
        chassis_number: autofillSensitiveFields
            ? previewToString(preview?.chassis_number)
            : '',
    }
}

export function AddVehicleDetailsDialog({
    open,
    onOpenChange,
    registrationNumber,
    preview,
    autofillSensitiveFields,
    onAdded,
}: AddVehicleDetailsDialogProps) {
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useForm<AddVehicleFormValues>({
        resolver: zodResolver(AddVehicleSchema),
        defaultValues: buildDefaultValues(
            registrationNumber,
            preview,
            autofillSensitiveFields
        ),
    })

    // Re-fill when the popup opens so we always use the latest plate + preview.
    useEffect(() => {
        if (!open) return
        setSubmitError(null)
        form.reset(
            buildDefaultValues(registrationNumber, preview, autofillSensitiveFields)
        )
    }, [open, registrationNumber, preview, autofillSensitiveFields, form])

    const addVehicleMutation = UseApiMutation<
        SubmitResponse,
        AddVehicleApiPayload
    >({
        url: 'vehicle/add-vehicle',
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: () => {
                setSubmitError(null)
                onOpenChange(false)
                onAdded()
            },
            onError: (error: unknown) => {
                setSubmitError(extractErrorMessage(error))
            },
        },
    })

    const onSubmit = (data: AddVehicleFormValues) => {
        setSubmitError(null)
        addVehicleMutation.mutate(buildAddVehiclePayload(data))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Add vehicle details</DialogTitle>
                    <DialogDescription>
                        This registration number was not accepted. Confirm or complete
                        the vehicle details below so we can add it, then we will retry
                        your quotation.
                    </DialogDescription>
                </DialogHeader>

                {/* Own form (not nested in the quote form) so Save does not submit Start Quotation. */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {submitError ? (
                        <div
                            role="alert"
                            className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {submitError}
                        </div>
                    ) : null}

                    <div className={fourColGridClassName}>
                        <ReuseableInput
                            className={cn(addVehicleInputClassName, 'uppercase')}
                            control={form.control}
                            name="registration_number"
                            label="Registration Number"
                            type="text"
                            required
                            placeholder="e.g. KAA 123A"
                        />
                        <ReuseableInput
                            className={addVehicleInputClassName}
                            control={form.control}
                            name="make"
                            label="Make"
                            type="text"
                            required
                            placeholder="e.g. TOYOTA"
                        />
                        <ReuseableInput
                            className={addVehicleInputClassName}
                            control={form.control}
                            name="model"
                            label="Model"
                            type="text"
                            required
                            placeholder="e.g. VITZ"
                        />
                        <ReuseableInput
                            className={addVehicleInputClassName}
                            control={form.control}
                            name="manufacture_year"
                            label="Year of Manufacture"
                            type="number"
                            required
                            placeholder="e.g. 2016"
                        />
                    </div>

                    <div className={fourColGridClassName}>
                        <ReuseableInput
                            className={addVehicleInputClassName}
                            control={form.control}
                            name="body_type"
                            label="Body Type"
                            type="text"
                            required
                            placeholder="e.g. S.WAGON"
                        />
                        <ReuseableInput
                            className={addVehicleInputClassName}
                            control={form.control}
                            name="color"
                            label="Color"
                            type="text"
                            placeholder="e.g. BLUE"
                        />
                        <ReuseableInput
                            className={addVehicleInputClassName}
                            control={form.control}
                            name="number_of_passengers"
                            label="Number of Passengers"
                            type="number"
                            placeholder="e.g. 5"
                        />
                        <ReuseableInput
                            className={addVehicleInputClassName}
                            control={form.control}
                            name="tonnage"
                            label="Tonnage"
                            type="number"
                            step="0.01"
                            required
                            placeholder="e.g. 970"
                        />
                    </div>

                    {/* Chassis first (required), then optional engine number and cubic capacity */}
                    <div className={threeColGridClassName}>
                        <ReuseableInput
                            className={addVehicleInputClassName}
                            control={form.control}
                            name="chassis_number"
                            label="Chassis Number"
                            type="text"
                            required
                            placeholder="e.g. KSP130-2164151"
                        />
                        <ReuseableInput
                            className={addVehicleInputClassName}
                            control={form.control}
                            name="engine_number"
                            label="Engine Number"
                            type="text"
                            placeholder="e.g. 1KR-1603484"
                        />
                        <ReuseableInput
                            className={addVehicleInputClassName}
                            control={form.control}
                            name="cubic_capacity"
                            label="Cubic Capacity"
                            type="number"
                            placeholder="e.g. 990"
                        />
                    </div>

                    <DialogFooter className="gap-3 sm:gap-4">
                        <Button
                            type="button"
                            className="w-full rounded-full border border-[#C20C0C] bg-transparent text-[#C20C0C] hover:bg-[#C20C0C]/10 sm:w-auto"
                            onClick={() => onOpenChange(false)}
                            disabled={addVehicleMutation.isPending}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="w-full rounded-full bg-[#C20C0C]/90 text-sm hover:bg-[#C20C0C] sm:w-auto"
                            loading={addVehicleMutation.isPending}
                            disabled={addVehicleMutation.isPending}>
                            Save and continue
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
