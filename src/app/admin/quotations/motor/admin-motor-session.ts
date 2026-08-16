import type { AdminMotorCustomerContact } from './admin-step-props'

export type { AdminMotorCustomerContact }
import { ADMIN_MOTOR_PURCHASE_STEP_KEY } from '@/app/payment/payment-session'
import {
    ADMIN_MOTOR_CUSTOMER_EMAIL_KEY,
    ADMIN_MOTOR_CUSTOMER_NAME_KEY,
    ADMIN_MOTOR_CUSTOMER_PHONE_KEY,
    ADMIN_MOTOR_QUOTE_CUSTOMER_ID_KEY,
    ADMIN_MOTOR_QUOTE_CUSTOMER_TYPE_KEY,
    ADMIN_MOTOR_QUOTE_IS_GUEST_KEY,
    INVOICE_SESSION_STORAGE_KEY,
    MOTOR_QUOTE_SESSION_STORAGE_KEY,
    PURCHASE_SESSION_STORAGE_KEY,
    VEHICLE_DETAILS_SESSION_STORAGE_KEY,
    VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import type {
    MotorQuoteSessionCustomerType,
    MotorQuoteSessionStartData,
} from '@/types/types'
import { isSelfCoverLookup } from './customer-lookup-utils'

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

    sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, String(purchaseId))
    sessionStorage.setItem(
        VEHICLE_DETAILS_SESSION_STORAGE_KEY,
        vehicleInfo ? JSON.stringify(vehicleInfo) : ''
    )
    sessionStorage.setItem(
        VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY,
        ownership == null ? '' : String(ownership)
    )
    sessionStorage.setItem(ADMIN_MOTOR_PURCHASE_STEP_KEY, '1')
    sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
}
