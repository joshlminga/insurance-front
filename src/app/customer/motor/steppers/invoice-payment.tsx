/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { InvoicePaymentSchema } from '@/types/form-schema'
import type { InvoicePaymentFormValues } from '@/types/schema'
import type { CustomerVerificationDetailsProps, SubmitResponse } from '@/types/types'
import { EMETHODS, INVOICE_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

export const InvoicePayment: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const [purchaseSessionId, setPurchaseSessionId] = useState<string | null>(null);
    const form = useForm<InvoicePaymentFormValues>({
        resolver: zodResolver(InvoicePaymentSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            cover_start_date: "",
            payment_plan: "Full",
        },

    })
    useEffect(() => {
        const storedPurchaseKey = String(sessionStorage.getItem(INVOICE_SESSION_STORAGE_KEY))
        if (storedPurchaseKey) {
            setPurchaseSessionId(storedPurchaseKey)
        } else {
            setPurchaseSessionId(null)
        }
    }, [])
    
    const submitMutation = UseApiMutation<SubmitResponse, InvoicePaymentFormValues>({
        url: `purchase/motor/${purchaseSessionId}/invoice`,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                goToNextStep?.()
                ShowToast.success(data.message || "Submitted successfully!")
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Submission failed!")
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
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5'>
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="name"
                        label="Customer Name"
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="email"
                        label="Email Address"
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="phone"
                        label="Phone Number"
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        type='date'
                        name="cover_start_date"
                        label="Cover Start Date"
                    />
                </div>
            </div>
            <CardFooter className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-3 px-0">
                <Button
                    type="button"
                    className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                    leftIcon={<ArrowLeftCircle />}
                    onClick={() => goToPrevStep?.()}>
                    Previous
                </Button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button
                        type="submit"
                        className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                        rightIcon={<ArrowRightCircle />}
                        loading={submitMutation.isPending}>
                        Complete Payment
                    </Button>
                </div>
            </CardFooter>
        </form>
    )
}
