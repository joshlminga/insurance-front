/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button, ReusableDropdown, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { InvoicePaymentSchema } from '@/types/form-schema'
import type { InvoicePaymentFormValues } from '@/types/schema'
import type { CustomerVerificationDetailsProps, SubmitResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle, Eye, Mail, Share2 } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

export const InvoicePayment: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const form = useForm<
        z.input<typeof InvoicePaymentSchema>,
        any,
        InvoicePaymentFormValues
    >({
        resolver: zodResolver(InvoicePaymentSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            covering: "",
            provider: "",
            cover_start_date: "",
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
        submitMutation.mutate(data)
    }
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto bg-transparent">
            <div className='items-center justify-center border p-3 sm:p-4'>
                <div className="w-full py-3">
                    <h1 className="text-xl sm:text-2xl font-bold leading-none mb-4">Process Invoice & Payment</h1>
                </div>
                <Separator className='my-4' />
                
                {/* Form Fields Grid - 1 col mobile, 2 col sm, 3 col lg */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
                    <ReuseableInput
                       className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="name"
                        label="Customer Name"
                    />
                    <ReuseableInput
                       className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="email"
                        label="Email Address"
                    />
                    <ReuseableInput
                       className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="phone"
                        label="Phone Number"
                    />
                    <ReuseableInput
                       className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="covering"
                        label="Covering"
                    />
                    <ReuseableInput
                       className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="provider"
                        label="Provider"
                    />
                    <ReuseableInput
                       className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        type='date'
                        name="cover_start_date"
                        label="Cover Start Date"
                    />
                </div>
            </div>
            
            {/* Navigation Buttons - stack on mobile, row on sm+ */}
            <CardFooter className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-3 px-0">
                <Button
                    type="button"
                    className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                    leftIcon={<ArrowLeftCircle />}
                    onClick={() => goToPrevStep?.()}>
                    Previous
                </Button>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <ReusableDropdown
                        trigger={
                            <Button
                                className="w-full sm:w-auto bg-[#0CC258] hover:bg-[#0CC258]/80">
                                Generate Invoice
                            </Button>
                        }
                        items={[
                            {
                                label: "WhatsApp",
                                icon: <Share2 className="w-4 h-4" />,
                            },
                            {
                                label: "Email",
                                icon: <Mail className="w-4 h-4" />,
                            },
                            {
                                label: "View Online",
                                icon: <Eye className="w-4 h-4" />,
                            },
                            {
                                label: "Select All",
                                icon: <Eye className="w-4 h-4" />,
                            },
                        ]} />
                    <Button
                        type="button"
                        className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                        rightIcon={<ArrowRightCircle />}
                        onClick={() => goToNextStep?.()}
                    >
                        Complete Payment
                    </Button>
                </div>
            </CardFooter>
        </form>
    )
}
