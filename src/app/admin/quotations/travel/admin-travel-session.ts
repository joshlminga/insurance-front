import type { AdminTravelCustomerContact } from './admin-step-props'
import { ADMIN_TRAVEL_PURCHASE_STEP_KEY } from '@/app/payment/payment-session'
import {
    ADMIN_ACTIVE_QUOTATION_PRODUCT_KEY,
    ADMIN_TRAVEL_CUSTOMER_EMAIL_KEY,
    ADMIN_TRAVEL_CUSTOMER_NAME_KEY,
    ADMIN_TRAVEL_CUSTOMER_PHONE_KEY,
    ADMIN_TRAVEL_QUOTE_CUSTOMER_ID_KEY,
    ADMIN_TRAVEL_QUOTE_CUSTOMER_TYPE_KEY,
    ADMIN_TRAVEL_QUOTE_DUPLICATE_PREFILL_KEY,
    ADMIN_TRAVEL_QUOTE_DUPLICATE_SOURCE_KEY,
    ADMIN_TRAVEL_QUOTE_DUPLICATE_START_AT_KEY,
    ADMIN_TRAVEL_QUOTE_IS_GUEST_KEY,
    INVOICE_SESSION_STORAGE_KEY,
    PURCHASE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import {
    TRAVEL_QUOTATION_FORM_SESSION_KEY,
    TRAVEL_QUOTE_SESSION_STORAGE_KEY,
} from '@/utils/travel-enums'
import type {
    MotorQuoteSessionCustomerType,
    TravelQuoteDuplicatePayload,
    TravelQuoteDuplicateStartAt,
    TravelQuoteFetchDetail,
    TravelQuoteLastEndedStage,
    TravelQuoteSessionStartData,
} from '@/types/types'
import { isSelfCoverLookup } from '@/app/admin/quotations/motor/customer-lookup-utils'
import { contactFromUser, type AdminMotorPayeeUser } from '@/app/admin/quotations/motor/admin-motor-session'

export type { AdminTravelCustomerContact }
export { contactFromUser }

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

export type AdminTravelQuoteSessionIdentity = {
    quoteSessionId: number
    customerType?: MotorQuoteSessionCustomerType
    isGuest?: boolean
    customerId?: number | null
}

/** Save customer contact from this quotation. Empty fields clear leftovers. */
export function persistAdminTravelCustomerContact(contact: AdminTravelCustomerContact) {
    if (typeof window === 'undefined') return
    writeOrClearKey(ADMIN_TRAVEL_CUSTOMER_EMAIL_KEY, contact.email)
    writeOrClearKey(ADMIN_TRAVEL_CUSTOMER_NAME_KEY, contact.name)
    writeOrClearKey(ADMIN_TRAVEL_CUSTOMER_PHONE_KEY, contact.phone)
}

export function readAdminTravelCustomerContact(): AdminTravelCustomerContact {
    return {
        email: readKey(ADMIN_TRAVEL_CUSTOMER_EMAIL_KEY) || undefined,
        name: readKey(ADMIN_TRAVEL_CUSTOMER_NAME_KEY) || undefined,
        phone: readKey(ADMIN_TRAVEL_CUSTOMER_PHONE_KEY) || undefined,
    }
}

/**
 * Payee / share contact for this travel quotation.
 * Self-cover (customer_id = logged-in user) uses the agent account.
 */
export function resolveAdminTravelPayeeContact(
    authUser: AdminMotorPayeeUser | null | undefined
): AdminTravelCustomerContact {
    const quoteSession = readAdminTravelQuoteSession()
    if (isSelfCoverLookup(quoteSession?.customerId ?? undefined, authUser?.id)) {
        return contactFromUser(authUser)
    }
    return readAdminTravelCustomerContact()
}

/** Persist quote session id from POST quotation/travel. */
export function persistAdminTravelQuoteSession(session: TravelQuoteSessionStartData): void {
    if (typeof window === 'undefined') return

    sessionStorage.setItem(TRAVEL_QUOTE_SESSION_STORAGE_KEY, String(session.id))
    sessionStorage.setItem(ADMIN_ACTIVE_QUOTATION_PRODUCT_KEY, 'travel')

    if (session.customer_type) {
        sessionStorage.setItem(ADMIN_TRAVEL_QUOTE_CUSTOMER_TYPE_KEY, session.customer_type)
    } else {
        sessionStorage.removeItem(ADMIN_TRAVEL_QUOTE_CUSTOMER_TYPE_KEY)
    }

    if (session.is_guest !== undefined) {
        sessionStorage.setItem(ADMIN_TRAVEL_QUOTE_IS_GUEST_KEY, session.is_guest ? '1' : '0')
    } else {
        sessionStorage.removeItem(ADMIN_TRAVEL_QUOTE_IS_GUEST_KEY)
    }

    if (session.customer_id != null) {
        sessionStorage.setItem(ADMIN_TRAVEL_QUOTE_CUSTOMER_ID_KEY, String(session.customer_id))
    } else {
        sessionStorage.removeItem(ADMIN_TRAVEL_QUOTE_CUSTOMER_ID_KEY)
    }
}

export function readAdminTravelQuoteSession(): AdminTravelQuoteSessionIdentity | null {
    const quoteSessionId = Number(readKey(TRAVEL_QUOTE_SESSION_STORAGE_KEY))
    if (!Number.isFinite(quoteSessionId) || quoteSessionId <= 0) {
        return null
    }

    const customerTypeRaw = readKey(ADMIN_TRAVEL_QUOTE_CUSTOMER_TYPE_KEY)
    const customerType = (
        customerTypeRaw === 'guest' ||
        customerTypeRaw === 'member' ||
        customerTypeRaw === 'agency'
    )
        ? customerTypeRaw
        : undefined

    const isGuestRaw = readKey(ADMIN_TRAVEL_QUOTE_IS_GUEST_KEY)
    const isGuest =
        isGuestRaw === '1' ? true : isGuestRaw === '0' ? false : undefined

    const customerIdRaw = readKey(ADMIN_TRAVEL_QUOTE_CUSTOMER_ID_KEY)
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

/** Start admin travel purchase checkout at KYC (step 1). */
export function persistAdminTravelPurchaseStart(purchaseId: string | number): void {
    if (typeof window === 'undefined') return

    sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, String(purchaseId))
    sessionStorage.setItem(ADMIN_TRAVEL_PURCHASE_STEP_KEY, '1')
    sessionStorage.setItem(ADMIN_ACTIVE_QUOTATION_PRODUCT_KEY, 'travel')
    sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
}

/**
 * Issue Cover from Finance travel invoices.
 * Lands on Payment (3) when invoice meta exists, Invoice (2) when KYC exists but invoice meta missing,
 * otherwise KYC (1). Seeds purchase + invoice session keys like payment resume.
 */
export function persistAdminTravelIssueCoverFromInvoice(input: {
    purchaseId: string | number
    invoiceId?: string | number | null
    hasKycMeta?: boolean
    hasInvoiceMeta?: boolean
}): { purchaseStep: 1 | 2 | 3 } {
    if (typeof window === 'undefined') {
        return { purchaseStep: 1 }
    }

    const purchaseId = String(input.purchaseId)
    sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, purchaseId)
    sessionStorage.setItem(ADMIN_ACTIVE_QUOTATION_PRODUCT_KEY, 'travel')

    // Prefer payment when an invoice already exists (usual finance case)
    let purchaseStep: 1 | 2 | 3 = 3
    if (!input.hasKycMeta) {
        purchaseStep = 1
    } else if (!input.hasInvoiceMeta) {
        purchaseStep = 2
    }

    sessionStorage.setItem(ADMIN_TRAVEL_PURCHASE_STEP_KEY, String(purchaseStep))

    if (purchaseStep === 3) {
        // Same as persistAdminTravelResumeFromDetail payment stage
        sessionStorage.setItem(INVOICE_SESSION_STORAGE_KEY, purchaseId)
        if (input.invoiceId != null && String(input.invoiceId).trim() !== '') {
            sessionStorage.setItem('admin_travel_target_invoice_id', String(input.invoiceId))
        }
    } else {
        sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
        sessionStorage.removeItem('admin_travel_target_invoice_id')
    }

    return { purchaseStep }
}

