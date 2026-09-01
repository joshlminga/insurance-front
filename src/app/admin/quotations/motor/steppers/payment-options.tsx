/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { 
    Button,
    ConfirmationDialog, 
    CustomDialogComponent, 
    ReusableDropdown, 
    ReuseableInput, 
    ReuseableRadioChoiceGroup, 
    SendInvoiceViaEmail 
} from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type { MpesaPayload, SubmitResponse } from '@/types/types'
import {
    EMETHODS,
    INSTALLMENT_FIELDS_VISIBLE,
    INVOICE_SESSION_STORAGE_KEY,
    PAYMENTPLANS,
    PURCHASE_SESSION_STORAGE_KEY
} from '@/utils/constatnts'
import { EPAYMENTTABS } from '@/utils/steps-config'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle, Eye, Mail, Share2 } from 'lucide-react'
import React from 'react'
import { Controller, FormProvider, useForm, type Resolver } from 'react-hook-form'
import { PaymentDetailsSchema } from '@/types/form-schema'
import type { PaymentFormInput } from '@/types/schema'
import { extractErrorMessage } from '@/utils/helpers'
import { cn } from '@/lib/utils'
import { useCustomDialogContextFactory } from '@/hooks'
import { usePesapalPaymentFlow } from '@/hooks/use-pesapal-payment-flow'
import { usePaystackPaymentFlow } from '@/hooks/use-paystack-payment-flow'
import { submitMotorCreditPayment } from '@/app/admin/credit/credit-payment'
import { CreditPendingBanner } from '@/app/admin/credit/components/CreditPendingBanner'
import { getPaymentStatusPath, storePaymentStatusSession } from '@/app/payment/payment-session'
import type { AdminMotorStepProps } from '../admin-step-props'
import {
    readAdminMotorCustomerContact,
    readAdminMotorTargetInvoiceAmount,
    readAdminMotorTargetInvoiceId,
} from '../admin-motor-session'
import { useNavigate } from 'react-router-dom'
import {
    motorPurchaseSummaryQueryOptions,
    MOTOR_PURCHASE_URLS,
    resolveTargetInvoiceBreakdownItem,
} from '@/app/customer/motor/motor-purchase-query'

type BoxHeaderProps = {
    title: string
    description?: string
}

const BoxHeader = ({ title, description }: BoxHeaderProps) => (
    <div className="flex flex-col gap-0.5 pb-2">
        <h2 className="text-sm font-semibold sm:text-lg">{title}</h2>
        {description ? (
            <p className="text-xs text-muted-foreground sm:text-sm">
                {description}
            </p>
        ) : null}
    </div>
)

const compactFieldClass =
    'w-full h-9.5 rounded-[4px] border border-black/30 bg-white text-sm text-black'

const breakdownInputClass =
    'w-full h-9.5 rounded-[4px] border border-[#ADABAB] bg-neutral-50 text-sm text-black shadow-none disabled:opacity-100 disabled:cursor-default disabled:bg-neutral-50'

