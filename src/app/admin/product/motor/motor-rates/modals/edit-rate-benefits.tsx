/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Button, ReusableSelect, ReusableSingleSelectApiInput, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { CreateMotorRateBenefitsSchema } from '@/types/form-schema'
import { CreateMotorRateBenefitsFormValues, CreateMotorRateBenefitsInputValues } from '@/types/schema'
import { SubmitResponse } from '@/types/types'
import { BENEFITTYPESOPTIONS, EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

export const EditMotorRateBenefits = ({ handleDialogContextSwitch, componentProps }: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {

    const form = useForm<CreateMotorRateBenefitsInputValues, any, CreateMotorRateBenefitsFormValues>({
        resolver: zodResolver(CreateMotorRateBenefitsSchema),
        defaultValues: {
            benefit_id: String(componentProps?.data?.benefit_id ?? ""),
            rate: componentProps?.data?.rate ?? "",
            minimum: componentProps?.data?.minimum ?? "",
            benefit_type: componentProps?.data?.benefit_type ?? "",
            description: componentProps?.data?.description ?? "",
            // start_date: componentProps?.data?.start_date ?? "",
            // expiry_date: componentProps?.data?.expiry_date ??  "",
        },
    })

    const submitMutation = UseApiMutation<SubmitResponse, CreateMotorRateBenefitsFormValues>({
        url: `products/motor/rate-benefits/${componentProps?.data?.id}`,
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
    const onSubmit = (data: CreateMotorRateBenefitsFormValues) => {
        submitMutation.mutate(data)
    }

    return (
        <div className="w-full min-w-[600px] max-w-[800px] p-6 space-y-4">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">
                    Edit Optional Benefits
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details below to register a Optional Benefits.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <Controller
                    control={form.control}
                    name="benefit_id"
                    render={({ field }) => (
                        <div>
                            <ReusableSingleSelectApiInput
                                url="motor/addon-benefit"
                                value={field.value}
                                onChange={field.onChange}
                                label="Addon Benefit"
                                required
                                placeholder="Select Addon Benefit..."
                                className={form.formState.errors.benefit_id ? "**:data-[slot=select-trigger]:border-red-500 **:data-[slot=select-trigger]:focus-visible:ring-red-500" : ""}
                            />
                            {form.formState.errors.benefit_id?.message && (
                                <p className="text-red-500 text-sm mt-1">
                                    {String(form.formState.errors.benefit_id.message)}
                                </p>
                            )}
                        </div>
                    )}
                />
                <ReusableSelect
                    control={form.control}
                    name="benefit_type"
                    label="Benefit Types"
                    options={BENEFITTYPESOPTIONS}
                />
                <ReuseableInput
                    control={form.control}
                    name="rate"
                    label="Rate"
                    type="number"
                    step="0.01"
                    required
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="minimum"
                    label="Minimum"
                     type="number"
                    step="0.01"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="description"
                    label="description"
                    type='textarea'
                    // rows={3}
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                {/* <ReuseableInput
                    control={form.control}
                    name="start_date"
                    label="Start Date"
                    type="date"
                    required
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="expiry_date"
                    label="Expiry Date"
                    type="date"
                    required
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                /> */}
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
