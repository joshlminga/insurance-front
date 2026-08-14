import { beforeEach, describe, expect, it } from 'vitest'
import {
    persistAdminMotorQuoteSession,
    readAdminMotorQuoteSession,
} from './admin-motor-session'
import {
    ADMIN_MOTOR_QUOTE_CUSTOMER_ID_KEY,
    ADMIN_MOTOR_QUOTE_CUSTOMER_TYPE_KEY,
    ADMIN_MOTOR_QUOTE_IS_GUEST_KEY,
    MOTOR_QUOTE_SESSION_STORAGE_KEY,
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
})