export const AdminMotorPaymentOptions: React.FC<AdminMotorStepProps> = ({
    goToNextStep,
    goToPrevStep,
    defaultCustomerContact,
}) => {
    const customerEmail = defaultCustomerContact?.email ?? readAdminMotorCustomerContact().email
    const navigate = useNavigate()
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>('mpesa');
    const [purchaseId, setPurchaseId] = React.useState<string | null>(null);
    const [isPlanConfirmOpen, setIsPlanConfirmOpen] = React.useState(false);
    const lastAppliedPlanRef = React.useRef<string>('');
    const pendingPlanRef = React.useRef<string | null>(null);
    const isConfirmingPlanRef = React.useRef(false);
    const [targetInvoiceId] = React.useState<string | null>(() => readAdminMotorTargetInvoiceId());
    const [fallbackInvoiceAmount] = React.useState<string | null>(() => readAdminMotorTargetInvoiceAmount());
    const [creditPending, setCreditPending] = React.useState<{
        message: string
        creditTransactionId?: number
        invoiceId?: string
    } | null>(null)
    const [isCreditSubmitting, setIsCreditSubmitting] = React.useState(false)
    const [isPlanBreakdownUpdating, setIsPlanBreakdownUpdating] = React.useState(false)

    const {
        pollMode,
        isPolling: isGatewayPolling,
        pollMessage: gatewayPollMessage,
        stopPolling: stopGatewayPolling,
        startMpesaPolling,
        submitPesapal,
        usesPesapal,
        isPesapalSubmitting,
    } = usePesapalPaymentFlow({ flow: 'admin', goToNextStep })

    const {
        isPolling: isPaystackPolling,
        pollMessage: paystackPollMessage,
        stopPolling: stopPaystackPolling,
        submitPaystack,
        usesPaystack,
        isPaystackSubmitting,
    } = usePaystackPaymentFlow({ flow: 'admin' })

    const isPolling = isGatewayPolling || isPaystackPolling
    const pollMessage = isPaystackPolling ? paystackPollMessage : gatewayPollMessage
    const stopPolling = isPaystackPolling ? stopPaystackPolling : stopGatewayPolling

    React.useEffect(() => {
        const storedPurchaseKey =
            sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY)
            ?? sessionStorage.getItem(INVOICE_SESSION_STORAGE_KEY)

        if (storedPurchaseKey) {
            setPurchaseId(storedPurchaseKey)
        } else {
            setPurchaseId(null)
        }
    }, [])

    const { data: SummaryData, refetch: refetchSummary } = UseApiQuery<SubmitResponse>({
        url: purchaseId ? MOTOR_PURCHASE_URLS.summary(purchaseId) : '',
        params: targetInvoiceId ? { target_invoice_id: targetInvoiceId } : undefined,
        queryOptions: {
            enabled: !!purchaseId,
            retry: 1,
            ...motorPurchaseSummaryQueryOptions,
        },
    })

    const form = useForm<PaymentFormInput>({
        resolver: zodResolver(PaymentDetailsSchema) as Resolver<PaymentFormInput>,
        defaultValues: {
            payment_method: 'mpesa',
            amount: 1.00,
            phone_number: '',
            invoice_id: '',
            payment_plans: '',
            first_installment: '',
            second_installment: '',
            third_installment: '',
            card_provider: 'paystack',
            paypal_email: '',
            pesapal_email: customerEmail ?? '',
            paystack_email: customerEmail ?? '',
            available_credit: '',
            unsettled_credit: '',
            unsettled_credit_limit: '',
            credit_acknowledged: false,
            mpesa_transaction_code: '',
            payment_proof_receipt: undefined,
        },
    })

    React.useEffect(() => {
        if (!SummaryData?.data) return

        const items = SummaryData.data.invoice_breakdown?.items as Parameters<
            typeof resolveTargetInvoiceBreakdownItem
        >[0]
        const targetItem = resolveTargetInvoiceBreakdownItem(items, targetInvoiceId)

        if (targetItem?.installment_amount) {
            form.setValue('amount', Number(targetItem.installment_amount))
        } else if (fallbackInvoiceAmount) {
            form.setValue('amount', Number(fallbackInvoiceAmount))
        }

        if (targetItem?.id) {
            form.setValue('invoice_id', String(targetItem.id))
        }
    }, [SummaryData, form, targetInvoiceId, fallbackInvoiceAmount])

    const paymentPlansLocked = React.useMemo(
        () => Boolean(SummaryData?.data?.payment_plans_locked),
        [SummaryData],
    )

    const availablePaymentPlans = React.useMemo(
        () => (paymentPlansLocked ? PAYMENTPLANS.filter((plan) => plan.value === 'Full') : PAYMENTPLANS),
        [paymentPlansLocked],
    )

    React.useEffect(() => {
        if (!paymentPlansLocked) return
        form.setValue('payment_plans', 'Full')
        lastAppliedPlanRef.current = 'Full'
    }, [paymentPlansLocked, form])

    const paymentPlanMutation = UseApiMutation<SubmitResponse, { payment_plan: string }>({
        url: `purchase/motor/${purchaseId}/payment-plan`,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data, variables) => {
                lastAppliedPlanRef.current = variables.payment_plan
                const schedule = data?.data?.payment_breakdown?.schedule
                form.setValue('first_installment', schedule?.[0]?.amount?.toString() ?? '')
                form.setValue('second_installment', schedule?.[1]?.amount?.toString() ?? '')
                form.setValue('third_installment', schedule?.[2]?.amount?.toString() ?? '')
                if (schedule?.[0]?.amount) {
                    form.setValue('amount', Number(schedule[0].amount))
                }
                refetchSummary()
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Failed to update payment plan!")
            },
        },
    })

    const isInteractionBlocked =
        isPlanBreakdownUpdating
        || paymentPlanMutation.isPending
        || isPolling
        || isPesapalSubmitting
        || isPaystackSubmitting
        || isCreditSubmitting

    const selectedPaymentPlan = form.watch('payment_plans')

    const visibleInstallmentCount = selectedPaymentPlan
        ? INSTALLMENT_FIELDS_VISIBLE[selectedPaymentPlan] ?? 0
        : 0

    React.useEffect(() => {
        if (!selectedPaymentPlan) return
        if (selectedPaymentPlan === 'Full') {
            form.setValue('second_installment', '')
            form.setValue('third_installment', '')
        } else if (selectedPaymentPlan === 'Two_Installment') {
            form.setValue('third_installment', '')
        }
    }, [selectedPaymentPlan, form])

    const cancelPlanChange = React.useCallback(() => {
        pendingPlanRef.current = null
        setIsPlanConfirmOpen(false)
    }, [])

    const confirmPlanChange = React.useCallback(async () => {
        isConfirmingPlanRef.current = true
        setIsPlanBreakdownUpdating(true)
        try {
            const nextPlan = pendingPlanRef.current
            if (!nextPlan || !purchaseId) return
            form.setValue('payment_plans', nextPlan)
            form.setValue('first_installment', '')
            form.setValue('second_installment', '')
            form.setValue('third_installment', '')
            try {
                await paymentPlanMutation.mutateAsync({ payment_plan: nextPlan })
                await refetchSummary()
            } catch {
                form.setValue('payment_plans', lastAppliedPlanRef.current)
            }
        } finally {
            isConfirmingPlanRef.current = false
            pendingPlanRef.current = null
            setIsPlanConfirmOpen(false)
            setIsPlanBreakdownUpdating(false)
        }
    }, [form, paymentPlanMutation, purchaseId, refetchSummary])

    const handlePaymentMethodChange = (value: string) => {
        setSelectedPaymentMethod(value)
        form.setValue('payment_method', value as 'mpesa' | 'card' | 'pesapal' | 'paypal' | 'credit' | 'cash')
        form.clearErrors()
    }

    const submitMutation = UseApiMutation<SubmitResponse, MpesaPayload>({
        url: 'mpesa/stk-push',
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                const checkoutId = data.CheckoutRequestID || data.data?.CheckoutRequestID || data.data?.checkout_request_id
                if (!checkoutId) {
                    ShowToast.error(data.message || 'Failed to initiate payment.')
                    return
                }
                ShowToast.success('Check your phone and enter your M-Pesa PIN.')
                startMpesaPolling(String(checkoutId))
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Submission failed!")
            },
        },
    })

    const onSubmit = async (data: PaymentFormInput) => {
        if (usesPesapal(data)) {
            submitPesapal(data)
            return
        }

        if (data.payment_method === 'credit') {
            if (!data.invoice_id) {
                ShowToast.error('Invoice is missing. Please refresh and try again.')
                return
            }
            setCreditPending(null)
            setIsCreditSubmitting(true)
            storePaymentStatusSession({ flow: 'admin', invoiceId: data.invoice_id })
            try {
                const result = await submitMotorCreditPayment(data.invoice_id, {
                    credit_acknowledged: data.credit_acknowledged,
                })
                if (result.kind === 'pending_approval') {
                    const invoiceId = String(result.invoiceId ?? data.invoice_id)
                    setCreditPending({
                        message: result.message,
                        creditTransactionId: result.creditTransactionId,
                        invoiceId,
                    })
                    ShowToast.success(result.message)
                    navigate(`${getPaymentStatusPath('credit', 'pending')}?invoice_id=${encodeURIComponent(invoiceId)}`)
                    return
                }
                if (result.kind === 'validation_error') {
                    ShowToast.error(result.message)
                    return
                }
                ShowToast.success(result.message || 'Credit payment submitted successfully')
                navigate(getPaymentStatusPath('credit', 'success'))
            } catch (error) {
                ShowToast.error(extractErrorMessage(error))
                navigate(getPaymentStatusPath('credit', 'failed'))
            } finally {
                setIsCreditSubmitting(false)
            }
            return
        }

        if (usesPaystack(data)) {
            storePaymentStatusSession({ flow: 'admin', invoiceId: data.invoice_id })
            submitPaystack(data)
            return
        }

        if (data.payment_method !== 'mpesa') {
            goToNextStep?.()
            return
        }
        storePaymentStatusSession({ flow: 'admin', invoiceId: data.invoice_id })
        const payload: MpesaPayload = {
            phone: data.phone_number ?? '',
            amount: data.amount ?? 0,
            invoice_id: data.invoice_id ?? '',
        }
        submitMutation.mutate(payload)
    }

    const createDownloadMutation = (purchaseId: string) =>
        UseApiMutation<Blob, string>({
            url: `document/motor/invoice-all/${purchaseId}`,
            method: EMETHODS.GET,
            config: {
                responseType: 'blob',
            },
            mutationOptions: {
                onSuccess: (data) => {
                    const blob = new Blob([data], { type: 'application/pdf' })
                    const url = window.URL.createObjectURL(blob)
                    const width = 1000;
                    const height = 900;
                    const left = (window.screen.width / 2) - (width / 2);
                    const top = (window.screen.height / 2) - (height / 2);

                    const previewWindow = window.open(url, 'DocumentPreview', `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`);
                    if (previewWindow) {
                        previewWindow.focus();
                    } else {
                        ShowToast.error("Pop-up blocked! Please allow pop-ups to preview the document.");
                    }
                    ShowToast.success(`Invoice preview opened`);
                },
                onError: (error: unknown) => {
                    const message = extractErrorMessage(error)
                    ShowToast.error(message || "Download failed!")
                },
            },
        })
    const InvoiceViewMutation = createDownloadMutation(String(purchaseId))

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>
            data?: any
            requireRecipientEmail?: boolean
            defaultEmail?: string
        }>()

    return (
        <>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto bg-transparent">
                    <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6">
                        <div className="w-full pb-2">
                            <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                                Payment <span className="text-[#BF162E]">Options</span>
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-black/70 sm:text-base">
                                {paymentPlansLocked
                                    ? 'Complete payment for the outstanding invoice installment.'
                                    : 'Choose a payment plan and select how the customer will pay for this motor cover.'}
                            </p>
                        </div>

                        <div className="mt-4 space-y-4">
                            {!paymentPlansLocked ? (
                            <div className="rounded-xl border border-black/20 bg-white p-2.5 sm:p-4">
                                <BoxHeader
                                    title="Payment Plans"
                                    description="Review the amounts due for each installment."
                                />
                                <div className="mt-2.5 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end **:data-[slot=field-label]:text-sm **:data-[slot=field-label]:mb-1">
                                    <div className="w-full lg:col-span-4">
                                    <Controller
                                        name="payment_plans"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={fieldState.invalid}
                                                className="w-full flex-col gap-0">
                                                <FieldLabel>Select an installment schedule.</FieldLabel>
                                                <Select
                                                    value={field.value || undefined}
                                                    disabled={paymentPlansLocked || isInteractionBlocked}
                                                    onValueChange={(value) => {
                                                        const previous = field.value ?? ''
                                                        if (value === previous) return
                                                        if (!purchaseId) {
                                                            field.onChange(value)
                                                            return
                                                        }
                                                        pendingPlanRef.current = value
                                                        setIsPlanConfirmOpen(true)
                                                    }}>
                                                    <SelectTrigger
                                                        aria-invalid={fieldState.invalid}
                                                        className={cn(
                                                            compactFieldClass,
                                                            fieldState.invalid &&
                                                            'border-[#BF162E] focus:ring-[#BF162E]'
                                                        )}>
                                                        <SelectValue placeholder="Select an option" />
                                                    </SelectTrigger>
                                                    <SelectContent className="">
                                                        {availablePaymentPlans.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && (
                                                    <FieldError className="mt-1 text-sm text-[#BF162E]">
                                                        {fieldState.error.message}
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )}
                                    />
                                    </div>
                                    <div className="w-full lg:col-span-8">
                                {visibleInstallmentCount > 0 ? (
                                    <div
                                        className={cn(
                                            'grid gap-2.5 sm:gap-4',
                                            visibleInstallmentCount === 1 && 'grid-cols-1',
                                            visibleInstallmentCount === 2 && 'grid-cols-1 sm:grid-cols-2',
                                            visibleInstallmentCount >= 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                        )}>
                                        {visibleInstallmentCount >= 1 && (
                                            <ReuseableInput
                                                className={breakdownInputClass}
                                                control={form.control}
                                                name="first_installment"
                                                label={
                                                    selectedPaymentPlan === 'Full'
                                                        ? 'Full installment'
                                                        : '1st installment'
                                                }
                                                disabled
                                                thousandsSeparator
                                            />
                                        )}
                                        {visibleInstallmentCount >= 2 && (
                                            <ReuseableInput
                                                className={breakdownInputClass}
                                                control={form.control}
                                                name="second_installment"
                                                label="2nd installment"
                                                disabled
                                                thousandsSeparator
                                            />
                                        )}
                                        {visibleInstallmentCount >= 3 && (
                                            <ReuseableInput
                                                className={breakdownInputClass}
                                                control={form.control}
                                                name="third_installment"
                                                label="3rd installment"
                                                disabled
                                                thousandsSeparator
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <Field className="w-full flex-col gap-0">
                                        <FieldLabel className="invisible" aria-hidden="true">
                                            Select an installment schedule.
                                        </FieldLabel>
                                        <p className="flex h-9.5 items-center text-sm text-black/70">
                                            Select a payment plan to see the installment breakdown.
                                        </p>
                                    </Field>
                                )}
                                    </div>
                                </div>
                            </div>
                            ) : null}

                            <div className="rounded-xl border border-black/20 bg-white p-2.5 sm:p-4 [&_h2]:text-black [&_p]:text-black/70 [&_.mt-6]:mt-4.5">
                                <BoxHeader
                                    title="Preferred Payment Method"
                                    description="Choose how the customer will complete this payment."
                                />
                                <ReuseableRadioChoiceGroup
                                    variant="tabs"
                                    layout="horizontal"
                                    activeColor="#BF162E"
                                    selectorPosition="left"
                                    showSelector={true}
                                    imagePriority
                                    borderOnlyActive
                                    neutralSelector
                                    value={selectedPaymentMethod}
                                    onValueChange={handlePaymentMethodChange}
                                    items={EPAYMENTTABS}
                                />
                            </div>
                        </div>
                    </div>

                    <ConfirmationDialog
                        open={isPlanConfirmOpen}
                        onOpenChange={(open) => {
                            setIsPlanConfirmOpen(open)
                            if (!open && !isConfirmingPlanRef.current) {
                                pendingPlanRef.current = null
                            }
                        }}
                        title="Change payment plan?"
                        description="This will recalculate your installment schedule on the invoice."
                        confirmButtonText="Yes, change"
                        cancelButtonText="Cancel"
                        onConfirm={confirmPlanChange}
                        onCancel={cancelPlanChange}
                        isPending={paymentPlanMutation.isPending || isPlanBreakdownUpdating}
                    />

                    {(isPlanBreakdownUpdating || paymentPlanMutation.isPending) && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                            <div className="mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-black/20 bg-white p-8 shadow-xl">
                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#BF162E] border-t-transparent" />
                                <p className="text-center font-medium text-black/80">
                                    Updating payment plan…
                                </p>
                                <p className="text-center text-sm text-black/60">
                                    Please wait while we recalculate the installment breakdown.
                                </p>
                            </div>
                        </div>
                    )}

                    {isPolling && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl max-w-sm mx-4 border border-black/20">
                                <div className="w-12 h-12 border-4 border-[#BF162E] border-t-transparent rounded-full animate-spin" />
                                <p className="text-center font-medium text-black/80">{pollMessage}</p>
                                <p className="text-center text-sm text-black/60">
                                    {isPaystackPolling
                                        ? 'Complete payment in the Paystack window if it is still open.'
                                        : pollMode === 'pesapal'
                                        ? 'Complete payment on the Pesapal page if it is still open.'
                                        : 'Please enter your PIN on the M-Pesa prompt on your phone.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={stopPolling}
                                    className="text-sm text-[#BF162E] underline mt-2">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {creditPending ? (
                        <div className="mt-4 px-1">
                            <CreditPendingBanner
                                message={creditPending.message}
                                creditTransactionId={creditPending.creditTransactionId}
                                invoiceId={creditPending.invoiceId}
                            />
                        </div>
                    ) : null}

                    <CardFooter className="mt-4 w-full flex flex-col gap-3 px-0 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                            type="button"
                            disabled={isInteractionBlocked}
                            className="w-full rounded-full border border-[#BF162E] bg-transparent text-[#BF162E] hover:bg-[#BF162E]/10 sm:w-auto disabled:opacity-50"
                            leftIcon={<ArrowLeftCircle />}
                            onClick={() => goToPrevStep?.()}>
                            Previous
                        </Button>

                        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                            <ReusableDropdown
                                trigger={
                                    <Button
                                        variant="outline"
                                        disabled={isInteractionBlocked}
                                        className="w-full border-[#BF162E] bg-transparent text-[#BF162E] hover:bg-[#BF162E] hover:text-white focus-visible:ring-[#BF162E]/30 disabled:opacity-50 lg:w-auto">
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
                                        onClick: () => {
                                            handleDialogContextSwitch({
                                                componentProps: {
                                                    data: purchaseId,
                                                    requireRecipientEmail: true,
                                                    defaultEmail: customerEmail,
                                                },
                                                Component: SendInvoiceViaEmail,
                                            })
                                        }
                                    },
                                    {
                                        label: "View Online",
                                        icon: <Eye className="w-4 h-4" />,
                                        onClick: () => {
                                            InvoiceViewMutation.mutate(String(purchaseId))
                                        },
                                    }
                                ]} />
                            <Button
                                type="submit"
                                disabled={isInteractionBlocked}
                                className="w-full rounded-full bg-[#BF162E]/90 hover:bg-[#BF162E] sm:w-auto disabled:opacity-50"
                                rightIcon={<ArrowRightCircle />}>
                                {isPlanBreakdownUpdating || paymentPlanMutation.isPending
                                    ? 'Updating plan...'
                                    : isPolling || isPesapalSubmitting || isPaystackSubmitting || isCreditSubmitting
                                    ? 'Processing...'
                                    : 'Proceed To Payment'}
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            </FormProvider>

            <CustomDialogComponent
                {...{ handleDialogContextSwitch, dialogOpen }}
                className='sm:max-w-fit w-[95vw] sm:w-auto p-4 sm:p-6'>
                {dialogContent?.Component && (
                    <dialogContent.Component
                        {...{
                            componentProps: dialogContent.componentProps,
                            handleDialogContextSwitch,
                        }}
                    />
                )}
            </CustomDialogComponent>

        </>
    )
}
