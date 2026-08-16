import { PaymentChecking } from '@/app/payment/components/payment-checking'
import { getPaymentStatusPath, patchPaymentStatusSession } from '@/app/payment/payment-session'
import { interpretPaystackStatus } from '@/app/payment/payment-status'
import { UseApiQuery } from '@/hooks/hooks'
import type { PaystackPollResponse } from '@/types/types'
import { POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from '@/utils/constatnts'
import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

/**
 * Paystack hosted checkout sends the browser here with ?reference= / ?trxref=.
 * We poll paystack/status until Paystack (and our webhook) confirm the invoice is paid.
 */
export const PaystackReturnPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [reference] = React.useState(() => {
        const fromQuery =
            searchParams.get('reference') ||
            searchParams.get('trxref') ||
            ''
        return fromQuery.trim()
    })

    const [timedOut, setTimedOut] = React.useState(false)

    React.useEffect(() => {
        if (!reference) return
        patchPaymentStatusSession({ reference })
        const timeoutId = window.setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS)
        return () => window.clearTimeout(timeoutId)
    }, [reference])

    const statusQuery = UseApiQuery<PaystackPollResponse>({
        url: 'paystack/status',
        params: reference ? { reference } : undefined,
        queryOptions: {
            enabled: Boolean(reference) && !timedOut,
            retry: 1,
            refetchInterval: POLL_INTERVAL_MS,
            refetchIntervalInBackground: true,
        },
    })

    React.useEffect(() => {
        if (!reference) {
            navigate(getPaymentStatusPath('paystack', 'failed'), { replace: true })
            return
        }

        if (timedOut) {
            navigate(getPaymentStatusPath('paystack', 'failed'), { replace: true })
            return
        }

        if (statusQuery.isError) {
            navigate(getPaymentStatusPath('paystack', 'failed'), { replace: true })
            return
        }

        if (statusQuery.isLoading || !statusQuery.data) return

        const outcome = interpretPaystackStatus(statusQuery.data)
        if (outcome === 'success') {
            navigate(getPaymentStatusPath('paystack', 'success'), { replace: true })
            return
        }
        if (outcome === 'failed') {
            navigate(getPaymentStatusPath('paystack', 'failed'), { replace: true })
        }
    }, [
        navigate,
        reference,
        statusQuery.data,
        statusQuery.isError,
        statusQuery.isLoading,
        timedOut,
    ])

    return <PaymentChecking message="Finalizing your Paystack payment..." />
}
