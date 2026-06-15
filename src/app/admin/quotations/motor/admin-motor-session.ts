import type { AdminMotorCustomerContact } from './admin-step-props'

export type { AdminMotorCustomerContact }
import {
    ADMIN_MOTOR_CUSTOMER_EMAIL_KEY,
    ADMIN_MOTOR_CUSTOMER_NAME_KEY,
    ADMIN_MOTOR_CUSTOMER_PHONE_KEY,
} from '@/utils/constatnts'

const readKey = (key: string) => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem(key)?.trim() ?? ''
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
