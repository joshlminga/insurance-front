import { PaymentChecking } from '@/app/payment/components/payment-checking'
import { getPaymentStatusPath, patchPaymentStatusSession, readPaymentStatusSession } from '@/app/payment/payment-session'
import { interpretMpesaStatus } from '@/app/payment/payment-status'
import { UseApiQuery } from '@/hooks/hooks'
import type { MpesaPollResponse } from '@/types/types'
import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

/**
 * Gateway / poll callback for M-Pesa.
 * Reads checkout_request_id from the URL (or session), asks the API once, then
 * sends the user to /payment/mpesa/success or /failed.
 */
export const MpesaReturnPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [checkoutRequestId] = React.useState(() => {
        const fromQuery =
            searchParams.get('checkout_request_id') ||
            searchParams.get('CheckoutRequestID') ||
            ''
        return fromQuery.trim() || readPaymentStatusSession()?.checkoutRequestId || ''
    })

    const statusQuery = UseApiQuery<MpesaPollResponse>({
        url: 'mpesa/status',
        params: checkoutRequestId ? { checkout_request_id: checkoutRequestId } : undefined,
        queryOptions: {
            enabled: Boolean(checkoutRequestId),
            retry: 1,
        },
    })

    React.useEffect(() => {
        if (!checkoutRequestId) {
            navigate(getPaymentStatusPath('mpesa', 'failed'), { replace: true })
            return
        }

        patchPaymentStatusSession({ checkoutRequestId })

        if (statusQuery.isError) {
            navigate(getPaymentStatusPath('mpesa', 'failed'), { replace: true })
            return
        }

        if (statusQuery.isLoading || !statusQuery.data) return

        const outcome = interpretMpesaStatus(statusQuery.data)
        navigate(getPaymentStatusPath('mpesa', outcome === 'success' ? 'success' : 'failed'), {
            replace: true,
        })
    }, [
        checkoutRequestId,
        navigate,
        statusQuery.data,
        statusQuery.isError,
        statusQuery.isLoading,
    ])

    return <PaymentChecking message="Finalizing your M-Pesa payment..." />
}
