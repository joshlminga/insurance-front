/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ReusableTabs } from '@/dev/core'
import React, { useState } from 'react'
import { EMOTORTABS } from '@/utils/enums'
import type { CustomerVerificationDetailsProps, SubmitResponse, TTabItem } from '@/types/types'
import { CardFooter } from '@/components/ui/card'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import { useForm, FormProvider } from 'react-hook-form'
import type { VehicleFormValues } from '@/types/schema'
import { UseApiMutation } from '@/hooks/hooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { VehicleDetailsSchema } from '@/types/form-schema'
import { EMETHODS } from '@/utils/constatnts'
import { ShowToast } from '@/utils/utils'

export const VehicleDetailsPage: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const [current_tab, setCurrent_Tab] = useState<TTabItem>();
    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(VehicleDetailsSchema),
        defaultValues: {
            registration_number: "",
            vehicle_model: "",
            vehicle_make: "",
            yom: "",
            insurance_type: "",
        },
    })

    const submitMutation = UseApiMutation<SubmitResponse, VehicleFormValues>({
        url: `vehicle/details/${current_tab}`,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                goToNextStep?.()
                ShowToast.success(data.message || "Submitted successfully!")
            },
            onError: (error: any) => {
                ShowToast.error(
                    error.response?.data?.message ||
                    error.message ||
                    "Submission failed!"
                )
            },
        },
    })

    const onSubmit = (data: VehicleFormValues) => {
        submitMutation.mutate(data)
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto bg-transparent">
                <div className='items-center justify-center border p-4'>
                    <div className="w-full py-3">
                        <h1 className="text-3xl font-bold leading-none mb-4">Proceed to add your <span className='text-[#C20C0C]'>Vehicle Details</span></h1>
                        <h6 className='text-lg font-bold'>Select type of cover</h6>
                    </div>
                    <ReusableTabs
                        tabs={EMOTORTABS}
                        form={form}
                    />
                </div>
                <CardFooter className="w-full md:col-span-2 flex justify-between mt-3 px-0">
                    <Button
                        type="button"
                        className="rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                        leftIcon={<ArrowLeftCircle />}
                        onClick={() => goToPrevStep?.()}>
                        Previous
                    </Button>
                    <Button
                        type="button"
                        className="bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                        rightIcon={<ArrowRightCircle />}
                        onClick={() => goToNextStep?.()}
                    // loading={submitMutation.isPending}
                    >
                        Next
                    </Button>
                </CardFooter>
            </form>
        </FormProvider>
    )
}
