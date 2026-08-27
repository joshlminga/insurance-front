/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
    Button, 
    ReusableSelect, 
    ReuseableInput 
} from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { CreateMotorAddonBenefitsSchema } from '@/types/form-schema'
import { CreateMotorAddonBenefitsFormValues } from '@/types/schema'
import { SubmitResponse } from '@/types/types'
import { 
    EMETHODS, 
    MOTORADDONSBENEFITS 
} from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

export const CreateMotorAddonBenefitsModal = ({ handleDialogContextSwitch, componentProps }: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {
    const form = useForm<CreateMotorAddonBenefitsFormValues>({
        resolver: zodResolver(CreateMotorAddonBenefitsSchema),
        defaultValues: {
            name: "",
            description: "",
            group: "",
        },
    })

    const submitMutation = UseApiMutation<SubmitResponse, CreateMotorAddonBenefitsFormValues>({
        url: "motor/addon-benefit",
        method: EMETHODS.POST,
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
    const onSubmit = (data: CreateMotorAddonBenefitsFormValues) => {
        submitMutation.mutate(data)
    }

    return (
        <div className="w-full min-w-150 max-w-150 p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">
                    Motor AddOn Benefits
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details below to register a motor addon benefits.
                </p>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <ReuseableInput
                    control={form.control}
                    name="name"
                    label="AddOn Name"
                    className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="description"
                    type="textarea"
                    label="AddOn Description"
                    className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                />
                <ReusableSelect
                    control={form.control}
                    name="group"
                    label="Group"
                    options={MOTORADDONSBENEFITS}
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
                        Save
                    </Button>
                </div>
            </form>
        </div>
    )
}
