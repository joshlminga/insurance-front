/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
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

export const KycInfo: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const form = useForm<KycFormValues>({
        resolver: zodResolver(KycSchema),
        defaultValues: {
            passport_number: "",
            tax_number: "",
            chassis_number: "",
            engine_number: "",
            total_seats: "",
            tonage_capacity: "",
            log_book_attachment: "",
            tax_certificate: "",
            passport_attachment: "",
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
            <div className='items-center justify-center border p-4'>
                <div className="w-full py-3">
                    <h1 className="text-2xl font-bold leading-none mb-4">KYC Info</h1>
                </div>
                <hr />
                <div className='grid grid-cols-3 gap-5'>
                    <ReuseableInput
                        className="h-[51px] rounded-[5px] border border-[#ADABAB] justify-self-start"
                        control={form.control}
                        name="passport_number"
                        label="Passport/ID Number"
                    />
                    <ReuseableInput
                        className="h-[51px] rounded-[5px] border border-[#ADABAB] justify-self-start"
                        control={form.control}
                        name="tax_number"
                        label="Personal Tax Number"
                    />
                    <ReuseableInput
                        className="h-[51px] rounded-[5px] border border-[#ADABAB] justify-self-start"
                        control={form.control}
                        name="chassis_number"
                        label="Vehicle Chassis Number"
                    />
                     <ReuseableInput
                        className="h-[51px] rounded-[5px] border border-[#ADABAB] justify-self-start"
                        control={form.control}
                        name="engine_number"
                        label="Vehicle Engine Number"
                    />
                     <ReuseableInput
                        className="h-[51px] rounded-[5px] border border-[#ADABAB] justify-self-start"
                        control={form.control}
                        name="total_seats"
                        label="Vehicle Total Seat Number"
                    />
                </div>

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
    )
}
