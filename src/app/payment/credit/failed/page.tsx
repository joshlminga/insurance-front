import { PaymentFailedPage } from '@/app/payment/components/payment-failed-page'

export const CreditFailedPage = () => (
    <PaymentFailedPage
        methodLabel="Credit"
        description="We could not complete this credit payment. You can try again from the payment step."
    />
)
