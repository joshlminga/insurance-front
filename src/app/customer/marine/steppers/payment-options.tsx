/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Button, ReusableSelect, ReuseableInput, ReuseableRadioChoiceGroup } from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { usePesapalPaymentFlow } from '@/hooks/use-pesapal-payment-flow'
import type { CustomerVerificationDetailsProps, MpesaPayload, SubmitResponse } from '@/types/types'
import {
    EMETHODS,
    INVOICE_SESSION_STORAGE_KEY,
    PAYMENTPLANS,
} from '@/utils/constatnts'
import { EPAYMENTTABS } from '@/utils/steps-config'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import React from 'react'
import { FormProvider, useForm, type Resolver } from 'react-hook-form'
import { PaymentDetailsSchema } from '@/types/form-schema'
import type { PaymentFormInput } from '@/types/schema'
import { extractErrorMessage } from '@/utils/helpers'
import { storePaymentStatusSession } from '@/app/payment/payment-session'
import { EROUTES } from '@/utils/enums'
import { useNavigate } from 'react-router-dom'

export const PaymentOptions: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const navigate = useNavigate()
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>('mpesa')
    const [purchaseSessionId, setPurchaseSessionId] = React.useState<string | null>(null)

    const {
        pollMode,
        isPolling,
        pollMessage,
        stopPolling,
        startMpesaPolling,
        submitPesapal,
        usesPesapal,
        isPesapalSubmitting,
    } = usePesapalPaymentFlow({ flow: 'marine', goToNextStep })

    React.useEffect(() => {
        const storedPurchaseKey = String(sessionStorage.getItem(INVOICE_SESSION_STORAGE_KEY))
        setPurchaseSessionId(storedPurchaseKey || null)
    }, [])

    const { data: SummaryData } = UseApiQuery<SubmitResponse>({
        url: `purchase/motor/${purchaseSessionId}/summary`,
        queryOptions: {
            enabled: Boolean(purchaseSessionId),
            retry: 1,
        },
    })

    const form = useForm<PaymentFormInput>({
        resolver: zodResolver(PaymentDetailsSchema) as Resolver<PaymentFormInput>,
        defaultValues: {
            payment_method: 'mpesa',
            payment_plans: '',
            first_installment: '',
            second_installment: '',
            third_installment: '',
            amount: 1,
            phone_number: '',
            invoice_id: '',
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

    const handlePaymentMethodChange = (value: string) => {
        setSelectedPaymentMethod(value)
        form.setValue('payment_method', value as 'mpesa' | 'card' | 'pesapal' | 'paypal' | 'credit' | 'cash')
        form.clearErrors()
    }

    const submitMutation = UseApiMutation<SubmitResponse, MpesaPayload>({
        url: 'mpesa/stk-push',
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data: SubmitResponse) => {
                const checkoutId = data.CheckoutRequestID || data.data?.CheckoutRequestID || data.data?.checkout_request_id

                if (!checkoutId) {
                    ShowToast.error(data.message || 'Failed to initiate payment.')
                    return
                }
                ShowToast.success('Check your phone and enter your M-Pesa PIN.')
                startMpesaPolling(String(checkoutId))
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error)
                ShowToast.error(message || 'Submission failed!')
            },
        },
    })

    const onSubmit = (data: PaymentFormInput) => {
        if (usesPesapal(data)) {
            submitPesapal(data)
            return
        }

        if (data.payment_method === 'card' && data.card_provider === 'paystack') {
            storePaymentStatusSession({ flow: 'marine', invoiceId: data.invoice_id })
            navigate(EROUTES.PAYMENT_PAYSTACK_SUCCESS)
            return
        }

        if (data.payment_method !== 'mpesa') {
            goToNextStep?.()
            return
        }
        storePaymentStatusSession({ flow: 'marine', invoiceId: data.invoice_id })
        const payload: MpesaPayload = {
            phone: data.phone_number ?? '',
            amount: data.amount ?? 0,
            invoice_id: data.invoice_id ?? '',
            account_reference: 'POLICY-PAYMENT',
            transaction_desc: 'Policy payment',
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
                                className="w-full h-10 rounded-[5px] border border-[#ADABAB] bg-white"
                                control={form.control}
                                name="first_installment"
                                label="1st Installment 40%"
                            />
                            <ReuseableInput
                                className="w-full h-10 rounded-[5px] border border-[#ADABAB] bg-white"
                                control={form.control}
                                name="second_installment"
                                label="2nd Installment 30%"
                            />
                            <ReuseableInput
                                className="w-full h-10 rounded-[5px] border border-[#ADABAB] bg-white sm:col-span-2 lg:col-span-1"
                                control={form.control}
                                name="third_installment"
                                label="3rd Installment 30%"
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

                <CardFooter className="w-full flex flex-col sm:flex-row justify-between gap-3 mt-3 px-2 sm:px-0">
                    <Button
                        type="button"
                        className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                        leftIcon={<ArrowLeftCircle />}
                        onClick={() => goToPrevStep?.()}>
                        Previous
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPolling || isPesapalSubmitting}
                        className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                        rightIcon={<ArrowRightCircle />}>
                        {isPolling || isPesapalSubmitting ? 'Processing...' : 'Proceed To Payment'}
                    </Button>
                </CardFooter>
            </form>
        </FormProvider>
    )
}
