import { describe, expect, it } from 'vitest'
import { CustomerVerificationPage } from '@/app/customer/travel/steppers/customer-details'
import OTPTravelVerificationPage from '@/app/customer/travel/steppers/otp-verification'
import { TravellerDetailsPage } from '@/app/customer/travel/steppers/traveller-details'
import { TravelQuotationsPage } from '@/app/customer/travel/steppers/quotations'
import { getTravelSteps } from '@/utils/steps-config'

describe('getTravelSteps', () => {
  it('includes registration and OTP for guests', () => {
    const steps = getTravelSteps(false)

    expect(steps).toHaveLength(8)
    expect(steps[0]?.content).toBe(CustomerVerificationPage)
    expect(steps[1]?.content).toBe(OTPTravelVerificationPage)
    expect(steps[2]?.content).toBe(TravellerDetailsPage)
    expect(steps[3]?.content).toBe(TravelQuotationsPage)
  })

  it('skips registration and OTP when authenticated', () => {
    const guestSteps = getTravelSteps(false)
    const authSteps = getTravelSteps(true)

    expect(guestSteps).toHaveLength(8)
    expect(authSteps).toHaveLength(6)
    expect(authSteps.length).toBe(guestSteps.length - 2)
    expect(authSteps[0]?.content).toBe(TravellerDetailsPage)
    expect(authSteps[1]?.content).toBe(TravelQuotationsPage)
    expect(authSteps.some((step) => step.content === CustomerVerificationPage)).toBe(false)
    expect(authSteps.some((step) => step.content === OTPTravelVerificationPage)).toBe(false)
  })

  it('does not include the Destination step', () => {
    const guestSteps = getTravelSteps(false)
    const authSteps = getTravelSteps(true)

    // Destination was removed: TravellerDetails goes straight to Quotations
    expect(guestSteps[2]?.content).toBe(TravellerDetailsPage)
    expect(guestSteps[3]?.content).toBe(TravelQuotationsPage)
    expect(authSteps[0]?.content).toBe(TravellerDetailsPage)
    expect(authSteps[1]?.content).toBe(TravelQuotationsPage)
  })
})
