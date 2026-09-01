import type { AdminMotorCustomerContact } from './admin-step-props'

export type { AdminMotorCustomerContact }
import { ADMIN_MOTOR_PURCHASE_STEP_KEY } from '@/app/payment/payment-session'
import {
    ADMIN_MOTOR_CUSTOMER_EMAIL_KEY,
    ADMIN_MOTOR_CUSTOMER_NAME_KEY,
    ADMIN_MOTOR_CUSTOMER_PHONE_KEY,
    ADMIN_MOTOR_QUOTE_CUSTOMER_ID_KEY,
    ADMIN_MOTOR_QUOTE_CUSTOMER_TYPE_KEY,
    ADMIN_MOTOR_QUOTE_DUPLICATE_PREFILL_KEY,
    ADMIN_MOTOR_QUOTE_DUPLICATE_SOURCE_KEY,
    ADMIN_MOTOR_QUOTE_DUPLICATE_START_AT_KEY,
    ADMIN_MOTOR_QUOTE_IS_GUEST_KEY,
    INVOICE_SESSION_STORAGE_KEY,
    MOTOR_QUOTE_SESSION_STORAGE_KEY,
    PURCHASE_SESSION_STORAGE_KEY,
    VEHICLE_DETAILS_SESSION_STORAGE_KEY,
    VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import type {
    MotorQuoteDuplicatePayload,
    MotorQuoteDuplicateStartAt,
    MotorQuoteFetchDetail,
    MotorQuoteLastEndedStage,
    MotorQuoteSessionCustomerType,
    MotorQuoteSessionStartData,
} from '@/types/types'
import { isSelfCoverLookup } from './customer-lookup-utils'
import { normalizeMotorVehicleForKycSession } from './motor-vehicle-session'

const readKey = (key: string) => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem(key)?.trim() ?? ''
}

const writeOrClearKey = (key: string, value?: string) => {
    const trimmed = value?.trim() ?? ''
    if (trimmed) {
        sessionStorage.setItem(key, trimmed)
        return
    }
    sessionStorage.removeItem(key)
}

/** Logged-in user fields used to prefill self-cover payee / share contact. */
export type AdminMotorPayeeUser = {
    id?: number | string | null
    name?: string | null
    email?: string | null
    phone?: string | null
}

export function contactFromUser(
    user: AdminMotorPayeeUser | null | undefined
): AdminMotorCustomerContact {
    return {
        name: user?.name?.trim() || undefined,
        email: user?.email?.trim() || undefined,
        phone: user?.phone?.trim() || undefined,
    }
}

export type AdminMotorQuoteSessionIdentity = {
    quoteSessionId: number
    customerType?: MotorQuoteSessionCustomerType
    isGuest?: boolean
    customerId?: number | null
}

/** Save customer contact from this quotation. Empty fields clear leftover guests. */
export function persistAdminMotorCustomerContact(contact: AdminMotorCustomerContact) {
    if (typeof window === 'undefined') return
    writeOrClearKey(ADMIN_MOTOR_CUSTOMER_EMAIL_KEY, contact.email)
    writeOrClearKey(ADMIN_MOTOR_CUSTOMER_NAME_KEY, contact.name)
    writeOrClearKey(ADMIN_MOTOR_CUSTOMER_PHONE_KEY, contact.phone)
}

/** Read customer contact saved during admin motor quotation intake. */
export function readAdminMotorCustomerContact(): AdminMotorCustomerContact {
    return {
        email: readKey(ADMIN_MOTOR_CUSTOMER_EMAIL_KEY) || undefined,
        name: readKey(ADMIN_MOTOR_CUSTOMER_NAME_KEY) || undefined,
        phone: readKey(ADMIN_MOTOR_CUSTOMER_PHONE_KEY) || undefined,
    }
}

/**
 * Payee / share contact for this quotation.
 * Self-cover (customer_id = logged-in user) uses the agent account, not a leftover guest.
 */
export function resolveAdminMotorPayeeContact(
    authUser: AdminMotorPayeeUser | null | undefined
): AdminMotorCustomerContact {
    const quoteSession = readAdminMotorQuoteSession()
    if (isSelfCoverLookup(quoteSession?.customerId ?? undefined, authUser?.id)) {
        return contactFromUser(authUser)
    }
    return readAdminMotorCustomerContact()
}

/** Persist quote session id and resolved customer identity from start-quote API response. */
export function persistAdminMotorQuoteSession(session: MotorQuoteSessionStartData): void {
    if (typeof window === 'undefined') return

    sessionStorage.setItem(MOTOR_QUOTE_SESSION_STORAGE_KEY, String(session.id))

    if (session.customer_type) {
        sessionStorage.setItem(ADMIN_MOTOR_QUOTE_CUSTOMER_TYPE_KEY, session.customer_type)
    } else {
        sessionStorage.removeItem(ADMIN_MOTOR_QUOTE_CUSTOMER_TYPE_KEY)
    }

    if (session.is_guest !== undefined) {
        sessionStorage.setItem(ADMIN_MOTOR_QUOTE_IS_GUEST_KEY, session.is_guest ? '1' : '0')
    } else {
        sessionStorage.removeItem(ADMIN_MOTOR_QUOTE_IS_GUEST_KEY)
    }

    if (session.customer_id != null) {
        sessionStorage.setItem(ADMIN_MOTOR_QUOTE_CUSTOMER_ID_KEY, String(session.customer_id))
    } else {
        sessionStorage.removeItem(ADMIN_MOTOR_QUOTE_CUSTOMER_ID_KEY)
    }
}

