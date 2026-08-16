import { PaymentChecking } from '@/app/payment/components/payment-checking'
import { CREDIT_URLS } from '@/app/admin/credit/credit-query'
import {
    getPaymentStatusPath,
    patchPaymentStatusSession,
    readPaymentStatusSession,
} from '@/app/payment/payment-session'
import { interpretCreditScheduleStatus, readCreditSchedule } from '@/app/payment/payment-status'
import { UseApiQuery } from '@/hooks/hooks'
import type { SubmitResponse } from '@/types/types'
import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

/**
 * Reads invoice_id from the URL or session, loads the credit schedule, then
 * sends the user to success, pending, or failed. Does not charge again.
 */
export const CreditReturnPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [invoiceId] = React.useState(() => {
        const fromQuery = searchParams.get('invoice_id')?.trim()
        const fromSession = readPaymentStatusSession()?.invoiceId
        return fromQuery || fromSession || ''
    })

    const scheduleQuery = UseApiQuery<SubmitResponse>({
        url: CREDIT_URLS.invoiceSchedule(invoiceId),
        queryOptions: {
            enabled: Boolean(invoiceId),
            retry: 1,
        },
    })

    React.useEffect(() => {
        if (!invoiceId) {
            navigate(getPaymentStatusPath('credit', 'failed'), { replace: true })
            return
        }

        patchPaymentStatusSession({ invoiceId })

        if (scheduleQuery.isError) {
            navigate(getPaymentStatusPath('credit', 'failed'), { replace: true })
            return
        }

        if (scheduleQuery.isLoading || !scheduleQuery.data) return

        const schedule = readCreditSchedule(scheduleQuery.data)
        const outcome = interpretCreditScheduleStatus(schedule?.status)

        if (outcome === 'success') {
            navigate(getPaymentStatusPath('credit', 'success'), { replace: true })
            return
        }
        if (outcome === 'pending') {
            navigate(`${getPaymentStatusPath('credit', 'pending')}?invoice_id=${encodeURIComponent(invoiceId)}`, {
                replace: true,
            })
            return
        }

        navigate(getPaymentStatusPath('credit', 'failed'), { replace: true })
    }, [
        invoiceId,
        navigate,
        scheduleQuery.data,
        scheduleQuery.isError,
        scheduleQuery.isLoading,
    ])

    return <PaymentChecking message="Checking your credit payment status..." />
}
