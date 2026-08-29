import { PaymentChecking } from '@/app/payment/components/payment-checking'
import { getPaymentStatusPath, patchPaymentStatusSession } from '@/app/payment/payment-session'
import { interpretPaystackStatus, readPaystackSettlementId } from '@/app/payment/payment-status'
import { usePreferAdminPaymentReturn } from '@/app/payment/use-prefer-admin-payment-return'
import { UseApiQuery } from '@/hooks/hooks'
import type { PaystackPollResponse } from '@/types/types'
import { POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

function creditSettlementPath(id: number): string {
    return EROUTES.CREDIT_SETTLEMENT.replace(':id', String(id))
}

/**
 * Paystack hosted checkout sends the browser here with ?reference= / ?trxref=.
 * We poll paystack/status until Paystack confirms the invoice (cover) or settlement is paid.
 */
export const PaystackReturnPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const layoutReady = usePreferAdminPaymentReturn('paystack')
    const [reference] = React.useState(() => {
        const fromQuery =
            searchParams.get('reference') ||
            searchParams.get('trxref') ||
            ''
        return fromQuery.trim()
    })

    const [timedOut, setTimedOut] = React.useState(false)

    React.useEffect(() => {
        if (!layoutReady || !reference) return
        patchPaymentStatusSession({ reference })
        const timeoutId = window.setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS)
        return () => window.clearTimeout(timeoutId)
    }, [layoutReady, reference])

    const statusQuery = UseApiQuery<PaystackPollResponse>({
        url: 'paystack/status',
        params: reference ? { reference } : undefined,
        queryOptions: {
            enabled: layoutReady && Boolean(reference) && !timedOut,
            retry: 1,
            refetchInterval: POLL_INTERVAL_MS,
            refetchIntervalInBackground: true,
        },
    })

    React.useEffect(() => {
        if (!layoutReady) return

        if (!reference) {
            navigate(getPaymentStatusPath('paystack', 'failed'), { replace: true })
            return
        }

        const settlementId = readPaystackSettlementId(statusQuery.data)

        if (timedOut) {
            if (settlementId) {
                navigate(creditSettlementPath(settlementId), { replace: true })
                return
            }
            navigate(getPaymentStatusPath('paystack', 'failed'), { replace: true })
            return
        }

        if (statusQuery.isError) {
            if (settlementId) {
                navigate(creditSettlementPath(settlementId), { replace: true })
                return
            }
            navigate(getPaymentStatusPath('paystack', 'failed'), { replace: true })
            return
        }

        if (statusQuery.isLoading || !statusQuery.data) return

        const outcome = interpretPaystackStatus(statusQuery.data)
        if (settlementId && (outcome === 'success' || outcome === 'failed')) {
            navigate(creditSettlementPath(settlementId), { replace: true })
            return
        }
        if (outcome === 'success') {
            navigate(getPaymentStatusPath('paystack', 'success'), { replace: true })
            return
        }
        if (outcome === 'failed') {
            navigate(getPaymentStatusPath('paystack', 'failed'), { replace: true })
        }
    }, [
        layoutReady,
        navigate,
        reference,
        statusQuery.data,
        statusQuery.isError,
        statusQuery.isLoading,
        timedOut,
    ])

    return <PaymentChecking message="Finalizing your Paystack payment..." />
}
