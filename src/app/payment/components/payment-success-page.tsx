import { PaymentResultCard } from '@/app/payment/components/payment-result-card'
import { useReceiptContinue } from '@/app/payment/components/use-receipt-continue'

type PaymentSuccessPageProps = {
    methodLabel: string
    description: string
}

/** Shared success screen: Continue button + 10s auto-redirect to the receipt step. */
export const PaymentSuccessPage = ({ methodLabel, description }: PaymentSuccessPageProps) => {
    const { secondsLeft, continueToReceipt } = useReceiptContinue()

    return (
        <PaymentResultCard
            variant="success"
            methodLabel={methodLabel}
            title="Payment completed successfully"
            description={description}
            primaryLabel="Continue to receipt"
            onPrimaryClick={continueToReceipt}
            helperText={`Redirecting to your receipt in ${secondsLeft} second${secondsLeft === 1 ? '' : 's'}…`}
        />
    )
}