/** Read quote session identity saved after admin motor quotation start. */
export function readAdminMotorQuoteSession(): AdminMotorQuoteSessionIdentity | null {
    const quoteSessionId = Number(readKey(MOTOR_QUOTE_SESSION_STORAGE_KEY))
    if (!Number.isFinite(quoteSessionId) || quoteSessionId <= 0) {
        return null
    }

    const customerTypeRaw = readKey(ADMIN_MOTOR_QUOTE_CUSTOMER_TYPE_KEY)
    const customerType = (
        customerTypeRaw === 'guest' ||
        customerTypeRaw === 'member' ||
        customerTypeRaw === 'agency'
    )
        ? customerTypeRaw
        : undefined

    const isGuestRaw = readKey(ADMIN_MOTOR_QUOTE_IS_GUEST_KEY)
    const isGuest =
        isGuestRaw === '1' ? true : isGuestRaw === '0' ? false : undefined

    const customerIdRaw = readKey(ADMIN_MOTOR_QUOTE_CUSTOMER_ID_KEY)
    const customerId =
        customerIdRaw !== '' && Number.isFinite(Number(customerIdRaw))
            ? Number(customerIdRaw)
            : null

    return {
        quoteSessionId,
        customerType,
        isGuest,
        customerId,
    }
}

type PersistAdminMotorPurchaseStartInput = {
    purchaseId: string | number
    vehicleInfo?: unknown
    ownership?: unknown
}

/**
 * Start a new admin motor purchase checkout.
 * Always reopen at KYC (step 1) and drop any leftover invoice from a previous cover,
 * otherwise Purchase Cover reopens the old receipt screen.
 */
export function persistAdminMotorPurchaseStart({
    purchaseId,
    vehicleInfo,
    ownership,
}: PersistAdminMotorPurchaseStartInput): void {
    if (typeof window === 'undefined') return

    const normalizedVehicle = normalizeMotorVehicleForKycSession(vehicleInfo)

    sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, String(purchaseId))
    sessionStorage.setItem(
        VEHICLE_DETAILS_SESSION_STORAGE_KEY,
        normalizedVehicle ? JSON.stringify(normalizedVehicle) : ''
    )
    sessionStorage.setItem(
        VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY,
        ownership == null ? '' : String(ownership)
    )
    sessionStorage.setItem(ADMIN_MOTOR_PURCHASE_STEP_KEY, '1')
    sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
}

/** Resume an existing quote/purchase from fetch detail into admin stepper session keys. */
export function persistAdminMotorResumeFromDetail(detail: MotorQuoteFetchDetail): {
  stage: MotorQuoteLastEndedStage
  purchaseStep: number | null
} {
  const sessionId = detail.session?.id
  if (!sessionId) {
    return { stage: 'quote', purchaseStep: null }
  }

  persistAdminMotorQuoteSession({
    id: sessionId,
    quote_code: detail.session?.quote_code,
    customer_type: detail.session?.customer_type,
    customer_id: detail.session?.customer_id ?? null,
    is_guest: detail.customer?.type === 'guest',
  })

  const customerName =
    detail.customer?.name ||
    [detail.customer?.first_name, detail.customer?.last_name].filter(Boolean).join(' ')
  persistAdminMotorCustomerContact({
    name: customerName || undefined,
    email: detail.customer?.email || undefined,
    phone: detail.customer?.phone || undefined,
  })

  const stage = (detail.last_ended_stage ?? detail.session?.last_ended_stage ?? 'quote') as MotorQuoteLastEndedStage
  const purchaseId = detail.selected_cover?.purchase_id
  const ownership = (detail.cover as { ownership?: string } | undefined)?.ownership
  const firstInvoiceId = Array.isArray(detail.invoices) && detail.invoices[0]
    ? (detail.invoices[0] as { id?: number }).id
    : undefined

  const normalizedVehicle = normalizeMotorVehicleForKycSession(detail.vehicle)
  if (normalizedVehicle) {
    sessionStorage.setItem(
      VEHICLE_DETAILS_SESSION_STORAGE_KEY,
      JSON.stringify(normalizedVehicle)
    )
  } else {
    sessionStorage.removeItem(VEHICLE_DETAILS_SESSION_STORAGE_KEY)
  }

  if (purchaseId != null && (stage === 'kyc' || stage === 'payment' || stage === 'certificate' || stage === 'rates')) {
    sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, String(purchaseId))
    if (ownership) {
      sessionStorage.setItem(VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY, String(ownership))
    }
  }

  if (stage === 'rates' || stage === 'kyc') {
    sessionStorage.setItem(ADMIN_MOTOR_PURCHASE_STEP_KEY, '1')
    sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
    return { stage, purchaseStep: 1 }
  }

  if (stage === 'payment' || stage === 'certificate') {
    sessionStorage.setItem(ADMIN_MOTOR_PURCHASE_STEP_KEY, stage === 'certificate' ? '4' : '3')
    if (firstInvoiceId != null) {
      sessionStorage.setItem(INVOICE_SESSION_STORAGE_KEY, String(firstInvoiceId))
    } else if (purchaseId != null) {
      // Invoice form uses purchase id as session key in some flows
      sessionStorage.setItem(INVOICE_SESSION_STORAGE_KEY, String(purchaseId))
    }
    return { stage, purchaseStep: stage === 'certificate' ? 4 : 3 }
  }

  sessionStorage.removeItem(PURCHASE_SESSION_STORAGE_KEY)
  sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
  sessionStorage.removeItem(ADMIN_MOTOR_PURCHASE_STEP_KEY)
  return { stage, purchaseStep: null }
}

