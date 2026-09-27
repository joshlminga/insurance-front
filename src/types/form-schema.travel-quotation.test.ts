import { describe, expect, it } from 'vitest'
import {
  TravelQuotationSchema,
  TravelQuotationTravelerSchema,
  travelAddDaysIso,
  travelLocalIsoDate,
} from './form-schema'

const today = travelLocalIsoDate()
const tomorrow = travelAddDaysIso(today, 1)
const dayAfterTomorrow = travelAddDaysIso(today, 2)
const yesterday = travelAddDaysIso(today, -1)

const validTraveler = {
  first_name: 'Jane',
  middle_name: '',
  surname: 'Doe',
  date_of_birth: '1990-01-15',
  email: 'jane@example.com',
  phone: '0712345678',
  nationality: '1',
}

const basePayload = {
  bound: 'Outbound' as const,
  country_of_departure: '1',
  country_of_arrival: '2',
  travel_as: 'Individual' as const,
  date_of_departure: tomorrow,
  date_of_return: dayAfterTomorrow,
  type_of_trip: 'Single' as const,
  reason_for_travel: '10',
  travelers: [validTraveler],
}

describe('TravelQuotationSchema date rules', () => {
  it('rejects departure date before today', () => {
    const result = TravelQuotationSchema.safeParse({
      ...basePayload,
      date_of_departure: yesterday,
      date_of_return: today,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const departureIssues = result.error.issues.filter((issue) =>
        issue.path.includes('date_of_departure'),
      )
      expect(departureIssues.length).toBeGreaterThan(0)
    }
  })

  it('rejects same-day return (must be at least day after departure)', () => {
    const result = TravelQuotationSchema.safeParse({
      ...basePayload,
      date_of_departure: tomorrow,
      date_of_return: tomorrow,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const returnIssues = result.error.issues.filter((issue) =>
        issue.path.includes('date_of_return'),
      )
      expect(returnIssues[0]?.message).toContain('day after departure')
    }
  })

  it('accepts return on the day after departure', () => {
    const result = TravelQuotationSchema.safeParse({
      ...basePayload,
      date_of_departure: tomorrow,
      date_of_return: dayAfterTomorrow,
    })

    expect(result.success).toBe(true)
  })

  it('accepts departure on today when return is tomorrow', () => {
    const result = TravelQuotationSchema.safeParse({
      ...basePayload,
      date_of_departure: today,
      date_of_return: tomorrow,
    })

    expect(result.success).toBe(true)
  })
})

describe('TravelQuotationTravelerSchema date of birth', () => {
  it('accepts a past date of birth', () => {
    const result = TravelQuotationTravelerSchema.safeParse({
      ...validTraveler,
      date_of_birth: yesterday,
    })

    expect(result.success).toBe(true)
  })

  it('accepts today as date of birth', () => {
    const result = TravelQuotationTravelerSchema.safeParse({
      ...validTraveler,
      date_of_birth: today,
    })

    expect(result.success).toBe(true)
  })

  it('rejects a future date of birth', () => {
    const result = TravelQuotationTravelerSchema.safeParse({
      ...validTraveler,
      date_of_birth: tomorrow,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const dobIssues = result.error.issues.filter((issue) =>
        issue.path.includes('date_of_birth'),
      )
      expect(dobIssues[0]?.message).toContain('after today')
    }
  })
})
