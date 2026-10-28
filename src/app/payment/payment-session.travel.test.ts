import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EPREFIX, EROUTES } from '@/utils/enums'
import { getPesapalReturnUrl } from '@/utils/pesapal-payment'
import {
  getPaymentRetryUrl,
  goToReceipt,
  readPaymentStatusSession,
  storePaymentStatusSession,
} from '@/app/payment/payment-session'
import { useStepperStore } from '@/stores/stepper-store'

const customerTravelUrl = `/${EPREFIX.CUSTOMER}${EROUTES.TRAVEL}`

describe('payment session — travel flow', () => {
  beforeEach(() => {
    sessionStorage.clear()
    useStepperStore.setState({ travelStep: 1, motorStep: 1, marineStep: 1 })
  })

  it('reads and stores flow travel in session', () => {
    storePaymentStatusSession({ flow: 'travel', invoiceId: 'inv-1' })
    expect(readPaymentStatusSession()).toEqual({
      flow: 'travel',
      invoiceId: 'inv-1',
    })
  })

  it('returns customer travel URL for payment retry', () => {
    expect(getPaymentRetryUrl('travel')).toBe(customerTravelUrl)
  })

  it('goToReceipt sets travel success step and navigates (guest)', () => {
    storePaymentStatusSession({ flow: 'travel' })
    const navigate = vi.fn()
    const setStepSpy = vi.spyOn(useStepperStore.getState(), 'setStep')

    goToReceipt(navigate, false)

    expect(setStepSpy).toHaveBeenCalledWith('travel', 8)
    expect(navigate).toHaveBeenCalledWith(customerTravelUrl)
  })

  it('goToReceipt sets travel success step and navigates (authenticated)', () => {
    storePaymentStatusSession({ flow: 'travel' })
    const navigate = vi.fn()
    const setStepSpy = vi.spyOn(useStepperStore.getState(), 'setStep')

    goToReceipt(navigate, true)

    expect(setStepSpy).toHaveBeenCalledWith('travel', 6)
    expect(navigate).toHaveBeenCalledWith(customerTravelUrl)
  })
})

describe('getPesapalReturnUrl — travel', () => {
  it('returns customer travel purchase URL', () => {
    expect(getPesapalReturnUrl('travel')).toBe(customerTravelUrl)
  })
})
