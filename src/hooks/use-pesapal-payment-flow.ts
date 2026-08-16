/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPaymentStatusPath, patchPaymentStatusSession } from '@/app/payment/payment-session'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type { PaymentFormInput } from '@/types/schema'
import type { PesapalPayload, PesapalPollResponse, SubmitResponse } from '@/types/types'
import { EMETHODS, POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from '@/utils/constatnts'
import {
    getPesapalReturnUrl,
    PESAPAL_ORDER_TRACKING_ID_KEY,
    PESAPAL_POLL_PENDING_KEY,
    readPesapalPaymentResult,
    clearPesapalSessionKeys,
    storePesapalCheckoutSession,
    type PesapalReturnFlow,
} from '@/utils/pesapal-payment'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export type PaymentPollMode = 'mpesa' | 'pesapal' | null

type UsePesapalPaymentFlowOptions = {
    flow: PesapalReturnFlow
    goToNextStep?: () => void
}

export function usePesapalPaymentFlow({ flow, goToNextStep }: UsePesapalPaymentFlowOptions) {
    const navigate = useNavigate()
    const [pollMode, setPollMode] = React.useState<PaymentPollMode>(null)
    const [pollId, setPollId] = React.useState<string | null>(null)
    const [isPolling, setIsPolling] = React.useState(false)
    const [pollMessage, setPollMessage] = React.useState('')

    const stopPolling = React.useCallback(() => {
        setIsPolling(false)
        setPollMessage('')
        setPollId(null)
        setPollMode(null)
    }, [])

    const startMpesaPolling = React.useCallback((checkoutRequestId: string) => {
        patchPaymentStatusSession({ flow, checkoutRequestId })
        setPollMode('mpesa')
        setPollId(checkoutRequestId)
        setIsPolling(true)
        setPollMessage('Waiting for payment confirmation...')
    }, [flow])

    const startPesapalPolling = React.useCallback((orderTrackingId: string) => {
        setPollMode('pesapal')
        setPollId(orderTrackingId)
        setIsPolling(true)
        setPollMessage('Confirming your Pesapal payment...')
    }, [])

    React.useEffect(() => {
        const paymentResult = readPesapalPaymentResult()
        if (paymentResult) {
            clearPesapalSessionKeys()
            if (paymentResult === 'completed') {
                ShowToast.success('Payment confirmed!')
                goToNextStep?.()
            } else {
                ShowToast.error('Payment failed or was cancelled. Please try again.')
            }
            return
        }

        const pollPending = sessionStorage.getItem(PESAPAL_POLL_PENDING_KEY) === 'true'
        const trackingId = sessionStorage.getItem(PESAPAL_ORDER_TRACKING_ID_KEY)
        if (pollPending && trackingId) {
            sessionStorage.removeItem(PESAPAL_POLL_PENDING_KEY)
            startPesapalPolling(trackingId)
        }
    }, [goToNextStep, startPesapalPolling])

    React.useEffect(() => {
        if (!isPolling) return
        const timeoutId = setTimeout(() => {
            const timedOutMode = pollMode
            stopPolling()
            ShowToast.error('Payment timed out. Please try again.')
            if (timedOutMode === 'mpesa') {
                navigate(getPaymentStatusPath('mpesa', 'failed'))
            }
        }, POLL_TIMEOUT_MS)

        return () => clearTimeout(timeoutId)
    }, [isPolling, navigate, pollMode, stopPolling])

    const mpesaPollQuery = UseApiQuery<any>({
        url: 'mpesa/status',
        params: pollMode === 'mpesa' && pollId ? { checkout_request_id: pollId } : undefined,
        queryOptions: {
            enabled: isPolling && pollMode === 'mpesa' && Boolean(pollId),
            refetchInterval: isPolling && pollMode === 'mpesa' ? POLL_INTERVAL_MS : false,
            refetchIntervalInBackground: true,
            retry: 1,
        },
    })

    const pesapalPollQuery = UseApiQuery<PesapalPollResponse>({
        url: 'pesapal/status',
        params: pollMode === 'pesapal' && pollId ? { order_tracking_id: pollId } : undefined,
        queryOptions: {
            enabled: isPolling && pollMode === 'pesapal' && Boolean(pollId),
            refetchInterval: isPolling && pollMode === 'pesapal' ? POLL_INTERVAL_MS : false,
            refetchIntervalInBackground: true,
            retry: 1,
        },
    })

    React.useEffect(() => {
        if (!isPolling || pollMode !== 'mpesa' || !mpesaPollQuery.data) return
        const payload = mpesaPollQuery.data.data ?? mpesaPollQuery.data
        const statusRaw = payload.status?.toLowerCase()
        const resultCode = payload.ResultCode

        const isSuccess =
            statusRaw === 'completed' ||
            statusRaw === 'success' ||
            statusRaw === 'successful' ||
            resultCode === 0
        const isFailed =
            statusRaw === 'failed' ||
            statusRaw === 'cancelled' ||
            statusRaw === 'canceled' ||
            statusRaw === 'error' ||
            (typeof resultCode === 'number' && resultCode !== 0)

        if (isSuccess) {
            stopPolling()
            ShowToast.success(payload.message || payload.ResultDesc || 'Payment confirmed!')
            navigate(getPaymentStatusPath('mpesa', 'success'))
            return
        }
        if (isFailed) {
            stopPolling()
            ShowToast.error(payload.message || payload.ResultDesc || 'Payment failed. Please try again.')
            navigate(getPaymentStatusPath('mpesa', 'failed'))
            return
        }
        setPollMessage(payload.message || 'Waiting for payment confirmation...')
    }, [isPolling, pollMode, mpesaPollQuery.data, navigate, stopPolling])

    React.useEffect(() => {
        if (!isPolling || pollMode !== 'pesapal' || !pesapalPollQuery.data) return
        const statusRaw = pesapalPollQuery.data.status?.toLowerCase()

        if (statusRaw === 'completed') {
            stopPolling()
            clearPesapalSessionKeys()
            ShowToast.success('Payment confirmed!')
            goToNextStep?.()
            return
        }
        if (statusRaw === 'failed') {
            stopPolling()
            clearPesapalSessionKeys()
            ShowToast.error('Payment failed. Please try again.')
            return
        }
        setPollMessage('Confirming your Pesapal payment...')
    }, [isPolling, pollMode, pesapalPollQuery.data, goToNextStep, stopPolling])

    React.useEffect(() => {
        if (!isPolling || pollMode !== 'mpesa' || !mpesaPollQuery.isError) return
        setPollMessage('Still checking payment status...')
    }, [isPolling, pollMode, mpesaPollQuery.isError])

    React.useEffect(() => {
        if (!isPolling || pollMode !== 'pesapal' || !pesapalPollQuery.isError) return
        setPollMessage('Still checking Pesapal payment status...')
    }, [isPolling, pollMode, pesapalPollQuery.isError])

    const pesapalMutation = UseApiMutation<SubmitResponse, PesapalPayload>({
        url: 'pesapal/submit-order',
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (response) => {
                const payload = response.data ?? response
                const orderTrackingId = payload?.order_tracking_id
                const redirectUrl = payload?.redirect_url

                if (!orderTrackingId || !redirectUrl) {
                    ShowToast.error(response.message || 'Failed to initiate Pesapal checkout.')
                    return
                }

                storePesapalCheckoutSession(orderTrackingId, getPesapalReturnUrl(flow))
                ShowToast.success('Redirecting to Pesapal to complete payment.')
                window.location.href = redirectUrl
            },
            onError: (error: any) => {
                ShowToast.error(extractErrorMessage(error) || 'Failed to initiate Pesapal checkout.')
            },
        },
    })

    const submitPesapal = React.useCallback(
        (data: PaymentFormInput) => {
            const invoiceId = Number(data.invoice_id)
            if (!Number.isFinite(invoiceId) || invoiceId <= 0) {
                ShowToast.error('Invoice is missing. Please refresh and try again.')
                return
            }

            const payload: PesapalPayload = {
                invoice_id: invoiceId,
            }

            const phone = data.phone_number?.trim()
            const email = data.pesapal_email?.trim() || data.paypal_email?.trim()

            if (phone) payload.phone = phone
            if (email) payload.email = email

            pesapalMutation.mutate(payload)
        },
        [pesapalMutation],
    )

    const usesPesapal = (data: PaymentFormInput) =>
        data.payment_method === 'pesapal' ||
        (data.payment_method === 'card' && data.card_provider === 'pesapal')

    return {
        pollMode,
        isPolling,
        pollMessage,
        stopPolling,
        startMpesaPolling,
        submitPesapal,
        usesPesapal,
        isPesapalSubmitting: pesapalMutation.isPending,
    }
}
