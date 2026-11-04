/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DmvicValidationOverrideDialog } from '@/components/shared'
import { Button, ReusableSelect, ReuseableInput } from '@/dev/core'
import {
    MOTOR_PURCHASE_URLS,
    motorInvoiceSummaryKey,
    motorPurchaseSummaryQueryOptions,
    refreshMotorPurchaseSummary,
    type MotorPurchaseSummaryData,
} from '@/app/customer/motor/motor-purchase-query'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { useQueryClient } from '@tanstack/react-query'
import {
    InvoicePaymentSchema,
    MOTOR_ISSUE_REASON_OPTIONS,
    MOTOR_ISSUE_REASON_VALUES,
    type MotorIssueReasonValue,
} from '@/types/form-schema'
import type { InvoicePaymentFormValues } from '@/types/schema'
import type { BoxHeaderProps, SubmitResponse } from '@/types/types'
import {
    EMETHODS,
    INVOICE_SESSION_STORAGE_KEY,
    PURCHASE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import { validateDoubleInsurancePreflight } from '@/utils/dmvic-double-insurance'
import {
    extractErrorMessage,
    getDmvicValidationOverrideError,
    isDmvicPolicyExhaustedError,
    isShortMotorCover,
    maxCoverEndDate,
} from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { AdminMotorStepProps } from '../admin-step-props'
import {
    readAdminMotorCustomerContact,
    readAdminMotorTargetInvoiceId,
    isAdminMotorIssueCoverFlow,
} from '../admin-motor-session'
import {
    motorCheckboxLabelAccentClassName,
    motorCheckboxLabelClassName,
} from '../motor-field-styles'
import { cn } from '@/lib/utils'

const getTodayDateString = () => new Date().toISOString().split("T")[0]

const readPurchaseSessionId = () => {
    if (typeof window === "undefined") return null
    return (
        sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY)
        ?? sessionStorage.getItem(INVOICE_SESSION_STORAGE_KEY)
    )
}