/**
 * Resume an existing travel quote from Find/Listed detail.
 * Restores quote session id, customer contact, trip form snapshot, and purchase step.
 */
export function persistAdminTravelResumeFromDetail(detail: TravelQuoteFetchDetail): {
    stage: TravelQuoteLastEndedStage
    purchaseStep: number | null
} {
    const sessionId = detail.session?.id
    if (!sessionId) {
        return { stage: 'quote', purchaseStep: null }
    }

    persistAdminTravelQuoteSession({
        id: sessionId,
        quote_code: detail.session?.quote_code,
        customer_type: detail.session?.customer_type,
        customer_id: detail.session?.customer_id ?? null,
        is_guest: detail.customer?.type === 'guest',
    })

    const customerName =
        detail.customer?.name ||
        [detail.customer?.first_name, detail.customer?.last_name].filter(Boolean).join(' ')
    persistAdminTravelCustomerContact({
        name: customerName || undefined,
        email: detail.customer?.email || undefined,
        phone: detail.customer?.phone || undefined,
    })

    // KYC / invoice forms read trip + travelers from this session key
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

    const stage = (detail.last_ended_stage ??
        detail.session?.last_ended_stage ??
        'quote') as TravelQuoteLastEndedStage
    const purchaseId = detail.selected_offer?.purchase_id
    const firstInvoiceId =
        Array.isArray(detail.invoices) && detail.invoices[0]
            ? (detail.invoices[0] as { id?: number }).id
            : undefined

    if (
        purchaseId != null &&
        (stage === 'kyc' || stage === 'payment' || stage === 'rates')
    ) {
        sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, String(purchaseId))
    }

    if (stage === 'rates' || stage === 'kyc') {
        sessionStorage.setItem(ADMIN_TRAVEL_PURCHASE_STEP_KEY, '1')
        sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
        return { stage, purchaseStep: 1 }
    }

    if (stage === 'payment') {
        sessionStorage.setItem(ADMIN_TRAVEL_PURCHASE_STEP_KEY, '3')
        if (purchaseId != null) {
            sessionStorage.setItem(INVOICE_SESSION_STORAGE_KEY, String(purchaseId))
        }
        if (firstInvoiceId != null) {
            // Kept for parity with motor resume; travel payment may ignore this key
            sessionStorage.setItem('admin_travel_target_invoice_id', String(firstInvoiceId))
        }
        return { stage, purchaseStep: 3 }
    }

    sessionStorage.removeItem(PURCHASE_SESSION_STORAGE_KEY)
    sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
    sessionStorage.removeItem(ADMIN_TRAVEL_PURCHASE_STEP_KEY)
    return { stage, purchaseStep: null }
}

