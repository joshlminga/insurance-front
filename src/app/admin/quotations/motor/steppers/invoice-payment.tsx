/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Button, ReuseableInput } from '@/dev/core'
import { refreshMotorPurchaseSummary } from '@/app/customer/motor/motor-purchase-query'
import { UseApiMutation } from '@/hooks/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { InvoicePaymentSchema } from '@/types/form-schema'
import type { InvoicePaymentFormValues } from '@/types/schema'
import type { BoxHeaderProps, SubmitResponse } from '@/types/types'
import { EMETHODS, INVOICE_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { AdminMotorStepProps } from '../admin-step-props'
import { readAdminMotorCustomerContact } from '../admin-motor-session'

const getTodayDateString = () => new Date().toISOString().split("T")[0]

const readSessionValue = (key: string) => {
    if (typeof window === "undefined") return null
    return sessionStorage.getItem(key)
}

const BoxHeader = ({ title, description }: BoxHeaderProps) => (
    <div className="flex flex-col gap-0.5 pb-3">
        <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
        {description ? (
            <p className="text-xs text-muted-foreground sm:text-sm">
                {description}
            </p>
        ) : null}
    </div>
)

export const AdminMotorInvoicePayment: React.FC<AdminMotorStepProps> = ({
    goToNextStep,
    goToPrevStep,
    defaultCustomerContact,
}) => {
    const queryClient = useQueryClient()
    const contact = defaultCustomerContact ?? readAdminMotorCustomerContact()
    const [purchaseSessionId] = useState(() => readSessionValue(INVOICE_SESSION_STORAGE_KEY))
    const todayMinDate = getTodayDateString()

    const form = useForm<InvoicePaymentFormValues>({
        resolver: zodResolver(InvoicePaymentSchema),
        defaultValues: {
            name: contact.name ?? "",
            email: contact.email ?? "",
            phone: contact.phone ?? "",
            cover_start_date: "",
            cover_end_date: "",
            policy_number: "",
            payment_plan: "Full",
        },

    })

    const coverStartDate = form.watch("cover_start_date")

    const submitMutation = UseApiMutation<SubmitResponse, InvoicePaymentFormValues>({
        url: `purchase/motor/${purchaseSessionId}/invoice`,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: async (data) => {
                if (purchaseSessionId) {
                    await refreshMotorPurchaseSummary(queryClient, purchaseSessionId)
                }
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
        const payload: InvoicePaymentFormValues = { ...data }
        if (!payload.cover_end_date?.trim()) {
            delete payload.cover_end_date
        }
        if (!payload.policy_number?.trim()) {
            delete payload.policy_number
        }
        submitMutation.mutate(payload)
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto bg-transparent">
            <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6">
                <div className="w-full pb-2">
                    <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                        Process Invoice & <span className="text-[#C20C0C]">Payment</span>
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                        Please fill in the details of the person who will be paying for the insurance.
                    </p>
                </div>

                <div className="mt-5 space-y-5">
                    <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5">
                        <BoxHeader
                            title="Payee Details"
                            description="Enter the contact information for the person paying for this cover."
                        />
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
                            <ReuseableInput
                                className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                name="name"
                                label="Payee Name"
                                placeholder=""
                                required
                            />
                            <ReuseableInput
                                className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                name="email"
                                label="Payee Email Address"
                                placeholder="abc@example.com"
                                required
                            />
                            <ReuseableInput
                                className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                name="phone"
                                label="Payee Phone Number"
                                placeholder="07XXXXXXXX"
                                required
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5">
                        <BoxHeader
                            title="Cover & Policy"
                            description="Set cover dates and optionally reuse an existing policy number (admin only)."
                        />
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
                            <ReuseableInput
                                className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                type='date'
                                name="cover_start_date"
                                label="Cover Start Date"
                                placeholder="DD/MM/YYYY"
                                required
                                min={todayMinDate}
                            />
                            <ReuseableInput
                                className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                type='date'
                                name="cover_end_date"
                                label="Cover End Date (optional)"
                                placeholder="DD/MM/YYYY"
                                min={coverStartDate || todayMinDate}
                            />
                            <ReuseableInput
                                className="w-full h-10 rounded-[5px] border-2 border-[#C20C0C]"
                                control={form.control}
                                name="policy_number"
                                label="Policy Number (optional)"
                                placeholder="Leave blank to auto-allocate"
                            />
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
                            A custom cover end date limits this purchase to full payment only. Max cover is 12 months from the start date.
                        </p>
                    </div>
                </div>
            </div>
            <CardFooter className="mt-4 w-full flex flex-col gap-3 px-0 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    type="button"
                    className="w-full rounded-full border border-[#C20C0C] bg-transparent text-[#C20C0C] hover:bg-[#C20C0C]/10 sm:w-auto"
                    leftIcon={<ArrowLeftCircle />}
                    onClick={() => goToPrevStep?.()}>
                    Previous
                </Button>

                <Button
                    type="submit"
                    className="w-full rounded-full bg-[#C20C0C]/90 hover:bg-[#C20C0C] sm:w-auto"
                    rightIcon={<ArrowRightCircle />}
                    loading={submitMutation.isPending}>
                    Complete Payment
                </Button>
            </CardFooter>
        </form>
    )
}
