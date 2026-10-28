import type { TravelQuoteFetchDetail, TravelQuoteLastEndedStage } from '@/types/types'
import {
  INVOICE_SESSION_STORAGE_KEY,
  PURCHASE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import {
  TRAVEL_QUOTATION_FORM_SESSION_KEY,
  TRAVEL_QUOTE_SESSION_STORAGE_KEY,
} from '@/utils/travel-enums'

/**
 * Map backend last_ended_stage → authenticated customer travel stepper (1-based).
 * Auth steps: 1 Traveller, 2 Quotations, 3 KYC, 4 Invoices, 5 Payment, 6 Success.
 */
export function mapTravelStageToCustomerStep(stage: TravelQuoteLastEndedStage | string): number {
  switch (stage) {
    case 'rates':
    case 'kyc':
      return 3
    case 'payment':
      return 5
    case 'quote':
    default:
      return 2
  }
}

export function isTravelQuoteResumable(row: {
  status?: string | null
  last_ended_stage?: string | null
}): boolean {
  const status = String(row.status ?? '').toLowerCase()
  if (status === 'cancelled' || status === 'converted_to_policy') {
    return false
  }
  return true
}

/** Resume an existing travel quote into customer sessionStorage keys (not admin keys). */
export function persistCustomerTravelResumeFromDetail(detail: TravelQuoteFetchDetail): {
  stage: TravelQuoteLastEndedStage
  step: number
} {
  const sessionId = detail.session?.id
  const stage = (detail.last_ended_stage ??
    detail.session?.last_ended_stage ??
    'quote') as TravelQuoteLastEndedStage

  if (!sessionId) {
    return { stage: 'quote', step: mapTravelStageToCustomerStep('quote') }
  }

  sessionStorage.setItem(TRAVEL_QUOTE_SESSION_STORAGE_KEY, String(sessionId))

  const trip = detail.trip
  const meta = detail.meta ?? {}
  try {
    sessionStorage.setItem(
      TRAVEL_QUOTATION_FORM_SESSION_KEY,
      JSON.stringify({
        bound: trip?.bound ?? meta.bound ?? '',
        country_of_departure: String(
          trip?.country_of_departure ?? meta.country_of_departure ?? ''
        ),
        country_of_arrival: String(
          trip?.country_of_arrival ?? meta.country_of_arrival ?? ''
        ),
        travel_as: trip?.travel_as ?? meta.travel_as ?? '',
        date_of_departure: trip?.date_of_departure ?? meta.date_of_departure ?? '',
        date_of_return: trip?.date_of_return ?? meta.date_of_return ?? '',
        type_of_trip: trip?.type_of_trip ?? meta.type_of_trip ?? '',
        reason_for_travel: String(
          trip?.reason_for_travel ?? meta.reason_for_travel ?? ''
        ),
        travelers: trip?.travelers ?? [],
      })
    )
  } catch {
    // Ignore quota errors; resume still works for purchase steps
  }

  const purchaseId = detail.selected_offer?.purchase_id

  if (purchaseId != null && (stage === 'kyc' || stage === 'payment' || stage === 'rates')) {
    sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, String(purchaseId))
  }

  if (stage === 'rates' || stage === 'kyc') {
    sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
    return { stage, step: mapTravelStageToCustomerStep(stage) }
  }

  if (stage === 'payment') {
    if (purchaseId != null) {
      sessionStorage.setItem(INVOICE_SESSION_STORAGE_KEY, String(purchaseId))
    }
    return { stage, step: mapTravelStageToCustomerStep(stage) }
  }

  sessionStorage.removeItem(PURCHASE_SESSION_STORAGE_KEY)
  sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
  return { stage, step: mapTravelStageToCustomerStep(stage) }
}
