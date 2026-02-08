/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Button, ReuseableRadioChoiceGroup } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { VehicleDetailsSchema } from '@/types/form-schema'
import type { VehicleFormValues } from '@/types/schema'
import type { CustomerVerificationDetailsProps, SubmitResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { EPAYMENTTABS } from '@/utils/steps-config'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'

export const PaymentOptions: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
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
        url: '',
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
                <div className='items-center justify-center p-4'>
                    <div className="w-full py-3">
                        <h6 className='text-lg font-bold'>Please Select Your Preferred Payment Option</h6>
                    </div>
                    <ReuseableRadioChoiceGroup
                        variant="tabs"
                        layout="horizontal"
                        activeColor="#D3EDFF"
                        selectorPosition="left"
                        showSelector={true}
                        defaultValue="mpesa"
                        items={EPAYMENTTABS}
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
                        Submit
                    </Button>
                </CardFooter>
            </form>
        </FormProvider>
    )
}
