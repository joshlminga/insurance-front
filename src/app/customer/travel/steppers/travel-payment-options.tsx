/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Travel payment options — Full payment only (no installment / payment-plan UI).
 * Summary comes from purchase/travel/{purchaseId}/summary.
 * Gateway flows keep working against the travel purchase invoice id.
 */
import { CreditPendingBanner } from '@/app/admin/credit/components/CreditPendingBanner'
import { CreditScheduleStatusPanel } from '@/app/admin/credit/components/CreditScheduleStatusPanel'
import { submitMotorCreditPayment } from '@/app/admin/credit/credit-payment'
import {
  storePaymentStatusSession,
  type PaymentStatusFlow,
} from '@/app/payment/payment-session'
import { CardFooter } from '@/components/ui/card'
import {
  Button,
  CustomDialogComponent,
  ReusableDropdown,
  ReuseableRadioChoiceGroup,
  SendInvoiceViaEmail,
} from '@/dev/core'
import { useCustomDialogContextFactory } from '@/hooks'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { useActionWaitHold } from '@/hooks/use-action-wait-hold'
import { usePaystackPaymentFlow } from '@/hooks/use-paystack-payment-flow'
import { usePesapalPaymentFlow } from '@/hooks/use-pesapal-payment-flow'
import { getPaymentActionWaitDetail } from '@/lib/action-wait'
import { PaymentDetailsSchema } from '@/types/form-schema'
import type { PaymentFormInput } from '@/types/schema'
import type {
  CustomerVerificationDetailsProps,
  MpesaPayload,
  SubmitResponse,
} from '@/types/types'
import {
  EMETHODS,
  INVOICE_SESSION_STORAGE_KEY,
  PURCHASE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { customerPaymentTabs, EPAYMENTTABS } from '@/utils/steps-config'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle, Eye, Mail, Share2 } from 'lucide-react'
