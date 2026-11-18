/**
 * Travel payment step gate — CannonKE uses insurer M-Pesa page; others use shared payment options.
 * Detects Cannon from session flag OR purchase summary (so resume/admin still works).
 */
import { TravelCannonPaymentPage } from '@/app/customer/travel/steppers/travel-cannon-payment'
import { TravelPaymentOptionsPage } from '@/app/customer/travel/steppers/travel-payment-options'
import { useTravelCannonCheckout } from '@/hooks/use-travel-cannon-checkout'
import type { CustomerVerificationDetailsProps } from '@/types/types'
import React from 'react'

type TravelPaymentGateProps = CustomerVerificationDetailsProps & {
  paymentStatusFlow?: 'travel' | 'admin'
  includeCreditPayment?: boolean
}

export const TravelPaymentGatePage: React.FC<TravelPaymentGateProps> = (props) => {
  const { isCannon, isResolving } = useTravelCannonCheckout()

  if (isResolving) {
    return (
      <div className="mx-auto w-full max-w-lg py-10 text-center text-sm text-muted-foreground">
        Checking payment options…
      </div>
    )
  }

  if (isCannon) {
    return <TravelCannonPaymentPage {...props} />
  }

  return <TravelPaymentOptionsPage {...props} />
}
