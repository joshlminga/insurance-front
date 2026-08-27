/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
    Button, 
    ReusableCoveringInputMultiselect, 
    ReuseableInput, 
    ReuseableSingleSelectclassInput 
} from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { CreateVehicleUsesSchema } from '@/types/form-schema'
import { CreateVehicleUsesFormValues } from '@/types/schema'
import { SubmitResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

export const EditVehicleUseModal = ({ handleDialogContextSwitch, componentProps }: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {

    const vehicleUseData = componentProps?.data ?? {}

    const defaultClassValue =
        vehicleUseData?.cover_for?.id ??
        vehicleUseData?.class?.id ??
        vehicleUseData?.class_id ??
        vehicleUseData?.parent_id

    const defaultCoveringValue = Array.isArray(vehicleUseData?.covering)
        ? vehicleUseData.covering.map((item: any) => String(item?.id ?? item))
        : Array.isArray(vehicleUseData?.coverings)
            ? vehicleUseData.coverings.map((item: any) => String(item?.id ?? item))
            : []

    const form = useForm<CreateVehicleUsesFormValues>({
        resolver: zodResolver(CreateVehicleUsesSchema),
        defaultValues: {
            name: vehicleUseData?.name ?? "",
            class: defaultClassValue ? String(defaultClassValue) : undefined,
            covering: defaultCoveringValue,
            description: vehicleUseData?.meta?.description ?? vehicleUseData?.description ?? "",
        },
    })

    const submitMutation = UseApiMutation<SubmitResponse, CreateVehicleUsesFormValues>({
        url: `motor/vehicle-use/${componentProps?.data?.id}`,
        method: EMETHODS.PATCH,
        mutationOptions: {
            onSuccess: (data) => {
                ShowToast.success(data.message || "Submitted successfully!")
                form.reset()
                componentProps?.refetch?.()
                handleDialogContextSwitch({ refetch: true })
            },
            onError: (error: unknown) => {
                const message = extractErrorMessage(error)
                ShowToast.error(message || "Submission failed!")
            },
        },
    })
    const onSubmit = (data: CreateVehicleUsesFormValues) => {
        submitMutation.mutate(data)
    }

    return (
        <div className="w-full min-w-150 max-w-150 p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">
                    Edit Vehicle Uses
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details below to edit a Vehicle Uses.
                </p>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <ReuseableInput
                    control={form.control}
                    name="name"
                    label="Vehicle Use Name"
                   className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="description"
                    type="textarea"
                    label="Vehicle Use Description"
                   className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                />
                <Controller
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                        <ReuseableSingleSelectclassInput
                            label="Class"
                            required
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <Controller
                    control={form.control}
                    name="covering"
                    render={({ field }) => (
                        <ReusableCoveringInputMultiselect
                            label="Covering"
                            required
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2 px-0">
                    <Button
                        type="button"
                        className="w-full sm:w-auto rounded-sm border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                        onClick={() => handleDialogContextSwitch({})}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-sm hover:bg-[#C20C0C]"
                        loading={submitMutation.isPending}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    )
}
