/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Button, ReusableSelect, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { CreateMotorDetailedBenefitsSchema } from '@/types/form-schema'
import { CreateMotorDetailedBenefitsFormValues } from '@/types/schema'
import { SubmitResponse } from '@/types/types'
import { EMETHODS, MOTORDETAILEDBENEFITSGROUPTYPES, MOTORDETAILEDBENEFITSREFERENCETYPES } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

export const CreateDetailedBenefitsModal = ({ handleDialogContextSwitch, componentProps }: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {

    const form = useForm<CreateMotorDetailedBenefitsFormValues>({
        resolver: zodResolver(CreateMotorDetailedBenefitsSchema),
        defaultValues: {
            name: "",
            short_name: "",
            group: "",
            reference: "",
            description: "",
        },
    })

    const submitMutation = UseApiMutation<SubmitResponse, CreateMotorDetailedBenefitsFormValues>({
        url: "motor/detail-benefit",
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
    const onSubmit = (data: CreateMotorDetailedBenefitsFormValues) => {
        submitMutation.mutate(data)
    }

    return (
        <div className="w-full min-w-[600px] max-w-[600px] p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">
                    Motor Detailed Benefits
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details below to register a motor Detailed benefits.
                </p>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <ReuseableInput
                    control={form.control}
                    name="name"
                    label="Detailed Benefit Name"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                 <ReuseableInput
                    control={form.control}
                    name="short_name"
                    label="Detailed Benefit Short Name (Optional)"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReusableSelect
                    name='group'
                    control={form.control}
                    label='Group'
                    options={MOTORDETAILEDBENEFITSGROUPTYPES}
                />
                <ReusableSelect
                    name='reference'
                    control={form.control}
                    label='Reference'
                    options={MOTORDETAILEDBENEFITSREFERENCETYPES}
                />
                <ReuseableInput
                    control={form.control}
                    name="description"
                    type="textarea"
                    label="Detailed Benefit Description"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 mt-2 px-0">
                    <Button
                        type="button"
                        className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                        onClick={() => handleDialogContextSwitch({})}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                        loading={submitMutation.isPending}>
                        Save
                    </Button>
                </CardFooter>
            </form>
        </div>
    )
}
