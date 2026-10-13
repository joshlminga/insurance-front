import { describe, expect, it } from 'vitest'
import { buildTravelQuotationPayload } from './travel-quotation-payload'
import type { AdminTravelQuotationFormValues } from '@/types/schema'

const baseTrip = {
  bound: 'Outbound' as const,
  country_of_departure: '1',
  country_of_arrival: '2',
  travel_as: 'Individual' as const,
  date_of_departure: '2099-06-01',
  date_of_return: '2099-06-10',
  type_of_trip: 'Single' as const,
  reason_for_travel: '10',
  travelers: [
    {
      first_name: 'Jane',
      middle_name: '',
      surname: 'Doe',
      date_of_birth: '1990-01-01',
      email: 'jane@example.com',
      phone: '712345678',
      nationality: '3',
    },
  ],
}

function formValues(
  overrides: Partial<AdminTravelQuotationFormValues> = {}
): AdminTravelQuotationFormValues {
  return {
    full_name: '',
    email: '',
    phone: '',
    user_id: '',
    country_id: '1',
    agency_id: '101',
    processed_by_organization_id: '',
    referral_id: '',
    create_customer_account: false,
    ...baseTrip,
    ...overrides,
  } as AdminTravelQuotationFormValues
}

describe('buildTravelQuotationPayload', () => {
  it('maps Your Agency to agency_id and On behalf to processed_by_organization_id', () => {
    const payload = buildTravelQuotationPayload({
      data: formValues({
        agency_id: '55',
        processed_by_organization_id: '77',
        user_id: '9',
      }),
      dialCode: '+254',
    })

    expect(payload.agency_id).toBe('55')
    expect(payload.processed_by_organization_id).toBe('77')
    expect(payload.user_id).toBe('9')
    expect(payload.is_guest).toBeUndefined()
  })

  it('trims referral_id and sends null when empty', () => {
    const withCode = buildTravelQuotationPayload({
      data: formValues({ referral_id: '  REF-1  ', user_id: '1' }),
      dialCode: '+254',
    })
    expect(withCode.referral_id).toBe('REF-1')

    const empty = buildTravelQuotationPayload({
      data: formValues({ referral_id: '   ', user_id: '1' }),
      dialCode: '+254',
    })
    expect(empty.referral_id).toBeNull()
  })

  it('sends guest contact when no user_id and create account unchecked', () => {
    const payload = buildTravelQuotationPayload({
      data: formValues({
        full_name: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '712345678',
        create_customer_account: false,
      }),
      dialCode: '+254',
    })

    expect(payload.user_id).toBeNull()
    expect(payload.is_guest).toBe(true)
    expect(payload.first_name).toBe('Ada')
    expect(payload.last_name).toBe('Lovelace')
    expect(payload.email).toBe('ada@example.com')
    expect(payload.phone).toBe('+254712345678')
    expect(payload.agency_id).toBe('101')
  })

  it('sends is_guest false when create account is checked', () => {
    const payload = buildTravelQuotationPayload({
      data: formValues({
        full_name: 'Ada',
        email: 'ada@example.com',
        phone: '712345678',
        create_customer_account: true,
      }),
      dialCode: '+254',
    })

    expect(payload.is_guest).toBe(false)
    expect(payload.user_id).toBeNull()
  })
})
