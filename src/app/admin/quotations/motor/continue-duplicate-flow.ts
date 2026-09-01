import {
  ADMIN_MOTOR_PURCHASE_PAYMENT_STEP,
  ADMIN_MOTOR_PURCHASE_STEP_KEY,
} from '@/app/payment/payment-session'
import apiClient from '@/lib/api-client'
import type {
  MotorQuoteDuplicatePayload,
  MotorQuoteSessionStartData,
  SubmitResponse,
} from '@/types/types'
import { ADMIN_MOTOR_QUOTE_DUPLICATE_PREFILL_KEY } from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import {
  clearAdminMotorDuplicatePrefill,
  persistAdminMotorCustomerContact,
  persistAdminMotorDuplicatePrefill,
  persistAdminMotorPurchaseStart,
  persistAdminMotorQuoteSession,
} from './admin-motor-session'

type AuthUserLike = {
  id?: number | string | null
  email?: string | null
}

/**
 * Build the POST body for auto/quotation/motor from a duplicate payload.
 * Never creates a member account: existing user_id (or self) keeps membership;
 * everyone else is guest.
 */
export function buildDuplicateStartQuoteBody(
  payload: MotorQuoteDuplicatePayload,
  authUser?: AuthUserLike | null
): Record<string, unknown> {
  const sq = payload.start_quote
  const sourceUserId =
    sq.user_id != null && Number(sq.user_id) > 0 ? Number(sq.user_id) : null

  const authId =
    authUser?.id != null && Number(authUser.id) > 0 ? Number(authUser.id) : null
  const authEmail = String(authUser?.email ?? '')
    .trim()
    .toLowerCase()
  const quoteEmail = String(sq.email ?? '')
    .trim()
    .toLowerCase()

  const isSelf =
    (authId != null && sourceUserId != null && authId === sourceUserId) ||
    (authId != null && authEmail !== '' && authEmail === quoteEmail)

  const existingUserId = sourceUserId ?? (isSelf ? authId : null)

  return {
    ...sq,
    quote_duplicate: payload.source_quote_session_id,
    // Existing member or self → bind user_id. Otherwise always guest (no account create).
    user_id: existingUserId,
    is_guest: existingUserId == null,
  }
}

/**
 * After the API returns a duplicate payload, continue into the requested stage.
 *
 * - quote  → review/edit form (new session not created yet)
 * - rates  → start new session, then rates/results
 * - kyc    → start session + purchase selected cover, then KYC
 * - payment → start session + purchase, then payment step
 */
export async function continueAdminMotorDuplicateFlow(
  payload: MotorQuoteDuplicatePayload,
  authUser?: AuthUserLike | null
): Promise<{ route: string; startAt: string; quoteSessionId?: number }> {
  if (!payload?.start_quote) {
    throw new Error('Duplicate payload was empty')
  }

  persistAdminMotorDuplicatePrefill(payload)

  const startAt = payload.start_at
  if (startAt === 'quote') {
    return { route: EROUTES.MOTOR_QUOTATION_DUPLICATE, startAt }
  }

  const sq = payload.start_quote
  const fullName = [sq.first_name, sq.last_name].filter(Boolean).join(' ').trim()
  if (sq.email || sq.first_name || sq.phone) {
    persistAdminMotorCustomerContact({
      name: fullName || undefined,
      email: sq.email || undefined,
      phone: sq.phone || undefined,
    })
  }

  const startBody = buildDuplicateStartQuoteBody(payload, authUser)

  const startResponse = await apiClient.post<SubmitResponse>(
    'auto/quotation/motor',
    startBody
  )
  const session = startResponse.data?.data as MotorQuoteSessionStartData | undefined
  const quoteSessionId = Number(session?.id)
  if (!Number.isFinite(quoteSessionId) || quoteSessionId <= 0) {
    throw new Error('Quote session could not be initialized for duplicate.')
  }

  persistAdminMotorQuoteSession({
    ...session,
    id: quoteSessionId,
  })

  if (startAt === 'rates') {
    sessionStorage.removeItem(ADMIN_MOTOR_QUOTE_DUPLICATE_PREFILL_KEY)
    return {
      route: EROUTES.MOTOR_QUOTATION_RESULTS,
      startAt,
      quoteSessionId,
    }
  }

  const productId = payload.rates?.product_id
  const rateId = payload.rates?.rate_id
  if (productId == null || rateId == null) {
    sessionStorage.removeItem(ADMIN_MOTOR_QUOTE_DUPLICATE_PREFILL_KEY)
    return {
      route: EROUTES.MOTOR_QUOTATION_RESULTS,
      startAt,
      quoteSessionId,
    }
  }

  const purchaseResponse = await apiClient.post<SubmitResponse>(
    `purchase/motor/${quoteSessionId}`,
    {
      product_id: productId,
      rate_id: rateId,
      quote_duplicate: payload.source_quote_session_id,
    }
  )
  const purchaseData = purchaseResponse.data?.data as
    | {
        purchase_id?: number | string
        vehicle_info?: unknown
        ownership?: unknown
      }
    | undefined
  const purchaseId = purchaseData?.purchase_id
  if (purchaseId === undefined) {
    throw new Error('Purchase could not be started for duplicate.')
  }

  persistAdminMotorPurchaseStart({
    purchaseId,
    vehicleInfo: purchaseData?.vehicle_info ?? payload.vehicle,
    ownership: purchaseData?.ownership ?? sq.ownership,
  })

  if (startAt === 'payment') {
    sessionStorage.setItem(
      ADMIN_MOTOR_PURCHASE_STEP_KEY,
      String(ADMIN_MOTOR_PURCHASE_PAYMENT_STEP)
    )
  }

  clearAdminMotorDuplicatePrefill()

  return {
    route: EROUTES.MOTOR_QUOTATION_PURCHASE,
    startAt,
    quoteSessionId,
  }
}
