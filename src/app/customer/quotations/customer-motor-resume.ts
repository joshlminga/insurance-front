import { normalizeMotorVehicleForKycSession } from '@/app/admin/quotations/motor/motor-vehicle-session'
import type { MotorQuoteFetchDetail, MotorQuoteLastEndedStage } from '@/types/types'
import {
  INVOICE_SESSION_STORAGE_KEY,
  MOTOR_QUOTE_SESSION_STORAGE_KEY,
  PURCHASE_SESSION_STORAGE_KEY,
  VEHICLE_DETAILS_SESSION_STORAGE_KEY,
  VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'

/**
 * Map backend last_ended_stage → authenticated customer motor stepper (1-based).
 * Auth steps: 1 Vehicle, 2 Quotations, 3 KYC, 4 Invoice, 5 Payment, 6 Success.
 */
export function mapMotorStageToCustomerStep(stage: MotorQuoteLastEndedStage | string): number {
  switch (stage) {
    case 'rates':
    case 'kyc':
      return 3
    case 'payment':
      return 5
    case 'certificate':
      return 6
    case 'quote':
    default:
      return 2
  }
}

export function isMotorQuoteResumable(row: {
  status?: string | null
  last_ended_stage?: string | null
}): boolean {
  const status = String(row.status ?? '').toLowerCase()
  const stage = String(row.last_ended_stage ?? '').toLowerCase()
  if (status === 'cancelled' || status === 'converted_to_policy') {
    return false
  }
  if (stage === 'certificate') {
    return false
  }
  return true
}

/** Resume an existing motor quote into customer sessionStorage keys (not admin keys). */
export function persistCustomerMotorResumeFromDetail(detail: MotorQuoteFetchDetail): {
  stage: MotorQuoteLastEndedStage
  step: number
} {
  const sessionId = detail.session?.id
  const stage = (detail.last_ended_stage ??
    detail.session?.last_ended_stage ??
    'quote') as MotorQuoteLastEndedStage

  if (!sessionId) {
    return { stage: 'quote', step: mapMotorStageToCustomerStep('quote') }
  }

  sessionStorage.setItem(MOTOR_QUOTE_SESSION_STORAGE_KEY, String(sessionId))

  const purchaseId = detail.selected_cover?.purchase_id
  const ownership = (detail.cover as { ownership?: string } | undefined)?.ownership

  const normalizedVehicle = normalizeMotorVehicleForKycSession(detail.vehicle)
  if (normalizedVehicle) {
    sessionStorage.setItem(
      VEHICLE_DETAILS_SESSION_STORAGE_KEY,
      JSON.stringify(normalizedVehicle)
    )
  } else {
    sessionStorage.removeItem(VEHICLE_DETAILS_SESSION_STORAGE_KEY)
  }

  if (
    purchaseId != null &&
    (stage === 'kyc' || stage === 'payment' || stage === 'certificate' || stage === 'rates')
  ) {
    sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, String(purchaseId))
    if (ownership) {
      sessionStorage.setItem(VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY, String(ownership))
    }
  }

  if (stage === 'rates' || stage === 'kyc') {
    sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
    return { stage, step: mapMotorStageToCustomerStep(stage) }
  }

  if (stage === 'payment' || stage === 'certificate') {
    if (purchaseId != null) {
      sessionStorage.setItem(INVOICE_SESSION_STORAGE_KEY, String(purchaseId))
    }
    return { stage, step: mapMotorStageToCustomerStep(stage) }
  }

  sessionStorage.removeItem(PURCHASE_SESSION_STORAGE_KEY)
  sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
  return { stage, step: mapMotorStageToCustomerStep(stage) }
}
