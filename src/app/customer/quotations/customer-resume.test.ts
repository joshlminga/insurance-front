import { beforeEach, describe, expect, it } from 'vitest'
import type { MotorQuoteFetchDetail, TravelQuoteFetchDetail } from '@/types/types'
import {
  INVOICE_SESSION_STORAGE_KEY,
  MOTOR_QUOTE_SESSION_STORAGE_KEY,
  PURCHASE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import {
  TRAVEL_QUOTATION_FORM_SESSION_KEY,
  TRAVEL_QUOTE_SESSION_STORAGE_KEY,
} from '@/utils/travel-enums'
import {
  isMotorQuoteResumable,
  mapMotorStageToCustomerStep,
  persistCustomerMotorResumeFromDetail,
} from './customer-motor-resume'
import {
  isTravelQuoteResumable,
  mapTravelStageToCustomerStep,
  persistCustomerTravelResumeFromDetail,
} from './customer-travel-resume'
import {
  documentInvoiceUrl,
  documentReceiptUrl,
} from '@/utils/motor-document-download'
import { EMETHODS } from '@/utils/constatnts'

describe('mapMotorStageToCustomerStep', () => {
  it('maps stages to authenticated stepper indices', () => {
    expect(mapMotorStageToCustomerStep('quote')).toBe(2)
    expect(mapMotorStageToCustomerStep('rates')).toBe(3)
    expect(mapMotorStageToCustomerStep('kyc')).toBe(3)
    expect(mapMotorStageToCustomerStep('payment')).toBe(5)
    expect(mapMotorStageToCustomerStep('certificate')).toBe(6)
  })
})

describe('mapTravelStageToCustomerStep', () => {
  it('maps stages to authenticated stepper indices', () => {
    expect(mapTravelStageToCustomerStep('quote')).toBe(2)
    expect(mapTravelStageToCustomerStep('rates')).toBe(3)
    expect(mapTravelStageToCustomerStep('kyc')).toBe(3)
    expect(mapTravelStageToCustomerStep('payment')).toBe(5)
  })
})

describe('isMotorQuoteResumable', () => {
  it('blocks cancelled, converted, and certificate stages', () => {
    expect(isMotorQuoteResumable({ status: 'in_progress', last_ended_stage: 'kyc' })).toBe(true)
    expect(isMotorQuoteResumable({ status: 'cancelled', last_ended_stage: 'kyc' })).toBe(false)
    expect(isMotorQuoteResumable({ status: 'converted_to_policy', last_ended_stage: 'payment' })).toBe(false)
    expect(isMotorQuoteResumable({ status: 'in_progress', last_ended_stage: 'certificate' })).toBe(false)
  })
})

describe('isTravelQuoteResumable', () => {
  it('blocks cancelled and converted', () => {
    expect(isTravelQuoteResumable({ status: 'in_progress' })).toBe(true)
    expect(isTravelQuoteResumable({ status: 'cancelled' })).toBe(false)
    expect(isTravelQuoteResumable({ status: 'converted_to_policy' })).toBe(false)
  })
})

describe('persistCustomerMotorResumeFromDetail', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('resumes payment stage with purchase keys', () => {
    const detail: MotorQuoteFetchDetail = {
      last_ended_stage: 'payment',
      session: { id: 55, quote_code: 'Q-MTR-55' },
      selected_cover: { purchase_id: 900 },
      invoices: [{ id: 1 }],
      vehicle: { registration_number: 'KDA123A' },
    }

    const result = persistCustomerMotorResumeFromDetail(detail)

    expect(result).toEqual({ stage: 'payment', step: 5 })
    expect(sessionStorage.getItem(MOTOR_QUOTE_SESSION_STORAGE_KEY)).toBe('55')
    expect(sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY)).toBe('900')
    expect(sessionStorage.getItem(INVOICE_SESSION_STORAGE_KEY)).toBe('900')
  })
})

describe('persistCustomerTravelResumeFromDetail', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('resumes quote stage and stores trip form', () => {
    const detail: TravelQuoteFetchDetail = {
      last_ended_stage: 'quote',
      session: { id: 42, quote_code: 'Q-TRV-42' },
      trip: {
        bound: 'Outbound',
        country_of_departure: 1,
        country_of_arrival: 2,
        travelers: [{ first_name: 'Jane' }],
      },
    }

    const result = persistCustomerTravelResumeFromDetail(detail)

    expect(result).toEqual({ stage: 'quote', step: 2 })
    expect(sessionStorage.getItem(TRAVEL_QUOTE_SESSION_STORAGE_KEY)).toBe('42')
    const form = JSON.parse(sessionStorage.getItem(TRAVEL_QUOTATION_FORM_SESSION_KEY) ?? '{}')
    expect(form.bound).toBe('Outbound')
    expect(form.country_of_arrival).toBe('2')
  })
})

describe('document download url helpers', () => {
  it('builds motor and travel invoice urls', () => {
    expect(documentInvoiceUrl('Motor', 10)).toBe('document/motor/invoice/10')
    expect(documentInvoiceUrl('Travel', 11)).toBe('document/travel/invoice/11')
  })

  it('builds motor GET and travel POST receipt routes', () => {
    const motor = documentReceiptUrl('Motor', { invoiceId: 10 })
    expect(motor).toEqual({
      method: EMETHODS.GET,
      url: 'document/motor/receipt/10',
    })

    const travel = documentReceiptUrl('Travel', {
      purchaseId: 20,
      invoiceId: 21,
    })
    expect(travel.method).toBe(EMETHODS.POST)
    expect(travel.url).toBe('document/travel/receipt/20')
    expect(travel.body).toEqual({ target_invoice_id: 21 })
  })
})
