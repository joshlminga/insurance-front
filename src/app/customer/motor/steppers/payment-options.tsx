/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Field, FieldError } from '@/components/ui/field'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button, ConfirmationDialog, CustomDialogComponent, ReusableDropdown, ReuseableInput, ReuseableRadioChoiceGroup, SendInvoiceViaEmail } from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type { CustomerVerificationDetailsProps, MpesaPayload, SubmitResponse } from '@/types/types'
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
import { submitMotorCreditPayment } from '@/app/admin/credit/credit-payment'
import { CreditPendingBanner } from '@/app/admin/credit/components/CreditPendingBanner'


export const PaymentOptions: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>('mpesa');
    const [purchaseSessionId, setPurchaseSessionId] = React.useState<string | null>(null);
    const [isPlanConfirmOpen, setIsPlanConfirmOpen] = React.useState(false);
    const lastAppliedPlanRef = React.useRef<string>('');
    const pendingPlanRef = React.useRef<string | null>(null);
    const isConfirmingPlanRef = React.useRef(false);
    const [purchaseId, setPurchaseId] = React.useState<string | null>(null)
    const [creditPending, setCreditPending] = React.useState<{
        message: string
        creditTransactionId?: number
    } | null>(null)
    const [isCreditSubmitting, setIsCreditSubmitting] = React.useState(false)

    const {
        pollMode,
        isPolling,
        pollMessage,
        stopPolling,
        startMpesaPolling,
        submitPesapal,
        usesPesapal,
        isPesapalSubmitting,
    } = usePesapalPaymentFlow({ flow: 'motor', goToNextStep })

    React.useEffect(() => {
        const storedPurchaseKey = String(sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY))
        if (storedPurchaseKey) {
            setPurchaseId(storedPurchaseKey)
        } else {
            setPurchaseId(null)
        }
    }, [])

    React.useEffect(() => {
        const storedPurchaseKey = String(sessionStorage.getItem(INVOICE_SESSION_STORAGE_KEY))
        if (storedPurchaseKey) {
            setPurchaseSessionId(storedPurchaseKey)
        } else {
            setPurchaseSessionId(null)
        }
    }, [])

    const { data: SummaryData, refetch: refetchSummary } = UseApiQuery<SubmitResponse>({
        url: `purchase/motor/${purchaseSessionId}/summary`,
        queryOptions: {
            enabled: !!purchaseSessionId,
            retry: 1,
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
            pesapal_email: '',
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
        const firstItem = SummaryData.data.invoice_breakdown?.items?.[0]
        if (firstItem?.installment_amount) {
            form.setValue('amount', Number(firstItem.installment_amount))
        }
        if (firstItem?.id) {
            form.setValue('invoice_id', String(firstItem.id))
        }
    }, [SummaryData, form])

    const paymentPlanMutation = UseApiMutation<SubmitResponse, { payment_plan: string }>({
        url: `purchase/motor/${purchaseSessionId}/payment-plan`,
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
        try {
            const nextPlan = pendingPlanRef.current
            if (!nextPlan || !purchaseSessionId) return
            form.setValue('payment_plans', nextPlan)
            try {
                await paymentPlanMutation.mutateAsync({ payment_plan: nextPlan })
            } catch {
                form.setValue('payment_plans', lastAppliedPlanRef.current)
            }
        } finally {
            isConfirmingPlanRef.current = false
            pendingPlanRef.current = null
            setIsPlanConfirmOpen(false)
        }
    }, [form, paymentPlanMutation, purchaseSessionId])

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
            if (!purchaseSessionId) {
                ShowToast.error('Purchase session is missing. Please refresh and try again.')
                return
            }
            setCreditPending(null)
            setIsCreditSubmitting(true)
            try {
                const result = await submitMotorCreditPayment(purchaseSessionId, {
                    credit_acknowledged: data.credit_acknowledged,
                    invoice_id: data.invoice_id,
                })
                if (result.kind === 'pending_approval') {
                    setCreditPending({
                        message: result.message,
                        creditTransactionId: result.creditTransactionId,
                    })
                    ShowToast.success(result.message)
                    return
                }
                if (result.kind === 'validation_error') {
                    ShowToast.error(result.message)
                    return
                }
                ShowToast.success(result.message || 'Credit payment submitted successfully')
                goToNextStep?.()
            } catch (error) {
                ShowToast.error(extractErrorMessage(error))
            } finally {
                setIsCreditSubmitting(false)
            }
            return
        }

        if (data.payment_method !== 'mpesa') {
            goToNextStep?.()
            return
        }
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
        }>()

    return (
        <>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto bg-transparent">
                    <div className='w-full items-center justify-center p-2 sm:p-4'>
                        <div className="w-full min-h-45.5 h-auto rounded-[3px] bg-[#D9D9D95E] shadow-[0px_4px_4px_0px_#00000040] p-4 sm:p-6 mb-4">
                            <div className="w-full sm:w-auto mb-4">
                                <label htmlFor="payment_plans" className="font-medium text-[15px] text-black block mb-2">
                                    Payment Plans:
                                </label>
                                <div className="w-full sm:w-fit sm:min-w-50 h-auto">
                                    <Controller
                                        name="payment_plans"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={fieldState.invalid}
                                                className="w-full">
                                                <Select
                                                    value={field.value || undefined}
                                                    onValueChange={(value) => {
                                                        const previous = field.value ?? ''
                                                        if (value === previous) return
                                                        if (!purchaseSessionId) {
                                                            field.onChange(value)
                                                            return
                                                        }
                                                        pendingPlanRef.current = value
                                                        setIsPlanConfirmOpen(true)
                                                    }}>
                                                    <SelectTrigger
                                                        aria-invalid={fieldState.invalid}
                                                        className={cn(
                                                            'w-full h-12.75 rounded-[3px] border border-[#ADABAB] bg-white text-sm',
                                                            fieldState.invalid &&
                                                            'border-red-500 focus:ring-red-500'
                                                        )}>
                                                        <SelectValue placeholder="Select an option" />
                                                    </SelectTrigger>
                                                    <SelectContent className="">
                                                        {PAYMENTPLANS.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && (
                                                    <FieldError className="mt-1 text-sm text-red-500">
                                                        {fieldState.error.message}
                                                    </FieldError>
                                                )}
                                            </Field>
                                        )}
                                    />
                                </div>
                            </div>
                            {visibleInstallmentCount > 0 ? (
                                <div
                                    className={cn(
                                        'grid gap-3 sm:gap-4',
                                        visibleInstallmentCount === 1 && 'grid-cols-1 sm:max-w-md',
                                        visibleInstallmentCount === 2 && 'grid-cols-1 sm:grid-cols-2',
                                        visibleInstallmentCount >= 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                    )}>
                                    {visibleInstallmentCount >= 1 && (
                                        <ReuseableInput
                                            className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] bg-white text-black"
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
                                            className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] bg-white text-black"
                                            control={form.control}
                                            name="second_installment"
                                            label="2nd installment"
                                            disabled
                                            thousandsSeparator
                                        />
                                    )}
                                    {visibleInstallmentCount >= 3 && (
                                        <ReuseableInput
                                            className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] bg-white text-black"
                                            control={form.control}
                                            name="third_installment"
                                            label="3rd installment"
                                            disabled
                                            thousandsSeparator
                                        />
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Select a payment plan above to see the installment schedule.
                                </p>
                            )}
                        </div>
                        <div className="w-full py-3">
                            <h6 className='text-base sm:text-lg font-bold'>Please Select Your Preferred Payment Option</h6>
                        </div>
                        <ReuseableRadioChoiceGroup
                            variant="tabs"
                            layout="horizontal"
                            activeColor="#D3EDFF"
                            selectorPosition="left"
                            showSelector={true}
                            value={selectedPaymentMethod}
                            onValueChange={handlePaymentMethodChange}
                            items={EPAYMENTTABS}
                        />
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
                        isPending={paymentPlanMutation.isPending}
                    />

                    {isPolling && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl max-w-sm mx-4">
                                <div className="w-12 h-12 border-4 border-[#0CC258] border-t-transparent rounded-full animate-spin" />
                                <p className="text-center font-medium text-gray-700">{pollMessage}</p>
                                <p className="text-center text-sm text-gray-500">
                                    {pollMode === 'pesapal'
                                        ? 'Complete payment on the Pesapal page if it is still open.'
                                        : 'Please enter your PIN on the M-Pesa prompt on your phone.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={stopPolling}
                                    className="text-sm text-red-500 underline mt-2">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {creditPending ? (
                        <div className="px-2 sm:px-4">
                            <CreditPendingBanner
                                message={creditPending.message}
                                creditTransactionId={creditPending.creditTransactionId}
                            />
                        </div>
                    ) : null}

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
                                        variant="outline"
                                        className=" w-full lg:w-auto border-[#C20C0C] bg-[#FFF5F5] text-[#C20C0C] hover:bg-[#C20C0C] hover:text-white focus-visible:ring-[#C20C0C]/30">
                                        Generate Invoice
                                    </Button>
                                }
                                items={[
                                    {
                                        label: "WhatsApp",
                                        icon: <Share2 className="w-4 h-4" />,
                                        onClick: () => console.log("WhatsApp"),
                                    },
                                    {
                                        label: "Email",
                                        icon: <Mail className="w-4 h-4" />,
                                        onClick: () => {
                                            handleDialogContextSwitch({
                                                componentProps: { data: purchaseId },
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
                                disabled={isPolling || isPesapalSubmitting || isCreditSubmitting}
                                className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                                rightIcon={<ArrowRightCircle />}>
                                {isPolling || isPesapalSubmitting || isCreditSubmitting
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
