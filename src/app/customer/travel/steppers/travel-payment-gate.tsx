/**
 * Travel payment step gate — CannonKE uses insurer M-Pesa page; others use shared payment options.
 */
import { TravelCannonPaymentPage } from '@/app/customer/travel/steppers/travel-cannon-payment'
import { TravelPaymentOptionsPage } from '@/app/customer/travel/steppers/travel-payment-options'
import type { CustomerVerificationDetailsProps } from '@/types/types'
import { TRAVEL_CANNON_CHECKOUT_KEY } from '@/utils/constatnts'
import React from 'react'

type TravelPaymentGateProps = CustomerVerificationDetailsProps & {
  paymentStatusFlow?: 'travel' | 'admin'
  includeCreditPayment?: boolean
}

const isCannonCheckout = () => {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(TRAVEL_CANNON_CHECKOUT_KEY) === '1'
}

export const TravelPaymentGatePage: React.FC<TravelPaymentGateProps> = (props) => {
  if (isCannonCheckout()) {
    return <TravelCannonPaymentPage {...props} />
  }

  return <TravelPaymentOptionsPage {...props} />
}