/** Remember the duplicate payload so the existing travel form can prefill after navigation. */
export function persistAdminTravelDuplicatePrefill(payload: TravelQuoteDuplicatePayload): void {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(
        ADMIN_TRAVEL_QUOTE_DUPLICATE_SOURCE_KEY,
        String(payload.source_quote_session_id)
    )
    sessionStorage.setItem(ADMIN_TRAVEL_QUOTE_DUPLICATE_START_AT_KEY, payload.start_at)
    sessionStorage.setItem(ADMIN_TRAVEL_QUOTE_DUPLICATE_PREFILL_KEY, JSON.stringify(payload))
}

export function readAdminTravelDuplicatePrefill(): TravelQuoteDuplicatePayload | null {
    if (typeof window === 'undefined') return null
    const raw = sessionStorage.getItem(ADMIN_TRAVEL_QUOTE_DUPLICATE_PREFILL_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as TravelQuoteDuplicatePayload
    } catch {
        return null
    }
}

/** Source session id kept until purchase so rates-stage duplicates can send quote_duplicate. */
export function readAdminTravelDuplicateSourceId(): number | null {
    const raw = readKey(ADMIN_TRAVEL_QUOTE_DUPLICATE_SOURCE_KEY)
    const id = Number(raw)
    return Number.isFinite(id) && id > 0 ? id : null
}