/** Seed payment step for Issue cover from invoice reports. */
export function persistAdminMotorIssueCoverFromInvoice(input: {
  purchaseId: string | number
  invoiceId?: string | number | null
}): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, String(input.purchaseId))
  sessionStorage.setItem(ADMIN_MOTOR_PURCHASE_STEP_KEY, '3')
  if (input.invoiceId != null && String(input.invoiceId).trim() !== '') {
    sessionStorage.setItem(INVOICE_SESSION_STORAGE_KEY, String(input.invoiceId))
  } else {
    sessionStorage.setItem(INVOICE_SESSION_STORAGE_KEY, String(input.purchaseId))
  }
}

export function persistAdminMotorDuplicatePrefill(payload: MotorQuoteDuplicatePayload): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(ADMIN_MOTOR_QUOTE_DUPLICATE_SOURCE_KEY, String(payload.source_quote_session_id))
  sessionStorage.setItem(ADMIN_MOTOR_QUOTE_DUPLICATE_START_AT_KEY, payload.start_at)
  sessionStorage.setItem(ADMIN_MOTOR_QUOTE_DUPLICATE_PREFILL_KEY, JSON.stringify(payload))
}

export function readAdminMotorDuplicatePrefill(): MotorQuoteDuplicatePayload | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(ADMIN_MOTOR_QUOTE_DUPLICATE_PREFILL_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as MotorQuoteDuplicatePayload
  } catch {
    return null
  }
}

export function readAdminMotorDuplicateSourceId(): number | null {
  const raw = readKey(ADMIN_MOTOR_QUOTE_DUPLICATE_SOURCE_KEY)
  const id = Number(raw)
  return Number.isFinite(id) && id > 0 ? id : null
}

export function readAdminMotorDuplicateStartAt(): MotorQuoteDuplicateStartAt | null {
  const raw = readKey(ADMIN_MOTOR_QUOTE_DUPLICATE_START_AT_KEY)
  if (raw === 'quote' || raw === 'rates' || raw === 'kyc' || raw === 'payment') {
    return raw
  }
  return null
}

export function clearAdminMotorDuplicatePrefill(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(ADMIN_MOTOR_QUOTE_DUPLICATE_PREFILL_KEY)
  sessionStorage.removeItem(ADMIN_MOTOR_QUOTE_DUPLICATE_SOURCE_KEY)
  sessionStorage.removeItem(ADMIN_MOTOR_QUOTE_DUPLICATE_START_AT_KEY)
}

/** Clear active admin motor quote session keys (quote, purchase, invoice, vehicle). */
export function clearAdminMotorActiveSession(options?: { clearDuplicatePrefill?: boolean }): void {
  if (typeof window === 'undefined') return

  sessionStorage.removeItem(MOTOR_QUOTE_SESSION_STORAGE_KEY)
  sessionStorage.removeItem(PURCHASE_SESSION_STORAGE_KEY)
  sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
  sessionStorage.removeItem(VEHICLE_DETAILS_SESSION_STORAGE_KEY)
  sessionStorage.removeItem(VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY)
  sessionStorage.removeItem(ADMIN_MOTOR_PURCHASE_STEP_KEY)
  sessionStorage.removeItem(ADMIN_MOTOR_CUSTOMER_EMAIL_KEY)
  sessionStorage.removeItem(ADMIN_MOTOR_CUSTOMER_NAME_KEY)
  sessionStorage.removeItem(ADMIN_MOTOR_CUSTOMER_PHONE_KEY)
  sessionStorage.removeItem(ADMIN_MOTOR_QUOTE_CUSTOMER_ID_KEY)
  sessionStorage.removeItem(ADMIN_MOTOR_QUOTE_CUSTOMER_TYPE_KEY)
  sessionStorage.removeItem(ADMIN_MOTOR_QUOTE_IS_GUEST_KEY)

  if (options?.clearDuplicatePrefill) {
    clearAdminMotorDuplicatePrefill()
  }
}
