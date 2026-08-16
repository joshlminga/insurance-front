import { PaymentFailedPage } from '@/app/payment/components/payment-failed-page'

export const PaystackFailedPage = () => (
    <PaymentFailedPage
        methodLabel="Paystack"
        description="We could not confirm your Paystack payment. You can try again from the payment step."
    />
)
