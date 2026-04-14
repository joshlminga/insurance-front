/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Button, ReusableDropdown, ReusableSelect, ReuseableInput, ReuseableRadioChoiceGroup } from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type { CustomerVerificationDetailsProps, MpesaPayload, MpesaPollResponse, SubmitResponse } from '@/types/types'
import { EMETHODS, INVOICE_SESSION_STORAGE_KEY, PAYMENTPLANS, POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from '@/utils/constatnts'
import { EPAYMENTTABS } from '@/utils/steps-config'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle, Eye, Mail, Share2 } from 'lucide-react'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { PaymentDetailsSchema } from '@/types/form-schema'
import type { PaymentFormValues } from '@/types/schema'
import { extractErrorMessage } from '@/utils/helpers'

export const PaymentOptions: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>('mpesa')
    const [isPolling, setIsPolling] = React.useState(false)
    const [pollMessage, setPollMessage] = React.useState('')
    const [checkoutRequestId, setCheckoutRequestId] = React.useState<string | null>(null)
    const [purchaseSessionId, setPurchaseSessionId] = React.useState<string | null>(null)

    const stopPolling = React.useCallback(() => {
        setIsPolling(false)
        setPollMessage('')
        setCheckoutRequestId(null)
    }, [])

    const startPolling = React.useCallback((id: string) => {
        setCheckoutRequestId(id)
        setIsPolling(true)
        setPollMessage('Waiting for payment confirmation...')
    }, [])

    const pollQuery = UseApiQuery<MpesaPollResponse>({
        url: 'mpesa/status',
        params: checkoutRequestId ? { checkout_request_id: checkoutRequestId } : undefined,
        queryOptions: {
            enabled: isPolling && Boolean(checkoutRequestId),
            refetchInterval: isPolling ? POLL_INTERVAL_MS : false,
            refetchIntervalInBackground: true,
            retry: 1,
        },
    })

    React.useEffect(() => {
        const storedPurchaseKey = String(localStorage.getItem(INVOICE_SESSION_STORAGE_KEY))
        if (storedPurchaseKey) {
            setPurchaseSessionId(storedPurchaseKey)
        } else {
            setPurchaseSessionId(null)
        }
    }, [])

    React.useEffect(() => {
        if (!isPolling) return
        const timeoutId = setTimeout(() => {
            stopPolling()
            ShowToast.error('Payment timed out. Please try again.')
        }, POLL_TIMEOUT_MS)

        return () => clearTimeout(timeoutId)
    }, [isPolling, stopPolling])

    React.useEffect(() => {
        if (!isPolling || !pollQuery.data) return

        const payload = pollQuery.data.data ?? pollQuery.data
        const statusRaw = payload.status?.toLowerCase()
        const resultCode = payload.ResultCode

        const isSuccess = statusRaw === 'completed' || statusRaw === 'success' || statusRaw === 'successful' || resultCode === 0
        const isFailed = statusRaw === 'failed' || statusRaw === 'cancelled' || statusRaw === 'canceled' || statusRaw === 'error' || (typeof resultCode === 'number' && resultCode !== 0)

        if (isSuccess) {
            stopPolling()
            setTimeout(() => {
                ShowToast.success(payload.message || payload.ResultDesc || 'Payment confirmed!')
            }, 4000)
            goToNextStep?.()
            return
        }

        if (isFailed) {
            stopPolling()
            setTimeout(() => {
                ShowToast.error(payload.message || payload.ResultDesc || 'Payment failed. Please try again.')
            }, 4000)
            return
        }
        setPollMessage(payload.message || 'Waiting for payment confirmation...')
    }, [isPolling, pollQuery.data, goToNextStep, stopPolling])

    React.useEffect(() => {
        if (!isPolling || !pollQuery.isError) return
        setPollMessage('Still checking payment status...')
    }, [isPolling, pollQuery.isError])

    const { data: SummaryData, refetch: refetchSummary } = UseApiQuery<SubmitResponse>({
        url: `purchase/motor/${purchaseSessionId}/summary`,
        queryOptions: {
            enabled: !!purchaseSessionId,
            retry: 1,
        },
    })

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(PaymentDetailsSchema),
        defaultValues: {
            payment_method: 'mpesa',
            amount: 1.00,
            phone_number: '',
            invoice_id: '',
            payment_plans: '',
            first_installment: '',
            second_installment: '',
            third_installment: '',
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
            onSuccess: (data) => {
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
    const prevPlanRef = React.useRef(selectedPaymentPlan)

    React.useEffect(() => {
        if (!selectedPaymentPlan || !purchaseSessionId || selectedPaymentPlan === prevPlanRef.current) return
        prevPlanRef.current = selectedPaymentPlan
        paymentPlanMutation.mutate({ payment_plan: selectedPaymentPlan })
    }, [selectedPaymentPlan, purchaseSessionId])


    const handlePaymentMethodChange = (value: string) => {
        setSelectedPaymentMethod(value)
        form.setValue('payment_method', value as 'mpesa' | 'card' | 'pesapal')
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
                startPolling(String(checkoutId))
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Submission failed!")
            },
        },
    })

    const onSubmit = (data: PaymentFormValues) => {
        if (data.payment_method !== 'mpesa') {
            goToNextStep?.()
            return
        }
        const payload: MpesaPayload = {
            phone: data.phone_number,
            amount: data.amount,
            invoice_id: data.invoice_id,
        }
        submitMutation.mutate(payload)
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto bg-transparent">
                <div className='w-full items-center justify-center p-2 sm:p-4'>
                    <div className="w-full min-h-45.5 h-auto rounded-[3px] bg-[#D9D9D95E] shadow-[0px_4px_4px_0px_#00000040] p-4 sm:p-6 mb-4">
                        <div className="w-full sm:w-auto mb-4">
                            <label htmlFor="payment_plans" className="font-medium text-[15px] text-black block mb-2">
                                Payment Plans:
                            </label>
                            <div className="w-full sm:w-fit sm:min-w-50 h-auto">
                                <ReusableSelect
                                    className="w-full"
                                    triggerClassName="h-full rounded-[3px] border border-[#ADABAB] bg-white text-sm"
                                    name="payment_plans"
                                    label=""
                                    options={PAYMENTPLANS}
                                    control={form.control}
                                />
                            </div>
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                            <ReuseableInput
                                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] bg-white text-black"
                                control={form.control}
                                name="first_installment"
                                label="Full Installment"
                                disabled
                            />
                            <ReuseableInput
                                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] bg-white text-black"
                                control={form.control}
                                name="second_installment"
                                label="2nd Installment 30%"
                                disabled
                            />
                            <ReuseableInput
                                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] bg-white sm:col-span-2 lg:col-span-1 text-black"
                                control={form.control}
                                name="third_installment"
                                label="3rd Installment 30%"
                                disabled
                            />
                        </div>
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

                {isPolling && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl max-w-sm mx-4">
                            <div className="w-12 h-12 border-4 border-[#0CC258] border-t-transparent rounded-full animate-spin" />
                            <p className="text-center font-medium text-gray-700">{pollMessage}</p>
                            <p className="text-center text-sm text-gray-500">
                                Please enter your PIN on the M-Pesa prompt on your phone.
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
                                    onClick: () => console.log("WhatsApp"),
                                },
                                {
                                    label: "Email",
                                    icon: <Mail className="w-4 h-4" />,
                                    onClick: () => console.log("Email"),
                                },
                                {
                                    label: "View Online",
                                    icon: <Eye className="w-4 h-4" />,
                                    onClick: () => console.log("view online"),
                                },
                                {
                                    label: "Select All",
                                    icon: <Eye className="w-4 h-4" />,
                                    onClick: () => console.log("select all"),
                                },
                            ]} />
                        <Button
                            type="submit"
                            disabled={isPolling}
                            className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                            rightIcon={<ArrowRightCircle />}>
                            {isPolling ? 'Processing...' : 'Proceed To Payment'}
                        </Button>
                    </div>
                </CardFooter>
            </form>
        </FormProvider>
    )
}