import React from 'react'
import { FormProvider, type Resolver, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

type TravelSummaryData = {
  invoice_breakdown?: {
    items?: Array<{
      id?: string | number
      installment_amount?: number | string
      total_amount?: number | string
    }>
  }
  /** Settlement currency after FX (KES) — payment is never in product USD/EUR/etc. */
  currency?: string | null
  currency_symbol?: string | null
  total_premium?: number | string
  total_payable?: number | string
  cover?: {
    premium?: {
      currency?: string | null
      currency_symbol?: string | null
      source_currency_code?: string | null
      source_basic_premium?: number | string | null
      exchange_rate?: number | string | null
    }
  }
}

type TravelPaymentOptionsPageProps = CustomerVerificationDetailsProps & {
  /** Admin travel purchase uses 'admin' so receipt returns to travel-quotations/purchase. */
  paymentStatusFlow?: PaymentStatusFlow
  /** Show the Credit tab. Only the admin travel purchase passes true; customers never see it. */
  includeCreditPayment?: boolean
}

export const TravelPaymentOptionsPage: React.FC<
  TravelPaymentOptionsPageProps
> = ({
  goToNextStep,
  goToPrevStep,
  paymentStatusFlow = 'motor',
  includeCreditPayment = false,
}) => {
  const navigate = useNavigate()
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    React.useState<string>('mpesa')
  const [purchaseId, setPurchaseId] = React.useState<string | null>(null)
  const [creditPending, setCreditPending] = React.useState<{
    message: string
    creditTransactionId?: number
    invoiceId?: string
  } | null>(null)
  const [isCreditSubmitting, setIsCreditSubmitting] = React.useState(false)

  // Gateways still use motor return routes until travel-specific return URLs exist.
  const {
    pollMode,
    isPolling: isGatewayPolling,
    stopPolling: stopGatewayPolling,
    startMpesaPolling,
    submitPesapal,
    usesPesapal,
    isPesapalSubmitting,
  } = usePesapalPaymentFlow({ flow: paymentStatusFlow, goToNextStep })

  const {
    isPolling: isPaystackPolling,
    stopPolling: stopPaystackPolling,
    submitPaystack,
    usesPaystack,
    isPaystackSubmitting,
  } = usePaystackPaymentFlow({ flow: paymentStatusFlow })

  const isPolling = isGatewayPolling || isPaystackPolling
  const stopPolling = isPaystackPolling ? stopPaystackPolling : stopGatewayPolling

  useActionWaitHold('travel-payment-poll', isPolling, {
    detail: getPaymentActionWaitDetail({
      isPaystack: isPaystackPolling,
      pollMode,
    }),
    onCancel: stopPolling,
  })

  React.useEffect(() => {
    const storedPurchaseKey =
      sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY) ??
      sessionStorage.getItem(INVOICE_SESSION_STORAGE_KEY)

    setPurchaseId(storedPurchaseKey || null)
  }, [])

  const { data: SummaryData } = UseApiQuery<SubmitResponse>({
    url: purchaseId ? `purchase/travel/${purchaseId}/summary` : '',
    queryOptions: {
      enabled: !!purchaseId,
      retry: 1,
    },
  })

  const form = useForm<PaymentFormInput>({
    resolver: zodResolver(PaymentDetailsSchema) as Resolver<PaymentFormInput>,
    defaultValues: {
      payment_method: 'mpesa',
      amount: 1.0,
      phone_number: '',
      invoice_id: '',
      payment_plans: 'Full',
      first_installment: '',
      second_installment: '',
      third_installment: '',
      card_provider: 'paystack',
      paypal_email: '',
      pesapal_email: '',
      paystack_email: '',
      available_credit: '',
      unsettled_credit: '',
      unsettled_credit_limit: '',
      credit_acknowledged: false,
      mpesa_transaction_code: '',
      payment_proof_receipt: undefined,
    },
  })

  const summary = SummaryData?.data as TravelSummaryData | undefined
  const payableItem = summary?.invoice_breakdown?.items?.[0]
  const fullAmount =
    payableItem?.installment_amount ??
    payableItem?.total_amount ??
    summary?.total_payable ??
    summary?.total_premium

  // Always show settlement currency (KES/KSh) — amount is already converted from any product currency.
  const settlementSymbol = (() => {
    const raw =
      summary?.currency_symbol ??
      summary?.cover?.premium?.currency_symbol ??
      summary?.currency ??
      summary?.cover?.premium?.currency ??
      'KSh'
    const trimmed = String(raw).trim()
    if (!trimmed) return 'KSh'
    const upper = trimmed.toUpperCase()
    if (upper === 'KES' || upper === 'KSH') return 'KSh'
    return trimmed
  })()

  const sourceCurrency = String(
    summary?.cover?.premium?.source_currency_code ?? '',
  ).trim()
  const sourceBasic = summary?.cover?.premium?.source_basic_premium
  const exchangeRate = summary?.cover?.premium?.exchange_rate
  const showFxHint =
    sourceCurrency !== '' &&
    sourceCurrency.toUpperCase() !== 'KES' &&
    sourceCurrency.toUpperCase() !== 'KSH' &&
    sourceBasic != null &&
    sourceBasic !== '' &&
    exchangeRate != null &&
    exchangeRate !== ''

  React.useEffect(() => {
    if (!summary) return

    if (fullAmount != null && fullAmount !== '') {
      form.setValue('amount', Number(fullAmount))
      form.setValue('first_installment', String(fullAmount))
    }
    if (payableItem?.id) {
      form.setValue('invoice_id', String(payableItem.id))
    }
    form.setValue('payment_plans', 'Full')
  }, [summary, payableItem, fullAmount, form])

  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value)
    form.setValue(
      'payment_method',
      value as 'mpesa' | 'card' | 'pesapal' | 'paypal' | 'credit' | 'cash',
    )
    form.clearErrors()
  }

  const submitMutation = UseApiMutation<SubmitResponse, MpesaPayload>({
    url: 'mpesa/stk-push',
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        const checkoutId =
          data.CheckoutRequestID ||
          data.data?.CheckoutRequestID ||
          data.data?.checkout_request_id
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
      storePaymentStatusSession({ flow: paymentStatusFlow, invoiceId: data.invoice_id })
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
          navigate(
            `${EROUTES.PAYMENT_CREDIT_PENDING}?invoice_id=${encodeURIComponent(invoiceId)}`,
          )
          return
        }
        if (result.kind === 'validation_error') {
          ShowToast.error(result.message)
          return
        }
        ShowToast.success(result.message || 'Credit payment submitted successfully')
        navigate(EROUTES.PAYMENT_CREDIT_SUCCESS)
      } catch (error) {
        ShowToast.error(extractErrorMessage(error))
        navigate(EROUTES.PAYMENT_CREDIT_FAILED)
      } finally {
        setIsCreditSubmitting(false)
      }
      return
    }

    if (usesPaystack(data)) {
      storePaymentStatusSession({ flow: paymentStatusFlow, invoiceId: data.invoice_id })
      submitPaystack(data)
      return
    }

    if (data.payment_method !== 'mpesa') {
      goToNextStep?.()
      return
    }
    storePaymentStatusSession({ flow: paymentStatusFlow, invoiceId: data.invoice_id })
    const payload: MpesaPayload = {
      phone: data.phone_number ?? '',
      amount: data.amount ?? 0,
      invoice_id: data.invoice_id ?? '',
    }
    submitMutation.mutate(payload)
  }

  const InvoiceViewMutation = UseApiMutation<Blob, string>({
    url: `document/motor/invoice-all/${purchaseId}`,
    method: EMETHODS.GET,
    config: {
      responseType: 'blob',
    },
    mutationOptions: {
      onSuccess: (data) => {
        const blob = new Blob([data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const width = 1000
        const height = 900
        const left = window.screen.width / 2 - width / 2
        const top = window.screen.height / 2 - height / 2

        const previewWindow = window.open(
          url,
          'DocumentPreview',
          `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`,
        )
        if (previewWindow) {
          previewWindow.focus()
        } else {
          ShowToast.error(
            'Pop-up blocked! Please allow pop-ups to preview the document.',
          )
        }
        ShowToast.success('Invoice preview opened')
      },
      onError: (error: unknown) => {
        const message = extractErrorMessage(error)
        ShowToast.error(message || 'Download failed!')
      },
    },
  })

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      data?: any
    }>()

  const formattedAmount =
    fullAmount != null && fullAmount !== ''
      ? Number(fullAmount).toLocaleString()
      : '—'

  return (
    <>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto w-full bg-transparent"
        >
          <div className="w-full items-center justify-center p-2 sm:p-4">
            {/* Full-only summary — no payment-plan selector */}
            <div className="mb-4 min-h-45.5 h-auto w-full rounded-[3px] bg-[#D9D9D95E] p-4 shadow-[0px_4px_4px_0px_#00000040] sm:p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[15px] font-medium text-black">
                    Payment Plan
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Travel cover is paid in full. Complete payment for the
                    outstanding invoice amount.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-[5px] border border-[#ADABAB] bg-white px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="text-sm font-medium text-black">Full payment</p>
                  </div>
                  <div className="rounded-[5px] border border-[#ADABAB] bg-white px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">
                      Amount due (settlement currency)
                    </p>
                    <p className="text-sm font-medium text-black">
                      {settlementSymbol} {formattedAmount}
                    </p>
                    {showFxHint ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Converted from {sourceCurrency}{' '}
                        {Number(sourceBasic).toLocaleString()} (rate{' '}
                        {Number(exchangeRate).toLocaleString()})
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full py-3">
              <h6 className="text-base font-bold sm:text-lg">
                Please Select Your Preferred Payment Option
              </h6>
            </div>
            <ReuseableRadioChoiceGroup
              variant="tabs"
              layout="horizontal"
              activeColor="#D3EDFF"
              selectorPosition="left"
              showSelector={true}
              value={selectedPaymentMethod}
              onValueChange={handlePaymentMethodChange}
              items={includeCreditPayment ? EPAYMENTTABS : customerPaymentTabs()}
            />
          </div>

          {creditPending ? (
            <div className="space-y-4 px-2 sm:px-4">
              <CreditPendingBanner
                message={creditPending.message}
                creditTransactionId={creditPending.creditTransactionId}
                invoiceId={creditPending.invoiceId}
                showDashboardLink={false}
              />
              {creditPending.invoiceId ? (
                <CreditScheduleStatusPanel
                  invoiceId={creditPending.invoiceId}
                  onProceeded={() => goToNextStep?.()}
                  showReceiptButton={false}
                />
              ) : null}
            </div>
          ) : null}

          <CardFooter className="mt-3 flex w-full flex-col items-stretch justify-between gap-3 px-0 sm:flex-row sm:items-center">
            <Button
              type="button"
              className="w-full rounded-full border border-[#C20C0C] bg-transparent text-[#C20C0C] hover:bg-[#C20C0C]/10 sm:w-auto"
              leftIcon={<ArrowLeftCircle />}
              onClick={() => goToPrevStep?.()}
            >
              Previous
            </Button>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <ReusableDropdown
                trigger={
                  <Button
                    variant="outline"
                    className="w-full border-[#C20C0C] bg-[#FFF5F5] text-[#C20C0C] hover:bg-[#C20C0C] hover:text-white focus-visible:ring-[#C20C0C]/30 lg:w-auto"
                  >
                    Generate Invoice
                  </Button>
                }
                items={[
                  {
                    label: 'WhatsApp',
                    icon: <Share2 className="h-4 w-4" />,
                  },
                  {
                    label: 'Email',
                    icon: <Mail className="h-4 w-4" />,
                    onClick: () => {
                      handleDialogContextSwitch({
                        componentProps: { data: purchaseId },
                        Component: SendInvoiceViaEmail,
                      })
                    },
                  },
                  {
                    label: 'View Online',
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => {
                      InvoiceViewMutation.mutate(String(purchaseId))
                    },
                  },
                ]}
              />
              <Button
                type="submit"
                disabled={
                  isPolling ||
                  isPesapalSubmitting ||
                  isPaystackSubmitting ||
                  isCreditSubmitting
                }
                className="w-full rounded-full bg-[#C20C0C]/80 hover:bg-[#C20C0C] sm:w-auto"
                rightIcon={<ArrowRightCircle />}
              >
                {isPolling ||
                isPesapalSubmitting ||
                isPaystackSubmitting ||
                isCreditSubmitting
                  ? 'Processing...'
                  : 'Proceed To Payment'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </FormProvider>

      <CustomDialogComponent
        {...{ handleDialogContextSwitch, dialogOpen }}
        className="w-[95vw] p-4 sm:max-w-fit sm:w-auto sm:p-6"
      >
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
