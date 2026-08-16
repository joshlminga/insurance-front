import { beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_MOTOR_PURCHASE_STEP_KEY } from '@/app/payment/payment-session'
import {
    persistAdminMotorCustomerContact,
    persistAdminMotorPurchaseStart,
    persistAdminMotorQuoteSession,
    readAdminMotorCustomerContact,
    readAdminMotorQuoteSession,
    resolveAdminMotorPayeeContact,
} from './admin-motor-session'
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

describe('admin motor quote session persistence', () => {
    beforeEach(() => {
        sessionStorage.clear()
    })

    it('persists quote session identity from start-quote response', () => {
        persistAdminMotorQuoteSession({
            id: 42,
            customer_type: 'guest',
            customer_id: 7,
            guest_id: 7,
            is_guest: true,
        })

        expect(sessionStorage.getItem(MOTOR_QUOTE_SESSION_STORAGE_KEY)).toBe('42')
        expect(sessionStorage.getItem(ADMIN_MOTOR_QUOTE_CUSTOMER_TYPE_KEY)).toBe('guest')
        expect(sessionStorage.getItem(ADMIN_MOTOR_QUOTE_IS_GUEST_KEY)).toBe('1')
        expect(sessionStorage.getItem(ADMIN_MOTOR_QUOTE_CUSTOMER_ID_KEY)).toBe('7')

        expect(readAdminMotorQuoteSession()).toEqual({
            quoteSessionId: 42,
            customerType: 'guest',
            isGuest: true,
            customerId: 7,
        })
    })

    it('starts a new purchase at KYC and clears a leftover receipt/invoice session', () => {
        sessionStorage.setItem(ADMIN_MOTOR_PURCHASE_STEP_KEY, '4')
        sessionStorage.setItem(INVOICE_SESSION_STORAGE_KEY, '8')

        persistAdminMotorPurchaseStart({
            purchaseId: 11,
            vehicleInfo: { make: 'Toyota' },
            ownership: 'Personally Owned',
        })

        expect(sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY)).toBe('11')
        expect(sessionStorage.getItem(VEHICLE_DETAILS_SESSION_STORAGE_KEY)).toBe(
            JSON.stringify({ make: 'Toyota' })
        )
        expect(sessionStorage.getItem(VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY)).toBe(
            'Personally Owned'
        )
        expect(sessionStorage.getItem(ADMIN_MOTOR_PURCHASE_STEP_KEY)).toBe('1')
        expect(sessionStorage.getItem(INVOICE_SESSION_STORAGE_KEY)).toBeNull()
    })

    it('clears leftover guest contact when the current quotation has empty customer details', () => {
        sessionStorage.setItem(ADMIN_MOTOR_CUSTOMER_NAME_KEY, 'Eliora Minga')
        sessionStorage.setItem(ADMIN_MOTOR_CUSTOMER_EMAIL_KEY, 'guest@example.com')
        sessionStorage.setItem(ADMIN_MOTOR_CUSTOMER_PHONE_KEY, '712345678')

        persistAdminMotorCustomerContact({})

        expect(readAdminMotorCustomerContact()).toEqual({
            email: undefined,
            name: undefined,
            phone: undefined,
        })
    })

    it('uses the logged-in user for self-cover payee details instead of a leftover guest', () => {
        persistAdminMotorQuoteSession({
            id: 99,
            customer_type: 'member',
            customer_id: 36,
            is_guest: true,
        })
        sessionStorage.setItem(ADMIN_MOTOR_CUSTOMER_NAME_KEY, 'Eliora Minga')
        sessionStorage.setItem(ADMIN_MOTOR_CUSTOMER_EMAIL_KEY, 'guest@example.com')

        expect(
            resolveAdminMotorPayeeContact({
                id: 36,
                name: 'Agent User',
                email: 'agent@example.com',
                phone: '+254700000000',
            })
        ).toEqual({
            name: 'Agent User',
            email: 'agent@example.com',
            phone: '+254700000000',
        })
    })

    it('keeps quotation customer contact when buying cover for someone else', () => {
        persistAdminMotorQuoteSession({
            id: 99,
            customer_type: 'guest',
            customer_id: 7,
            is_guest: true,
        })
        persistAdminMotorCustomerContact({
            name: 'Eliora Minga',
            email: 'guest@example.com',
            phone: '712345678',
        })

        expect(
            resolveAdminMotorPayeeContact({
                id: 36,
                name: 'Agent User',
                email: 'agent@example.com',
            })
        ).toEqual({
            name: 'Eliora Minga',
            email: 'guest@example.com',
            phone: '712345678',
        })
    })
})