const isMotorIssueReason = (value: unknown): value is MotorIssueReasonValue =>
    typeof value === 'string'
    && (MOTOR_ISSUE_REASON_VALUES as readonly string[]).includes(value)

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
    const [targetInvoiceId] = useState<string | null>(() => readAdminMotorTargetInvoiceId())
    const [isIssueCoverFlow] = useState(() => isAdminMotorIssueCoverFlow())
    // Ignore stale target invoice outside Issue-cover (filters summary to wrong purchase).
    const effectiveTargetInvoiceId = isIssueCoverFlow ? targetInvoiceId : null
    const useInvoiceSummary = Boolean(effectiveTargetInvoiceId)
    const todayMinDate = getTodayDateString()
    const [overrideDialogOpen, setOverrideDialogOpen] = useState(false)
    const [overrideMessages, setOverrideMessages] = useState<string[]>([])
    const [pendingOverridePayload, setPendingOverridePayload] =
        useState<InvoicePaymentFormValues | null>(null)
    const [isPreflightPending, setIsPreflightPending] = useState(false)

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
            reminders_enabled: false,
            issue_reason: "",
            other_reason: "",
        },

    })

    const coverStartDate = form.watch("cover_start_date")
    const coverEndDate = form.watch("cover_end_date")
    const issueReason = form.watch("issue_reason")
    // Max end = start + 12 months − 1 day (e.g. 18/09/2026 → 17/09/2027)
    const coverEndMaxDate = coverStartDate ? maxCoverEndDate(coverStartDate, 12) : undefined
    // Short cover (≤ 30 days): show required "Reason to Issue 1 Month"
    const showShortCoverReason = isShortMotorCover(coverStartDate, coverEndDate)

    // When cover lengthens past 30 days, clear reason fields so they are not posted
    React.useEffect(() => {
        if (showShortCoverReason) {
            return
        }
        if (form.getValues("issue_reason")) {
            form.setValue("issue_reason", "")
        }
        if (form.getValues("other_reason")) {
            form.setValue("other_reason", "")
        }
    }, [showShortCoverReason, form])

    const { data: summaryData } = UseApiQuery<SubmitResponse>({
        url: useInvoiceSummary
            ? MOTOR_PURCHASE_URLS.invoiceSummary(effectiveTargetInvoiceId!)
            : purchaseSessionId
                ? MOTOR_PURCHASE_URLS.summary(purchaseSessionId)
                : '',
        queryKey: useInvoiceSummary
            ? motorInvoiceSummaryKey(effectiveTargetInvoiceId!)
            : undefined,
        queryOptions: {
            enabled: useInvoiceSummary ? Boolean(effectiveTargetInvoiceId) : Boolean(purchaseSessionId),
            retry: 1,
            ...motorPurchaseSummaryQueryOptions,
        },
    })

    const summary = summaryData?.data as MotorPurchaseSummaryData | undefined

    React.useEffect(() => {
        const data = summaryData?.data as MotorPurchaseSummaryData | undefined
        const invoice = data?.invoice
        if (!invoice && data?.reminders_enabled === undefined) return

        if (invoice?.name) form.setValue('name', invoice.name)
        if (invoice?.email) form.setValue('email', invoice.email)
        if (invoice?.phone) form.setValue('phone', invoice.phone)
        if (invoice?.cover_start_date) form.setValue('cover_start_date', invoice.cover_start_date)
        if (invoice?.cover_end_date) form.setValue('cover_end_date', invoice.cover_end_date)
        if (invoice?.policy_number) form.setValue('policy_number', invoice.policy_number)
        if (invoice?.payment_plan) form.setValue('payment_plan', invoice.payment_plan)

        // Prefill reminders + short-cover reason from summary root or invoice
        const remindersEnabled = data?.reminders_enabled ?? invoice?.reminders_enabled
        if (typeof remindersEnabled === 'boolean') {
            form.setValue('reminders_enabled', remindersEnabled)
        }

        const reason = data?.issue_reason ?? invoice?.issue_reason
        if (isMotorIssueReason(reason)) {
            form.setValue('issue_reason', reason)
        }

        const otherReason = data?.other_reason ?? invoice?.other_reason
        if (typeof otherReason === 'string' && otherReason.trim()) {
            form.setValue('other_reason', otherReason)
        }
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

                // Policy sequence exhausted: toast above + highlight Policy Number so admin can enter one
                if (isDmvicPolicyExhaustedError(error)) {
                    form.setError("policy_number", {
                        type: "manual",
                        message:
                            message
                            || "System has exhausted Policy number, kindly enter manually",
                    })
                }
            },
        },
    })

    const buildPayload = (data: InvoicePaymentFormValues): InvoicePaymentFormValues => {
        const payload: InvoicePaymentFormValues = {
            ...data,
            reminders_enabled: Boolean(data.reminders_enabled),
        }
        if (!payload.cover_end_date?.trim()) {
            delete payload.cover_end_date
        }
        if (!payload.policy_number?.trim()) {
            delete payload.policy_number
        }

        // Only send reason when this is still a short cover
        if (!isShortMotorCover(payload.cover_start_date, payload.cover_end_date)) {
            delete payload.issue_reason
            delete payload.other_reason
        } else if (payload.issue_reason !== 'other') {
            delete payload.other_reason
        }

        // Strip override flags on first submit; popup retry adds them back
        delete payload.validate_double_insurance
        delete payload.is_logbook_verified
        delete payload.additional_comments
        return payload
    }

    const onSubmit = async (data: InvoicePaymentFormValues) => {
        const payload = buildPayload(data)

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
            // 1) Double insurance preflight (separate from Type A/C on invoice POST)
            const preflight = await validateDoubleInsurancePreflight({
                coverStartDate: data.cover_start_date,
                coverEndDate: data.cover_end_date,
                vehicleRegistrationNumber: registration,
                chassisNumber: chassis,
            })

            if (!preflight.clear) {
                // Do not auto-fill a suggested start: DMVIC only saw covers in the checked range.
                form.setError('cover_start_date', {
                    type: 'manual',
                    message: preflight.message,
                })
                ShowToast.error(preflight.message)
                return
            }

            // 2) Invoice submit → server Type A/C validate
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
        const base = pendingOverridePayload ?? buildPayload(form.getValues())
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

                            {/* Short cover: admin must pick why this is a 1-month issue */}
                            {showShortCoverReason ? (
                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <ReusableSelect
                                        control={form.control}
                                        name="issue_reason"
                                        label="Reason to Issue 1 Month"
                                        placeholder="Select a reason"
                                        required
                                        options={MOTOR_ISSUE_REASON_OPTIONS.map((option) => ({
                                            value: option.value,
                                            label: option.label,
                                        }))}
                                    />
                                    {issueReason === 'other' ? (
                                        <ReuseableInput
                                            className="w-full min-h-20 rounded-[5px] border border-[#ADABAB]"
                                            control={form.control}
                                            name="other_reason"
                                            label="Other reasons"
                                            type="textarea"
                                            rows={3}
                                            placeholder="Describe the reason"
                                            required
                                        />
                                    ) : null}
                                </div>
                            ) : null}

                            <div className="mt-4 flex items-start gap-2">
                                <Controller
                                    control={form.control}
                                    name="reminders_enabled"
                                    render={({ field }) => (
                                        <Checkbox
                                            id="admin-reminders-enabled"
                                            checked={Boolean(field.value)}
                                            onCheckedChange={(checked) =>
                                                field.onChange(Boolean(checked))
                                            }
                                            className="mt-0.5 w-3.75 h-3.75 rounded-[3px] border border-[#D9D9D9] data-[state=checked]:bg-[#C20C0C] data-[state=checked]:border-[#C20C0C]"
                                        />
                                    )}
                                />
                                <label
                                    htmlFor="admin-reminders-enabled"
                                    className={cn(motorCheckboxLabelClassName)}
                                >
                                    <span className={motorCheckboxLabelAccentClassName}>
                                        Send cover expiry reminders
                                    </span>
                                    {' '}
                                    (emails after the invoice is paid, based on cover length)
                                </label>
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
