/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPaymentStatusPath, patchPaymentStatusSession } from '@/app/payment/payment-session'
import { interpretPaystackStatus } from '@/app/payment/payment-status'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type { PaymentFormInput } from '@/types/schema'
import type { PaystackPayload, PaystackPollResponse, SubmitResponse } from '@/types/types'
import { EMETHODS, POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { openPaystackPopup } from '@/utils/paystack-payment'
import { ShowToast } from '@/utils/utils'
import type { PaymentStatusFlow } from '@/app/payment/payment-session'
import React from 'react'
import { useNavigate } from 'react-router-dom'

type UsePaystackPaymentFlowOptions = {
  flow: PaymentStatusFlow
}

type PaystackCheckoutFields = {
  reference?: string
  access_code?: string
  authorization_url?: string
  public_key?: string
}

function checkoutFromResponse(response: SubmitResponse): PaystackCheckoutFields {
  const payload = (response.data ?? response) as PaystackCheckoutFields
  return {
    reference: payload.reference,
    access_code: payload.access_code,
    authorization_url: payload.authorization_url,
    public_key: payload.public_key,
  }
}

export function usePaystackPaymentFlow({ flow }: UsePaystackPaymentFlowOptions) {
  const navigate = useNavigate()
  const [pollId, setPollId] = React.useState<string | null>(null)
  const [isPolling, setIsPolling] = React.useState(false)
  const [pollMessage, setPollMessage] = React.useState('')

  const stopPolling = React.useCallback(() => {
    setIsPolling(false)
    setPollMessage('')
    setPollId(null)
  }, [])

  const startPaystackPolling = React.useCallback((reference: string) => {
    patchPaymentStatusSession({ flow, reference })
    setPollId(reference)
    setIsPolling(true)
    setPollMessage('Confirming your Paystack payment...')
  }, [flow])

  const redirectToHostedCheckout = React.useCallback((authorizationUrl: string, reference: string) => {
    patchPaymentStatusSession({ flow, reference })
    ShowToast.success('Redirecting to Paystack to complete payment.')
    window.location.href = authorizationUrl
  }, [flow])

  React.useEffect(() => {
    if (!isPolling) return
    const timeoutId = setTimeout(() => {
      stopPolling()
      ShowToast.error('Payment timed out. Please try again.')
      navigate(getPaymentStatusPath('paystack', 'failed'))
    }, POLL_TIMEOUT_MS)

    return () => clearTimeout(timeoutId)
  }, [isPolling, navigate, stopPolling])

  const paystackPollQuery = UseApiQuery<PaystackPollResponse>({
    url: 'paystack/status',
    params: isPolling && pollId ? { reference: pollId } : undefined,
    queryOptions: {
      enabled: isPolling && Boolean(pollId),
      refetchInterval: isPolling ? POLL_INTERVAL_MS : false,
      refetchIntervalInBackground: true,
      retry: 1,
    },
  })

  React.useEffect(() => {
    if (!isPolling || !paystackPollQuery.data) return

    const outcome = interpretPaystackStatus(paystackPollQuery.data)
    if (outcome === 'success') {
      stopPolling()
      ShowToast.success('Payment confirmed!')
      navigate(getPaymentStatusPath('paystack', 'success'))
      return
    }
    if (outcome === 'failed') {
      stopPolling()
      ShowToast.error('Payment failed. Please try again.')
      navigate(getPaymentStatusPath('paystack', 'failed'))
      return
    }

    setPollMessage('Confirming your Paystack payment...')
  }, [isPolling, navigate, paystackPollQuery.data, stopPolling])

  React.useEffect(() => {
    if (!isPolling || !paystackPollQuery.isError) return
    setPollMessage('Still checking Paystack payment status...')
  }, [isPolling, paystackPollQuery.isError])

  const paystackMutation = UseApiMutation<SubmitResponse, PaystackPayload>({
    url: 'paystack/initialize',
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: async (response, variables) => {
        const checkout = checkoutFromResponse(response)
        const reference = checkout.reference
        const authorizationUrl = checkout.authorization_url

        if (!reference) {
          ShowToast.error(response.message || 'Failed to initiate Paystack checkout.')
          return
        }

        patchPaymentStatusSession({ flow, reference, invoiceId: String(variables.invoice_id) })

        const opened = await openPaystackPopup({
          accessCode: checkout.access_code,
          publicKey: checkout.public_key,
          email: variables.email ?? '',
          amount: variables.amount ?? 0,
          reference,
          onSuccess: () => startPaystackPolling(reference),
          onCancel: () => {
            ShowToast.error('Paystack checkout was closed. Please try again.')
          },
        })

        if (!opened) {
          if (!authorizationUrl) {
            ShowToast.error('Failed to open Paystack checkout.')
            return
          }
          redirectToHostedCheckout(authorizationUrl, reference)
        }
      },
      onError: (error: any) => {
        ShowToast.error(extractErrorMessage(error) || 'Failed to initiate Paystack checkout.')
      },
    },
  })

  const submitPaystack = React.useCallback(
    (data: PaymentFormInput) => {
      const invoiceId = Number(data.invoice_id)
      if (!Number.isFinite(invoiceId) || invoiceId <= 0) {
        ShowToast.error('Invoice is missing. Please refresh and try again.')
        return
      }

      const email = data.paystack_email?.trim() || data.pesapal_email?.trim()
      if (!email) {
        ShowToast.error('Enter an email address for Paystack checkout.')
        return
      }

      const payload: PaystackPayload = {
        invoice_id: invoiceId,
        email,
        amount: data.amount,
      }

      const phone = data.phone_number?.trim()
      if (phone) payload.phone = phone

      paystackMutation.mutate(payload)
    },
    [paystackMutation],
  )

  const usesPaystack = (data: PaymentFormInput) =>
    data.payment_method === 'card' && data.card_provider === 'paystack'

  return {
    isPolling,
    pollMessage,
    stopPolling,
    submitPaystack,
    usesPaystack,
    isPaystackSubmitting: paystackMutation.isPending,
  }
}
