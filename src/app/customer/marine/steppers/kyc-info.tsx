/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { KycSchema } from '@/types/form-schema'
import type { KycFormValues } from '@/types/schema'
import type { CustomerVerificationDetailsProps, SubmitResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import z from 'zod'

export const KycInfo: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const form = useForm<
        z.input<typeof KycSchema>,
        any,
        KycFormValues
    >({
        resolver: zodResolver(KycSchema),
        defaultValues: {
            nationality_id: "",
            id_type: "",
            id_number: "",
            tax_pin: "",
            color: "",
            chassis_number: "",
            engine_cc: "",
            engine_number: "",
            total_seats: "",
            tonage_capacity: "",
            logbook: undefined,
            tax_certificate: undefined,
            id_document: undefined,
        },

    })
    const submitMutation = UseApiMutation<SubmitResponse, KycFormValues>({
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

    const onSubmit = (data: KycFormValues) => {
        submitMutation.mutate(data)
    }
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto bg-transparent">
            <div className='items-center justify-center border p-3 sm:p-4'>
                <div className="w-full py-3">
                    <h1 className="text-xl sm:text-2xl font-bold leading-none mb-4">KYC Info</h1>
                </div>
                <Separator className='my-4' />
                
                {/* Personal & Vehicle Info - 1 col mobile, 2 col sm, 3 col lg */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
                    <ReuseableInput
                       className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="id_number"
                        label="Passport/ID Number"
                    />
                    <ReuseableInput
                       className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="tax_pin"
                        label="Personal Tax Number"
                    />
                    <ReuseableInput
                       className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="chassis_number"
                        label="Vehicle Chassis Number"
                    />
                    <ReuseableInput
                       className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="engine_number"
                        label="Vehicle Engine Number"
                    />
                    <ReuseableInput
                       className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="total_seats"
                        label="Vehicle Total Seat Number"
                    />
                    <ReuseableInput
                       className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        type='number'
                        name="tonage_capacity"
                        label="Vehicle Tonage Capacity"
                    />
                </div>
                
                <Separator className='my-4' />
                
                {/* File Attachments - 1 col mobile, 2 col sm, 3 col lg */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
                    <ReuseableInput
                       className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        type='file'
                        name="logbook"
                        label="Attach Logbook"
                    />
                    <ReuseableInput
                       className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        type='file'
                        name="tax_certificate"
                        label="Attach Tax Certificate"
                    />
                    <ReuseableInput
                        className="w-full h-[51px] rounded-[5px] border border-[#ADABAB] sm:col-span-2 lg:col-span-1"
                        control={form.control}
                        type='file'
                        name="id_document"
                        label="Attach ID/Passport"
                    />
                </div>
            </div>
            
            {/* Navigation Buttons - stack on mobile */}
            <CardFooter className="w-full flex flex-col sm:flex-row justify-between gap-3 mt-3 px-0">
                <Button
                    type="button"
                    className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                    leftIcon={<ArrowLeftCircle />}
                    onClick={() => goToPrevStep?.()}>
                    Previous
                </Button>
                <Button
                    type="button"
                    className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                    rightIcon={<ArrowRightCircle />}
                    onClick={form.handleSubmit(onSubmit)}>
                    Next
                </Button>
            </CardFooter>
        </form>
    )
}
