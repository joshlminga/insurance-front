/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
    Button, 
    ReuseableInput 
} from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { CreateCoverTypeSchema } from '@/types/form-schema'
import { CreateCoverTypeFormValues } from '@/types/schema'
import { SubmitResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

export const EditCoverTypesModal = ({ handleDialogContextSwitch, componentProps }: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {
    const form = useForm<CreateCoverTypeFormValues>({
        resolver: zodResolver(CreateCoverTypeSchema),
        defaultValues: {
            name: componentProps?.data?.name ?? "",
            description: componentProps?.data?.meta?.description ?? "",
        },
    })

    const submitMutation = UseApiMutation<SubmitResponse, CreateCoverTypeFormValues>({
        url: `motor/cover-type/${componentProps?.data?.id}`,
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
                ShowToast.error(message || "Update failed!")
            },
        },
    })
    const onSubmit = (data: CreateCoverTypeFormValues) => {
        submitMutation.mutate(data)
    }

    return (
        <div className="w-full min-w-[600px] max-w-[600px] p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">
                    Edit Cover Type
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details below to register a new motor product.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <ReuseableInput
                    control={form.control}
                    name="name"
                    label="Cover type Name"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="description"
                    type="textarea"
                    label="Cover Description"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
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
