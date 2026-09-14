/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { DmvicValidationOverrideDialog } from '@/components/shared'
import { Button, ReuseableInput } from '@/dev/core'
import {
    MOTOR_PURCHASE_URLS,
    motorPurchaseSummaryQueryOptions,
    refreshMotorPurchaseSummary,
    type MotorPurchaseSummaryData,
} from '@/app/customer/motor/motor-purchase-query'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { InvoicePaymentSchema } from '@/types/form-schema'
import type { InvoicePaymentFormValues } from '@/types/schema'
import type { CustomerVerificationDetailsProps, SubmitResponse } from '@/types/types'
import { EMETHODS, INVOICE_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { validateDoubleInsurancePreflight } from '@/utils/dmvic-double-insurance'
import { extractErrorMessage, getDmvicValidationOverrideError } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

type BoxHeaderProps = {
    title: string
    description?: string
}

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

export const InvoicePayment: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const queryClient = useQueryClient()
    const [purchaseSessionId] = useState(() => readSessionValue(INVOICE_SESSION_STORAGE_KEY))
    const todayMinDate = getTodayDateString()
    const [overrideDialogOpen, setOverrideDialogOpen] = useState(false)
    const [overrideMessages, setOverrideMessages] = useState<string[]>([])
    const [pendingOverridePayload, setPendingOverridePayload] =
        useState<InvoicePaymentFormValues | null>(null)
    // Separate loading flag so preflight + invoice submit don't stack confusing spinners
    const [isPreflightPending, setIsPreflightPending] = useState(false)

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

    // Need plate/chassis for the double-insurance preflight (not stored on this form)
    const { data: summaryResponse } = UseApiQuery<SubmitResponse>({
        url: purchaseSessionId ? MOTOR_PURCHASE_URLS.summary(purchaseSessionId) : '',
        queryOptions: {
            enabled: Boolean(purchaseSessionId),
            retry: 1,
            ...motorPurchaseSummaryQueryOptions,
        },
    })

    const summary = summaryResponse?.data as MotorPurchaseSummaryData | undefined

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

    const onSubmit = async (data: InvoicePaymentFormValues) => {
        const payload: InvoicePaymentFormValues = { ...data }
        // Strip override flags on first submit; popup retry adds them back
        delete payload.validate_double_insurance
        delete payload.is_logbook_verified
        delete payload.additional_comments

        const registration =
            summary?.vehicle?.registration_number
            ?? summary?.kyc?.vehicle_registration_number
            ?? null
        const chassis =
            summary?.vehicle?.chassis_number
            ?? summary?.kyc?.chassis_number
            ?? null

        setIsPreflightPending(true)
        try {
            // 1) Double insurance (dates only) — separate HTTP call to avoid PHP timeout with Type A/C
            const preflight = await validateDoubleInsurancePreflight({
                coverStartDate: data.cover_start_date,
                vehicleRegistrationNumber: registration,
                chassisNumber: chassis,
            })

            if (!preflight.clear) {
                if (preflight.suggestedCoverStartDate) {
                    form.setValue('cover_start_date', preflight.suggestedCoverStartDate, {
                        shouldValidate: true,
                        shouldDirty: true,
                    })
                }
                form.setError('cover_start_date', {
                    type: 'manual',
                    message: preflight.message,
                })
                ShowToast.error(preflight.message)
                return
            }

            // 2) Invoice submit runs Type A/C validate on the server
            setPendingOverridePayload(payload)
            submitMutation.mutate(payload)
        } catch (error: any) {
            const message = extractErrorMessage(error)
            ShowToast.error(message || "Double insurance check failed!")
        } finally {
            setIsPreflightPending(false)
        }
    }

    const onConfirmOverride = (values: {
        is_logbook_verified: true
        additional_comments: string
    }) => {
        const base = pendingOverridePayload ?? form.getValues()
        submitMutation.mutate({
            ...base,
            validate_double_insurance: true,
            is_logbook_verified: values.is_logbook_verified,
            additional_comments: values.additional_comments,
        })
    }

    const isSubmitting = isPreflightPending || submitMutation.isPending

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
                                description="Enter the contact information and preferred cover start date."
                            />
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5'>
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
                            </div>
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
                        loading={isSubmitting}>
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
