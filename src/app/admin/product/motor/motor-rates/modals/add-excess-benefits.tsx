/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Button, ReusableSelect, ReusableSingleSelectApiInput, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { CreateMotorRateExcessBenefitsSchema } from '@/types/form-schema'
import { CreateMotorRateExcessBenefitsFormValues } from '@/types/schema'
import { SubmitResponse } from '@/types/types'
import { DETAILEDTYPESOPTIONS, EMETHODS, HIGHLIGHTOPTIONS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

export const AddMotorRateExcessBenefits = ({ handleDialogContextSwitch, componentProps }: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {

    const form = useForm<CreateMotorRateExcessBenefitsFormValues>({
        resolver: zodResolver(CreateMotorRateExcessBenefitsSchema),
        defaultValues: {
            detail_benefit_id: "",
            detail_type: "",
            key: "",
            value: "",
            detail_highlight: 'false',
            product_rate_id: "",
        },
    })

    const submitMutation = UseApiMutation<SubmitResponse, CreateMotorRateExcessBenefitsFormValues>({
        url: `products/motor/rate-details/${componentProps?.data?.id}`,
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

    const onSubmit = (data: CreateMotorRateExcessBenefitsFormValues) => {
        submitMutation.mutate(data)
    }

    return (
        <div className="w-full min-w-150 max-w-200 p-6 space-y-4">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">
                    Add Excess Benefits
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details below to register a Excess Benefits.
                </p>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <Controller
                    control={form.control}
                    name="detail_benefit_id"
                    render={({ field }) => (
                        <div>
                            <ReusableSingleSelectApiInput
                                url="motor/detail-benefit"
                                value={field.value}
                                onChange={field.onChange}
                                label="Detailed Benefit"
                                required
                                placeholder="Select Detailed Benefit..."
                                className={form.formState.errors.detail_benefit_id ? "**:data-[slot=select-trigger]:border-red-500 **:data-[slot=select-trigger]:focus-visible:ring-red-500" : ""}
                            />
                            {form.formState.errors.detail_benefit_id?.message && (
                                <p className="text-red-500 text-sm mt-1">
                                    {String(form.formState.errors.detail_benefit_id.message)}
                                </p>
                            )}
                        </div>
                    )}
                />
                <ReusableSelect
                    control={form.control}
                    name="detail_type"
                    label="Detail Types"
                    options={DETAILEDTYPESOPTIONS}
                />
                <ReuseableInput
                    control={form.control}
                    name="value"
                    label="Title"
                    className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="key"
                    label="description"
                    type='textarea'
                    rows={3}
                    className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                />
                <ReusableSelect
                    control={form.control}
                    name="detail_highlight"
                    label="Highlight"
                    options={HIGHLIGHTOPTIONS}
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
                        Save Changes
                    </Button>
                </CardFooter>
            </form>

        </div>
    )
}
