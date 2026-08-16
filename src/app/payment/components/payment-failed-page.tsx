import { PaymentResultCard } from '@/app/payment/components/payment-result-card'
import { goToPaymentRetry } from '@/app/payment/payment-session'
import { useNavigate } from 'react-router-dom'

type PaymentFailedPageProps = {
    methodLabel: string
    description: string
}

/** Shared failed screen. Try again goes back to the payment step (not the receipt). */
export const PaymentFailedPage = ({ methodLabel, description }: PaymentFailedPageProps) => {
    const navigate = useNavigate()

    return (
        <PaymentResultCard
            variant="failed"
            methodLabel={methodLabel}
            title="Payment was not completed"
            description={description}
            primaryLabel="Try again"
            onPrimaryClick={() => goToPaymentRetry(navigate)}
        />
    )
}
