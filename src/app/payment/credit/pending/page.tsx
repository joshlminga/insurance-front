import { CreditScheduleStatusPanel } from '@/app/admin/credit/components/CreditScheduleStatusPanel'
import { PaymentResultCard } from '@/app/payment/components/payment-result-card'
import { EROUTES } from '@/utils/enums'
import {
    patchPaymentStatusSession,
    readPaymentStatusSession,
} from '@/app/payment/payment-session'
import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

/**
 * Waiting-for-approval page. When the schedule is completed (or the user clicks
 * Proceed), we go to credit success — still not straight to the receipt.
 */
export const CreditPendingPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const redirectedRef = React.useRef(false)

    const invoiceId = React.useMemo(() => {
        const fromQuery = searchParams.get('invoice_id')?.trim()
        const fromSession = readPaymentStatusSession()?.invoiceId
        return fromQuery || fromSession || ''
    }, [searchParams])

    React.useEffect(() => {
        if (invoiceId) {
            patchPaymentStatusSession({ invoiceId })
        }
    }, [invoiceId])

    const goToCreditSuccess = React.useCallback(() => {
        if (redirectedRef.current) return
        redirectedRef.current = true
        navigate(EROUTES.PAYMENT_CREDIT_SUCCESS, { replace: true })
    }, [navigate])

    return (
        <PaymentResultCard
            variant="pending"
            methodLabel="Credit"
            title="Credit payment is pending approval"
            description="A manager needs to approve this credit payment. You can update the cover start date below when the API allows it."
        >
            {invoiceId ? (
                <CreditScheduleStatusPanel
                    invoiceId={invoiceId}
                    showReceiptButton={false}
                    onProceeded={goToCreditSuccess}
                    onCompleted={goToCreditSuccess}
                />
            ) : (
                <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No invoice was found for this credit payment.
                </p>
            )}
        </PaymentResultCard>
    )
}
