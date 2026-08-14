import type { AdminMotorCustomerContact } from './admin-step-props'

export type { AdminMotorCustomerContact }
import {
    ADMIN_MOTOR_CUSTOMER_EMAIL_KEY,
    ADMIN_MOTOR_CUSTOMER_NAME_KEY,
    ADMIN_MOTOR_CUSTOMER_PHONE_KEY,
    ADMIN_MOTOR_QUOTE_CUSTOMER_ID_KEY,
    ADMIN_MOTOR_QUOTE_CUSTOMER_TYPE_KEY,
    ADMIN_MOTOR_QUOTE_IS_GUEST_KEY,
    MOTOR_QUOTE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import type {
    MotorQuoteSessionCustomerType,
    MotorQuoteSessionStartData,
} from '@/types/types'

const readKey = (key: string) => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem(key)?.trim() ?? ''
}

export type AdminMotorQuoteSessionIdentity = {
    quoteSessionId: number
    customerType?: MotorQuoteSessionCustomerType
    isGuest?: boolean
    customerId?: number | null
}

/** Save customer contact from the admin intake form for later steps (email share, invoice prefill). */
export function persistAdminMotorCustomerContact(contact: AdminMotorCustomerContact) {
    if (typeof window === 'undefined') return
    if (contact.email) {
        sessionStorage.setItem(ADMIN_MOTOR_CUSTOMER_EMAIL_KEY, contact.email)
    }
    if (contact.name) {
        sessionStorage.setItem(ADMIN_MOTOR_CUSTOMER_NAME_KEY, contact.name)
    }
    if (contact.phone) {
        sessionStorage.setItem(ADMIN_MOTOR_CUSTOMER_PHONE_KEY, contact.phone)
    }
}

/** Read customer contact saved during admin motor quotation intake. */
export function readAdminMotorCustomerContact(): AdminMotorCustomerContact {
    return {
        email: readKey(ADMIN_MOTOR_CUSTOMER_EMAIL_KEY) || undefined,
        name: readKey(ADMIN_MOTOR_CUSTOMER_NAME_KEY) || undefined,
        phone: readKey(ADMIN_MOTOR_CUSTOMER_PHONE_KEY) || undefined,
    }
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
