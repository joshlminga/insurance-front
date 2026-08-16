import { PaymentFailedPage } from '@/app/payment/components/payment-failed-page'

export const MpesaFailedPage = () => (
    <PaymentFailedPage
        methodLabel="M-Pesa"
        description="We could not confirm your M-Pesa payment. You can try again from the payment step."
    />
)
