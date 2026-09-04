/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { DmvicValidationOverrideDialog } from '@/components/shared'
import { Button, ReuseableInput } from '@/dev/core'
import {
    MOTOR_PURCHASE_URLS,
    motorPurchaseSummaryQueryOptions,
    refreshMotorPurchaseSummary,
} from '@/app/customer/motor/motor-purchase-query'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { InvoicePaymentSchema } from '@/types/form-schema'
import type { InvoicePaymentFormValues } from '@/types/schema'
import type { BoxHeaderProps, SubmitResponse } from '@/types/types'
import {
    EMETHODS,
    INVOICE_SESSION_STORAGE_KEY,
    PURCHASE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import {
    extractErrorMessage,
    getDmvicValidationOverrideError,
    maxCoverEndDate,
} from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { AdminMotorStepProps } from '../admin-step-props'
import { readAdminMotorCustomerContact } from '../admin-motor-session'

const getTodayDateString = () => new Date().toISOString().split("T")[0]

const readPurchaseSessionId = () => {
    if (typeof window === "undefined") return null
    return (
        sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY)
        ?? sessionStorage.getItem(INVOICE_SESSION_STORAGE_KEY)
    )
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
    const [purchaseSessionId] = useState(() => readPurchaseSessionId())
    const todayMinDate = getTodayDateString()
    const [overrideDialogOpen, setOverrideDialogOpen] = useState(false)
    const [overrideMessages, setOverrideMessages] = useState<string[]>([])
    const [pendingOverridePayload, setPendingOverridePayload] =
        useState<InvoicePaymentFormValues | null>(null)

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
    // Max end = start + 12 months − 1 day (e.g. 18/09/2026 → 17/09/2027)
    const coverEndMaxDate = coverStartDate ? maxCoverEndDate(coverStartDate, 12) : undefined

    const { data: summaryData } = UseApiQuery<SubmitResponse>({
        url: purchaseSessionId ? MOTOR_PURCHASE_URLS.summary(purchaseSessionId) : '',
        queryOptions: {
            enabled: !!purchaseSessionId,
            retry: 1,
            ...motorPurchaseSummaryQueryOptions,
        },
    })

    React.useEffect(() => {
        const invoice = summaryData?.data?.invoice as Record<string, string | undefined> | undefined
        if (!invoice) return

        if (invoice.name) form.setValue('name', invoice.name)
        if (invoice.email) form.setValue('email', invoice.email)
        if (invoice.phone) form.setValue('phone', invoice.phone)
        if (invoice.cover_start_date) form.setValue('cover_start_date', invoice.cover_start_date)
        if (invoice.cover_end_date) form.setValue('cover_end_date', invoice.cover_end_date)
        if (invoice.policy_number) form.setValue('policy_number', invoice.policy_number)
        if (invoice.payment_plan) form.setValue('payment_plan', invoice.payment_plan)
    }, [summaryData, form])

    const submitMutation = UseApiMutation<SubmitResponse, InvoicePaymentFormValues>({
        url: `purchase/motor/${purchaseSessionId}/invoice`,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: async (data) => {
                setOverrideDialogOpen(false)
                setPendingOverridePayload(null)
                setOverrideMessages([])
                if (purchaseSessionId) {
                    await refreshMotorPurchaseSummary(queryClient, purchaseSessionId)
                }
                goToNextStep?.()
                ShowToast.success(data.message || "Submitted successfully!")
            },
            onError: (error: any) => {
                const override = getDmvicValidationOverrideError(error)
                if (override) {
                    setOverrideMessages(override.messages)
                    setOverrideDialogOpen(true)
                    return
                }
                setOverrideDialogOpen(false)
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Submission failed!")
            },
        },
    })

    const buildPayload = (data: InvoicePaymentFormValues): InvoicePaymentFormValues => {
        const payload: InvoicePaymentFormValues = { ...data }
        if (!payload.cover_end_date?.trim()) {
            delete payload.cover_end_date
        }
        if (!payload.policy_number?.trim()) {
            delete payload.policy_number
        }
        delete payload.validate_double_insurance
        return payload
    }

    const onSubmit = (data: InvoicePaymentFormValues) => {
        const payload = buildPayload(data)
        setPendingOverridePayload(payload)
        submitMutation.mutate(payload)
    }

    const onConfirmOverride = () => {
        const base = pendingOverridePayload ?? buildPayload(form.getValues())
        submitMutation.mutate({
            ...base,
            validate_double_insurance: true,
        })
    }

    return (
        <>
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
                                    max={coverEndMaxDate}
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
                                A custom cover end date defers DMVIC certificate issuance until cover is issued manually. Max cover is 12 months from the start date.
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

            <DmvicValidationOverrideDialog
                open={overrideDialogOpen}
                onOpenChange={setOverrideDialogOpen}
                messages={overrideMessages}
                onConfirm={onConfirmOverride}
                isPending={submitMutation.isPending}
            />
        </>
    )
}
