/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { InvoicePaymentSchema } from '@/types/form-schema'
import type { InvoicePaymentFormValues } from '@/types/schema'
import type { CustomerVerificationDetailsProps, SubmitResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'

export const InvoicePayment: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const form = useForm<InvoicePaymentFormValues>({
        resolver: zodResolver(InvoicePaymentSchema),
        defaultValues: {
            customer_name: "",
            email: "",
            phone_number: "",
            covering: "",
            provider: "",
            cover_startdate: "",
            total_payable: "",
        },

    })
    const submitMutation = UseApiMutation<SubmitResponse, InvoicePaymentFormValues>({
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

    const onSubmit = (data: InvoicePaymentFormValues) => {
        console.log(data);

        submitMutation.mutate(data)
    }
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto bg-transparent">
            <div className='items-center justify-center border p-4'>
                <div className="w-full py-3">
                    <h1 className="text-2xl font-bold leading-none mb-4">Process Invoice & Payment</h1>
                </div>
                <Separator className='my-4' />
                <div className='grid grid-cols-3 gap-5'>
                    <ReuseableInput
                        className="h-[51px] rounded-[5px] border border-[#ADABAB] justify-self-start"
                        control={form.control}
                        name="customer_name"
                        label="Customer Name"
                    />
                    <ReuseableInput
                        className="h-[51px] rounded-[5px] border border-[#ADABAB] justify-self-start"
                        control={form.control}
                        name="email"
                        label="Email Address"
                    />
                    <ReuseableInput
                        className="h-[51px] rounded-[5px] border border-[#ADABAB] justify-self-start"
                        control={form.control}
                        name="phone_number"
                        label="Phone Number"
                    />
                    <ReuseableInput
                        className="h-[51px] rounded-[5px] border border-[#ADABAB] justify-self-start"
                        control={form.control}
                        name="covering"
                        label="Covering"
                    />
                    <ReuseableInput
                        className="h-[51px] rounded-[5px] border border-[#ADABAB] justify-self-start"
                        control={form.control}
                        name="provider"
                        label="Provider"
                    />
                    <ReuseableInput
                        className="h-[51px] rounded-[5px] border border-[#ADABAB] justify-self-start"
                        control={form.control}
                        type='date'
                        name="cover_startdate"
                        label="Cover Start Date"
                    />
                    <ReuseableInput
                        className="h-[51px] rounded-[5px] border border-[#ADABAB] justify-self-start"
                        control={form.control}
                        type='number'
                        name="total_payable"
                        label="Total Payable"
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
                    loading={submitMutation.isPending}>
                    Complete Payment
                </Button>
            </CardFooter>
        </form>
    )
}
