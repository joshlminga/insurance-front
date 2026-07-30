import { UseApiQuery } from '@/hooks/hooks'
import type { PesapalPollResponse } from '@/types/types'
import {
    PESAPAL_ORDER_TRACKING_ID_KEY,
    PESAPAL_POLL_PENDING_KEY,
    PESAPAL_RETURN_URL_KEY,
    setPesapalPaymentResult,
} from '@/utils/pesapal-payment'
import { EPREFIX, EROUTES } from '@/utils/enums'
import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const PesapalReturnPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [orderTrackingId] = React.useState(() => {
        const fromQuery =
            searchParams.get('OrderTrackingId') ||
            searchParams.get('orderTrackingId') ||
            sessionStorage.getItem(PESAPAL_ORDER_TRACKING_ID_KEY) ||
            ''

        return fromQuery.trim()
    })

    const returnUrl = React.useMemo(
        () =>
            sessionStorage.getItem(PESAPAL_RETURN_URL_KEY) ||
            `/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}`,
        [],
    )

    const statusQuery = UseApiQuery<PesapalPollResponse>({
        url: 'pesapal/status',
        params: orderTrackingId ? { order_tracking_id: orderTrackingId } : undefined,
        queryOptions: {
            enabled: Boolean(orderTrackingId),
            retry: 1,
        },
    })

    React.useEffect(() => {
        if (!orderTrackingId) {
            setPesapalPaymentResult('failed')
            navigate(returnUrl, { replace: true })
            return
        }

        if (statusQuery.isError) {
            setPesapalPaymentResult('failed')
            navigate(returnUrl, { replace: true })
            return
        }

        if (statusQuery.isLoading || !statusQuery.data) return

        const status = statusQuery.data.status?.toLowerCase()
        if (status === 'completed') {
            setPesapalPaymentResult('completed')
            navigate(returnUrl, { replace: true })
            return
        }
        if (status === 'failed') {
            setPesapalPaymentResult('failed')
            navigate(returnUrl, { replace: true })
            return
        }

        sessionStorage.setItem(PESAPAL_POLL_PENDING_KEY, 'true')
        sessionStorage.setItem(PESAPAL_ORDER_TRACKING_ID_KEY, orderTrackingId)
        navigate(returnUrl, { replace: true })
    }, [
        navigate,
        orderTrackingId,
        returnUrl,
        statusQuery.data,
        statusQuery.isError,
        statusQuery.isLoading,
    ])

    return (
        <div className="flex min-h-[50vh] w-full items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0CC258] border-t-transparent" />
                <p className="text-sm font-medium text-gray-700">
                    Finalizing your Pesapal payment...
                </p>
            </div>
        </div>
    )
}