export function readAdminTravelDuplicateStartAt(): TravelQuoteDuplicateStartAt | null {
    const raw = readKey(ADMIN_TRAVEL_QUOTE_DUPLICATE_START_AT_KEY)
    if (raw === 'quote' || raw === 'rates' || raw === 'kyc' || raw === 'payment') {
        return raw
    }
    return null
}

export function clearAdminTravelDuplicatePrefill(): void {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem(ADMIN_TRAVEL_QUOTE_DUPLICATE_PREFILL_KEY)
    sessionStorage.removeItem(ADMIN_TRAVEL_QUOTE_DUPLICATE_SOURCE_KEY)
    sessionStorage.removeItem(ADMIN_TRAVEL_QUOTE_DUPLICATE_START_AT_KEY)
}

/**
 * Trip snapshot KYC reads from sessionStorage.
 * Rates / KYC duplicates never open the start form, so we save this ourselves.
 */
export function persistAdminTravelTripSnapshot(snapshot: {
    bound?: string
    country_of_departure?: string
    country_of_arrival?: string
    travel_as?: string
    date_of_departure?: string
    date_of_return?: string
    type_of_trip?: string
    reason_for_travel?: string
    travelers?: Array<Record<string, unknown>>
}): void {
    if (typeof window === 'undefined') return
    try {
        sessionStorage.setItem(TRAVEL_QUOTATION_FORM_SESSION_KEY, JSON.stringify(snapshot))
    } catch {
        // KYC can still be typed by hand if the browser storage is full
    }
}

/** Clear active admin travel quote / purchase session keys. */
export function clearAdminTravelActiveSession(options?: {
    clearDuplicatePrefill?: boolean
}): void {
    if (typeof window === 'undefined') return

    sessionStorage.removeItem(TRAVEL_QUOTE_SESSION_STORAGE_KEY)
    sessionStorage.removeItem(TRAVEL_QUOTATION_FORM_SESSION_KEY)
    sessionStorage.removeItem(PURCHASE_SESSION_STORAGE_KEY)
    sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
    sessionStorage.removeItem(ADMIN_TRAVEL_PURCHASE_STEP_KEY)
    sessionStorage.removeItem(ADMIN_TRAVEL_CUSTOMER_EMAIL_KEY)
    sessionStorage.removeItem(ADMIN_TRAVEL_CUSTOMER_NAME_KEY)
    sessionStorage.removeItem(ADMIN_TRAVEL_CUSTOMER_PHONE_KEY)
    sessionStorage.removeItem(ADMIN_TRAVEL_QUOTE_CUSTOMER_ID_KEY)
    sessionStorage.removeItem(ADMIN_TRAVEL_QUOTE_CUSTOMER_TYPE_KEY)
    sessionStorage.removeItem(ADMIN_TRAVEL_QUOTE_IS_GUEST_KEY)

    if (readKey(ADMIN_ACTIVE_QUOTATION_PRODUCT_KEY) === 'travel') {
        sessionStorage.removeItem(ADMIN_ACTIVE_QUOTATION_PRODUCT_KEY)
    }

    if (options?.clearDuplicatePrefill) {
        clearAdminTravelDuplicatePrefill()
    }
}
