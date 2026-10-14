import { beforeEach, describe, expect, it } from 'vitest'
import { TRAVEL_QUOTATION_FORM_SESSION_KEY } from '@/utils/travel-enums'
import {
  readTravelDepartureDateFromSession,
  readTravelQuotationFormSession,
} from './travel-quotation-session'

describe('travel-quotation-session', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('reads date_of_departure from quotation form session', () => {
    sessionStorage.setItem(
      TRAVEL_QUOTATION_FORM_SESSION_KEY,
      JSON.stringify({
        date_of_departure: '2099-06-01',
        travelers: [{ nationality: '42' }],
      }),
    )

    expect(readTravelDepartureDateFromSession()).toBe('2099-06-01')
    expect(readTravelQuotationFormSession()?.date_of_departure).toBe('2099-06-01')
  })

  it('returns empty departure when session is missing', () => {
    expect(readTravelDepartureDateFromSession()).toBe('')
    expect(readTravelQuotationFormSession()).toBeNull()
  })
})
