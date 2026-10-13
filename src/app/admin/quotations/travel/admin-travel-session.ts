import type { AdminTravelCustomerContact } from './admin-step-props'
import { ADMIN_TRAVEL_PURCHASE_STEP_KEY } from '@/app/payment/payment-session'
import {
    ADMIN_ACTIVE_QUOTATION_PRODUCT_KEY,
    ADMIN_TRAVEL_CUSTOMER_EMAIL_KEY,
    ADMIN_TRAVEL_CUSTOMER_NAME_KEY,
    ADMIN_TRAVEL_CUSTOMER_PHONE_KEY,
    ADMIN_TRAVEL_QUOTE_CUSTOMER_ID_KEY,
    ADMIN_TRAVEL_QUOTE_CUSTOMER_TYPE_KEY,
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

/** Clear active admin travel quote / purchase session keys. */
export function clearAdminTravelActiveSession(): void {
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
}
