import { beforeEach, describe, expect, it } from 'vitest'
import {
  ADMIN_ACTIVE_QUOTATION_PRODUCT_KEY,
  ADMIN_TRAVEL_CUSTOMER_EMAIL_KEY,
  PURCHASE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import {
  TRAVEL_QUOTATION_FORM_SESSION_KEY,
  TRAVEL_QUOTE_SESSION_STORAGE_KEY,
} from '@/utils/travel-enums'
import { ADMIN_TRAVEL_PURCHASE_STEP_KEY } from '@/app/payment/payment-session'
import type { TravelQuoteFetchDetail } from '@/types/types'
import { persistAdminTravelResumeFromDetail } from './admin-travel-session'

describe('persistAdminTravelResumeFromDetail', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('resumes quote stage to results (no purchase step)', () => {
    const detail: TravelQuoteFetchDetail = {
      last_ended_stage: 'quote',
      session: {
        id: 42,
        quote_code: 'Q-TRV-2026-000042',
        customer_type: 'guest',
        customer_id: 9,
      },
      customer: {
        id: 9,
        type: 'guest',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+254700000001',
      },
      trip: {
        bound: 'Outbound',
        country_of_departure: 1,
        country_of_arrival: 2,
        travel_as: 'Individual',
        date_of_departure: '2099-06-01',
        date_of_return: '2099-06-10',
        type_of_trip: 'Single',
        reason_for_travel: 10,
        travelers: [{ first_name: 'Jane', surname: 'Doe' }],
      },
    }

    const result = persistAdminTravelResumeFromDetail(detail)

    expect(result).toEqual({ stage: 'quote', purchaseStep: null })
    expect(sessionStorage.getItem(TRAVEL_QUOTE_SESSION_STORAGE_KEY)).toBe('42')
    expect(sessionStorage.getItem(ADMIN_ACTIVE_QUOTATION_PRODUCT_KEY)).toBe('travel')
    expect(sessionStorage.getItem(ADMIN_TRAVEL_CUSTOMER_EMAIL_KEY)).toBe('jane@example.com')
    expect(sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY)).toBeNull()
    expect(sessionStorage.getItem(ADMIN_TRAVEL_PURCHASE_STEP_KEY)).toBeNull()

    const form = JSON.parse(sessionStorage.getItem(TRAVEL_QUOTATION_FORM_SESSION_KEY) ?? '{}')
    expect(form.bound).toBe('Outbound')
    expect(form.country_of_arrival).toBe('2')
    expect(form.travelers).toHaveLength(1)
  })

  it('resumes payment stage with purchase + invoice session keys', () => {
    const detail: TravelQuoteFetchDetail = {
      last_ended_stage: 'payment',
      session: {
        id: 77,
        quote_code: 'Q-TRV-2026-000077',
        customer_type: 'guest',
        customer_id: 3,
      },
      customer: {
        type: 'guest',
        name: 'Ada',
        email: 'ada@example.com',
      },
      selected_offer: {
        purchase_id: 500,
        product_id: 1,
        rate_id: 2,
      },
      invoices: [{ id: 900 }],
      trip: {
        bound: 'Inbound',
        travelers: [],
      },
    }

    const result = persistAdminTravelResumeFromDetail(detail)

    expect(result).toEqual({ stage: 'payment', purchaseStep: 3 })
    expect(sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY)).toBe('500')
    expect(sessionStorage.getItem(ADMIN_TRAVEL_PURCHASE_STEP_KEY)).toBe('3')
  })
})
